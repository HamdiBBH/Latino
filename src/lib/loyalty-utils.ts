// Loyalty utility functions (pure, can be used in both client and server)

export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

// Dynamic tier type (from CMS config)
export interface LoyaltyTierConfig {
    id: string;
    name: string;
    icon: string;
    minPoints: number;
    maxPoints: number | null;
    color: string;
    discountPercent: number;
    benefits: string[];
}

// Get the matching tier for a given points value from dynamic config
export function getTierForPoints(points: number, tiers: LoyaltyTierConfig[]): LoyaltyTierConfig {
    const sorted = [...tiers].sort((a, b) => b.minPoints - a.minPoints);
    return sorted.find((t) => points >= t.minPoints) ?? tiers[0];
}

// Full loyalty program config (stored in app_settings)
export interface LoyaltyConfig {
    pointsPerVisit: number;
    tiers: LoyaltyTierConfig[];
}

export function getLoyaltyTier(visitCount: number): LoyaltyTier {
    if (visitCount >= 10) return "platinum";
    if (visitCount >= 5) return "gold";
    if (visitCount >= 3) return "silver";
    return "bronze";
}

export function getLoyaltyBenefits(tier: LoyaltyTier): string[] {
    switch (tier) {
        case "platinum":
            return [
                "🎉 -20% sur toutes les réservations",
                "🍹 Cocktail offert à chaque visite",
                "⭐ Réservation prioritaire",
                "🎁 Cadeau anniversaire"
            ];
        case "gold":
            return [
                "🎉 -15% sur les réservations",
                "🍹 Cocktail offert",
                "🎁 Cadeau anniversaire"
            ];
        case "silver":
            return [
                "🎉 -10% sur les réservations",
                "🎁 Surprise anniversaire"
            ];
        default:
            return [
                "🎉 -5% à partir de la 3ème visite"
            ];
    }
}

export function getLoyaltyDiscount(tier: LoyaltyTier): number {
    switch (tier) {
        case "platinum": return 20;
        case "gold": return 15;
        case "silver": return 10;
        default: return 0;
    }
}
