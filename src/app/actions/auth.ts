"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Sign out user
 */
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
}

/**
 * Get current user with profile
 */
export async function getCurrentUser() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return {
        id: user.id,
        email: user.email,
        ...profile,
    };
}

/**
 * Update user profile
 */
export async function updateProfile(data: {
    full_name?: string;
    phone?: string;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "Non authentifié" };
    }

    const { error } = await supabase
        .from("profiles")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", user.id);

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true };
}
