import { Users, Shield, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function UsersPage() {
    const supabase = await createClient();

    // Fetch all profiles
    const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    const users = profiles || [];

    const roleColors: Record<string, { bg: string; text: string }> = {
        DEV: { bg: "#E0E7FF", text: "#3730A3" },
        CLIENT: { bg: "#F3F4F6", text: "#374151" },
        RESTAURANT: { bg: "#FEF3C7", text: "#92400E" },
        MANAGER: { bg: "#DCFCE7", text: "#166534" },
        ADMIN: { bg: "#FEE2E2", text: "#B91C1C" },
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                    <Users style={{ width: 32, height: 32, color: "#E8A87C" }} />
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                        Utilisateurs
                    </h1>
                </div>
                <p style={{ color: "#7A7A7A" }}>
                    Gérez les utilisateurs et leurs rôles
                </p>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "1rem",
                    marginBottom: "2rem",
                }}
            >
                {Object.entries(roleColors).map(([role, colors]) => {
                    const count = users.filter((u) => u.role === role).length;
                    return (
                        <div
                            key={role}
                            style={{
                                backgroundColor: "#FFFFFF",
                                padding: "1rem",
                                borderRadius: "12px",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                                border: "1px solid #E5E7EB",
                                textAlign: "center",
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-block",
                                    padding: "4px 12px",
                                    backgroundColor: colors.bg,
                                    color: colors.text,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    borderRadius: "100px",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                {role}
                            </span>
                            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222222" }}>{count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Users Table */}
            <div
                style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #E5E7EB",
                    overflow: "hidden",
                }}
            >
                {/* Table Header */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1.5fr 1fr 0.5fr",
                        gap: "1rem",
                        padding: "1rem 1.5rem",
                        backgroundColor: "#F9FAFB",
                        borderBottom: "1px solid #E5E7EB",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "#6B7280",
                    }}
                >
                    <span>Nom</span>
                    <span>Email</span>
                    <span>Rôle</span>
                    <span>Actions</span>
                </div>

                {/* Table Body */}
                {users.map((user, index) => {
                    const roleColor = roleColors[user.role] || roleColors.CLIENT;
                    return (
                        <div
                            key={user.id}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1.5fr 1fr 0.5fr",
                                gap: "1rem",
                                padding: "1rem 1.5rem",
                                borderBottom: index < users.length - 1 ? "1px solid #E5E7EB" : "none",
                                alignItems: "center",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        backgroundColor: "#E8A87C",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#FFFFFF",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    {(user.full_name || "?").charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 500, color: "#222222" }}>
                                    {user.full_name || "—"}
                                </span>
                            </div>
                            <span style={{ color: "#7A7A7A", fontSize: "0.875rem" }}>{user.email}</span>
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "4px 12px",
                                    backgroundColor: roleColor.bg,
                                    color: roleColor.text,
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    borderRadius: "100px",
                                    width: "fit-content",
                                }}
                            >
                                <Shield style={{ width: 12, height: 12 }} />
                                {user.role}
                            </span>
                            <button
                                style={{
                                    padding: "8px",
                                    backgroundColor: "transparent",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    color: "#EF4444",
                                    width: "fit-content",
                                }}
                                title="Supprimer"
                            >
                                <Trash2 style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                    );
                })}

                {users.length === 0 && (
                    <div style={{ padding: "3rem", textAlign: "center", color: "#7A7A7A" }}>
                        Aucun utilisateur trouvé
                    </div>
                )}
            </div>
        </div>
    );
}
