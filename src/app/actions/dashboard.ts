"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

    if (error) {
        console.error("Error updating order status:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/kitchen");

    return { success: true };
}

export async function getDashboardStats() {
    const supabase = await createClient();

    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    // Count today's reservations
    const { count: reservationsCount } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .eq("reservation_date", today);

    // Count pending orders
    const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "preparing"]);

    return {
        todayReservations: reservationsCount || 0,
        pendingOrders: ordersCount || 0,
    };
}
