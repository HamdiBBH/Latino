import {
    LayoutDashboard,
    TrendingUp,
    Users,
    Eye,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Globe,
    Smartphone,
    Monitor,
    Calendar,
    BarChart3,
    Activity,
    MousePointerClick,
    CalendarDays,
    ShoppingBag,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ClientDashboard from "@/components/admin/ClientDashboard";

// Mock analytics data - will be replaced by Google Analytics API later
const analyticsData = {
    visitors: { today: 342, trend: "+14.8%", positive: true },
    pageViews: { today: 1247, trend: "+14.5%", positive: true },
    avgSessionDuration: { value: "3m 42s", trend: "+8.2%", positive: true },
    bounceRate: { value: "42.3%", trend: "-5.1%", positive: true },
};

const topPages = [
    { path: "/", views: 523, percentage: 42 },
    { path: "/menu", views: 234, percentage: 19 },
    { path: "/reservations", views: 189, percentage: 15 },
    { path: "/gallery", views: 156, percentage: 13 },
    { path: "/contact", views: 145, percentage: 11 },
];

const deviceStats = [
    { type: "Mobile", icon: Smartphone, percentage: 62, color: "#E8A87C" },
    { type: "Desktop", icon: Monitor, percentage: 31, color: "#43B0A8" },
    { type: "Tablet", icon: Monitor, percentage: 7, color: "#6366F1" },
];

const weeklyData = [
    { day: "Lun", visitors: 245 },
    { day: "Mar", visitors: 312 },
    { day: "Mer", visitors: 287 },
    { day: "Jeu", visitors: 356 },
    { day: "Ven", visitors: 423 },
    { day: "Sam", visitors: 512 },
    { day: "Dim", visitors: 342 },
];

// Manager/Admin operational stats
const operationalStats = [
    { label: "Réservations aujourd'hui", value: "12", icon: CalendarDays, trend: "+20%" },
    { label: "Commandes en cours", value: "8", icon: ShoppingBag, trend: "+5%" },
    { label: "Visiteurs (7j)", value: "1,234", icon: TrendingUp, trend: "+15%" },
    { label: "Clients inscrits", value: "456", icon: Users, trend: "+8%" },
];

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

    // ===== CLIENT DASHBOARD =====
    if (userRole === "CLIENT") {
        return (
            <div>
                <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                        <LayoutDashboard style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                            Mon Espace
                        </h1>
                    </div>
                    <p style={{ color: "#7A7A7A" }}>
                        Bienvenue {profile?.full_name || "cher client"} !
                    </p>
                </div>
                <ClientDashboard
                    userName={profile?.full_name || "cher client"}
                    hasReservation={true}
                />
            </div>
        );
    }

    // ===== RESTAURANT STAFF DASHBOARD =====
    if (userRole === "RESTAURANT") {
        return (
            <div>
                <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                        <ShoppingBag style={{ width: 32, height: 32, color: "#EF4444" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                            Cuisine & Commandes
                        </h1>
                    </div>
                    <p style={{ color: "#7A7A7A" }}>
                        Vue temps réel des commandes
                    </p>
                </div>

                <div style={{
                    backgroundColor: "#FEE2E2",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    marginBottom: "2rem",
                }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#991B1B", marginBottom: "0.5rem" }}>
                        🔥 8 commandes en attente
                    </h2>
                    <p style={{ color: "#B91C1C" }}>Priorisez les commandes urgentes</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    <Link href="/dashboard/kitchen" style={{
                        display: "flex", alignItems: "center", gap: "1rem", padding: "1.5rem",
                        borderRadius: "16px", backgroundColor: "#FFF", border: "1px solid #E5E7EB",
                        textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ShoppingBag style={{ width: 24, height: 24, color: "#FFF" }} />
                        </div>
                        <span style={{ fontWeight: 600, color: "#222" }}>Voir Cuisine</span>
                    </Link>
                    <Link href="/dashboard/orders" style={{
                        display: "flex", alignItems: "center", gap: "1rem", padding: "1.5rem",
                        borderRadius: "16px", backgroundColor: "#FFF", border: "1px solid #E5E7EB",
                        textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#F97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CalendarDays style={{ width: 24, height: 24, color: "#FFF" }} />
                        </div>
                        <span style={{ fontWeight: 600, color: "#222" }}>Commandes</span>
                    </Link>
                </div>
            </div>
        );
    }

    // ===== MANAGER DASHBOARD =====
    if (userRole === "MANAGER") {
        return (
            <div>
                <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                        <LayoutDashboard style={{ width: 32, height: 32, color: "#F97316" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                            Gestion Opérationnelle
                        </h1>
                    </div>
                    <p style={{ color: "#7A7A7A" }}>
                        Réservations, commandes et supervision
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                    {operationalStats.slice(0, 2).map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} style={{
                                backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                                    <div style={{ width: 48, height: 48, backgroundColor: "rgba(232,168,124,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Icon style={{ width: 24, height: 24, color: "#E8A87C" }} />
                                    </div>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#22C55E" }}>{stat.trend}</span>
                                </div>
                                <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222" }}>{stat.value}</p>
                                <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{stat.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Links */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    <Link href="/dashboard/reservations" style={{
                        display: "flex", alignItems: "center", gap: "1rem", padding: "1.5rem",
                        borderRadius: "16px", backgroundColor: "#FFF", border: "1px solid #E5E7EB",
                        textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#F97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CalendarDays style={{ width: 24, height: 24, color: "#FFF" }} />
                        </div>
                        <span style={{ fontWeight: 600, color: "#222" }}>Réservations</span>
                    </Link>
                    <Link href="/dashboard/floorplan" style={{
                        display: "flex", alignItems: "center", gap: "1rem", padding: "1.5rem",
                        borderRadius: "16px", backgroundColor: "#FFF", border: "1px solid #E5E7EB",
                        textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <LayoutDashboard style={{ width: 24, height: 24, color: "#FFF" }} />
                        </div>
                        <span style={{ fontWeight: 600, color: "#222" }}>Plan de Salle</span>
                    </Link>
                    <Link href="/dashboard/orders" style={{
                        display: "flex", alignItems: "center", gap: "1rem", padding: "1.5rem",
                        borderRadius: "16px", backgroundColor: "#FFF", border: "1px solid #E5E7EB",
                        textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#EAB308", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ShoppingBag style={{ width: 24, height: 24, color: "#FFF" }} />
                        </div>
                        <span style={{ fontWeight: 600, color: "#222" }}>Commandes</span>
                    </Link>
                </div>
            </div>
        );
    }

    // ===== DEV/ADMIN ANALYTICS DASHBOARD =====
    const maxVisitors = Math.max(...weeklyData.map((d) => d.visitors));

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                    <LayoutDashboard style={{ width: 32, height: 32, color: "#E8A87C" }} />
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                        Dashboard Analytics
                    </h1>
                </div>
                <p style={{ color: "#7A7A7A" }}>
                    Suivi d&apos;activité et performance du site
                </p>
            </div>

            {/* Real-time indicator */}
            <div style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "1rem 1.5rem",
                backgroundColor: "#ECFDF5", borderRadius: "12px", marginBottom: "2rem", border: "1px solid #A7F3D0"
            }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22C55E", animation: "pulse 2s infinite" }} />
                <Activity style={{ width: 20, height: 20, color: "#22C55E" }} />
                <span style={{ fontWeight: 600, color: "#166534" }}>23 visiteurs en temps réel</span>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                {[
                    { ...analyticsData.visitors, label: "Visiteurs aujourd'hui", value: analyticsData.visitors.today, icon: Users, color: "#E8A87C" },
                    { ...analyticsData.pageViews, label: "Pages vues", value: analyticsData.pageViews.today, icon: Eye, color: "#43B0A8" },
                    { ...analyticsData.avgSessionDuration, label: "Durée moyenne session", icon: Clock, color: "#6366F1" },
                    { ...analyticsData.bounceRate, label: "Taux de rebond", icon: MousePointerClick, color: "#F97316" },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} style={{
                            backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                                <div style={{ width: 48, height: 48, backgroundColor: `${stat.color}15`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon style={{ width: 24, height: 24, color: stat.color }} />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    {stat.positive ? <ArrowUpRight style={{ width: 16, height: 16, color: "#22C55E" }} /> : <ArrowDownRight style={{ width: 16, height: 16, color: "#22C55E" }} />}
                                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#22C55E" }}>{stat.trend}</span>
                                </div>
                            </div>
                            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#222" }}>{stat.value}</p>
                            <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Weekly Chart */}
                <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <div>
                            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#222" }}>Visiteurs cette semaine</h3>
                            <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>Évolution quotidienne</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Calendar style={{ width: 16, height: 16, color: "#7A7A7A" }} />
                            <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>7 derniers jours</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "200px", gap: 8 }}>
                        {weeklyData.map((day, index) => (
                            <div key={day.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#222" }}>{day.visitors}</span>
                                <div style={{ width: "100%", height: `${(day.visitors / maxVisitors) * 160}px`, backgroundColor: index === 6 ? "#E8A87C" : "#F3E8DE", borderRadius: "8px 8px 0 0" }} />
                                <span style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Stats */}
                <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#222", marginBottom: "1.5rem" }}>Appareils</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {deviceStats.map((device) => {
                            const Icon = device.icon;
                            return (
                                <div key={device.type}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Icon style={{ width: 18, height: 18, color: device.color }} />
                                            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222" }}>{device.type}</span>
                                        </div>
                                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: device.color }}>{device.percentage}%</span>
                                    </div>
                                    <div style={{ height: 8, backgroundColor: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ width: `${device.percentage}%`, height: "100%", backgroundColor: device.color, borderRadius: 4 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Pages */}
            <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#222" }}>Pages les plus visitées</h3>
                    <BarChart3 style={{ width: 20, height: 20, color: "#7A7A7A" }} />
                </div>
                <div>
                    {topPages.map((page, index) => (
                        <div key={page.path} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: index < topPages.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ width: 28, height: 28, backgroundColor: "#F3F4F6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600, color: "#7A7A7A" }}>{index + 1}</span>
                                <span style={{ fontWeight: 500, color: "#222" }}>{page.path}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{page.views} vues</span>
                                <div style={{ width: 80, height: 6, backgroundColor: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${page.percentage}%`, height: "100%", backgroundColor: "#E8A87C", borderRadius: 3 }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Banner */}
            <div style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#FEF3C7", borderRadius: "12px", border: "1px solid #FCD34D", display: "flex", alignItems: "center", gap: 12 }}>
                <Globe style={{ width: 24, height: 24, color: "#92400E" }} />
                <div>
                    <p style={{ fontWeight: 600, color: "#92400E" }}>Connexion Google Analytics</p>
                    <p style={{ fontSize: "0.875rem", color: "#A16207" }}>Ces données sont des exemples. Connectez votre compte Google Analytics pour des statistiques en temps réel.</p>
                </div>
            </div>
        </div>
    );
}
