"use client";

import { useState, useTransition } from "react";
import { Search, Shield, ShieldAlert, Check, X, AlertCircle, RefreshCw } from "lucide-react";
import { updateUserRole } from "@/app/actions/admin";
import type { UserRole, Profile } from "@/types";

interface UsersTableProps {
    initialUsers: Profile[];
    currentUserId?: string;
}

const roleColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
    DEV: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", label: "Dev (DEV)" },
    CLIENT: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: "Client (CLIENT)" },
    RESTAURANT: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", label: "Staff (RESTAURANT)" },
    MANAGER: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Manager (MANAGER)" },
    ADMIN: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Admin (ADMIN)" },
};

export default function UsersTable({ initialUsers, currentUserId }: UsersTableProps) {
    const [users, setUsers] = useState<Profile[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
    const [isPending, startTransition] = useTransition();
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Filter users based on search term and role filter
    const filteredUsers = users.filter((user) => {
        const matchesSearch = 
            (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = selectedRoleFilter === "ALL" || user.role === selectedRoleFilter;
        
        return matchesSearch && matchesRole;
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

    return (
        <div className="space-y-6">
            {/* Notification Toast */}
            {notification && (
                <div 
                    className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 transform translate-y-0 ${
                        notification.type === "success" 
                            ? "bg-green-50 text-green-800 border-green-200" 
                            : "bg-red-50 text-red-800 border-red-200"
                    }`}
                >
                    {notification.type === "success" ? (
                        <Check className="w-5 h-5 text-green-600" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm font-medium">{notification.message}</span>
                    <button 
                        onClick={() => setNotification(null)}
                        className="ml-2 hover:opacity-75"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Stats Cards / Role Filters */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <button
                    onClick={() => setSelectedRoleFilter("ALL")}
                    className={`p-4 rounded-xl shadow-sm border text-center transition-all ${
                        selectedRoleFilter === "ALL"
                            ? "bg-white border-accent shadow-md scale-105"
                            : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                >
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Tous</span>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
                </button>

                {Object.entries(roleColors).map(([role, colors]) => {
                    const count = users.filter((u) => u.role === role).length;
                    const isSelected = selectedRoleFilter === role;
                    return (
                        <button
                            key={role}
                            onClick={() => setSelectedRoleFilter(role)}
                            className={`p-4 rounded-xl shadow-sm border text-center transition-all ${
                                isSelected
                                    ? `bg-white border-accent shadow-md scale-105`
                                    : "bg-white border-gray-100 hover:border-gray-200"
                            }`}
                        >
                            <span className={`inline-block px-2 py-0.5 rounded-full text-2xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                                {role}
                            </span>
                            <p className="text-2xl font-bold text-gray-900 mt-1.5">{count}</p>
                        </button>
                    );
                })}
            </div>

            {/* Search and Filters bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur par nom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                            Vider
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 w-full md:w-auto justify-end">
                    <span>Affichage de <strong>{filteredUsers.length}</strong> sur <strong>{users.length}</strong></span>
                    {selectedRoleFilter !== "ALL" && (
                        <button
                            onClick={() => setSelectedRoleFilter("ALL")}
                            className="text-accent hover:underline font-semibold"
                        >
                            (Réinitialiser filtre)
                        </button>
                    )}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Nom</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Email</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Rôle</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Statut Sécurité</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => {
                                const colors = roleColors[user.role] || roleColors.CLIENT;
                                const isSelf = user.id === currentUserId;
                                const isUpdating = updatingUserId === user.id;

                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* Name / Avatar */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                                                    {(user.full_name || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-900 block">
                                                        {user.full_name || "—"}
                                                    </span>
                                                    <span className="text-2xs text-gray-400">
                                                        Inscrit le {new Date(user.created_at).toLocaleDateString("fr-FR")}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 font-mono text-xs">{user.email}</span>
                                        </td>

                                        {/* Role Selector */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <select
                                                        value={user.role}
                                                        disabled={isSelf || isUpdating}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                        className={`px-3 py-1.5 pr-8 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none transition-all appearance-none ${
                                                            colors.bg
                                                        } ${colors.text} ${colors.border} ${
                                                            isSelf ? "opacity-90 cursor-not-allowed border-dashed" : "hover:brightness-95"
                                                        } disabled:opacity-50`}
                                                    >
                                                        {Object.keys(roleColors).map((r) => (
                                                            <option key={r} value={r} className="bg-white text-gray-800">
                                                                {roleColors[r].label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {!isSelf && !isUpdating && (
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-500">
                                                            <Shield className="w-3.5 h-3.5 opacity-65" />
                                                        </div>
                                                    )}
                                                    {isUpdating && (
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
                                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                                {isSelf && (
                                                    <span className="text-3xs text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                                                        Vous
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Security Status */}
                                        <td className="px-6 py-4">
                                            {isSelf ? (
                                                <div className="flex items-center gap-1.5 text-2xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md w-fit">
                                                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>Modification bloquée pour votre propre compte</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-2xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md w-fit">
                                                    <Shield className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>Modifiable par l'administrateur</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Aucun utilisateur trouvé pour les critères de recherche
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
