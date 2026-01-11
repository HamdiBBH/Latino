"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// CONFLICT DETECTION
// ============================================

export async function detectConflicts() {
    const supabase = await createClient();
    const conflicts: { type: string; message: string; date?: string; details?: string }[] = [];

    // Get all confirmed + pending reservations for the next 30 days
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const { data: reservations } = await supabase
        .from("reservations")
        .select("id, reservation_date, guest_count, guest_email, guest_name, status")
        .gte("reservation_date", today.toISOString().split("T")[0])
        .lte("reservation_date", endDate.toISOString().split("T")[0])
        .in("status", ["pending", "confirmed"]);

    if (!reservations) return { conflicts };

    // Group by date
    const byDate: Record<string, typeof reservations> = {};
    reservations.forEach(r => {
        if (!byDate[r.reservation_date]) byDate[r.reservation_date] = [];
        byDate[r.reservation_date].push(r);
    });

    const MAX_CAPACITY = 50;

    // Check each date
    Object.entries(byDate).forEach(([date, dateReservations]) => {
        const totalGuests = dateReservations.reduce((sum, r) => sum + r.guest_count, 0);

        // 1. Capacity exceeded
        if (totalGuests > MAX_CAPACITY) {
            conflicts.push({
                type: "capacity",
                message: `Capacité dépassée`,
                date,
                details: `${totalGuests}/${MAX_CAPACITY} personnes`
            });
        }

        // 2. Duplicate email on same day
        const emails = dateReservations.map(r => r.guest_email.toLowerCase());
        const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
        if (duplicates.length > 0) {
            conflicts.push({
                type: "duplicate",
                message: `Double réservation détectée`,
                date,
                details: `Email: ${duplicates[0]}`
            });
        }
    });

    return { conflicts };
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
