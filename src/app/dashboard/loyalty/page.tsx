"use client";

import { useState } from "react";
import { Trophy, Star, ChevronLeft, Gift, TrendingUp, Award, Crown, Diamond, ArrowRight, Lock, Check } from "lucide-react";
import Link from "next/link";

// VIP Levels
const vipLevels = [
    { id: "bronze", name: "Bronze", icon: "🥉", minPoints: 0, color: "#CD7F32", benefits: ["Accueil personnalisé", "Newsletter exclusive"] },
    { id: "silver", name: "Silver", icon: "🥈", minPoints: 500, color: "#C0C0C0", benefits: ["Jus de bienvenue", "Réservation prioritaire"] },
    { id: "gold", name: "Gold", icon: "🥇", minPoints: 1500, color: "#FFD700", benefits: ["Upgrade zone gratuit", "-10% sur extras"] },
    { id: "diamond", name: "Diamond", icon: "💎", minPoints: 5000, color: "#B9F2FF", benefits: ["Cabane VIP offerte/an", "Service conciergerie dédié"] },
];

// Badges
const badges = [
    { id: "first_visit", name: "Première Vague", description: "Première visite", icon: "🌊", earned: true, earnedDate: "15 juin 2024" },
    { id: "summer_lover", name: "Summer Lover", description: "5 visites", icon: "☀️", earned: true, earnedDate: "28 juillet 2024" },
    { id: "cocktail_master", name: "Mocktail Master", description: "10 mocktails commandés", icon: "🍹", earned: true, earnedDate: "10 août 2024" },
    { id: "early_bird", name: "Early Bird", description: "Arrivée avant 10h", icon: "🐦", earned: true, earnedDate: "5 août 2024" },
    { id: "sunset_chaser", name: "Sunset Chaser", description: "10 couchers de soleil", icon: "🌅", earned: false, progress: 7, target: 10 },
    { id: "vip_regular", name: "VIP Regular", description: "20 visites", icon: "👑", earned: false, progress: 8, target: 20 },
    { id: "food_lover", name: "Food Lover", description: "Commander 5 déjeuners différents", icon: "🍽️", earned: false, progress: 3, target: 5 },
    { id: "social_butterfly", name: "Social Butterfly", description: "Parrainer 3 amis", icon: "🦋", earned: false, progress: 1, target: 3 },
];

// Points history
const pointsHistory = [
    { id: "1", type: "earn", amount: 100, description: "Visite du 15 août", date: "15 août 2024" },
    { id: "2", type: "earn", amount: 50, description: "Bonus Happy Hour", date: "15 août 2024" },
    { id: "3", type: "spend", amount: -200, description: "Mocktail offert", date: "10 août 2024" },
    { id: "4", type: "earn", amount: 100, description: "Visite du 5 août", date: "5 août 2024" },
    { id: "5", type: "earn", amount: 150, description: "Parrainage validé", date: "28 juillet 2024" },
];

// Rewards
const rewards = [
    { id: "1", name: "Mocktail Offert", points: 200, icon: "🍹", available: true },
    { id: "2", name: "Dessert Gratuit", points: 150, icon: "🍨", available: true },
    { id: "3", name: "Upgrade Zone", points: 500, icon: "⬆️", available: true },
    { id: "4", name: "Pack VIP Journée", points: 2000, icon: "💎", available: false },
];

// Mock user data
const userLoyalty = {
    points: 850,
    totalPointsEarned: 1250,
    level: "silver",
    visits: 8,
    memberSince: "Mai 2024",
    nextLevelPoints: 1500,
    referralCode: "BEACH850",
};

