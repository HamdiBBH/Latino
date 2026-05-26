"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CMS_ROLES, STAFF_ROLES, ADMIN_ROLES, AppRole, forbidden, requireRole } from "@/lib/authz";

/**
 * Update site content (DEV role only)
 */
export async function updateSiteContent(
    id: string,
    value: { text: string; type: string }
) {
    try {
        const auth = await requireRole(CMS_ROLES);
        if (!auth.authorized) return forbidden(auth.error);
        const { supabase } = auth;

        const { error } = await supabase
            .from("site_content")
            .update({ value, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/");
        revalidatePath("/dashboard/site-editor/texts");
        return { success: true };
    } catch (error) {
        console.error("Error updating site content:", error);
        return { success: false, message: "Erreur lors de la mise à jour." };
    }
}

/**
 * Batch update site content (DEV role only)
 */
export async function batchUpdateSiteContent(
    updates: Array<{ id: string; value: { text: string; type: string } }>
) {
    try {
        const auth = await requireRole(CMS_ROLES);
        if (!auth.authorized) return forbidden(auth.error);
        const { supabase } = auth;

        // Update each item
        for (const update of updates) {
            const { error } = await supabase
                .from("site_content")
                .update({ value: update.value, updated_at: new Date().toISOString() })
                .eq("id", update.id);

            if (error) throw error;
        }

        revalidatePath("/");
        revalidatePath("/dashboard/site-editor/texts");
        return { success: true, count: updates.length };
    } catch (error) {
        console.error("Error batch updating site content:", error);
        return { success: false, message: "Erreur lors de la mise à jour." };
    }
}

/**
 * Update site branding (DEV role only)
 */
export async function updateSiteBranding(
    key: string,
    value: string
) {
    try {
        const auth = await requireRole(CMS_ROLES);
        if (!auth.authorized) return forbidden(auth.error);
        const { supabase } = auth;

        const { error } = await supabase
            .from("site_branding")
            .update({ value, updated_at: new Date().toISOString() })
            .eq("key", key);

        if (error) throw error;

        revalidatePath("/");
        revalidatePath("/dashboard/site-editor/theme");
        return { success: true };
    } catch (error) {
        console.error("Error updating site branding:", error);
        return { success: false, message: "Erreur lors de la mise à jour." };
    }
}

/**
 * Update order status (RESTAURANT role)
 */
export async function updateOrderStatus(
    id: string,
    status: "new" | "preparing" | "ready" | "served" | "paid" | "cancelled"
) {
    try {
        const auth = await requireRole(STAFF_ROLES);
        if (!auth.authorized) return forbidden(auth.error);
        const { supabase } = auth;

        const { error } = await supabase
            .from("orders")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) throw error;

        // No revalidation needed - using Supabase Realtime
        return { success: true };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false };
    }
}

/**
 * Get all site content for CMS editor
 */
export async function getSiteContent() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("site_content")
            .select("*")
            .order("section", { ascending: true });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching site content:", error);
        return { success: false, data: [] };
    }
}

/**
 * Update a user's role (ADMIN role only)
 */
export async function updateUserRole(userId: string, role: AppRole) {
    try {
        const auth = await requireRole(ADMIN_ROLES);
        if (!auth.authorized) return forbidden(auth.error);
        const { supabase } = auth;

        const { error } = await supabase
            .from("profiles")
            .update({ role, updated_at: new Date().toISOString() })
            .eq("id", userId);

        if (error) throw error;

        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: "Erreur lors de la modification du rôle." };
    }
}
