"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

const navLinks = [
    { href: "#home", label: "Accueil" },
    { href: "#about", label: "Notre Histoire" },
    { href: "#services", label: "Services" },
    { href: "#gallery", label: "Galerie" },
    { href: "#events", label: "Loisirs" },
    { href: "#contact", label: "Contact" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("home");

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

    const linkColor = isScrolled ? "#222222" : "#FFFFFF";

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
                                    borderBottom: activeSection === link.href.replace("#", "") ? "2px solid #E8A87C" : "2px solid transparent",
                                }}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* ===== Desktop Auth + CTA ===== */}
                    <div className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <Link
                            href="/login"
                            aria-label="Se connecter"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                backgroundColor: isScrolled ? "rgba(34,34,34,0.1)" : "rgba(255,255,255,0.2)",
                                color: linkColor,
                                textDecoration: "none",
                                transition: "all 0.3s ease",
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </Link>
                        <Link
                            href="/reservation"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "15px 25px",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                borderRadius: 100,
                                backgroundColor: isScrolled ? "#222222" : "#E8A87C",
                                color: "#FFFFFF",
                                textDecoration: "none",
                                transition: "all 0.3s ease",
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
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