export default function LoyaltyPage() {
    const [activeTab, setActiveTab] = useState<"overview" | "badges" | "rewards" | "history">("overview");

    const currentLevel = vipLevels.find((l) => l.id === userLoyalty.level)!;
    const nextLevel = vipLevels.find((l) => l.minPoints > currentLevel.minPoints);
    const progressToNext = nextLevel
        ? ((userLoyalty.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
        : 100;

    return (
        <div style={{ maxWidth: "100%" }}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <Link
                    href="/dashboard"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#6B7280",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        marginBottom: "0.5rem",
                    }}
                >
                    <ChevronLeft style={{ width: 16, height: 16 }} />
                    Retour
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Trophy style={{ width: 32, height: 32, color: "#F59E0B" }} />
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222", margin: 0 }}>
                        Programme Fidélité
                    </h1>
                </div>
            </div>

            {/* Points Card */}
            <div
                style={{
                    background: `linear-gradient(135deg, ${currentLevel.color}40 0%, ${currentLevel.color}20 100%)`,
                    borderRadius: "20px",
                    padding: "1.5rem",
                    marginBottom: "1.5rem",
                    border: `2px solid ${currentLevel.color}`,
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "2rem" }}>{currentLevel.icon}</span>
                            <span style={{ fontWeight: 600, color: "#222" }}>{currentLevel.name}</span>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "#6B7280" }}>Membre depuis {userLoyalty.memberSince}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "#222", margin: 0 }}>{userLoyalty.points}</p>
                        <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: 0 }}>points disponibles</p>
                    </div>
                </div>

                {/* Progress to next level */}
                {nextLevel && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "6px" }}>
                            <span style={{ color: "#6B7280" }}>Prochain niveau: {nextLevel.name} {nextLevel.icon}</span>
                            <span style={{ fontWeight: 500, color: "#222" }}>{nextLevel.minPoints - userLoyalty.points} pts restants</span>
                        </div>
                        <div
                            style={{
                                height: "8px",
                                backgroundColor: "rgba(255,255,255,0.5)",
                                borderRadius: "4px",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${progressToNext}%`,
                                    backgroundColor: currentLevel.color,
                                    borderRadius: "4px",
                                    transition: "width 0.5s ease",
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "1rem" }}>
                    <div style={{ textAlign: "center", padding: "10px", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "12px" }}>
                        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#222", margin: 0 }}>{userLoyalty.visits}</p>
                        <p style={{ fontSize: "0.65rem", color: "#6B7280", margin: "2px 0 0 0" }}>Visites</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "10px", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "12px" }}>
                        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#222", margin: 0 }}>{userLoyalty.totalPointsEarned}</p>
                        <p style={{ fontSize: "0.65rem", color: "#6B7280", margin: "2px 0 0 0" }}>Points gagnés</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "10px", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "12px" }}>
                        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#222", margin: 0 }}>{badges.filter(b => b.earned).length}</p>
                        <p style={{ fontSize: "0.65rem", color: "#6B7280", margin: "2px 0 0 0" }}>Badges</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "1.5rem",
                    overflowX: "auto",
                }}
            >
                {[
                    { id: "overview", label: "Aperçu", icon: Star },
                    { id: "badges", label: "Badges", icon: Award },
                    { id: "rewards", label: "Récompenses", icon: Gift },
                    { id: "history", label: "Historique", icon: TrendingUp },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "10px 16px",
                                backgroundColor: activeTab === tab.id ? "#222" : "#FFF",
                                color: activeTab === tab.id ? "#FFF" : "#222",
                                border: activeTab === tab.id ? "none" : "1px solid #E5E7EB",
                                borderRadius: "100px",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <Icon style={{ width: 16, height: 16 }} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
                <div>
                    {/* VIP Levels */}
                    <div
                        style={{
                            backgroundColor: "#FFF",
                            borderRadius: "16px",
                            padding: "1.5rem",
                            marginBottom: "1.5rem",
                            border: "1px solid #E5E7EB",
                        }}
                    >
                        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#222", marginBottom: "1rem" }}>
                            Niveaux VIP
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {vipLevels.map((level) => {
                                const isCurrentLevel = level.id === userLoyalty.level;
                                const isUnlocked = userLoyalty.points >= level.minPoints;

                                return (
                                    <div
                                        key={level.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "12px",
                                            backgroundColor: isCurrentLevel ? `${level.color}20` : "#F9FAFB",
                                            borderRadius: "12px",
                                            border: isCurrentLevel ? `2px solid ${level.color}` : "1px solid #E5E7EB",
                                            opacity: isUnlocked ? 1 : 0.5,
                                        }}
                                    >
                                        <span style={{ fontSize: "1.5rem" }}>{level.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <p style={{ fontWeight: 600, color: "#222", margin: 0 }}>{level.name}</p>
                                                {isCurrentLevel && (
                                                    <span
                                                        style={{
                                                            padding: "2px 6px",
                                                            backgroundColor: level.color,
                                                            color: "#FFF",
                                                            fontSize: "0.6rem",
                                                            fontWeight: 600,
                                                            borderRadius: "100px",
                                                        }}
                                                    >
                                                        ACTUEL
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: "0.7rem", color: "#6B7280", margin: "2px 0 0 0" }}>
                                                {level.minPoints} points • {level.benefits[0]}
                                            </p>
                                        </div>
                                        {!isUnlocked && <Lock style={{ width: 16, height: 16, color: "#9CA3AF" }} />}
                                        {isUnlocked && !isCurrentLevel && <Check style={{ width: 16, height: 16, color: "#22C55E" }} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Referral Code */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                            borderRadius: "16px",
                            padding: "1.5rem",
                            color: "#FFF",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                            <Gift style={{ width: 24, height: 24 }} />
                            <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>Parrainez vos amis</h3>
                        </div>
                        <p style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "1rem" }}>
                            Gagnez 150 points pour chaque ami parrainé !
                        </p>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px 16px",
                                backgroundColor: "rgba(255,255,255,0.2)",
                                borderRadius: "12px",
                            }}
                        >
                            <span style={{ fontWeight: 700, letterSpacing: "2px" }}>{userLoyalty.referralCode}</span>
                            <button
                                style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#FFF",
                                    color: "#6366F1",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Copier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Badges Tab */}
            {activeTab === "badges" && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "12px",
                    }}
                >
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            style={{
                                backgroundColor: "#FFF",
                                borderRadius: "16px",
                                padding: "1rem",
                                border: badge.earned ? "2px solid #22C55E" : "1px solid #E5E7EB",
                                opacity: badge.earned ? 1 : 0.7,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontSize: "2rem" }}>{badge.icon}</span>
                                {badge.earned && <Check style={{ width: 16, height: 16, color: "#22C55E" }} />}
                            </div>
                            <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#222", margin: "0 0 4px 0" }}>
                                {badge.name}
                            </h4>
                            <p style={{ fontSize: "0.7rem", color: "#6B7280", margin: 0 }}>
                                {badge.description}
                            </p>
                            {badge.earned ? (
                                <p style={{ fontSize: "0.65rem", color: "#22C55E", margin: "6px 0 0 0" }}>
                                    ✓ Obtenu le {badge.earnedDate}
                                </p>
                            ) : (
                                <div style={{ marginTop: "8px" }}>
                                    <div
                                        style={{
                                            height: "4px",
                                            backgroundColor: "#E5E7EB",
                                            borderRadius: "2px",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: "100%",
                                                width: `${((badge.progress || 0) / (badge.target || 1)) * 100}%`,
                                                backgroundColor: "#F59E0B",
                                                borderRadius: "2px",
                                            }}
                                        />
                                    </div>
                                    <p style={{ fontSize: "0.6rem", color: "#6B7280", margin: "4px 0 0 0" }}>
                                        {badge.progress}/{badge.target}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Rewards Tab */}
            {activeTab === "rewards" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {rewards.map((reward) => {
                        const canRedeem = userLoyalty.points >= reward.points && reward.available;

                        return (
                            <div
                                key={reward.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "1rem",
                                    backgroundColor: "#FFF",
                                    borderRadius: "16px",
                                    border: "1px solid #E5E7EB",
                                    opacity: reward.available ? 1 : 0.5,
                                }}
                            >
                                <div
                                    style={{
                                        width: "56px",
                                        height: "56px",
                                        backgroundColor: "#FEF3E2",
                                        borderRadius: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1.75rem",
                                    }}
                                >
                                    {reward.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#222", margin: 0 }}>
                                        {reward.name}
                                    </h4>
                                    <p style={{ fontSize: "0.8rem", color: "#F59E0B", fontWeight: 600, margin: "4px 0 0 0" }}>
                                        {reward.points} points
                                    </p>
                                </div>
                                <button
                                    disabled={!canRedeem}
                                    style={{
                                        padding: "10px 16px",
                                        backgroundColor: canRedeem ? "#E8A87C" : "#E5E7EB",
                                        color: canRedeem ? "#FFF" : "#9CA3AF",
                                        border: "none",
                                        borderRadius: "10px",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        cursor: canRedeem ? "pointer" : "not-allowed",
                                    }}
                                >
                                    {canRedeem ? "Échanger" : reward.available ? "Insuffisant" : "Indisponible"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
                <div
                    style={{
                        backgroundColor: "#FFF",
                        borderRadius: "16px",
                        border: "1px solid #E5E7EB",
                        overflow: "hidden",
                    }}
                >
                    {pointsHistory.map((entry, index) => (
                        <div
                            key={entry.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "1rem",
                                borderBottom: index < pointsHistory.length - 1 ? "1px solid #E5E7EB" : "none",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        backgroundColor: entry.type === "earn" ? "#DCFCE7" : "#FEE2E2",
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {entry.type === "earn" ? (
                                        <TrendingUp style={{ width: 18, height: 18, color: "#22C55E" }} />
                                    ) : (
                                        <Gift style={{ width: 18, height: 18, color: "#EF4444" }} />
                                    )}
                                </div>
                                <div>
                                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222", margin: 0 }}>
                                        {entry.description}
                                    </p>
                                    <p style={{ fontSize: "0.7rem", color: "#6B7280", margin: "2px 0 0 0" }}>
                                        {entry.date}
                                    </p>
                                </div>
                            </div>
                            <span
                                style={{
                                    fontWeight: 700,
                                    color: entry.type === "earn" ? "#22C55E" : "#EF4444",
                                }}
                            >
                                {entry.type === "earn" ? "+" : ""}{entry.amount}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
