"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// CONFLICT DETECTION (Smart)
// ============================================

export type ConflictSeverity = "info" | "warning" | "critical";

export interface SmartConflict {
    id: string; // Deterministic ID for dismiss support
    type: "duplicate_exact" | "duplicate_same_day" | "capacity_global" | "capacity_installation";
    severity: ConflictSeverity;
    message: string;
    date?: string;
    details?: string;
    reservationIds: string[]; // For direct navigation
    actionLabel?: string; // Suggested action
    actionHref?: string;
}

export async function detectConflicts() {
    const supabase = await createClient();
    const conflicts: SmartConflict[] = [];

    // Get all confirmed + pending reservations for the next 30 days
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const { data: reservations } = await supabase
        .from("reservations")
        .select("id, reservation_date, time_slot, guest_count, guest_email, guest_name, status, installation_id")
        .gte("reservation_date", today.toISOString().split("T")[0])
        .lte("reservation_date", endDate.toISOString().split("T")[0])
        .in("status", ["pending", "confirmed"]);

    if (!reservations) return { conflicts };

    // Load installations for per-installation capacity
    const { data: installations } = await supabase
        .from("installations")
        .select("id, name, capacity_max")
        .eq("is_active", true);

    const installationMap = new Map(
        (installations || []).map(i => [i.id, i])
    );

    // Load dismissed conflict IDs
    const dismissedIds = await getDismissedConflictIds();

    // Group by date
    const byDate: Record<string, typeof reservations> = {};
    reservations.forEach(r => {
        if (!byDate[r.reservation_date]) byDate[r.reservation_date] = [];
        byDate[r.reservation_date].push(r);
    });

    // Global capacity (sum of all installation max capacities, fallback 50)
    const GLOBAL_CAPACITY = installations && installations.length > 0
        ? installations.reduce((sum, i) => sum + (i.capacity_max || 10), 0)
        : 50;

    Object.entries(byDate).forEach(([date, dateReservations]) => {
        const totalGuests = dateReservations.reduce((sum, r) => sum + r.guest_count, 0);

        // 1. Global capacity warning (>80%) and critical (>100%)
        if (totalGuests > GLOBAL_CAPACITY) {
            const conflictId = `capacity_global_${date}`;
            if (!dismissedIds.has(conflictId)) {
                conflicts.push({
                    id: conflictId,
                    type: "capacity_global",
                    severity: "critical",
                    message: "Capacité globale dépassée",
                    date,
                    details: `${totalGuests}/${GLOBAL_CAPACITY} personnes`,
                    reservationIds: dateReservations.map(r => r.id),
                    actionLabel: "Voir le calendrier",
                    actionHref: "/dashboard/reservations/calendar",
                });
            }
        } else if (totalGuests > GLOBAL_CAPACITY * 0.8) {
            const conflictId = `capacity_warn_${date}`;
            if (!dismissedIds.has(conflictId)) {
                conflicts.push({
                    id: conflictId,
                    type: "capacity_global",
                    severity: "warning",
                    message: "Capacité globale bientôt atteinte",
                    date,
                    details: `${totalGuests}/${GLOBAL_CAPACITY} personnes (${Math.round(totalGuests / GLOBAL_CAPACITY * 100)}%)`,
                    reservationIds: dateReservations.map(r => r.id),
                });
            }
        }

        // 2. Smart duplicate detection — only flag if SAME email + SAME date + SAME time_slot + SAME installation
        const emailGroups: Record<string, typeof reservations> = {};
        dateReservations.forEach(r => {
            const key = r.guest_email.toLowerCase();
            if (!emailGroups[key]) emailGroups[key] = [];
            emailGroups[key].push(r);
        });

        Object.entries(emailGroups).forEach(([email, emailReservations]) => {
            if (emailReservations.length < 2) return;

            // Check if it's an exact duplicate (same installation + same time slot)
            const slotInstallationPairs = new Map<string, typeof reservations>();
            emailReservations.forEach(r => {
                const pairKey = `${r.installation_id || "none"}_${r.time_slot}`;
                if (!slotInstallationPairs.has(pairKey)) slotInstallationPairs.set(pairKey, []);
                slotInstallationPairs.get(pairKey)!.push(r);
            });

            const exactDuplicates = [...slotInstallationPairs.values()].filter(group => group.length > 1);

            if (exactDuplicates.length > 0) {
                // True duplicate — same person, same installation, same slot = likely mistake
                const dupes = exactDuplicates[0];
                const conflictId = `dup_exact_${date}_${email}`;
                if (!dismissedIds.has(conflictId)) {
                    conflicts.push({
                        id: conflictId,
                        type: "duplicate_exact",
                        severity: "warning",
                        message: "Doublon probable",
                        date,
                        details: `${emailReservations[0].guest_name} — même créneau, même forfait`,
                        reservationIds: dupes.map(r => r.id),
                        actionLabel: "Voir les réservations",
                        actionHref: `/dashboard/reservations?id=${dupes[0].id}`,
                    });
                }
            } else {
                // Different installations or time slots — just an info, not blocking
                const conflictId = `dup_info_${date}_${email}`;
                if (!dismissedIds.has(conflictId)) {
                    conflicts.push({
                        id: conflictId,
                        type: "duplicate_same_day",
                        severity: "info",
                        message: "Réservations multiples",
                        date,
                        details: `${emailReservations[0].guest_name} — ${emailReservations.length} réservations (créneaux/forfaits différents)`,
                        reservationIds: emailReservations.map(r => r.id),
                        actionLabel: "Vérifier",
                        actionHref: `/dashboard/reservations?id=${emailReservations[0].id}`,
                    });
                }
            }
        });
    });

    // Sort: critical first, then warning, then info
    const severityOrder: Record<ConflictSeverity, number> = { critical: 0, warning: 1, info: 2 };
    conflicts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return { conflicts };
}

