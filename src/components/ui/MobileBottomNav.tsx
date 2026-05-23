"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/config";

const WhatsAppSVG = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const UserSVG = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const CalendarSVG = () => (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

export function MobileBottomNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, "0");
        const m = now.getMinutes().toString().padStart(2, "0");
        setCurrentTime(`${h}:${m}`);
    }, [isOpen]);

    // Lock body scroll when chat is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const phoneNumber = RESTAURANT_INFO.phone.replace(/[^0-9]/g, "");
    const reservationMessage = encodeURIComponent(
        `👋 Bonjour ! Je souhaite réserver au ${RESTAURANT_INFO.name} 🌴 Merci de me contacter pour confirmer ma réservation.`
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${reservationMessage}`;

    const chatMessage = `👋 Bienvenue chez ${RESTAURANT_INFO.name} ! Merci de nous contacter 🌴 Pour réserver, merci de nous indiquer : · Le nombre de personnes · La date et l'heure souhaitées · Toute demande particulière (Repas spécial, Évènement, anniversaire, etc.) On revient vite vers vous pour confirmer ☀️`;

    if (pathname?.startsWith("/login") || pathname?.startsWith("/dashboard") || pathname?.startsWith("/reservation")) {
        return null;
    }

    return (
        <>
            {/* ── WhatsApp Chat Overlay (mobile) ── */}
            {isOpen && (
                <>
                    {/* Dimmed backdrop */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0,0,0,0.45)",
                            zIndex: 9997,
                        }}
                    />

                    {/* Chat sheet — slides up from bottom */}
                    <div
                        style={{
                            position: "fixed",
                            bottom: "64px",        /* sits just above the nav bar */
                            left: "12px",
                            right: "12px",
                            borderRadius: "20px",
                            boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
                            zIndex: 9998,
                            overflow: "hidden",
                            fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                            animation: "wa-mobile-up 0.28s ease",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, #075E54 0%, #128C7E 100%)",
                                padding: "14px 16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "12px",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                                {/* Avatar */}
                                <div style={{ position: "relative", flexShrink: 0 }}>
                                    <div
                                        style={{
                                            width: "46px",
                                            height: "46px",
                                            borderRadius: "50%",
                                            backgroundColor: "rgba(255,255,255,0.15)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "2px solid rgba(255,255,255,0.3)",
                                        }}
                                    >
                                        <span style={{ fontSize: "22px" }}>🌴</span>
                                    </div>
                                    <span
                                        style={{
                                            position: "absolute",
                                            bottom: "2px",
                                            right: "2px",
                                            width: "11px",
                                            height: "11px",
                                            backgroundColor: "#4ADE80",
                                            borderRadius: "50%",
                                            border: "2px solid #075E54",
                                        }}
                                    />
                                </div>

                                <div style={{ minWidth: 0 }}>
                                    <p style={{ color: "#FFFFFF", fontWeight: 700, margin: 0, fontSize: "15px" }}>
                                        Chat Whatsapp
                                    </p>
                                    <p style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: "12px" }}>
                                        Répond généralement instantanément
                                    </p>
                                </div>
                            </div>

                            {/* Close */}
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "rgba(255,255,255,0.8)",
                                    padding: "6px",
                                    display: "flex",
                                    alignItems: "center",
                                    borderRadius: "50%",
                                }}
                                aria-label="Fermer"
                            >
                                <X style={{ width: 22, height: 22 }} />
                            </button>
                        </div>

                        {/* Chat body */}
                        <div
                            style={{
                                background: "#ECE5DD",
                                padding: "16px 12px",
                                position: "relative",
                            }}
                        >
                            {/* Subtle dot pattern */}
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cg fill='%23000' fill-opacity='0.03'%3E%3Ccircle cx='20' cy='20' r='8'/%3E%3Ccircle cx='80' cy='40' r='5'/%3E%3Ccircle cx='140' cy='20' r='7'/%3E%3Ccircle cx='200' cy='50' r='6'/%3E%3Ccircle cx='260' cy='25' r='4'/%3E%3Ccircle cx='50' cy='80' r='6'/%3E%3Ccircle cx='110' cy='70' r='4'/%3E%3Ccircle cx='170' cy='90' r='8'/%3E%3Ccircle cx='230' cy='75' r='5'/%3E%3C/g%3E%3C/svg%3E")`,
                                    pointerEvents: "none",
                                }}
                            />

                            {/* Message bubble */}
                            <div style={{ position: "relative" }}>
                                <div
                                    style={{
                                        backgroundColor: "#FFFFFF",
                                        borderRadius: "0 12px 12px 12px",
                                        padding: "12px 14px 28px",
                                        maxWidth: "95%",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                                        position: "relative",
                                    }}
                                >
                                    {/* Tail */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: "-8px",
                                            width: 0,
                                            height: 0,
                                            borderTop: "8px solid #FFFFFF",
                                            borderLeft: "8px solid transparent",
                                        }}
                                    />
                                    <p style={{ color: "#25D366", fontWeight: 600, fontSize: "13px", margin: "0 0 6px" }}>
                                        Chat Whatsapp
                                    </p>
                                    <p style={{ color: "#303030", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                                        {chatMessage}
                                    </p>
                                    <span
                                        style={{
                                            position: "absolute",
                                            bottom: "8px",
                                            right: "12px",
                                            color: "#8A8A8A",
                                            fontSize: "11px",
                                        }}
                                    >
                                        {currentTime}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{ backgroundColor: "#F5F5F5", padding: "12px 16px", borderTop: "1px solid #E0E0E0" }}>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "10px",
                                    padding: "14px 20px",
                                    backgroundColor: "#25D366",
                                    color: "#FFFFFF",
                                    borderRadius: "50px",
                                    textDecoration: "none",
                                    fontWeight: 700,
                                    fontSize: "15px",
                                    boxShadow: "0 4px 14px rgba(37, 211, 102, 0.35)",
                                }}
                            >
                                <WhatsAppSVG />
                                Réserver maintenant
                            </a>
                        </div>
                    </div>

                    <style>{`
                        @keyframes wa-mobile-up {
                            from { opacity: 0; transform: translateY(24px); }
                            to   { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </>
            )}

            {/* ── Bottom Nav ── */}
            <nav className="mobile-bottom-nav">
                <Link href="/login" className="mbn-item">
                    <span className="mbn-icon"><UserSVG /></span>
                    <span className="mbn-label">Connexion</span>
                </Link>

                <Link href="/reservation" className="mbn-center">
                    <span className="mbn-center-circle"><CalendarSVG /></span>
                    <span className="mbn-center-label">Réserver</span>
                </Link>

                <button
                    onClick={() => setIsOpen(true)}
                    className="mbn-item mbn-whatsapp"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    aria-label="Ouvrir le chat WhatsApp"
                >
                    <span className="mbn-icon"><WhatsAppSVG /></span>
                    <span className="mbn-label">WhatsApp</span>
                </button>
            </nav>
        </>
    );
}
