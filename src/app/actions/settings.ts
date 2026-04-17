"use server";

import { createClient } from "@/lib/supabase/server";

export interface ReservationConfig {
    seasonStart: string; // MM-DD
    seasonEnd: string; // MM-DD
    restrictionStart: string; // MM-DD
    restrictionEnd: string; // MM-DD
    rules: {
        parasolMaxGuests: number;
        cabanePailloteMaxGuests: number;
        vipMinGuests: number;
    };
    weeklyOffers: Record<string, { type: "discount" | "free_children"; value: string; description: string } | null>;
}

const DEFAULT_CONFIG: ReservationConfig = {
    seasonStart: "06-01",
    seasonEnd: "09-30",
    restrictionStart: "06-01",
    restrictionEnd: "07-15",
    rules: {
        parasolMaxGuests: 3,
        cabanePailloteMaxGuests: 5,
        vipMinGuests: 6
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

    return data.value as ReservationConfig;
}

export async function saveReservationConfig(config: ReservationConfig) {
    const supabase = await createClient();

    // Vérifier les droits d'administration (optionnel: vous pouvez rajouter un vrai check si vous avez un rôle admin)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Non autorisé" };
    }

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
