"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/config";

export function WhatsAppButton() {
    const [isOpen, setIsOpen] = useState(false);

    const phoneNumber = RESTAURANT_INFO.phone.replace(/\s/g, "").replace("+", "");
    const defaultMessage = encodeURIComponent(
        `Bonjour ! Je souhaite avoir des informations sur ${RESTAURANT_INFO.name}. 🌴`
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

    const quickMessages = [
        { label: "📅 Réserver une journée", message: "Bonjour ! Je souhaite réserver une journée au Latino Coucou Beach." },
        { label: "💰 Connaître les tarifs", message: "Bonjour ! Quels sont vos tarifs et forfaits disponibles ?" },
        { label: "📍 Comment y accéder ?", message: "Bonjour ! Comment puis-je accéder au Latino Coucou Beach ?" },
        { label: "🎉 Organiser un événement", message: "Bonjour ! Je souhaite organiser un événement privé." },
    ];

    return (
        <>
            {/* Quick Actions Popup */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "100px",
                        right: "24px",
                        width: "320px",
                        backgroundColor: "#FFFFFF",
                        borderRadius: "16px",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                        zIndex: 9998,
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                            padding: "16px 20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                                style={{
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "50%",
                                    backgroundColor: "#FFFFFF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <span style={{ fontSize: "24px" }}>🌴</span>
                            </div>
                            <div>
                                <p style={{ color: "#FFFFFF", fontWeight: 600, margin: 0, fontSize: "15px" }}>
                                    {RESTAURANT_INFO.name}
                                </p>
                                <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "12px" }}>
                                    Répond généralement en 1h
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#FFFFFF",
                                padding: "5px",
                            }}
                            aria-label="Fermer"
                        >
                            <X style={{ width: 20, height: 20 }} />
                        </button>
                    </div>

                    {/* Quick Messages */}
                    <div style={{ padding: "16px" }}>
                        <p style={{ color: "#7A7A7A", fontSize: "13px", margin: "0 0 12px" }}>
                            💬 Comment pouvons-nous vous aider ?
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {quickMessages.map((item) => (
                                <a
                                    key={item.label}
                                    href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(item.message)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: "block",
                                        padding: "12px 16px",
                                        backgroundColor: "#F9F5F0",
                                        borderRadius: "10px",
                                        color: "#222222",
                                        textDecoration: "none",
                                        fontSize: "14px",
                                        transition: "background-color 0.2s",
                                    }}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Direct Link */}
                    <div style={{ padding: "0 16px 16px" }}>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                padding: "14px",
                                backgroundColor: "#25D366",
                                color: "#FFFFFF",
                                borderRadius: "10px",
                                textDecoration: "none",
                                fontWeight: 600,
                                fontSize: "15px",
                            }}
                        >
                            <MessageCircle style={{ width: 20, height: 20 }} />
                            Démarrer une conversation
                        </a>
                    </div>
                </div>
            )}

            {/* Floating Button */}
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
                    boxShadow: "0 4px 20px rgba(37, 211, 102, 0.4)",
                    zIndex: 9999,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 6px 30px rgba(37, 211, 102, 0.5)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(37, 211, 102, 0.4)";
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
        </>
    );
}
