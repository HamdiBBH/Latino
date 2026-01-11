"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================
// INSTALLATIONS
// ============================================

export async function getInstallations() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("installations")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching installations:", error);
        return [];
    }
    return data;
}

export async function getActiveInstallations() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("installations")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching active installations:", error);
        return [];
    }
    return data;
}

// ============================================
// RESERVATIONS
// ============================================

export async function getReservations(filters?: {
    status?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
}) {
    const supabase = await createClient();

    let query = supabase
        .from("reservations")
        .select("*")
        .order("reservation_date", { ascending: true });

    if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
    }

    if (filters?.date) {
        query = query.eq("reservation_date", filters.date);
    }

    if (filters?.startDate) {
        query = query.gte("reservation_date", filters.startDate);
    }

    if (filters?.endDate) {
        query = query.lte("reservation_date", filters.endDate);
    }

    const { data, error } = await query;

    console.log("getReservations - filters:", filters);
    console.log("getReservations - data count:", data?.length);
    console.log("getReservations - error:", error);

    if (error) {
        console.error("Error fetching reservations:", error);
        return [];
    }

    // Fetch package names separately
    if (data && data.length > 0) {
        const packageIds = [...new Set(data.map(r => r.package_id).filter(Boolean))];
        const { data: packages } = await supabase
            .from("packages")
            .select("id, name")
            .in("id", packageIds);

        const packageMap = new Map(packages?.map(p => [p.id, p.name]) || []);

        return data.map(r => ({
            ...r,
            packages: { name: packageMap.get(r.package_id) || "Forfait" }
        }));
    }

    return data || [];
}

export async function getReservation(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("reservations")
        .select("*, packages(*)")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching reservation:", error);
        return null;
    }
    return data;
}

export async function getPendingReservationsCount() {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

    if (error) {
        console.error("Error counting pending reservations:", error);
        return 0;
    }
    return count || 0;
}

export async function updateReservationStatus(
    id: string,
    status: "confirmed" | "declined" | "alternative_proposed",
    notes?: string,
    alternativeDate?: string,
    alternativeInstallationId?: string
) {
    const supabase = await createClient();

    const updates: Record<string, unknown> = {
        status,
        manager_notes: notes || null,
        updated_at: new Date().toISOString(),
    };

    if (status === "alternative_proposed") {
        updates.alternative_date = alternativeDate || null;
        updates.alternative_package_id = alternativeInstallationId || null;
    }

    const { error } = await supabase
        .from("reservations")
        .update(updates)
        .eq("id", id);

    if (error) {
        console.error("Error updating reservation:", error);
        return { success: false, error: error.message };
    }

    // TODO: Send email notification to guest

    revalidatePath("/dashboard/reservations");
    return { success: true };
}

export async function confirmReservation(id: string, notes?: string) {
    return updateReservationStatus(id, "confirmed", notes);
}

export async function declineReservation(id: string, reason: string) {
    return updateReservationStatus(id, "declined", reason);
}

export async function proposeAlternative(
    id: string,
    alternativeDate: string,
    alternativeInstallationId: string,
    notes?: string
) {
    return updateReservationStatus(id, "alternative_proposed", notes, alternativeDate, alternativeInstallationId);
}

// ============================================
// STATS
// ============================================

export async function getReservationStats() {
    const supabase = await createClient();

    const today = new Date().toISOString().split("T")[0];

    // Today's reservations
    const { count: todayCount } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .eq("reservation_date", today)
        .eq("status", "confirmed");

    // Pending count
    const { count: pendingCount } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

    // This week confirmed
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const { count: weekCount } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .gte("reservation_date", weekStart.toISOString().split("T")[0])
        .lte("reservation_date", weekEnd.toISOString().split("T")[0])
        .eq("status", "confirmed");

    return {
        todayConfirmed: todayCount || 0,
        pending: pendingCount || 0,
        weekConfirmed: weekCount || 0,
    };
}

// ============================================
// CREATE RESERVATION WITH AUTO-CONFIRM
// ============================================

const MAX_DAILY_CAPACITY = 50;

export async function createReservation(data: {
    package_id: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    reservation_date: string;
    time_slot: string;
    guest_count: number;
    special_request?: string;
    estimated_price: number;
    autoConfirmEnabled?: boolean;
}) {
    const supabase = await createClient();

    // Check current capacity for the date
    const { data: existingReservations } = await supabase
        .from("reservations")
        .select("guest_count")
        .eq("reservation_date", data.reservation_date)
        .in("status", ["pending", "confirmed"]);

    const currentGuests = existingReservations?.reduce((sum, r) => sum + r.guest_count, 0) || 0;
    const capacityPercent = ((currentGuests + data.guest_count) / MAX_DAILY_CAPACITY) * 100;

    // Auto-confirm if enabled and capacity < 50%
    const shouldAutoConfirm = data.autoConfirmEnabled && capacityPercent < 50;

    const { data: reservation, error } = await supabase
        .from("reservations")
        .insert({
            package_id: data.package_id,
            guest_name: data.guest_name,
            guest_email: data.guest_email,
            guest_phone: data.guest_phone,
            reservation_date: data.reservation_date,
            time_slot: data.time_slot,
            guest_count: data.guest_count,
            special_request: data.special_request || null,
            estimated_price: data.estimated_price,
            status: shouldAutoConfirm ? "confirmed" : "pending",
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating reservation:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/reservations");

    return {
        success: true,
        data: reservation,
        autoConfirmed: shouldAutoConfirm
    };
}
