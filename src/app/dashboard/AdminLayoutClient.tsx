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
    TrendingUp,
    Trophy,
    Bell,
    ChevronDown,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import Logo from "@/components/Logo";

interface NavItem {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    roles: string[];
}

const navItems: NavItem[] = [
    // DEV/ADMIN: Analytics Dashboard
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: TrendingUp,
        roles: ["DEV", "ADMIN"],
    },
    // DEV/ADMIN: CMS
    {
        href: "/dashboard/cms",
        label: "CMS",
        icon: Layers,
        roles: ["DEV", "ADMIN"],
    },
    // ADMIN: Business Management
    {
        href: "/dashboard/finance",
        label: "Finances",
        icon: ShoppingBag,
        roles: ["ADMIN"],
    },
    {
        href: "/dashboard/cms/menu",
        label: "Carte & Produits",
        icon: ChefHat,
        roles: ["ADMIN"],
    },
    {
        href: "/dashboard/staff",
        label: "Équipe RH",
        icon: Users,
        roles: ["ADMIN"],
    },
    {
        href: "/dashboard/config",
        label: "Configuration",
        icon: Settings,
        roles: ["ADMIN"],
    },
    {
        href: "/dashboard/stocks",
        label: "Stocks",
        icon: ShoppingBag,
        roles: ["ADMIN"],
    },
    // MANAGER: Operations
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["MANAGER"],
    },
    {
        href: "/dashboard/floorplan",
        label: "Plan de Salle",
        icon: LayoutDashboard,
        roles: ["MANAGER", "ADMIN"],
    },
    {
        href: "/dashboard/reservations",
        label: "Réservations",
        icon: CalendarDays,
        roles: ["MANAGER", "ADMIN"],
    },

    // CLIENT: Dashboard Features
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["CLIENT"],
    },
    {
        href: "/dashboard/loyalty",
        label: "Fidélité",
        icon: Trophy,
        roles: ["CLIENT", "DEV"],
    },
    {
        href: "/dashboard/memories",
        label: "Souvenirs",
        icon: Image,
        roles: ["CLIENT", "DEV"],
    },
    {
        href: "/dashboard/profile",
        label: "Mon Profil",
        icon: Users,
        roles: ["CLIENT", "DEV"],
    },
    {
        href: "/dashboard/concierge",
        label: "Aide",
        icon: Settings,
        roles: ["CLIENT", "ADMIN", "MANAGER", "DEV"],
    },
];

interface UserInfo {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl?: string;
}

const mockNotifications = [
    { id: 1, text: "Nouvelle réservation reçue", time: "Il y a 5 min", unread: true },
    { id: 2, text: "Le menu a été mis à jour par l'admin", time: "Il y a 2h", unread: false },
    { id: 3, text: "Nouveau message de contact", time: "Hier", unread: false },
];

const roleBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
    DEV: { bg: "#E0E7FF", text: "#3730A3", border: "#C7D2FE" },
    CLIENT: { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" },
    RESTAURANT: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
    MANAGER: { bg: "#DCFCE7", text: "#166534", border: "#A7F3D0" },
    ADMIN: { bg: "#FEE2E2", text: "#B91C1C", border: "#FCA5A5" },
};

