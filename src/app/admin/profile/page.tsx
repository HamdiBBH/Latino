"use client";

import { useState } from "react";
import { User, ChevronLeft, Camera, MapPin, Heart, Edit2, Settings, Bell, Lock, LogOut, Save, ChevronRight } from "lucide-react";
import Link from "next/link";

// Mock user profile data
const mockProfile = {
    fullName: "Jean Dupont",
    email: "jean.dupont@email.com",
    phone: "+216 22 333 444",
    avatarUrl: null,
    memberSince: "Mai 2024",
    totalVisits: 8,
    totalSpent: 1250,
    favoriteZone: "Cabane VIP",
    favoriteDrink: "Mojito",
    birthDate: "15/06/1985",
    preferences: {
        newsletter: true,
        smsNotifications: false,
        pushNotifications: true,
        specialOffers: true,
    },
};

// Stats
const stats = [
    { label: "Visites", value: mockProfile.totalVisits, icon: "🏖️" },
    { label: "Dépensé", value: `${mockProfile.totalSpent} TND`, icon: "💰" },
    { label: "Points", value: 850, icon: "⭐" },
    { label: "Badges", value: 4, icon: "🏆" },
];

// Menu sections
const menuSections = [
    {
        title: "Préférences",
        items: [
            { id: "favorite-zone", label: "Zone préférée", value: mockProfile.favoriteZone, icon: MapPin },
            { id: "favorite-drink", label: "Boisson favorite", value: mockProfile.favoriteDrink, icon: Heart },
        ],
    },
    {
        title: "Paramètres",
        items: [
            { id: "notifications", label: "Notifications", icon: Bell, hasArrow: true },
            { id: "security", label: "Sécurité", icon: Lock, hasArrow: true },
            { id: "settings", label: "Paramètres", icon: Settings, hasArrow: true },
        ],
    },
];

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(mockProfile);

    return (
        <div style={{ maxWidth: "100%" }}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <Link
                    href="/admin"
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <User style={{ width: 32, height: 32, color: "#6366F1" }} />
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222", margin: 0 }}>
                            Mon Profil
                        </h1>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 14px",
                            backgroundColor: isEditing ? "#22C55E" : "#F3F4F6",
                            color: isEditing ? "#FFF" : "#374151",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        {isEditing ? (
                            <>
                                <Save style={{ width: 16, height: 16 }} />
                                Sauver
                            </>
                        ) : (
                            <>
                                <Edit2 style={{ width: 16, height: 16 }} />
                                Modifier
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Profile Card */}
            <div
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    marginBottom: "1.5rem",
                    border: "1px solid #E5E7EB",
                    textAlign: "center",
                }}
            >
                {/* Avatar */}
                <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem" }}>
                    <div
                        style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            backgroundColor: "#E8A87C",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2.5rem",
                            color: "#FFF",
                            fontWeight: 700,
                        }}
                    >
                        {profile.fullName.charAt(0)}
                    </div>
                    {isEditing && (
                        <button
                            style={{
                                position: "absolute",
                                bottom: "0",
                                right: "0",
                                width: "32px",
                                height: "32px",
                                backgroundColor: "#222",
                                border: "3px solid #FFF",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                            }}
                        >
                            <Camera style={{ width: 14, height: 14, color: "#FFF" }} />
                        </button>
                    )}
                </div>

                {/* Name & Email */}
                {isEditing ? (
                    <div style={{ marginBottom: "1rem" }}>
                        <input
                            type="text"
                            value={profile.fullName}
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                            style={{
                                fontSize: "1.25rem",
                                fontWeight: 600,
                                color: "#222",
                                border: "none",
                                borderBottom: "2px solid #E8A87C",
                                textAlign: "center",
                                outline: "none",
                                padding: "4px 8px",
                                marginBottom: "8px",
                                width: "100%",
                                backgroundColor: "transparent",
                            }}
                        />
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222", margin: "0 0 4px 0" }}>
                            {profile.fullName}
                        </h2>
                        <p style={{ fontSize: "0.875rem", color: "#6B7280", margin: "0 0 4px 0" }}>
                            {profile.email}
                        </p>
                    </>
                )}

                <span
                    style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        backgroundColor: "#FEF3E2",
                        color: "#E8A87C",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        borderRadius: "100px",
                        marginTop: "8px",
                    }}
                >
                    Membre depuis {profile.memberSince}
                </span>
            </div>

            {/* Stats Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                    marginBottom: "1.5rem",
                }}
            >
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            backgroundColor: "#FFF",
                            borderRadius: "14px",
                            padding: "1rem 0.5rem",
                            textAlign: "center",
                            border: "1px solid #E5E7EB",
                        }}
                    >
                        <span style={{ fontSize: "1.25rem", marginBottom: "4px", display: "block" }}>{stat.icon}</span>
                        <p style={{ fontSize: "1rem", fontWeight: 700, color: "#222", margin: "0 0 2px 0" }}>
                            {stat.value}
                        </p>
                        <p style={{ fontSize: "0.6rem", color: "#6B7280", margin: 0 }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Contact Info */}
            <div
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "16px",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    border: "1px solid #E5E7EB",
                }}
            >
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#222", marginBottom: "1rem" }}>
                    Informations de contact
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>Email</span>
                        {isEditing ? (
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                style={{
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color: "#222",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                    padding: "6px 10px",
                                    outline: "none",
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222" }}>{profile.email}</span>
                        )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>Téléphone</span>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                style={{
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color: "#222",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                    padding: "6px 10px",
                                    outline: "none",
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222" }}>{profile.phone}</span>
                        )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>Date de naissance</span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222" }}>{profile.birthDate}</span>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            {menuSections.map((section) => (
                <div
                    key={section.title}
                    style={{
                        backgroundColor: "#FFF",
                        borderRadius: "16px",
                        marginBottom: "1rem",
                        border: "1px solid #E5E7EB",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: "1rem 1rem 0.5rem" }}>
                        <h3 style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>
                            {section.title}
                        </h3>
                    </div>
                    {section.items.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "14px 1rem",
                                    borderTop: index > 0 ? "1px solid #E5E7EB" : "none",
                                    cursor: item.hasArrow ? "pointer" : "default",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Icon style={{ width: 20, height: 20, color: "#6B7280" }} />
                                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222" }}>{item.label}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {item.value && (
                                        <span style={{ fontSize: "0.875rem", color: "#6B7280" }}>{item.value}</span>
                                    )}
                                    {item.hasArrow && <ChevronRight style={{ width: 16, height: 16, color: "#9CA3AF" }} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}

            {/* Logout Button */}
            <button
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "14px",
                    backgroundColor: "#FEE2E2",
                    color: "#EF4444",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: "1rem",
                }}
            >
                <LogOut style={{ width: 18, height: 18 }} />
                Déconnexion
            </button>
        </div>
    );
}
