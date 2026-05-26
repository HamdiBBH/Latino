"use client";

import { useState, useTransition } from "react";
import { Shield, Mail, Trash2, Check, X, AlertCircle, RefreshCw, Search } from "lucide-react";
import { updateUserRole } from "@/app/actions/admin";
import type { UserRole, Profile } from "@/types";

interface StaffListProps {
    initialUsers: Profile[];
    currentUserId?: string;
}

const roleColors: Record<string, { bg: string; color: string; label: string }> = {
    DEV: { bg: "#E0E7FF", color: "#3730A3", label: "Dev (DEV)" },
    CLIENT: { bg: "#F3F4F6", color: "#374151", label: "Client (CLIENT)" },
    RESTAURANT: { bg: "#FEF3C7", color: "#92400E", label: "Staff Resto" },
    MANAGER: { bg: "#DCFCE7", color: "#166534", label: "Manager" },
    ADMIN: { bg: "#FEE2E2", color: "#B91C1C", label: "Admin" },
};

export default function StaffList({ initialUsers, currentUserId }: StaffListProps) {
    const [users, setUsers] = useState<Profile[]>(initialUsers);
    const [activeTab, setActiveTab] = useState<"STAFF" | "CLIENT" | "ALL">("STAFF");
    const [searchTerm, setSearchTerm] = useState("");
    const [isPending, startTransition] = useTransition();
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Calculate dynamic stats
    const staffCount = users.filter(u => u.role !== "CLIENT").length;
    const managerCount = users.filter(u => u.role === "MANAGER").length;
    const restoCount = users.filter(u => u.role === "RESTAURANT").length;

    // Filter users based on search term and active tab
    const filteredUsers = users.filter((user) => {
        const matchesSearch = 
            (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());

        let matchesTab = true;
        if (activeTab === "STAFF") {
            matchesTab = user.role !== "CLIENT";
        } else if (activeTab === "CLIENT") {
            matchesTab = user.role === "CLIENT";
        }

        return matchesSearch && matchesTab;
    });

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        setUpdatingUserId(userId);
        setNotification(null);

        startTransition(async () => {
            const result = await updateUserRole(userId, newRole);
            
            if (result.success) {
                // Update local state
                setUsers((prevUsers) =>
                    prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
                );
                setNotification({
                    type: "success",
                    message: "Rôle mis à jour avec succès !",
                });
            } else {
                setNotification({
                    type: "error",
                    message: result.error || "Erreur lors de la modification du rôle.",
                });
            }
            setUpdatingUserId(null);

            // Auto-clear notification after 4 seconds
            setTimeout(() => {
                setNotification(null);
            }, 4000);
        });
    };

    const removeStaffAccess = async (userId: string) => {
        if (confirm("Voulez-vous retirer les accès staff de cet utilisateur ? Son rôle repassera à 'CLIENT'.")) {
            await handleRoleChange(userId, "CLIENT");
        }
    };

    return (
        <div>
            {/* Notification Toast */}
            {notification && (
                <div 
                    style={{
                        position: "fixed",
                        top: "1.5rem",
                        right: "1.5rem",
                        zIndex: 100,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        border: "1px solid",
                        transition: "all 0.3s ease",
                        backgroundColor: notification.type === "success" ? "#DCFCE7" : "#FEE2E2",
                        color: notification.type === "success" ? "#166534" : "#B91C1C",
                        borderColor: notification.type === "success" ? "#BBF7D0" : "#FEE2E2",
                    }}
                >
                    {notification.type === "success" ? (
                        <Check style={{ width: 18, height: 18 }} />
                    ) : (
                        <AlertCircle style={{ width: 18, height: 18 }} />
                    )}
                    <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{notification.message}</span>
                    <button 
                        onClick={() => setNotification(null)}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            marginLeft: "8px",
                            color: "inherit",
                        }}
                    >
                        <X style={{ width: 14, height: 14 }} />
                    </button>
                </div>
            )}

            {/* Stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "1rem",
                    marginBottom: "2rem",
                }}
            >
                {[
                    { label: "Membres Équipe", value: staffCount, color: "#22C55E" },
                    { label: "Managers", value: managerCount, color: "#3B82F6" },
                    { label: "Staff Resto", value: restoCount, color: "#F97316" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            backgroundColor: "#FFFFFF",
                            padding: "1.5rem",
                            borderRadius: "16px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                            border: "1px solid #E5E7EB",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ fontSize: "2rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
                        <p style={{ color: "#7A7A7A", fontSize: "0.875rem" }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Controls: Tabs & Search */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                    flexWrap: "wrap",
                }}
            >
                {/* Tabs */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[
                        { id: "STAFF" as const, label: "Équipe" },
                        { id: "CLIENT" as const, label: "Clients" },
                        { id: "ALL" as const, label: "Tous" },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: isActive ? "#E8A87C" : "#FFFFFF",
                                    color: isActive ? "#FFFFFF" : "#374151",
                                    border: "1px solid",
                                    borderColor: isActive ? "#E8A87C" : "#E5E7EB",
                                    borderRadius: "100px",
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
                    <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#9CA3AF" }} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 12px 10px 36px",
                            fontSize: "0.875rem",
                            borderRadius: "8px",
                            border: "1px solid #E5E7EB",
                            boxSizing: "border-box",
                            outline: "none",
                            transition: "border-color 0.2s",
                        }}
                    />
                </div>
            </div>

            {/* Employees List */}
            <div
                style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #E5E7EB",
                    overflow: "hidden",
                }}
            >
                {filteredUsers.map((employee, index) => {
                    const roleInfo = roleColors[employee.role] || roleColors.CLIENT;
                    const isSelf = employee.id === currentUserId;
                    const isUpdating = updatingUserId === employee.id;

                    return (
                        <div
                            key={employee.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "1.25rem 1.5rem",
                                borderBottom: index < filteredUsers.length - 1 ? "1px solid #E5E7EB" : "none",
                                flexWrap: "wrap",
                                gap: "1rem",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        backgroundColor: "#E8A87C",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#FFFFFF",
                                        fontWeight: 600,
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    {(employee.full_name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <p style={{ fontWeight: 600, color: "#222222", margin: 0 }}>{employee.full_name || "—"}</p>
                                        {isSelf && (
                                            <span style={{ fontSize: "10px", padding: "1px 6px", backgroundColor: "#F3F4F6", borderRadius: "4px", color: "#6B7280", fontWeight: 600 }}>
                                                Vous
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                        <Mail style={{ width: 14, height: 14, color: "#9CA3AF" }} />
                                        <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{employee.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                {/* Role Switcher Dropdown */}
                                <div style={{ position: "relative" }}>
                                    <select
                                        value={employee.role}
                                        disabled={isSelf || isUpdating}
                                        onChange={(e) => handleRoleChange(employee.id, e.target.value as UserRole)}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            padding: "6px 28px 6px 12px",
                                            backgroundColor: roleInfo.bg,
                                            color: roleInfo.color,
                                            border: "1px solid transparent",
                                            borderColor: isSelf ? "rgba(0,0,0,0.08)" : "transparent",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            borderRadius: "100px",
                                            cursor: isSelf ? "not-allowed" : "pointer",
                                            appearance: "none",
                                            outline: "none",
                                        }}
                                    >
                                        {Object.keys(roleColors).map((r) => (
                                            <option key={r} value={r} style={{ backgroundColor: "#FFFFFF", color: "#374151" }}>
                                                {roleColors[r].label}
                                            </option>
                                        ))}
                                    </select>
                                    <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                                        {isUpdating ? (
                                            <RefreshCw style={{ width: 12, height: 12, animation: "spin 1s linear infinite", color: roleInfo.color }} className="animate-spin" />
                                        ) : (
                                            <Shield style={{ width: 12, height: 12, color: roleInfo.color, opacity: 0.7 }} />
                                        )}
                                    </div>
                                </div>

                                {/* Remove Access Button (Only for staff, and not for self) */}
                                {employee.role !== "CLIENT" && !isSelf && (
                                    <button
                                        onClick={() => removeStaffAccess(employee.id)}
                                        style={{
                                            padding: "8px",
                                            backgroundColor: "#FEE2E2",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            color: "#B91C1C",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "background-color 0.2s",
                                        }}
                                        title="Retirer les accès staff"
                                    >
                                        <Trash2 style={{ width: 16, height: 16 }} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {filteredUsers.length === 0 && (
                    <div style={{ padding: "3rem", textAlign: "center", color: "#7A7A7A" }}>
                        Aucun utilisateur trouvé
                    </div>
                )}
            </div>
        </div>
    );
}
