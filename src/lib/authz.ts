import { createClient } from "@/lib/supabase/server";

export type AppRole = "DEV" | "CLIENT" | "RESTAURANT" | "MANAGER" | "ADMIN";

export const CMS_ROLES: AppRole[] = ["DEV", "ADMIN"];
export const MANAGER_ROLES: AppRole[] = ["MANAGER", "ADMIN"];
export const STAFF_ROLES: AppRole[] = ["RESTAURANT", "MANAGER", "ADMIN"];
export const ADMIN_ROLES: AppRole[] = ["ADMIN"];

export async function requireRole(allowedRoles: AppRole[]) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { authorized: false as const, error: "Non authentifié", supabase, user: null, role: null };
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (error || !profile?.role || !allowedRoles.includes(profile.role as AppRole)) {
        return { authorized: false as const, error: "Non autorisé", supabase, user, role: profile?.role || null };
    }

    return { authorized: true as const, supabase, user, role: profile.role as AppRole };
}

export function forbidden(message = "Non autorisé") {
    return { success: false as const, error: message };
}
