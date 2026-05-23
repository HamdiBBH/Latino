"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, UserCircle, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
    { href: "#home", label: "Accueil" },
    { href: "#about", label: "Notre Histoire" },
    { href: "#services", label: "Services" },
    { href: "#gallery", label: "Galerie" },
    { href: "#events", label: "Loisirs" },
    { href: "#contact", label: "Contact" },
];

interface AuthUser {
    name: string;
    email: string;
}

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Detect logged-in user
    useEffect(() => {
        const supabase = createClient();

        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();

                const name =
                    profile?.full_name ||
                    user.user_metadata?.full_name ||
                    user.email?.split("@")[0] ||
                    "Mon compte";
                setAuthUser({ name, email: user.email || "" });
            } else {
                setAuthUser(null);
            }
            setAuthLoading(false);
        };

        loadUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const user = session.user;
                const name =
                    user.user_metadata?.full_name ||
                    user.email?.split("@")[0] ||
                    "Mon compte";
                setAuthUser({ name, email: user.email || "" });
            } else {
                setAuthUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
            const sections = navLinks.map((l) => l.href.replace("#", ""));
            for (const section of [...sections].reverse()) {
                const el = document.getElementById(section);
                if (el && el.getBoundingClientRect().top <= 150) {
                    setActiveSection(section);
                    break;
                }
            }
        };
        const handleResize = () => {
            if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
        };
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const handleNavClick = (href: string) => {
        setIsMobileMenuOpen(false);
        document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setAuthUser(null);
        setIsMobileMenuOpen(false);
    };

    const linkColor = isScrolled ? "#222222" : "#FFFFFF";
    const avatarLetter = authUser?.name?.charAt(0)?.toUpperCase() || "?";

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: isScrolled ? "1rem 0" : "1.5rem 0",
                backgroundColor: isScrolled ? "rgba(255,255,255,0.98)" : "transparent",
                backdropFilter: isScrolled ? "blur(10px)" : "none",
                boxShadow: isScrolled ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.3s ease",
            }}
        >
            <div className="container">
                <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Logo isScrolled={isScrolled} />

                    {/* ===== Desktop Nav Links ===== */}
                    <div className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                        {navLinks.map((link) => (
                            <button
                                key={link.href}
                                onClick={() => handleNavClick(link.href)}
                                style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 500,
                                    color: linkColor,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "5px 0",
                                    transition: "color 0.3s ease",
                                    borderBottom:
                                        activeSection === link.href.replace("#", "")
                                            ? "2px solid #E8A87C"
                                            : "2px solid transparent",
                                }}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* ===== Desktop Auth ===== */}
                    <div className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {authLoading ? (
                            /* Skeleton while loading */
                            <div
                                style={{
                                    width: 140,
                                    height: 38,
                                    borderRadius: 100,
                                    backgroundColor: "rgba(255,255,255,0.15)",
                                }}
                            />
                        ) : authUser ? (
                            /* ── CONNECTED: name chip + logout ── */
                            <>
                                {/* User name chip */}
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "6px 14px 6px 6px",
                                        borderRadius: 100,
                                        backgroundColor: isScrolled
                                            ? "rgba(34,34,34,0.06)"
                                            : "rgba(255,255,255,0.15)",
                                        border: isScrolled
                                            ? "1px solid rgba(34,34,34,0.12)"
                                            : "1px solid rgba(255,255,255,0.25)",
                                    }}
                                >
                                    {/* Avatar */}
                                    <div
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #E8A87C, #D4905A)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            color: "#fff",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {avatarLetter}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            color: linkColor,
                                            maxWidth: "130px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {authUser.name}
                                    </span>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    title="Se déconnecter"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "9px 16px",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        borderRadius: 100,
                                        border: isScrolled
                                            ? "1px solid rgba(34,34,34,0.15)"
                                            : "1px solid rgba(255,255,255,0.3)",
                                        backgroundColor: "transparent",
                                        color: linkColor,
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <LogOut style={{ width: 15, height: 15 }} />
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            /* ── NOT CONNECTED: Se connecter + Créer un compte ── */
                            <>
                                <Link
                                    href="/login"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "10px 18px",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        color: linkColor,
                                        textDecoration: "none",
                                        borderRadius: 100,
                                        border: isScrolled
                                            ? "1px solid rgba(34,34,34,0.2)"
                                            : "1px solid rgba(255,255,255,0.35)",
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    <UserCircle style={{ width: 16, height: 16 }} />
                                    Se connecter
                                </Link>
                                <Link
                                    href="/register"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "10px 20px",
                                        fontSize: "0.875rem",
                                        fontWeight: 700,
                                        borderRadius: 100,
                                        background: "linear-gradient(135deg, #E8A87C, #D4905A)",
                                        color: "#FFFFFF",
                                        textDecoration: "none",
                                        boxShadow: "0 4px 14px rgba(232,168,124,0.35)",
                                        transition: "all 0.3s ease",
                                        letterSpacing: "0.2px",
                                    }}
                                >
                                    Créer un compte
                                </Link>
                            </>
                        )}

                        {/* Réserver — always visible */}
                        <Link
                            href="/reservation"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "10px 20px",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                borderRadius: 100,
                                backgroundColor: isScrolled ? "#222222" : "rgba(255,255,255,0.15)",
                                color: "#FFFFFF",
                                textDecoration: "none",
                                transition: "all 0.3s ease",
                                border: isScrolled ? "none" : "1px solid rgba(255,255,255,0.3)",
                            }}
                        >
                            Réserver
                        </Link>
                    </div>

                    {/* ===== Mobile Burger ===== */}
                    <button
                        className="hidden-desktop"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 10,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        {isMobileMenuOpen
                            ? <X size={28} color={linkColor} />
                            : <Menu size={28} color={linkColor} />
                        }
                    </button>
                </nav>

                {/* ===== Mobile Dropdown ===== */}
                {isMobileMenuOpen && (
                    <div
                        className="hidden-desktop"
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            backgroundColor: "#FFFFFF",
                            padding: "1.5rem",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {navLinks.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => handleNavClick(link.href)}
                                    style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 500,
                                        color: "#222222",
                                        background: "none",
                                        border: "none",
                                        borderBottom: "1px solid #F0EDE9",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        padding: "0.875rem 0",
                                        width: "100%",
                                    }}
                                >
                                    {link.label}
                                </button>
                            ))}

                            {/* Mobile Auth */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "1rem", marginTop: "0.25rem" }}>
                                {authUser ? (
                                    /* Logged in on mobile */
                                    <>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                padding: "12px 16px",
                                                backgroundColor: "#F9F5F0",
                                                borderRadius: "12px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: "50%",
                                                    background: "linear-gradient(135deg, #E8A87C, #D4905A)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "1rem",
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {avatarLetter}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#222", margin: 0 }}>
                                                    {authUser.name}
                                                </p>
                                                <p style={{ fontSize: "0.75rem", color: "#7A7A7A", margin: 0 }}>
                                                    {authUser.email}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                                padding: "14px 24px",
                                                fontSize: "1rem",
                                                fontWeight: 500,
                                                borderRadius: 100,
                                                border: "1px solid #E5E5E5",
                                                color: "#444444",
                                                background: "none",
                                                cursor: "pointer",
                                                width: "100%",
                                            }}
                                        >
                                            <LogOut style={{ width: 18, height: 18 }} />
                                            Se déconnecter
                                        </button>
                                    </>
                                ) : (
                                    /* Not logged in on mobile */
                                    <>
                                        <Link
                                            href="/register"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "14px 24px",
                                                fontSize: "1rem",
                                                fontWeight: 700,
                                                borderRadius: 100,
                                                background: "linear-gradient(135deg, #E8A87C, #D4905A)",
                                                color: "#FFFFFF",
                                                textDecoration: "none",
                                                boxShadow: "0 4px 14px rgba(232,168,124,0.3)",
                                            }}
                                        >
                                            Créer un compte gratuitement
                                        </Link>
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                                padding: "14px 24px",
                                                fontSize: "1rem",
                                                fontWeight: 500,
                                                borderRadius: 100,
                                                border: "1px solid #E5E5E5",
                                                color: "#444444",
                                                textDecoration: "none",
                                            }}
                                        >
                                            <UserCircle style={{ width: 18, height: 18 }} />
                                            Se connecter
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
