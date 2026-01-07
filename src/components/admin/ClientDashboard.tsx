"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Ship,
    Sun,
    Utensils,
    Palmtree,
    Sunset,
    Clock,
    Thermometer,
    Droplets,
    Wind,
    ShoppingBag,
    Trophy,
    Camera,
    MessageCircle,
    User,
    ArrowRight,
    Gift,
    Bell,
    Check,
} from "lucide-react";

// Day timeline steps for Coucou Beach
const daySteps = [
    { id: "boat", label: "En route", icon: Ship, time: "9h-10h", description: "Traversée vers l'île" },
    { id: "beach", label: "Plage", icon: Sun, time: "10h-13h", description: "Profitez du soleil" },
    { id: "lunch", label: "Déjeuner", icon: Utensils, time: "13h-14h", description: "Service du repas" },
    { id: "afternoon", label: "Après-midi", icon: Palmtree, time: "14h-18h", description: "Détente & extras" },
    { id: "sunset", label: "Retour", icon: Sunset, time: "18h-19h", description: "Retour au parking" },
];

// Mock weather data (in real app, fetch from API)
const mockWeather = {
    temperature: 28,
    condition: "Ensoleillé",
    uv: 8,
    humidity: 65,
    wind: 12,
    seaTemp: 24,
    sunset: "19:45",
};

// Mock client reservation data
const mockReservation = {
    date: new Date().toISOString().split("T")[0],
    zone: "Cabane VIP",
    zoneId: "VIP1",
    guests: 4,
    arrivalTime: "09:30",
    status: "arrived", // waiting, arrived, departed
    packageName: "Pack VIP Prestige",
};

// Quick actions for client
const quickActions = [
    { href: "/admin/menu-order", label: "Commander", icon: ShoppingBag, color: "#E8A87C", badge: null },
    { href: "/admin/boat-tracker", label: "Bateau", icon: Ship, color: "#3B82F6", badge: "10 min" },
    { href: "/admin/loyalty", label: "Fidélité", icon: Trophy, color: "#F59E0B", badge: "150 pts" },
    { href: "/admin/memories", label: "Photos", icon: Camera, color: "#EC4899", badge: null },
    { href: "/admin/concierge", label: "Aide", icon: MessageCircle, color: "#22C55E", badge: null },
    { href: "/admin/profile", label: "Profil", icon: User, color: "#6366F1", badge: null },
];

// Get current step based on time
const getCurrentStep = () => {
    const hour = new Date().getHours();
    if (hour < 10) return "boat";
    if (hour < 13) return "beach";
    if (hour < 14) return "lunch";
    if (hour < 18) return "afternoon";
    return "sunset";
};

interface ClientDashboardProps {
    userName: string;
    hasReservation?: boolean;
}

