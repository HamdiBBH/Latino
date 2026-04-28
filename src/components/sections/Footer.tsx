"use client";

import Link from "next/link";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import Logo from "@/components/Logo";

const navLinks = [
    { href: "#home", label: "Accueil" },
    { href: "#about", label: "Notre Histoire" },
    { href: "#services", label: "Services" },
    { href: "#gallery", label: "Galerie" },
    { href: "#events", label: "Événements" },
    { href: "#contact", label: "Contact" },
];

const services = [
    "Restaurant",
    "Bar & Mocktails",
    "Plage Privée",
    "Événements",
    "DJ Sets",
    "Privatisation",
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            style={{
                backgroundColor: "#222222",
                color: "#FFFFFF",
            }}
        >
            {/* Main Footer */}
            <div className="container" style={{ padding: "4rem 1.5rem" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "3rem",
                    }}
                >
                    {/* Brand */}
                    <div>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <Logo variant="light" />
                        </div>
                        <p
                            style={{
                                color: "rgba(255, 255, 255, 0.6)",
                                marginBottom: "1.5rem",
                                lineHeight: 1.6,
                            }}
                        >
                            Votre destination idéale pour des moments de détente et de
                            plaisir au bord de la Méditerranée.
                        </p>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#FFFFFF",
                                    transition: "background-color 0.3s ease",
                                }}
                            >
                                <Facebook style={{ width: 20, height: 20 }} />
                            </a>
                            <a
                                href="https://instagram.com/latinocoucoubeach"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#FFFFFF",
                                    transition: "background-color 0.3s ease",
                                }}
                            >
                                <Instagram style={{ width: 20, height: 20 }} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="hidden-mobile">
                        <h4 style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "1.5rem" }}>
                            Navigation
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {navLinks.map((link) => (
                                <li key={link.href} style={{ marginBottom: "0.75rem" }}>
                                    <a
                                        href={link.href}
                                        style={{
                                            color: "rgba(255, 255, 255, 0.6)",
                                            textDecoration: "none",
                                            transition: "color 0.3s ease",
                                        }}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="hidden-mobile">
                        <h4 style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "1.5rem" }}>
                            Nos Services
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {services.map((service) => (
                                <li
                                    key={service}
                                    style={{ marginBottom: "0.75rem", color: "rgba(255, 255, 255, 0.6)" }}
                                >
                                    {service}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "1.5rem" }}>
                            Contact
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            <li
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "12px",
                                    marginBottom: "1rem",
                                }}
                            >
                                <MapPin style={{ width: 20, height: 20, color: "#E8A87C", flexShrink: 0, marginTop: "2px" }} />
                                <a
                                    href="https://www.google.com/maps?q=37.14232000325309,10.21041432304559"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "rgba(255, 255, 255, 0.6)", textDecoration: "none" }}
                                >
                                    Coucou Beach, Ghar El Melh
                                    <br />
                                    Tunisie
                                </a>
                            </li>
                            <li style={{ marginBottom: "1rem" }}>
                                <a
                                    href="tel:+21650607072"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        color: "rgba(255, 255, 255, 0.6)",
                                        textDecoration: "none",
                                    }}
                                >
                                    <Phone style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                    +216 50 607 072
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:contact@latinocoucoubeach.com"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        color: "rgba(255, 255, 255, 0.6)",
                                        textDecoration: "none",
                                    }}
                                >
                                    <Mail style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                    contact@latinocoucoubeach.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div
                style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
            >
                <div
                    className="container"
                    style={{
                        padding: "1.5rem",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.9rem" }}>
                        © {currentYear} Latino Coucou Beach. Tous droits réservés.
                    </p>
                    <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.9rem" }}>
                        <a
                            href="#"
                            style={{ color: "rgba(255, 255, 255, 0.4)", textDecoration: "none" }}
                        >
                            Mentions légales
                        </a>
                        <a
                            href="#"
                            style={{ color: "rgba(255, 255, 255, 0.4)", textDecoration: "none" }}
                        >
                            Politique de confidentialité
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
