"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, ChevronLeft, Send, Phone, AlertTriangle, Clock, CheckCheck, Sparkles } from "lucide-react";
import Link from "next/link";

// Quick request buttons
const quickRequests = [
    { id: "towels", label: "Serviettes", icon: "🛁", message: "J'aurais besoin de serviettes supplémentaires s'il vous plaît" },
    { id: "ice", label: "Glaçons", icon: "🧊", message: "Pouvez-vous m'apporter des glaçons ?" },
    { id: "umbrella", label: "Parasol", icon: "☂️", message: "J'aimerais un ajustement de mon parasol" },
    { id: "menu", label: "Carte", icon: "📋", message: "Pouvez-vous m'apporter la carte s'il vous plaît ?" },
    { id: "bill", label: "Addition", icon: "💳", message: "Je voudrais l'addition s'il vous plaît" },
    { id: "help", label: "Aide", icon: "❓", message: "J'ai besoin d'assistance" },
];

interface Message {
    id: string;
    type: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    status?: "sent" | "delivered" | "read";
}

// Mock chat messages
const initialMessages: Message[] = [
    {
        id: "1",
        type: "system",
        content: "Bienvenue dans la conciergerie Coucou Beach ! Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date(Date.now() - 3600000),
    },
    {
        id: "2",
        type: "user",
        content: "Bonjour, à quelle heure est le service du déjeuner ?",
        timestamp: new Date(Date.now() - 3500000),
        status: "read",
    },
    {
        id: "3",
        type: "assistant",
        content: "Bonjour ! Le service déjeuner est de 13h à 14h30. Notre chef vous prépare un délicieux menu du jour. Souhaitez-vous que je vous le détaille ?",
        timestamp: new Date(Date.now() - 3400000),
    },
];

