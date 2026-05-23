"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/config";

export function WhatsAppButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, "0");
        const m = now.getMinutes().toString().padStart(2, "0");
        setCurrentTime(`${h}:${m}`);
    }, [isOpen]);

    const phoneNumber = RESTAURANT_INFO.phone.replace(/\s/g, "").replace("+", "");
    const reservationMessage = encodeURIComponent(
        `👋 Bonjour ! Je souhaite réserver au ${RESTAURANT_INFO.name} 🌴 Merci de me contacter pour confirmer ma réservation.`
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${reservationMessage}`;

    const chatMessage = `👋 Bienvenue chez ${RESTAURANT_INFO.name} ! Merci de nous contacter 🌴 Pour réserver, merci de nous indiquer : · Le nombre de personnes · La date et l'heure souhaitées · Toute demande particulière (Repas spécial, Évènement, anniversaire, etc.) On revient vite vers vous pour confirmer ☀️`;

    return (
        <div className="hidden-mobile">
            {/* Chat Window */}
            {isOpen && (
                <>
                    {/* Backdrop overlay (click outside to close) */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9997,
                        }}
                    />

                    <div
                        style={{
                            position: "fixed",
                            bottom: "100px",
                            right: "24px",
                            width: "340px",
                            borderRadius: "16px",
                            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.25)",
                            zIndex: 9998,
                            overflow: "hidden",
                            fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                            animation: "wa-slide-up 0.25s ease",
                        }}
                    >
                        {/* ── Header ── */}
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
                            {/* Avatar + info */}
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
                                    {/* Online dot */}
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

                                {/* Name & subtitle */}
                                <div style={{ minWidth: 0 }}>
                                    <p
                                        style={{
                                            color: "#FFFFFF",
                                            fontWeight: 700,
                                            margin: 0,
                                            fontSize: "15px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        Chat Whatsapp
                                    </p>
                                    <p
                                        style={{
                                            color: "rgba(255,255,255,0.75)",
                                            margin: 0,
                                            fontSize: "12px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        Répond généralement instantanément
                                    </p>
                                </div>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "rgba(255,255,255,0.8)",
                                    padding: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    borderRadius: "50%",
                                    transition: "color 0.2s, background 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#fff";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                                    e.currentTarget.style.background = "none";
                                }}
                                aria-label="Fermer"
                            >
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>

                        {/* ── Chat body with WhatsApp pattern background ── */}
                        <div
                            style={{
                                background: "#ECE5DD",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' opacity='0.07'%3E%3Ctext y='40' font-size='36'%3E💬%3C/text%3E%3C/svg%3E")`,
                                padding: "16px 12px",
                                minHeight: "200px",
                                position: "relative",
                            }}
                        >
                            {/* WhatsApp subtle pattern overlay */}
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cg fill='%23000' fill-opacity='0.03'%3E%3Ccircle cx='20' cy='20' r='8'/%3E%3Ccircle cx='80' cy='40' r='5'/%3E%3Ccircle cx='140' cy='20' r='7'/%3E%3Ccircle cx='200' cy='50' r='6'/%3E%3Ccircle cx='260' cy='25' r='4'/%3E%3Ccircle cx='50' cy='80' r='6'/%3E%3Ccircle cx='110' cy='70' r='4'/%3E%3Ccircle cx='170' cy='90' r='8'/%3E%3Ccircle cx='230' cy='75' r='5'/%3E%3Ccircle cx='290' cy='85' r='7'/%3E%3Ccircle cx='30' cy='140' r='5'/%3E%3Ccircle cx='90' cy='130' r='7'/%3E%3Ccircle cx='150' cy='150' r='4'/%3E%3Ccircle cx='210' cy='135' r='6'/%3E%3Ccircle cx='270' cy='145' r='8'/%3E%3Ccircle cx='60' cy='200' r='7'/%3E%3Ccircle cx='120' cy='190' r='5'/%3E%3Ccircle cx='180' cy='210' r='6'/%3E%3Ccircle cx='240' cy='195' r='4'/%3E%3Ccircle cx='10' cy='260' r='6'/%3E%3Ccircle cx='70' cy='250' r='8'/%3E%3Ccircle cx='130' cy='270' r='5'/%3E%3Ccircle cx='190' cy='255' r='7'/%3E%3Ccircle cx='250' cy='265' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
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
                                        maxWidth: "92%",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                                        position: "relative",
                                    }}
                                >
                                    {/* Bubble tail */}
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

                                    {/* Sender name */}
                                    <p
                                        style={{
                                            color: "#25D366",
                                            fontWeight: 600,
                                            fontSize: "13px",
                                            margin: "0 0 6px",
                                        }}
                                    >
                                        Chat Whatsapp
                                    </p>

                                    {/* Message text */}
                                    <p
                                        style={{
                                            color: "#303030",
                                            fontSize: "14px",
                                            lineHeight: "1.5",
                                            margin: 0,
                                        }}
                                    >
                                        {chatMessage}
                                    </p>

                                    {/* Timestamp */}
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

                        {/* ── CTA Button ── */}
                        <div
                            style={{
                                backgroundColor: "#F5F5F5",
                                padding: "12px 16px",
                                borderTop: "1px solid #E0E0E0",
                            }}
                        >
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
                                    transition: "background-color 0.2s, transform 0.15s",
                                    boxShadow: "0 4px 14px rgba(37, 211, 102, 0.35)",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#1ebe5d";
                                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#25D366";
                                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                                }}
                            >
                                {/* WhatsApp SVG icon */}
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Réserver maintenant
                            </a>
                        </div>
                    </div>
                </>
            )}

            {/* ── Floating Button ── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Contacter via WhatsApp"
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "#25D366",
                    color: "#FFFFFF",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(37, 211, 102, 0.45)",
                    zIndex: 9999,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 6px 30px rgba(37, 211, 102, 0.6)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(37, 211, 102, 0.45)";
                }}
            >
                {isOpen ? (
                    <X style={{ width: 28, height: 28 }} />
                ) : (
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                )}
            </button>

            {/* Animation keyframes */}
            <style>{`
                @keyframes wa-slide-up {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