export default function ClientDashboard({ userName, hasReservation = true }: ClientDashboardProps) {
    const [currentStep, setCurrentStep] = useState(getCurrentStep());
    const [, setTick] = useState(0);

    // Update current step every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentStep(getCurrentStep());
            setTick((t) => t + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const now = new Date();
    const timeString = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    // If no reservation today
    if (!hasReservation) {
        return (
            <div style={{ padding: "1rem" }}>
                <NoReservationCard userName={userName} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "100%" }}>
            {/* Welcome Header */}
            <div
                style={{
                    background: "linear-gradient(135deg, #E8A87C 0%, #F4B183 100%)",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    marginBottom: "1.5rem",
                    color: "#FFF",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                        <p style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "4px" }}>Bonjour,</p>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{userName} 👋</h1>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>{timeString}</p>
                        <p style={{ fontSize: "0.75rem", opacity: 0.9 }}>Coucou Beach</p>
                    </div>
                </div>

                {/* Current Zone Info */}
                <div
                    style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderRadius: "12px",
                        padding: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: "rgba(255,255,255,0.3)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem",
                        }}
                    >
                        🏖️
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, margin: 0 }}>{mockReservation.zone} • {mockReservation.zoneId}</p>
                        <p style={{ fontSize: "0.75rem", opacity: 0.9, margin: "2px 0 0 0" }}>
                            {mockReservation.packageName} • {mockReservation.guests} personnes
                        </p>
                    </div>
                    <div
                        style={{
                            padding: "4px 10px",
                            backgroundColor: mockReservation.status === "arrived" ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.3)",
                            borderRadius: "100px",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                        }}
                    >
                        {mockReservation.status === "arrived" ? "✓ Sur place" : "En attente"}
                    </div>
                </div>
            </div>

            {/* Weather Card */}
            <div
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "16px",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    border: "1px solid #E5E7EB",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Sun style={{ width: 24, height: 24, color: "#F59E0B" }} />
                        <span style={{ fontWeight: 600, color: "#222" }}>Météo</span>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>Mise à jour {timeString}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "3rem", fontWeight: 700, color: "#222" }}>{mockWeather.temperature}°</div>
                    <div>
                        <p style={{ fontWeight: 500, color: "#222", margin: 0 }}>{mockWeather.condition}</p>
                        <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: "2px 0 0 0" }}>
                            Coucher du soleil: {mockWeather.sunset}
                        </p>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                    <div style={{ textAlign: "center", padding: "8px", backgroundColor: "#FEF3C7", borderRadius: "8px" }}>
                        <Thermometer style={{ width: 16, height: 16, color: "#F59E0B", margin: "0 auto 4px" }} />
                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#92400E", margin: 0 }}>UV {mockWeather.uv}</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "8px", backgroundColor: "#DBEAFE", borderRadius: "8px" }}>
                        <Droplets style={{ width: 16, height: 16, color: "#3B82F6", margin: "0 auto 4px" }} />
                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#1E40AF", margin: 0 }}>{mockWeather.humidity}%</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "8px", backgroundColor: "#E0E7FF", borderRadius: "8px" }}>
                        <Wind style={{ width: 16, height: 16, color: "#6366F1", margin: "0 auto 4px" }} />
                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#4338CA", margin: 0 }}>{mockWeather.wind} km/h</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "8px", backgroundColor: "#D1FAE5", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>🌊</span>
                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#166534", margin: 0 }}>{mockWeather.seaTemp}°C</p>
                    </div>
                </div>
            </div>

            {/* Day Timeline */}
            <div
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "16px",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    border: "1px solid #E5E7EB",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                    <Clock style={{ width: 20, height: 20, color: "#E8A87C" }} />
                    <span style={{ fontWeight: 600, color: "#222" }}>Votre journée</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                    {/* Progress Line */}
                    <div
                        style={{
                            position: "absolute",
                            top: "20px",
                            left: "24px",
                            right: "24px",
                            height: "4px",
                            backgroundColor: "#E5E7EB",
                            borderRadius: "2px",
                            zIndex: 0,
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: "20px",
                            left: "24px",
                            width: `${(daySteps.findIndex((s) => s.id === currentStep) / (daySteps.length - 1)) * 100}%`,
                            height: "4px",
                            backgroundColor: "#E8A87C",
                            borderRadius: "2px",
                            zIndex: 1,
                            transition: "width 0.5s ease",
                        }}
                    />

                    {daySteps.map((step, index) => {
                        const Icon = step.icon;
                        const isPast = daySteps.findIndex((s) => s.id === currentStep) > index;
                        const isCurrent = step.id === currentStep;

                        return (
                            <div key={step.id} style={{ textAlign: "center", zIndex: 2, flex: 1 }}>
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        backgroundColor: isCurrent ? "#E8A87C" : isPast ? "#22C55E" : "#F3F4F6",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 8px",
                                        border: isCurrent ? "3px solid #FEF3E2" : "none",
                                        boxShadow: isCurrent ? "0 0 0 4px rgba(232,168,124,0.3)" : "none",
                                    }}
                                >
                                    {isPast ? (
                                        <Check style={{ width: 18, height: 18, color: "#FFF" }} />
                                    ) : (
                                        <Icon style={{ width: 18, height: 18, color: isCurrent ? "#FFF" : "#9CA3AF" }} />
                                    )}
                                </div>
                                <p
                                    style={{
                                        fontSize: "0.7rem",
                                        fontWeight: isCurrent ? 600 : 400,
                                        color: isCurrent ? "#E8A87C" : isPast ? "#22C55E" : "#6B7280",
                                        margin: 0,
                                    }}
                                >
                                    {step.label}
                                </p>
                                <p style={{ fontSize: "0.6rem", color: "#9CA3AF", margin: "2px 0 0 0" }}>{step.time}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#222", marginBottom: "0.75rem" }}>
                    Actions rapides
                </h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "12px",
                    }}
                >
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.href}
                                href={action.href}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "1rem",
                                    backgroundColor: "#FFF",
                                    borderRadius: "16px",
                                    border: "1px solid #E5E7EB",
                                    textDecoration: "none",
                                    position: "relative",
                                }}
                            >
                                {action.badge && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: "8px",
                                            right: "8px",
                                            padding: "2px 6px",
                                            backgroundColor: action.color,
                                            color: "#FFF",
                                            fontSize: "0.6rem",
                                            fontWeight: 600,
                                            borderRadius: "100px",
                                        }}
                                    >
                                        {action.badge}
                                    </span>
                                )}
                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "14px",
                                        backgroundColor: `${action.color}15`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Icon style={{ width: 24, height: 24, color: action.color }} />
                                </div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#222" }}>
                                    {action.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Special Offer Banner */}
            <div
                style={{
                    background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                    borderRadius: "16px",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}
            >
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Gift style={{ width: 24, height: 24, color: "#FFF" }} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: "#FFF", margin: 0, fontSize: "0.875rem" }}>
                        Happy Hour! 🍹
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)", margin: "2px 0 0 0" }}>
                        -20% sur tous les cocktails jusqu&apos;à 17h
                    </p>
                </div>
                <Link
                    href="/admin/menu-order"
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#FFF",
                        color: "#F59E0B",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textDecoration: "none",
                    }}
                >
                    Commander
                </Link>
            </div>

            {/* Notifications Preview */}
            <div
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "16px",
                    padding: "1rem",
                    border: "1px solid #E5E7EB",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Bell style={{ width: 18, height: 18, color: "#6366F1" }} />
                        <span style={{ fontWeight: 600, color: "#222", fontSize: "0.875rem" }}>Notifications</span>
                    </div>
                    <span
                        style={{
                            padding: "2px 8px",
                            backgroundColor: "#EEF2FF",
                            color: "#6366F1",
                            fontSize: "0.7rem",
                            fontWeight: 500,
                            borderRadius: "100px",
                        }}
                    >
                        2 nouvelles
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", backgroundColor: "#F9FAFB", borderRadius: "10px" }}>
                        <span style={{ fontSize: "1rem" }}>🚢</span>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "0.8rem", fontWeight: 500, color: "#222", margin: 0 }}>Prochaine navette dans 10 min</p>
                            <p style={{ fontSize: "0.7rem", color: "#6B7280", margin: "2px 0 0 0" }}>Départ du parking à 14:30</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", backgroundColor: "#F9FAFB", borderRadius: "10px" }}>
                        <span style={{ fontSize: "1rem" }}>🍉</span>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "0.8rem", fontWeight: 500, color: "#222", margin: 0 }}>Panier de fruits disponible</p>
                            <p style={{ fontSize: "0.7rem", color: "#6B7280", margin: "2px 0 0 0" }}>Inclus dans votre pack</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Component for when client has no reservation
