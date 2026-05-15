"use server";

import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROLES, forbidden, requireRole } from "@/lib/authz";
import { type LoyaltyConfig } from "@/lib/loyalty-utils";

const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
    pointsPerVisit: 100,
    tiers: [
        {
            id: "bronze",
            name: "Bronze",
            icon: "🥉",
            minPoints: 0,
            maxPoints: 299,
            color: "#CD7F32",
            discountPercent: 0,
            benefits: ["Accueil personnalisé", "Newsletter exclusive"],
        },
        {
            id: "silver",
            name: "Silver",
            icon: "🥈",
            minPoints: 300,
            maxPoints: 499,
            color: "#C0C0C0",
            discountPercent: 15,
            benefits: ["15% de réduction", "Jus de bienvenue", "Réservation prioritaire"],
        },
        {
            id: "gold",
            name: "Gold",
            icon: "🥇",
            minPoints: 500,
            maxPoints: null,
            color: "#FFD700",
            discountPercent: 20,
            benefits: ["20% de réduction", "Upgrade zone gratuit", "Service conciergerie dédié"],
        },
    ],
};

export async function getLoyaltyConfig(): Promise<LoyaltyConfig> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "loyalty_config")
        .single();

    if (error || !data) {
        return DEFAULT_LOYALTY_CONFIG;
    }

    return { ...DEFAULT_LOYALTY_CONFIG, ...(data.value as LoyaltyConfig) };
}

export async function saveLoyaltyConfig(config: LoyaltyConfig) {
    const auth = await requireRole(ADMIN_ROLES);
    if (!auth.authorized) return forbidden(auth.error);
    const { supabase, user } = auth;

    const { error } = await supabase.from("app_settings").upsert({
        key: "loyalty_config",
        value: config as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