export default function ConciergePage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: "user",
            content: content.trim(),
            timestamp: new Date(),
            status: "sent",
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        // Simulate assistant response
        setTimeout(() => {
            setIsTyping(false);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: "assistant",
                content: getAutoResponse(content),
                timestamp: new Date(),
            };
            setMessages((prev) => [
                ...prev.map((m) => (m.id === userMessage.id ? { ...m, status: "read" as const } : m)),
                assistantMessage,
            ]);
        }, 1500);
    };

    const getAutoResponse = (message: string): string => {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes("serviette")) {
            return "Bien sûr ! Un membre de notre équipe vous apporte des serviettes dans les 5 minutes. 🛁";
        }
        if (lowerMessage.includes("glaçon")) {
            return "Des glaçons arrivent tout de suite ! Notre serveur sera là dans 3 minutes. 🧊";
        }
        if (lowerMessage.includes("parasol")) {
            return "Je fais venir quelqu'un pour ajuster votre parasol immédiatement. ☂️";
        }
        if (lowerMessage.includes("carte") || lowerMessage.includes("menu")) {
            return "Je vous envoie notre carte digitale ! Vous pouvez aussi commander directement depuis l'app : /dashboard/menu-order 📋";
        }
        if (lowerMessage.includes("addition") || lowerMessage.includes("payer")) {
            return "L'addition sera préparée. Souhaitez-vous régler en espèces, par carte, ou ajouter au compte de votre réservation ? 💳";
        }
        if (lowerMessage.includes("heure") || lowerMessage.includes("fermeture")) {
            return "Le beach club est ouvert jusqu'à 19h. Le dernier bateau part à 18h30. Profitez bien de votre après-midi ! 🌅";
        }
        if (lowerMessage.includes("wifi") || lowerMessage.includes("internet")) {
            return "Le WiFi est gratuit ! Réseau: CoucouBeach_Guest | Mot de passe: plage2024 📶";
        }

        return "Merci pour votre message ! Un membre de notre équipe vous répondra dans les plus brefs délais. Y a-t-il autre chose que je puisse faire pour vous ? 😊";
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxWidth: "100%" }}>
            {/* Header */}
            <div style={{ marginBottom: "1rem" }}>
                <Link
                    href="/dashboard"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#6B7280",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        marginBottom: "0.5rem",
                    }}
                >
                    <ChevronLeft style={{ width: 16, height: 16 }} />
                    Retour
                </Link>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#22C55E",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <MessageCircle style={{ width: 20, height: 20, color: "#FFF" }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#222", margin: 0 }}>
                                Conciergerie
                            </h1>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <div style={{ width: "6px", height: "6px", backgroundColor: "#22C55E", borderRadius: "50%" }} />
                                <span style={{ fontSize: "0.7rem", color: "#22C55E" }}>En ligne</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#FEE2E2",
                                border: "none",
                                borderRadius: "12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            title="SOS Urgence"
                        >
                            <AlertTriangle style={{ width: 18, height: 18, color: "#EF4444" }} />
                        </button>
                        <button
                            style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#DBEAFE",
                                border: "none",
                                borderRadius: "12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            title="Appeler"
                        >
                            <Phone style={{ width: 18, height: 18, color: "#3B82F6" }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Requests */}
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    overflowX: "auto",
                    paddingBottom: "12px",
                    marginBottom: "1rem",
                }}
            >
                {quickRequests.map((req) => (
                    <button
                        key={req.id}
                        onClick={() => sendMessage(req.message)}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            padding: "10px 14px",
                            backgroundColor: "#FFF",
                            border: "1px solid #E5E7EB",
                            borderRadius: "12px",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <span style={{ fontSize: "1.25rem" }}>{req.icon}</span>
                        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "#222" }}>{req.label}</span>
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    paddingRight: "4px",
                }}
            >
                {messages.map((message) => (
                    <div
                        key={message.id}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: message.type === "user" ? "flex-end" : "flex-start",
                        }}
                    >
                        {message.type === "system" ? (
                            <div
                                style={{
                                    backgroundColor: "#F3F4F6",
                                    padding: "10px 14px",
                                    borderRadius: "12px",
                                    maxWidth: "85%",
                                    textAlign: "center",
                                }}
                            >
                                <p style={{ fontSize: "0.8rem", color: "#6B7280", margin: 0 }}>{message.content}</p>
                            </div>
                        ) : (
                            <>
                                <div
                                    style={{
                                        backgroundColor: message.type === "user" ? "#E8A87C" : "#FFF",
                                        color: message.type === "user" ? "#FFF" : "#222",
                                        padding: "12px 14px",
                                        borderRadius: message.type === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                        maxWidth: "85%",
                                        border: message.type === "assistant" ? "1px solid #E5E7EB" : "none",
                                    }}
                                >
                                    <p style={{ fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>{message.content}</p>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        marginTop: "4px",
                                        fontSize: "0.65rem",
                                        color: "#9CA3AF",
                                    }}
                                >
                                    <span>{formatTime(message.timestamp)}</span>
                                    {message.type === "user" && message.status === "read" && (
                                        <CheckCheck style={{ width: 12, height: 12, color: "#22C55E" }} />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                        <div
                            style={{
                                backgroundColor: "#FFF",
                                padding: "12px 16px",
                                borderRadius: "16px 16px 16px 4px",
                                border: "1px solid #E5E7EB",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                            }}
                        >
                            <span style={{ animation: "bounce 1s infinite" }}>•</span>
                            <span style={{ animation: "bounce 1s infinite 0.2s" }}>•</span>
                            <span style={{ animation: "bounce 1s infinite 0.4s" }}>•</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "1rem 0",
                    borderTop: "1px solid #E5E7EB",
                    marginTop: "1rem",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        backgroundColor: "#FFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "100px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Écrivez votre message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage(inputValue)}
                        style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: "0.875rem",
                            backgroundColor: "transparent",
                        }}
                    />
                </div>
                <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim()}
                    style={{
                        width: "44px",
                        height: "44px",
                        backgroundColor: inputValue.trim() ? "#E8A87C" : "#E5E7EB",
                        border: "none",
                        borderRadius: "50%",
                        cursor: inputValue.trim() ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Send style={{ width: 18, height: 18, color: inputValue.trim() ? "#FFF" : "#9CA3AF" }} />
                </button>
            </div>

            {/* CSS for bounce animation */}
            <style jsx global>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-4px); }
                }
            `}</style>
        </div>
    );
}
