import {
    LayoutDashboard,
    FileText,
    Image,
    Palette,
    CalendarDays,
    ShoppingBag,
    ChefHat,
    Users,
    Settings,
    TrendingUp,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ClientDashboard from "@/components/admin/ClientDashboard";

interface QuickAction {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    color: string;
    roles: string[];
}

const quickActions: QuickAction[] = [
    {
        href: "/admin/site-editor/texts",
        label: "Éditer les textes",
        icon: FileText,
        color: "#3B82F6",
        roles: ["DEV"],
    },
    {
        href: "/admin/site-editor/images",
        label: "Gérer les images",
        icon: Image,
        color: "#22C55E",
        roles: ["DEV"],
    },
    {
        href: "/admin/site-editor/theme",
        label: "Modifier le thème",
        icon: Palette,
        color: "#A855F7",
        roles: ["DEV"],
    },
    {
        href: "/admin/reservations",
        label: "Réservations",
        icon: CalendarDays,
        color: "#F97316",
        roles: ["MANAGER", "ADMIN"],
    },
    {
        href: "/admin/orders",
        label: "Commandes",
        icon: ShoppingBag,
        color: "#EAB308",
        roles: ["RESTAURANT", "MANAGER", "ADMIN"],
    },
    {
        href: "/admin/kitchen",
        label: "Cuisine",
        icon: ChefHat,
        color: "#EF4444",
        roles: ["RESTAURANT", "ADMIN"],
    },
    {
        href: "/admin/users",
        label: "Utilisateurs",
        icon: Users,
        color: "#6366F1",
        roles: ["ADMIN"],
    },
    {
        href: "/admin/settings",
        label: "Paramètres",
        icon: Settings,
        color: "#64748B",
        roles: ["ADMIN"],
    },
];

const stats = [
    { label: "Réservations aujourd'hui", value: "12", icon: CalendarDays, trend: "+20%" },
    { label: "Commandes en cours", value: "8", icon: ShoppingBag, trend: "+5%" },
    { label: "Visiteurs (7j)", value: "1,234", icon: TrendingUp, trend: "+15%" },
    { label: "Clients inscrits", value: "456", icon: Users, trend: "+8%" },
];

const roleDescriptions: Record<string, { title: string; description: string }> = {
    DEV: {
        title: "Développeur / CMS",
        description: "Vous avez accès à l'édition du contenu du site (textes, images, thème).",
    },
    CLIENT: {
        title: "Client",
        description: "Bienvenue ! Consultez vos réservations et votre historique.",
    },
    RESTAURANT: {
        title: "Staff Restaurant",
        description: "Gérez les commandes et la cuisine en temps réel.",
    },
    MANAGER: {
        title: "Manager",
        description: "Gérez les réservations, commandes et supervisez l'équipe.",
    },
    ADMIN: {
        title: "Administrateur",
        description: "Accès complet à toutes les fonctionnalités du système.",
    },
};

export default async function AdminDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const userRole = profile?.role || "CLIENT";
    const roleInfo = roleDescriptions[userRole] || roleDescriptions.CLIENT;

    const filteredActions = quickActions.filter((action) =>
        action.roles.includes(userRole)
    );

    // Show different stats based on role
    const visibleStats = userRole === "CLIENT"
        ? []
        : userRole === "RESTAURANT"
            ? stats.filter(s => s.label.includes("Commandes"))
            : stats;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                    <LayoutDashboard style={{ width: 32, height: 32, color: "#E8A87C" }} />
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                        Dashboard
                    </h1>
                </div>
                <p style={{ color: "#7A7A7A" }}>
                    Bienvenue dans le panneau d&apos;administration de Latino Coucou Beach
                </p>
            </div>

            {/* Role Info Card */}
            <div
                style={{
                    backgroundColor: "#E8A87C",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    marginBottom: "2rem",
                    color: "#FFFFFF",
                }}
            >
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    {roleInfo.title}
                </h2>
                <p style={{ opacity: 0.9 }}>{roleInfo.description}</p>
            </div>

            {/* Stats Grid */}
            {visibleStats.length > 0 && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "1.5rem",
                        marginBottom: "2rem",
                    }}
                >
                    {visibleStats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    padding: "1.5rem",
                                    borderRadius: "16px",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                                    border: "1px solid #E5E7EB",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            backgroundColor: "rgba(232, 168, 124, 0.1)",
                                            borderRadius: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Icon style={{ width: 24, height: 24, color: "#E8A87C" }} />
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                            color: "#22C55E",
                                        }}
                                    >
                                        {stat.trend}
                                    </span>
                                </div>
                                <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                                    {stat.value}
                                </p>
                                <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{stat.label}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Quick Actions */}
            <div style={{ marginBottom: "2rem" }}>
                <h2
                    style={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: "#222222",
                        marginBottom: "1rem",
                    }}
                >
                    Actions rapides
                </h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                    }}
                >
                    {filteredActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.href}
                                href={action.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "1rem",
                                    borderRadius: "12px",
                                    backgroundColor: "#FFFFFF",
                                    border: "1px solid #E5E7EB",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                                    textDecoration: "none",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "12px",
                                        backgroundColor: action.color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Icon style={{ width: 24, height: 24, color: "#FFFFFF" }} />
                                </div>
                                <span style={{ fontWeight: 500, color: "#222222" }}>
                                    {action.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity - Only show for relevant roles */}
            {["MANAGER", "ADMIN", "RESTAURANT"].includes(userRole) && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "1.5rem",
                    }}
                >
                    {/* Recent Reservations */}
                    {["MANAGER", "ADMIN"].includes(userRole) && (
                        <div
                            style={{
                                backgroundColor: "#FFFFFF",
                                padding: "1.5rem",
                                borderRadius: "16px",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                                border: "1px solid #E5E7EB",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "1rem",
                                }}
                            >
                                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#222222" }}>
                                    Dernières réservations
                                </h3>
                                <Link
                                    href="/admin/reservations"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        color: "#E8A87C",
                                        fontSize: "0.875rem",
                                        textDecoration: "none",
                                    }}
                                >
                                    Voir tout <ArrowRight style={{ width: 16, height: 16 }} />
                                </Link>
                            </div>
                            <div>
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "12px 0",
                                            borderBottom: i < 3 ? "1px solid #E5E7EB" : "none",
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 500, color: "#222222" }}>
                                                Réservation #{1000 + i}
                                            </p>
                                            <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>
                                                Table Restaurant - 4 pers.
                                            </p>
                                        </div>
                                        <span
                                            style={{
                                                padding: "4px 12px",
                                                backgroundColor: "#DCFCE7",
                                                color: "#166534",
                                                fontSize: "0.75rem",
                                                fontWeight: 500,
                                                borderRadius: "100px",
                                            }}
                                        >
                                            Confirmé
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Orders */}
                    {["RESTAURANT", "MANAGER", "ADMIN"].includes(userRole) && (
                        <div
                            style={{
                                backgroundColor: "#FFFFFF",
                                padding: "1.5rem",
                                borderRadius: "16px",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                                border: "1px solid #E5E7EB",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "1rem",
                                }}
                            >
                                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#222222" }}>
                                    Commandes en attente
                                </h3>
                                <Link
                                    href="/admin/orders"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        color: "#E8A87C",
                                        fontSize: "0.875rem",
                                        textDecoration: "none",
                                    }}
                                >
                                    Voir tout <ArrowRight style={{ width: 16, height: 16 }} />
                                </Link>
                            </div>
                            <div>
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "12px 0",
                                            borderBottom: i < 3 ? "1px solid #E5E7EB" : "none",
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 500, color: "#222222" }}>
                                                Commande #{2000 + i}
                                            </p>
                                            <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>
                                                Table {i + 4} - 3 articles
                                            </p>
                                        </div>
                                        <span
                                            style={{
                                                padding: "4px 12px",
                                                backgroundColor: "#FEF3C7",
                                                color: "#92400E",
                                                fontSize: "0.75rem",
                                                fontWeight: 500,
                                                borderRadius: "100px",
                                            }}
                                        >
                                            En cours
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Client-specific content - Revolutionary Dashboard */}
            {userRole === "CLIENT" && (
                <ClientDashboard
                    userName={profile?.full_name || "cher client"}
                    hasReservation={true}
                />
            )}
        </div>
    );
}
