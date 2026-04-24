"use client";

import { useState, useEffect } from "react";
import { User, ChevronLeft, Camera, Edit2, Settings, Bell, Lock, LogOut, Save, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any[]>([]);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push("/login");
                    return;
                }

                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;

                // Fetch reservations to calculate visits
                const { data: reservations } = await supabase
                    .from("reservations")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("status", "completed");

                const totalVisits = reservations?.length || 0;

                const memberSinceDate = new Date(data.created_at);
                const memberSince = memberSinceDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

                setProfile({
                    id: data.id,
                    fullName: data.full_name || "Utilisateur",
                    email: data.email || user.email,
                    phone: data.phone || "",
                    avatarUrl: data.avatar_url,
                    memberSince: memberSince,
                    loyaltyPoints: data.loyalty_points || 0,
                    role: data.role
                });

                setStats([
                    { label: "Visites", value: totalVisits, icon: "🏖️" },
                    { label: "Points", value: data.loyalty_points || 0, icon: "⭐" },
                ]);

            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfile();
    }, [router, supabase]);

    const handleSave = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: profile.fullName,
                    phone: profile.phone,
                })
                .eq("id", profile.id);

            if (error) throw error;
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Erreur lors de la mise à jour du profil");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 style={{ width: 32, height: 32, color: '#6366F1' }} className="animate-spin" />
            </div>
        );
    }

    if (!profile) return null;

    // Menu sections
    const menuSections = [
        {
            title: "Paramètres",
            items: [
                { id: "notifications", label: "Notifications", icon: Bell, hasArrow: true },
                { id: "security", label: "Sécurité", icon: Lock, hasArrow: true },
                { id: "settings", label: "Paramètres", icon: Settings, hasArrow: true },
            ],
        },
    ];

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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <User style={{ width: 32, height: 32, color: "#6366F1" }} />
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222", margin: 0 }}>
                            Mon Profil
                        </h1>
                    </div>
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 14px",
                                backgroundColor: isSaving ? "#9CA3AF" : "#22C55E",
                                color: "#FFF",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                cursor: isSaving ? "not-allowed" : "pointer",
                            }}
                        >
                            {isSaving ? (
                                <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                            ) : (
                                <>
                                    <Save style={{ width: 16, height: 16 }} />
                                    Sauver
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 14px",
                                backgroundColor: "#F3F4F6",
                                color: "#374151",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <Edit2 style={{ width: 16, height: 16 }} />
                            Modifier
                        </button>
                    )}
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
                    gridTemplateColumns: "repeat(2, 1fr)",
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
                        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222" }}>{profile.email}</span>
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
                                    width: "60%",
                                    textAlign: "right"
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222" }}>{profile.phone || "Non renseigné"}</span>
                        )}
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
                        const hasArrow = 'hasArrow' in item ? item.hasArrow : false;
                        const itemValue = 'value' in item ? item.value : undefined;
                        return (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "14px 1rem",
                                    borderTop: index > 0 ? "1px solid #E5E7EB" : "none",
                                    cursor: hasArrow ? "pointer" : "default",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Icon style={{ width: 20, height: 20, color: "#6B7280" }} />
                                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222" }}>{item.label}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {itemValue && (
                                        <span style={{ fontSize: "0.875rem", color: "#6B7280" }}>{itemValue}</span>
                                    )}
                                    {hasArrow && <ChevronRight style={{ width: 16, height: 16, color: "#9CA3AF" }} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}

            {/* Logout Button */}
            <button
                onClick={handleLogout}
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