export function AdminLayoutClient({
    children,
    user,
}: {
    children: React.ReactNode;
    user: UserInfo;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const filteredNavItems = navItems.filter((item) =>
        item.roles.includes(user.role)
    );

    const renderProfileDropdown = () => {
        return (
            <div style={{ position: "relative" }}>
                <button
                    onClick={() => {
                        setIsProfileOpen(!isProfileOpen);
                        setIsNotificationsOpen(false);
                    }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                    }}
                >
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            backgroundColor: "#E8A87C",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            color: "#FFFFFF",
                            fontSize: "0.875rem",
                        }}
                    >
                        {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown style={{ width: 14, height: 14, color: "#4B5563" }} className="desktop-only-chevron" />
                </button>

                {isProfileOpen && (
                    <>
                        <div 
                            onClick={() => setIsProfileOpen(false)}
                            style={{ position: "fixed", inset: 0, zIndex: 99, cursor: "default" }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
                                top: "45px",
                                width: "220px",
                                backgroundColor: "#FFFFFF",
                                borderRadius: "12px",
                                border: "1px solid #E5E7EB",
                                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                                zIndex: 100,
                                padding: "8px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div style={{ padding: "8px 12px" }}>
                                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {user.fullName}
                                </p>
                                <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: "2px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {user.email}
                                </p>
                            </div>
                            
                            <div style={{ height: "1px", backgroundColor: "#F3F4F6", margin: "6px 0" }} />
                            
                            <Link
                                href="/dashboard/profile"
                                onClick={() => setIsProfileOpen(false)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    textDecoration: "none",
                                    color: "#374151",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    transition: "background-color 0.2s",
                                }}
                                className="hover-bg-gray"
                            >
                                <Users style={{ width: 16, height: 16, color: "#9CA3AF" }} />
                                <span>Mon Profil</span>
                            </Link>

                            {user.role === "ADMIN" && (
                                <Link
                                    href="/dashboard/config"
                                    onClick={() => setIsProfileOpen(false)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "8px 12px",
                                        borderRadius: "6px",
                                        textDecoration: "none",
                                        color: "#374151",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        transition: "background-color 0.2s",
                                    }}
                                    className="hover-bg-gray"
                                >
                                    <Settings style={{ width: 16, height: 16, color: "#9CA3AF" }} />
                                    <span>Configuration</span>
                                </Link>
                            )}

                            <div style={{ height: "1px", backgroundColor: "#F3F4F6", margin: "6px 0" }} />

                            <button
                                onClick={() => {
                                    setIsProfileOpen(false);
                                    handleSignOut();
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    width: "100%",
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "none",
                                    textAlign: "left",
                                    color: "#EF4444",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    transition: "background-color 0.2s",
                                }}
                                className="hover-bg-red-light"
                            >
                                <LogOut style={{ width: 16, height: 16 }} />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const renderNotificationsDropdown = () => {
        const hasUnread = mockNotifications.some(n => n.unread);
        return (
            <div style={{ position: "relative" }}>
                <button
                    onClick={() => {
                        setIsNotificationsOpen(!isNotificationsOpen);
                        setIsProfileOpen(false);
                    }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "none",
                        background: "#F3F4F6",
                        cursor: "pointer",
                        position: "relative",
                        color: "#4B5563",
                    }}
                >
                    <Bell style={{ width: 18, height: 18 }} />
                    {hasUnread && (
                        <span
                            style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                width: "8px",
                                height: "8px",
                                backgroundColor: "#EF4444",
                                borderRadius: "50%",
                                border: "2px solid #FFFFFF",
                            }}
                        />
                    )}
                </button>

                {isNotificationsOpen && (
                    <>
                        <div 
                            onClick={() => setIsNotificationsOpen(false)}
                            style={{ position: "fixed", inset: 0, zIndex: 99, cursor: "default" }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
                                top: "45px",
                                width: "280px",
                                backgroundColor: "#FFFFFF",
                                borderRadius: "12px",
                                border: "1px solid #E5E7EB",
                                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                                zIndex: 100,
                                padding: "8px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div style={{ padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>Notifications</span>
                                <span style={{ fontSize: "0.75rem", color: "#E8A87C", fontWeight: 500, cursor: "pointer" }}>Tout marquer lu</span>
                            </div>
                            
                            <div style={{ height: "1px", backgroundColor: "#F3F4F6", margin: "6px 0" }} />
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "240px", overflowY: "auto" }}>
                                {mockNotifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        style={{
                                            padding: "8px",
                                            borderRadius: "8px",
                                            backgroundColor: notif.unread ? "#F9FAFB" : "transparent",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s",
                                        }}
                                        className="hover-bg-gray"
                                    >
                                        <p style={{ fontSize: "0.75rem", color: "#374151", margin: 0, fontWeight: notif.unread ? 600 : 400 }}>
                                            {notif.text}
                                        </p>
                                        <span style={{ fontSize: "0.625rem", color: "#9CA3AF", marginTop: "4px", display: "block" }}>
                                            {notif.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

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
                <div style={{ display: "flex", justifyContent: "center", flex: 1 }}>
                    <Logo variant="dark" />
                </div>
                {renderProfileDropdown()}
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
                    display: "flex",
                    flexDirection: "column",
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
                    <div style={{ transform: "scale(0.8)", transformOrigin: "left center" }}>
                        <Logo variant="light" />
                    </div>
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

                {/* Navigation */}
                <nav style={{ padding: "1rem", flex: 1, overflowY: "auto" }}>
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));

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
            </aside>

            {/* Main Content */}
            <main
                style={{
                    marginLeft: "256px",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                }}
                className="main-content"
            >
                {/* Desktop Sticky Header */}
                <header
                    style={{
                        position: "sticky",
                        top: 0,
                        height: "64px",
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(8px)",
                        borderBottom: "1px solid #E5E7EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 1.5rem",
                        zIndex: 30,
                    }}
                    className="desktop-header"
                >
                    <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                        Bonjour, <span style={{ fontWeight: 700, color: "#111827" }}>{user.fullName}</span> 👋
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <Link
                            href="/"
                            target="_blank"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 12px",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px",
                                backgroundColor: "#FFFFFF",
                                color: "#374151",
                                textDecoration: "none",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            }}
                        >
                            <ExternalLink style={{ width: 14, height: 14 }} />
                            <span>Voir le site</span>
                        </Link>

                        {renderNotificationsDropdown()}

                        {/* Role Badge */}
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "4px 10px",
                                backgroundColor: roleBadgeColors[user.role]?.bg || "#F3F4F6",
                                color: roleBadgeColors[user.role]?.text || "#374151",
                                border: `1px solid ${roleBadgeColors[user.role]?.border || "#E5E7EB"}`,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                borderRadius: "100px",
                            }}
                        >
                            {user.role}
                        </span>

                        <div style={{ height: "20px", width: "1px", backgroundColor: "#E5E7EB" }} />

                        {renderProfileDropdown()}
                    </div>
                </header>

                <div style={{ padding: "1.5rem", flex: 1 }}>{children}</div>
            </main>

            {/* CSS for responsive behavior */}
            <style jsx global>{`
        .hover-bg-gray:hover {
          background-color: #F3F4F6 !important;
        }
        .hover-bg-red-light:hover {
          background-color: #FEE2E2 !important;
          color: #B91C1C !important;
        }
        @media (max-width: 1024px) {
          .mobile-header {
            display: flex !important;
          }
          .desktop-header {
            display: none !important;
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
          .desktop-only-chevron {
            display: none !important;
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
          .desktop-header {
            display: flex !important;
          }
        }
      `}</style>
        </div>
    );
}
