"use client";

import { useState, useEffect } from "react";
import { Crown, Star, Award, Gift, Calendar, Phone, Mail, User, X, TrendingUp, Clock } from "lucide-react";
import { getCustomerByEmail, getCustomerOffers, type Customer, type SpecialOffer } from "@/app/actions/loyalty";
import { getLoyaltyTier, getLoyaltyBenefits, type LoyaltyTier } from "@/lib/loyalty-utils";

interface CustomerProfileProps {
    email: string;
    onClose?: () => void;
}

const tierColors = {
    bronze: { bg: "#FED7AA", text: "#9A3412", icon: "#EA580C" },
    silver: { bg: "#E5E7EB", text: "#374151", icon: "#6B7280" },
    gold: { bg: "#FEF3C7", text: "#92400E", icon: "#F59E0B" },
    platinum: { bg: "#E0E7FF", text: "#3730A3", icon: "#6366F1" },
};

const tierIcons = {
    bronze: Award,
    silver: Star,
    gold: Crown,
    platinum: Crown,
};

export function CustomerProfile({ email, onClose }: CustomerProfileProps) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [offers, setOffers] = useState<SpecialOffer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustomer();
    }, [email]);

    const loadCustomer = async () => {
        setLoading(true);
        const [customerData, offersData] = await Promise.all([
            getCustomerByEmail(email),
            getCustomerOffers(email)
        ]);
        setCustomer(customerData);
        setOffers(offersData);
        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "#7A7A7A" }}>Chargement...</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <User style={{ width: 48, height: 48, color: "#E5E7EB", margin: "0 auto 1rem" }} />
                <p style={{ color: "#7A7A7A" }}>Nouveau client</p>
                <p style={{ fontSize: "0.875rem", color: "#9CA3AF" }}>Première visite</p>
            </div>
        );
    }

    const tier = getLoyaltyTier(customer.visit_count);
    const benefits = getLoyaltyBenefits(tier);
    const TierIcon = tierIcons[tier];
    const colors = tierColors[tier];

    return (
        <div style={{ backgroundColor: "#FFF", borderRadius: "16px", overflow: "hidden" }}>
            {/* Header with tier */}
            <div style={{
                padding: "1.5rem",
                background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg}88)`,
                position: "relative"
            }}>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer" }}
                    >
                        <X style={{ width: 20, height: 20, color: colors.text }} />
                    </button>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        backgroundColor: "#FFF", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <TierIcon style={{ width: 28, height: 28, color: colors.icon }} />
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: "1.25rem", color: colors.text }}>
                            {customer.name || "Client"}
                        </p>
                        <p style={{ fontSize: "0.875rem", color: colors.text, opacity: 0.8, textTransform: "uppercase", letterSpacing: 1 }}>
                            {tier} Member
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", backgroundColor: "#E5E7EB" }}>
                <div style={{ padding: "1rem", backgroundColor: "#FFF", textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222" }}>{customer.visit_count}</p>
                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>Visites</p>
                </div>
                <div style={{ padding: "1rem", backgroundColor: "#FFF", textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#E8A87C" }}>{customer.loyalty_points}</p>
                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>Points</p>
                </div>
                <div style={{ padding: "1rem", backgroundColor: "#FFF", textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#22C55E" }}>{customer.total_spent}</p>
                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>DT dépensés</p>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: "1.5rem" }}>
                {/* Contact info */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Mail style={{ width: 14, height: 14, color: "#7A7A7A" }} />
                        <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{customer.email}</span>
                    </div>
                    {customer.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <Phone style={{ width: 14, height: 14, color: "#7A7A7A" }} />
                            <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{customer.phone}</span>
                        </div>
                    )}
                    {customer.first_visit_date && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Calendar style={{ width: 14, height: 14, color: "#7A7A7A" }} />
                            <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>
                                Depuis {new Date(customer.first_visit_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Active offers */}
                {offers.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7A7A7A", marginBottom: "8px", textTransform: "uppercase" }}>
                            Offres actives
                        </p>
                        {offers.map((offer, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "10px 12px", backgroundColor: "#DCFCE7", borderRadius: "8px", marginBottom: "6px"
                            }}>
                                <span style={{ fontSize: "0.875rem", color: "#166534" }}>{offer.message}</span>
                                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#22C55E" }}>-{offer.discount}%</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Benefits */}
                <div>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7A7A7A", marginBottom: "8px", textTransform: "uppercase" }}>
                        Avantages {tier}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {benefits.map((benefit, i) => (
                            <div key={i} style={{ fontSize: "0.875rem", color: "#222" }}>
                                {benefit}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next tier progress */}
                {tier !== "platinum" && (
                    <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#F9F5F0", borderRadius: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <TrendingUp style={{ width: 16, height: 16, color: "#E8A87C" }} />
                            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222" }}>
                                Prochain niveau
                            </span>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>
                            {tier === "bronze" && `Encore ${3 - customer.visit_count} visite(s) pour devenir Silver`}
                            {tier === "silver" && `Encore ${5 - customer.visit_count} visite(s) pour devenir Gold`}
                            {tier === "gold" && `Encore ${10 - customer.visit_count} visite(s) pour devenir Platinum`}
                        </p>
                        <div style={{ marginTop: "8px", height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                                width: tier === "bronze" ? `${(customer.visit_count / 3) * 100}%` :
                                    tier === "silver" ? `${((customer.visit_count - 3) / 2) * 100}%` :
                                        `${((customer.visit_count - 5) / 5) * 100}%`,
                                height: "100%",
                                backgroundColor: "#E8A87C",
                                borderRadius: 3,
                            }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// LOYALTY BADGE (Compact version)
// ============================================

interface LoyaltyBadgeProps {
    visitCount: number;
    showLabel?: boolean;
}

export function LoyaltyBadge({ visitCount, showLabel = false }: LoyaltyBadgeProps) {
    const tier = getLoyaltyTier(visitCount);
    const colors = tierColors[tier];
    const TierIcon = tierIcons[tier];

    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: showLabel ? "4px 10px" : "4px",
            backgroundColor: colors.bg, borderRadius: "100px"
        }}>
            <TierIcon style={{ width: 14, height: 14, color: colors.icon }} />
            {showLabel && (
                <span style={{ fontSize: "0.75rem", fontWeight: 500, color: colors.text, textTransform: "capitalize" }}>
                    {tier}
                </span>
            )}
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: colors.text }}>
                {visitCount}x
            </span>
        </div>
    );
}
