"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import Logo from "@/components/Logo";

const navLinks = [
    { href: "#home", label: "Accueil" },
    { href: "#about", label: "Notre Histoire" },
    { href: "#services", label: "Services" },
    { href: "#gallery", label: "Galerie" },
    { href: "#events", label: "Événements" },
    { href: "#contact", label: "Contact" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            const sections = navLinks.map((link) => link.href.replace("#", ""));
            for (const section of sections.reverse()) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const handleNavClick = (href: string) => {
        setIsMobileMenuOpen(false);
        const element = document.getElementById(href.replace("#", ""));
        element?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: isScrolled ? "1rem 0" : "1.5rem 0",
                backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.98)" : "transparent",
                backdropFilter: isScrolled ? "blur(10px)" : "none",
                boxShadow: isScrolled ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none",
                transition: "all 0.3s ease",
            }}
        >
            <div className="container">
                <nav
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    {/* Logo */}
                    <Logo isScrolled={isScrolled} />

                    {/* Desktop Nav - Only show on desktop */}
                    {!isMobile && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "2rem",
                            }}
                        >
                            {navLinks.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => handleNavClick(link.href)}
                                    style={{
                                        fontSize: "0.9rem",
                                        fontWeight: 500,
                                        color: isScrolled ? "#222222" : "#FFFFFF",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "5px 0",
                                        position: "relative",
                                        transition: "color 0.3s ease",
                                        borderBottom: activeSection === link.href.replace("#", "") ? "2px solid #E8A87C" : "2px solid transparent",
                                    }}
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Auth & CTA Buttons - Only show on desktop */}
                    {!isMobile && (
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            {/* Auth Icon */}
                            <Link
                                href="/login"
                                aria-label="Se connecter"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    backgroundColor: isScrolled ? "rgba(34, 34, 34, 0.1)" : "rgba(255, 255, 255, 0.2)",
                                    color: isScrolled ? "#222222" : "#FFFFFF",
                                    transition: "all 0.3s ease",
                                    textDecoration: "none",
                                }}
                            >
                                <User style={{ width: 20, height: 20 }} />
                            </Link>

                            {/* Reserve Button */}
                            <Link
                                href="/reservation"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "15px 25px",
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    borderRadius: "100px",
                                    backgroundColor: isScrolled ? "#222222" : "#E8A87C",
                                    color: "#FFFFFF",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    textDecoration: "none",
                                }}
                            >
                                Réserver
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle - Only show on mobile */}
                    {isMobile && (
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                            aria-expanded={isMobileMenuOpen}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "5px",
                                padding: "10px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            {isMobileMenuOpen ? (
                                <X style={{ width: 24, height: 24, color: isScrolled ? "#222222" : "#FFFFFF" }} />
                            ) : (
                                <Menu style={{ width: 24, height: 24, color: isScrolled ? "#222222" : "#FFFFFF" }} />
                            )}
                        </button>
                    )}
                </nav>

                {/* Mobile Menu */}
                {isMobile && isMobileMenuOpen && (
                    <div
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            backgroundColor: "#FFFFFF",
                            padding: "2rem 1.5rem",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {navLinks.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => handleNavClick(link.href)}
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: 500,
                                        color: "#222222",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        padding: "0.5rem 0",
                                    }}
                                >
                                    {link.label}
                                </button>
                            ))}
                            <Link
                                href="/reservation"
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "15px 25px",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    borderRadius: "100px",
                                    backgroundColor: "#222222",
                                    color: "#FFFFFF",
                                    border: "none",
                                    cursor: "pointer",
                                    marginTop: "1rem",
                                    textDecoration: "none",
                                }}
                            >
                                Réserver
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