function NoReservationCard({ userName }: { userName: string }) {
    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <div
                style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#FEF3E2",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    fontSize: "2.5rem",
                }}
            >
                🏝️
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222", marginBottom: "0.5rem" }}>
                Bienvenue, {userName}!
            </h2>
            <p style={{ color: "#6B7280", marginBottom: "1.5rem" }}>
                Vous n&apos;avez pas de réservation aujourd&apos;hui.<br />
                Réservez votre journée au paradis !
            </p>
            <Link
                href="/#reservation"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 28px",
                    backgroundColor: "#E8A87C",
                    color: "#FFF",
                    borderRadius: "100px",
                    fontWeight: 600,
                    textDecoration: "none",
                    fontSize: "1rem",
                }}
            >
                Réserver maintenant
                <ArrowRight style={{ width: 20, height: 20 }} />
            </Link>

            <div style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#FFF", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#222", marginBottom: "1rem" }}>
                    Pourquoi Coucou Beach ?
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.25rem" }}>🏖️</span>
                        <span style={{ fontSize: "0.875rem", color: "#222" }}>Plage privée</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.25rem" }}>🍽️</span>
                        <span style={{ fontSize: "0.875rem", color: "#222" }}>Déjeuner inclus</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.25rem" }}>🚤</span>
                        <span style={{ fontSize: "0.875rem", color: "#222" }}>Transport bateau</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.25rem" }}>🍹</span>
                        <span style={{ fontSize: "0.875rem", color: "#222" }}>Bar & cocktails</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
