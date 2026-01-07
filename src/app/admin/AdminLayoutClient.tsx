"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Image,
    Palette,
    CalendarDays,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ChefHat,
    Layers,
    ExternalLink,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";

interface NavItem {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    roles: string[];
}

const navItems: NavItem[] = [
    // DEV/ADMIN: Dashboard (CMS)
    {
        href: "/admin/cms",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["DEV", "ADMIN"],
    },
    // ADMIN: Business Management
    {
        href: "/admin/finance",
        label: "Finances",
        icon: ShoppingBag,
        roles: ["ADMIN"],
    },
    {
        href: "/admin/menu",
        label: "Carte & Produits",
        icon: ChefHat,
        roles: ["ADMIN"],
    },
    {
        href: "/admin/staff",
        label: "Équipe RH",
        icon: Users,
        roles: ["ADMIN"],
    },
    {
        href: "/admin/config",
        label: "Configuration",
        icon: Settings,
        roles: ["ADMIN"],
    },
    {
        href: "/admin/stocks",
        label: "Stocks",
        icon: ShoppingBag,
        roles: ["ADMIN"],
    },
    // MANAGER: Operations
    {
        href: "/admin/floorplan",
        label: "Plan de Salle",
        icon: LayoutDashboard,
        roles: ["MANAGER", "ADMIN"],
    },
    {
        href: "/admin/reservations",
        label: "Réservations",
        icon: CalendarDays,
        roles: ["MANAGER", "ADMIN"],
    },
    {
        href: "/admin/orders",
        label: "Commandes",
        icon: ShoppingBag,
        roles: ["RESTAURANT", "MANAGER"],
    },
    // RESTAURANT: Kitchen
    {
        href: "/admin/kitchen",
        label: "Cuisine",
        icon: ChefHat,
        roles: ["RESTAURANT"],
    },
    // CLIENT: Dashboard Features
    {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["CLIENT"],
    },
    {
        href: "/admin/boat-tracker",
        label: "Bateau",
        icon: Layers,
        roles: ["CLIENT"],
    },
    {
        href: "/admin/menu-order",
        label: "Commander",
        icon: ShoppingBag,
        roles: ["CLIENT"],
    },
    {
        href: "/admin/loyalty",
        label: "Fidélité",
        icon: CalendarDays,
        roles: ["CLIENT"],
    },
    {
        href: "/admin/memories",
        label: "Souvenirs",
        icon: Image,
        roles: ["CLIENT"],
    },
    {
        href: "/admin/profile",
        label: "Mon Profil",
        icon: Users,
        roles: ["CLIENT"],
    },
    {
        href: "/admin/concierge",
        label: "Aide",
        icon: Settings,
        roles: ["CLIENT"],
    },
];

interface UserInfo {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl?: string;
}

export function AdminLayoutClient({
    children,
    user,
}: {
    children: React.ReactNode;
    user: UserInfo;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const filteredNavItems = navItems.filter((item) =>
        item.roles.includes(user.role)
    );

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F3F4F6" }}>
            {/* Mobile Header */}
            <header
                style={{
                    display: "none",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "64px",
                    backgroundColor: "#FFFFFF",
                    borderBottom: "1px solid #E5E7EB",
                    zIndex: 40,
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 1rem",
                }}
                className="mobile-header"
            >
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    style={{
                        padding: "0.5rem",
                        borderRadius: "8px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                    }}
                >
                    <Menu style={{ width: 24, height: 24 }} />
                </button>
                <span style={{ fontWeight: 600, color: "#111827" }}>
                    Latino Coucou Admin
                </span>
                <div style={{ width: 40 }} />
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 40,
                    }}
                    className="mobile-overlay"
                />
            )}

            {/* Sidebar */}
            <aside
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: "256px",
                    backgroundColor: "#111827",
                    color: "#FFFFFF",
                    zIndex: 50,
                    transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.3s ease",
                }}
                className="sidebar"
            >
                {/* Logo */}
                <div
                    style={{
                        height: "64px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 1rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                >
                    <Link
                        href="/admin"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            textDecoration: "none",
                            color: "#FFFFFF",
                        }}
                    >
                        <span style={{ fontSize: "1.5rem" }}>🌴</span>
                        <span style={{ fontWeight: 600 }}>Admin Panel</span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        style={{
                            padding: "4px",
                            borderRadius: "4px",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: "#FFFFFF",
                        }}
                        className="mobile-close"
                    >
                        <X style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                {/* User Role Badge */}
                <div
                    style={{
                        padding: "1rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                >
                    <div
                        style={{
                            padding: "0.75rem 1rem",
                            backgroundColor: "rgba(232, 168, 124, 0.2)",
                            borderRadius: "8px",
                            textAlign: "center",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.75rem",
                                color: "rgba(255, 255, 255, 0.6)",
                                display: "block",
                                marginBottom: "4px",
                            }}
                        >
                            Connecté en tant que
                        </span>
                        <span
                            style={{
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: "#E8A87C",
                            }}
                        >
                            {user.role}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ padding: "1rem" }}>
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    marginBottom: "4px",
                                    textDecoration: "none",
                                    color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)",
                                    backgroundColor: isActive ? "#E8A87C" : "transparent",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <Icon style={{ width: 20, height: 20 }} />
                                <span style={{ fontWeight: 500 }}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "1rem",
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "1rem",
                            padding: "0 1rem",
                        }}
                    >
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#E8A87C",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 600,
                            }}
                        >
                            {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                            <p
                                style={{
                                    fontWeight: 500,
                                    fontSize: "0.875rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {user.fullName}
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)" }}>
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/"
                        target="_blank"
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "rgba(232, 168, 124, 0.15)",
                            color: "#E8A87C",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            textDecoration: "none",
                            marginBottom: "8px",
                        }}
                    >
                        <ExternalLink style={{ width: 20, height: 20 }} />
                        <span style={{ fontWeight: 500 }}>Voir le site</span>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "transparent",
                            color: "rgba(255, 255, 255, 0.7)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                    >
                        <LogOut style={{ width: 20, height: 20 }} />
                        <span style={{ fontWeight: 500 }}>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                style={{
                    marginLeft: "256px",
                    minHeight: "100vh",
                }}
                className="main-content"
            >
                <div style={{ padding: "1.5rem" }}>{children}</div>
            </main>

            {/* CSS for responsive behavior */}
            <style jsx global>{`
        @media (max-width: 1024px) {
          .mobile-header {
            display: flex !important;
          }
          .sidebar {
            transform: ${isSidebarOpen ? "translateX(0)" : "translateX(-100%)"} !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding-top: 64px !important;
          }
          .mobile-close {
            display: block !important;
          }
        }
        @media (min-width: 1025px) {
          .sidebar {
            transform: translateX(0) !important;
          }
          .mobile-close {
            display: none !important;
          }
          .mobile-overlay {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
}
