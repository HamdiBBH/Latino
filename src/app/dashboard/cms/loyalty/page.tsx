"use client";

import { useState, useEffect, useTransition } from "react";
import { Trophy, Save, Plus, Trash2, AlertCircle, CheckCircle, Percent, Star, Gift } from "lucide-react";
import { getLoyaltyConfig, saveLoyaltyConfig } from "@/app/actions/loyaltyConfig";
import { type LoyaltyConfig, type LoyaltyTierConfig } from "@/lib/loyalty-utils";

const TIER_EMOJIS = ["🥉", "🥈", "🥇", "💎", "👑", "⭐"];
const TIER_COLORS = ["#CD7F32", "#C0C0C0", "#FFD700", "#B9F2FF", "#E8A87C", "#6366F1"];

export default function LoyaltyCMSPage() {
    const [config, setConfig] = useState<LoyaltyConfig | null>(null);
    const [saving, startSave] = useTransition();
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLoyaltyConfig().then((c) => {
            setConfig(c);
            setLoading(false);
        });
    }, []);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSave = () => {
        if (!config) return;
        startSave(async () => {
            const result = await saveLoyaltyConfig(config);
            if (result && "success" in result && result.success) {
                showToast("success", "Configuration enregistrée !");
            } else {
                showToast("error", "Erreur lors de la sauvegarde.");
            }
        });
    };

    const updateTier = (index: number, updates: Partial<LoyaltyTierConfig>) => {
        if (!config) return;
        const tiers = config.tiers.map((t, i) => (i === index ? { ...t, ...updates } : t));
        setConfig({ ...config, tiers });
    };

    const addBenefit = (tierIndex: number) => {
        if (!config) return;
        const tier = config.tiers[tierIndex];
        updateTier(tierIndex, { benefits: [...tier.benefits, "Nouvel avantage"] });
    };

    const removeBenefit = (tierIndex: number, bIndex: number) => {
        if (!config) return;
        const tier = config.tiers[tierIndex];
        updateTier(tierIndex, { benefits: tier.benefits.filter((_, i) => i !== bIndex) });
    };

    const updateBenefit = (tierIndex: number, bIndex: number, value: string) => {
        if (!config) return;
        const tier = config.tiers[tierIndex];
        const benefits = tier.benefits.map((b, i) => (i === bIndex ? value : b));
        updateTier(tierIndex, { benefits });
    };

    const addTier = () => {
        if (!config) return;
        const lastTier = config.tiers[config.tiers.length - 1];
        const newMinPoints = lastTier ? lastTier.minPoints + 200 : 0;
        const newTier: LoyaltyTierConfig = {
            id: `tier_${Date.now()}`,
            name: "Nouveau Palier",
            icon: TIER_EMOJIS[config.tiers.length % TIER_EMOJIS.length],
            minPoints: newMinPoints,
            maxPoints: null,
            color: TIER_COLORS[config.tiers.length % TIER_COLORS.length],
            discountPercent: 0,
            benefits: ["Avantage exclusif"],
        };
        setConfig({ ...config, tiers: [...config.tiers, newTier] });
    };

    const removeTier = (index: number) => {
        if (!config || config.tiers.length <= 1) return;
        setConfig({ ...config, tiers: config.tiers.filter((_, i) => i !== index) });
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
                    <p style={{ color: "#6B7280" }}>Chargement de la configuration...</p>
                </div>
            </div>
        );
    }

    if (!config) return null;

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        top: "24px",
                        right: "24px",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "14px 20px",
                        borderRadius: "12px",
                        backgroundColor: toast.type === "success" ? "#ECFDF5" : "#FEF2F2",
                        border: `1px solid ${toast.type === "success" ? "#6EE7B7" : "#FCA5A5"}`,
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        color: toast.type === "success" ? "#065F46" : "#991B1B",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                    }}
                >
                    {toast.type === "success" ? <CheckCircle style={{ width: 20, height: 20 }} /> : <AlertCircle style={{ width: 20, height: 20 }} />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                        <Trophy style={{ width: 32, height: 32, color: "#F59E0B" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222" }}>
                            Programme de Fidélité
                        </h1>
                    </div>
                    <p style={{ color: "#7A7A7A" }}>
                        Définissez les règles de points, les paliers et les avantages clients
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        backgroundColor: saving ? "#9CA3AF" : "#E8A87C",
                        color: "#FFF",
                        border: "none",
                        borderRadius: "100px",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        cursor: saving ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                    }}
                >
                    <Save style={{ width: 18, height: 18 }} />
                    {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
            </div>

            {/* Points per visit */}
            <div
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "20px",
                    padding: "1.5rem 2rem",
                    marginBottom: "2rem",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "12px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Star style={{ width: 22, height: 22, color: "#F59E0B" }} />
                    </div>
                    <div>
                        <h2 style={{ fontWeight: 700, color: "#222", fontSize: "1.1rem" }}>Points par visite</h2>
                        <p style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>Nombre de points attribués automatiquement à chaque visite</p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <input
                        type="number"
                        min={1}
                        max={10000}
                        value={config.pointsPerVisit}
                        onChange={(e) => setConfig({ ...config, pointsPerVisit: parseInt(e.target.value) || 100 })}
                        style={{
                            width: "160px",
                            padding: "12px 16px",
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "#F59E0B",
                            border: "2px solid #FDE68A",
                            borderRadius: "12px",
                            textAlign: "center",
                            outline: "none",
                        }}
                    />
                    <span style={{ color: "#6B7280", fontWeight: 500 }}>points par visite</span>
                </div>
            </div>

            {/* Tiers */}
            <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#222" }}>Paliers de fidélité</h2>
                <button
                    onClick={addTier}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 18px",
                        backgroundColor: "#F3F4F6",
                        border: "1px dashed #D1D5DB",
                        borderRadius: "100px",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        color: "#374151",
                        cursor: "pointer",
                    }}
                >
                    <Plus style={{ width: 16, height: 16 }} />
                    Ajouter un palier
                </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
                {config.tiers.map((tier, idx) => (
                    <div
                        key={tier.id}
                        style={{
                            backgroundColor: "#FFF",
                            borderRadius: "20px",
                            border: `2px solid ${tier.color}40`,
                            boxShadow: `0 4px 20px ${tier.color}15`,
                            overflow: "hidden",
                        }}
                    >
                        {/* Tier Header */}
                        <div
                            style={{
                                background: `linear-gradient(135deg, ${tier.color}20, ${tier.color}08)`,
                                padding: "1.25rem 1.5rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                borderBottom: `1px solid ${tier.color}20`,
                            }}
                        >
                            <div style={{ fontSize: "2rem" }}>{tier.icon}</div>
                            <div style={{ flex: 1 }}>
                                <input
                                    value={tier.name}
                                    onChange={(e) => updateTier(idx, { name: e.target.value })}
                                    style={{
                                        fontSize: "1.25rem",
                                        fontWeight: 700,
                                        color: "#222",
                                        border: "none",
                                        background: "transparent",
                                        outline: "none",
                                        width: "100%",
                                    }}
                                />
                            </div>
                            {/* Icon picker */}
                            <div style={{ display: "flex", gap: "4px" }}>
                                {TIER_EMOJIS.map((em) => (
                                    <button
                                        key={em}
                                        onClick={() => updateTier(idx, { icon: em })}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "8px",
                                            border: tier.icon === em ? `2px solid ${tier.color}` : "2px solid transparent",
                                            background: "none",
                                            cursor: "pointer",
                                            fontSize: "1rem",
                                        }}
                                    >
                                        {em}
                                    </button>
                                ))}
                            </div>
                            {config.tiers.length > 1 && (
                                <button
                                    onClick={() => removeTier(idx)}
                                    style={{ padding: "6px", backgroundColor: "#FEE2E2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#B91C1C" }}
                                >
                                    <Trash2 style={{ width: 16, height: 16 }} />
                                </button>
                            )}
                        </div>

                        {/* Tier Body */}
                        <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            {/* Left: Points & discount */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", color: "#6B7280", fontWeight: 500, marginBottom: "6px" }}>
                                        Points minimum requis
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={tier.minPoints}
                                        onChange={(e) => updateTier(idx, { minPoints: parseInt(e.target.value) || 0 })}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            border: "1px solid #E5E7EB",
                                            borderRadius: "10px",
                                            fontSize: "1rem",
                                            fontWeight: 600,
                                            outline: "none",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", color: "#6B7280", fontWeight: 500, marginBottom: "6px" }}>
                                        <Percent style={{ width: 12, height: 12, display: "inline", marginRight: "4px" }} />
                                        Réduction accordée
                                    </label>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={tier.discountPercent}
                                            onChange={(e) => updateTier(idx, { discountPercent: parseInt(e.target.value) || 0 })}
                                            style={{
                                                width: "100px",
                                                padding: "10px 14px",
                                                border: `2px solid ${tier.color}60`,
                                                borderRadius: "10px",
                                                fontSize: "1.1rem",
                                                fontWeight: 700,
                                                color: tier.color,
                                                outline: "none",
                                                textAlign: "center",
                                            }}
                                        />
                                        <span style={{ fontSize: "1.25rem", fontWeight: 700, color: tier.color }}>%</span>
                                        {tier.discountPercent === 0 && (
                                            <span style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>(aucune réduction)</span>
                                        )}
                                    </div>
                                </div>

                                {/* Color picker */}
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", color: "#6B7280", fontWeight: 500, marginBottom: "6px" }}>
                                        Couleur du palier
                                    </label>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        {TIER_COLORS.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => updateTier(idx, { color: c })}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: "50%",
                                                    backgroundColor: c,
                                                    border: tier.color === c ? "3px solid #222" : "3px solid transparent",
                                                    cursor: "pointer",
                                                    outline: "none",
                                                }}
                                            />
                                        ))}
                                        <input
                                            type="color"
                                            value={tier.color}
                                            onChange={(e) => updateTier(idx, { color: e.target.value })}
                                            style={{ width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0, backgroundColor: "transparent" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right: Benefits */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "#6B7280", fontWeight: 500, marginBottom: "10px" }}>
                                    <Gift style={{ width: 12, height: 12, display: "inline", marginRight: "4px" }} />
                                    Avantages inclus
                                </label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                                    {tier.benefits.map((benefit, bIdx) => (
                                        <div key={bIdx} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span style={{ color: tier.color, fontSize: "0.9rem" }}>✓</span>
                                            <input
                                                value={benefit}
                                                onChange={(e) => updateBenefit(idx, bIdx, e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: "8px 12px",
                                                    border: "1px solid #E5E7EB",
                                                    borderRadius: "8px",
                                                    fontSize: "0.875rem",
                                                    outline: "none",
                                                }}
                                            />
                                            <button
                                                onClick={() => removeBenefit(idx, bIdx)}
                                                style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}
                                            >
                                                <Trash2 style={{ width: 14, height: 14 }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => addBenefit(idx)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        padding: "6px 12px",
                                        background: "none",
                                        border: `1px dashed ${tier.color}80`,
                                        borderRadius: "8px",
                                        fontSize: "0.8rem",
                                        color: tier.color,
                                        cursor: "pointer",
                                    }}
                                >
                                    <Plus style={{ width: 14, height: 14 }} />
                                    Ajouter un avantage
                                </button>
                            </div>
                        </div>

                        {/* Tier Summary Badge */}
                        <div
                            style={{
                                padding: "0.75rem 1.5rem",
                                background: `${tier.color}08`,
                                borderTop: `1px solid ${tier.color}20`,
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "0.8rem",
                                color: "#6B7280",
                            }}
                        >
                            <span style={{ fontWeight: 600, color: tier.color }}>{tier.icon} {tier.name}</span>
                            <span>—</span>
                            <span>À partir de <strong>{tier.minPoints} pts</strong></span>
                            {tier.discountPercent > 0 && (
                                <>
                                    <span>→</span>
                                    <span style={{ fontWeight: 600, color: "#22C55E" }}>-{tier.discountPercent}% de réduction</span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview */}
            <div
                style={{
                    backgroundColor: "#F9F5F0",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    border: "1px solid #E5E7EB",
                }}
            >
                <h3 style={{ fontWeight: 600, color: "#222", marginBottom: "1rem", fontSize: "1rem" }}>
                    📋 Récapitulatif des règles
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#374151" }}>
                        <Star style={{ width: 16, height: 16, color: "#F59E0B" }} />
                        <strong>{config.pointsPerVisit} points</strong>&nbsp;attribués par visite
                    </div>
                    {config.tiers.map((tier) => (
                        <div key={tier.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#374151" }}>
                            <span>{tier.icon}</span>
                            <strong style={{ color: tier.color }}>{tier.name}</strong>
                            {tier.minPoints > 0 && <span>→ dès {tier.minPoints} pts</span>}
                            {tier.discountPercent > 0 && <span style={{ color: "#22C55E", fontWeight: 600 }}>(-{tier.discountPercent}%)</span>}
                            {tier.discountPercent === 0 && <span style={{ color: "#9CA3AF" }}>(sans réduction)</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