// ============================================
// CONFLICT DISMISSAL
// ============================================

const DISMISSED_KEY = "conflict_dismissed_ids";

async function getDismissedConflictIds(): Promise<Set<string>> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", DISMISSED_KEY)
        .single();

    if (data?.value) {
        try {
            const parsed = JSON.parse(data.value);
            // Auto-cleanup: remove entries older than 30 days
            const now = Date.now();
            const valid = Object.entries(parsed as Record<string, number>)
                .filter(([, ts]) => now - (ts as number) < 30 * 24 * 60 * 60 * 1000);
            return new Set(valid.map(([id]) => id));
        } catch {
            return new Set();
        }
    }
    return new Set();
}

export async function dismissConflict(conflictId: string) {
    const supabase = await createClient();

    // Get existing dismissed
    const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", DISMISSED_KEY)
        .single();

    let dismissed: Record<string, number> = {};
    if (data?.value) {
        try { dismissed = JSON.parse(data.value); } catch { /* ignore */ }
    }

    dismissed[conflictId] = Date.now();

    await supabase
        .from("app_settings")
        .upsert({ key: DISMISSED_KEY, value: JSON.stringify(dismissed) }, { onConflict: "key" });

    return { success: true };
}

export async function restoreConflict(conflictId: string) {
    const supabase = await createClient();

    const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", DISMISSED_KEY)
        .single();

    let dismissed: Record<string, number> = {};
    if (data?.value) {
        try { dismissed = JSON.parse(data.value); } catch { /* ignore */ }
    }

    delete dismissed[conflictId];

    await supabase
        .from("app_settings")
        .upsert({ key: DISMISSED_KEY, value: JSON.stringify(dismissed) }, { onConflict: "key" });

    return { success: true };
}

// ============================================
// TOMORROW'S REMINDERS
// ============================================

export async function getTomorrowReservations() {
    const supabase = await createClient();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: reservations } = await supabase
        .from("reservations")
        .select("id, guest_name, guest_email, guest_phone, guest_count, reservation_date")
        .eq("reservation_date", tomorrowStr)
        .eq("status", "confirmed");

    return { reservations: reservations || [], date: tomorrowStr };
}

export async function markRemindersAsSent(reservationIds: string[]) {
    const supabase = await createClient();

    // Could add a "reminder_sent" timestamp column to reservations table
    // For now, we'll just return success
    console.log("Reminders sent for:", reservationIds);

    return { success: true, count: reservationIds.length };
}

// ============================================
// ANALYTICS
// ============================================

export async function getReservationAnalytics() {
    const supabase = await createClient();

    // Get all reservations from this season
    const { data: reservations } = await supabase
        .from("reservations")
        .select("reservation_date, guest_count, status, package_id, created_at")
        .in("status", ["confirmed", "pending", "declined"]);

    if (!reservations) return null;

    const confirmedReservations = reservations.filter(r => r.status === "confirmed");

    // Day of week analysis
    const dayOfWeekCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    confirmedReservations.forEach(r => {
        const day = new Date(r.reservation_date).getDay();
        dayOfWeekCount[day]++;
    });

    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const mostPopularDay = Object.entries(dayOfWeekCount)
        .sort((a, b) => b[1] - a[1])[0];

    // Package analysis
    const packageCount: Record<string, number> = {};
    confirmedReservations.forEach(r => {
        if (r.package_id) {
            packageCount[r.package_id] = (packageCount[r.package_id] || 0) + 1;
        }
    });

    // Stats
    const totalConfirmed = confirmedReservations.length;
    const totalDeclined = reservations.filter(r => r.status === "declined").length;
    const totalGuests = confirmedReservations.reduce((sum, r) => sum + r.guest_count, 0);
    const avgGuestsPerReservation = totalConfirmed > 0 ? Math.round(totalGuests / totalConfirmed) : 0;

    return {
        totalReservations: reservations.length,
        totalConfirmed,
        totalDeclined,
        totalGuests,
        avgGuestsPerReservation,
        mostPopularDay: dayNames[parseInt(mostPopularDay[0])],
        mostPopularDayCount: mostPopularDay[1],
        packageCount,
        dayOfWeekData: dayNames.map((name, i) => ({ name, count: dayOfWeekCount[i] }))
    };
}
