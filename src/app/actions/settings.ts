"use server";

import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROLES, forbidden, requireRole } from "@/lib/authz";

export interface ReservationConfig {
    seasonStart: string; // MM-DD
    seasonEnd: string; // MM-DD
    restrictionStart: string; // MM-DD
    restrictionEnd: string; // MM-DD
    bookingWindowStart?: string; // YYYY-MM-DD
    bookingWindowEnd?: string; // YYYY-MM-DD
    rules: {
        parasolMaxAdults: number;
        cabaneMinAdults: number;
        pailloteMinAdults: number;
        vipMinAdults: number;
    };
    weeklyOffers: Record<string, { type: "discount" | "free_children"; value: string; description: string } | null>;
}

const DEFAULT_CONFIG: ReservationConfig = {
    seasonStart: "06-01",
    seasonEnd: "09-30",
    restrictionStart: "06-01",
    restrictionEnd: "07-15",
    bookingWindowStart: "",
    bookingWindowEnd: "",
    rules: {
        parasolMaxAdults: 4,
        cabaneMinAdults: 3,
        pailloteMinAdults: 4,
        vipMinAdults: 6
    },
    weeklyOffers: {
        "3": { type: "free_children", value: "2", description: "2 enfants gratuits" },
        "5": { type: "discount", value: "-20%", description: "-20% sur votre réservation" }
    }
};

export async function getReservationConfig(): Promise<ReservationConfig> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "reservation_config")
        .single();

    if (error || !data) {
        console.error("Failed to load reservation config, falling back to default:", error);
        return DEFAULT_CONFIG;
    }

    const config = data.value as any;

    // Migration pour l'ancien schéma vers le nouveau basé sur la matrice
    if (config.rules && config.rules.parasolMaxGuests !== undefined) {
        config.rules = {
            parasolMaxAdults: 4, // Force default from matrix
            cabaneMinAdults: 3,  // Force default from matrix
            pailloteMinAdults: 4, // Force default from matrix
            vipMinAdults: config.rules.vipMinGuests || 6
        };
        delete config.rules.parasolMaxGuests;
        delete config.rules.cabanePailloteMaxGuests;
        delete config.rules.vipMinGuests;
    }

    return { 
        ...DEFAULT_CONFIG, 
        ...config, 
        rules: { ...DEFAULT_CONFIG.rules, ...(config.rules || {}) } 
    } as ReservationConfig;
}

export async function saveReservationConfig(config: ReservationConfig) {
    const auth = await requireRole(ADMIN_ROLES);
    if (!auth.authorized) return forbidden(auth.error);
    const { supabase, user } = auth;

    const { error } = await supabase
        .from("app_settings")
        .upsert({
            key: "reservation_config",
            value: config as unknown as any,
            updated_at: new Date().toISOString(),
            updated_by: user.id
        });

    if (error) {
        console.error("Failed to save reservation config:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
