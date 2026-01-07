"use client";

import { useState, useEffect } from "react";
import { Ship, Clock, Users, MapPin, ArrowRight, ChevronLeft, RefreshCw, Bell } from "lucide-react";
import Link from "next/link";

// Mock boat schedule data
const generateSchedule = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const schedule = [];

    // Generate departures from 9h to 18h
    for (let hour = 9; hour <= 18; hour++) {
        for (const minute of [0, 30]) {
            if (hour === 18 && minute === 30) continue; // Last departure at 18:00

            const departureTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
            const isPast = hour < currentHour || (hour === currentHour && minute <= currentMinute);

            schedule.push({
                id: `${hour}-${minute}`,
                time: departureTime,
                direction: hour < 14 ? "parking_to_island" : "island_to_parking",
                capacity: 12,
                booked: Math.floor(Math.random() * 10) + 2,
                isPast,
                isNext: false,
                status: isPast ? "departed" : "scheduled",
            });
        }
    }

    // Mark the first non-past departure as "next"
    const firstUpcoming = schedule.find(s => !s.isPast);
    if (firstUpcoming) {
        firstUpcoming.isNext = true;
    }

    return schedule;
};

// Get countdown to next departure
const getCountdown = (scheduleTime: string) => {
    const now = new Date();
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    const departure = new Date();
    departure.setHours(hours, minutes, 0, 0);

    const diffMs = departure.getTime() - now.getTime();
    if (diffMs <= 0) return null;

    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes >= 60) {
        const h = Math.floor(diffMinutes / 60);
        const m = diffMinutes % 60;
        return `${h}h ${m}min`;
    }
    return `${diffMinutes} min`;
};

// Boat position simulation (0 = parking, 100 = island)
const getBoatPosition = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    // Simulate boat moving every 30 min cycle
    const cyclePosition = minutes % 30;

    if (cyclePosition < 5) {
        // At dock (loading)
        return { position: minutes < 30 ? 0 : 100, status: "loading" };
    } else if (cyclePosition < 15) {
        // Traveling
        const progress = ((cyclePosition - 5) / 10) * 100;
        return {
            position: minutes < 30 ? progress : 100 - progress,
            status: "sailing"
        };
    } else if (cyclePosition < 20) {
        // At destination (unloading)
        return { position: minutes < 30 ? 100 : 0, status: "unloading" };
    } else {
        // Return journey
        const progress = ((cyclePosition - 20) / 10) * 100;
        return {
            position: minutes < 30 ? 100 - progress : progress,
            status: "sailing"
        };
    }
};

export default function BoatTrackerPage() {
    const [schedule, setSchedule] = useState(generateSchedule);
    const [boatInfo, setBoatInfo] = useState(getBoatPosition);
    const [, setTick] = useState(0);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // Update every 10 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setSchedule(generateSchedule());
            setBoatInfo(getBoatPosition());
            setTick((t) => t + 1);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    const nextDeparture = schedule.find((s) => s.isNext);
    const upcomingDepartures = schedule.filter((s) => !s.isPast).slice(0, 5);
    const countdown = nextDeparture ? getCountdown(nextDeparture.time) : null;

    return (
        <div style={{ maxWidth: "100%" }}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <Link
                    href="/admin"
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
                    Retour au dashboard
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Ship style={{ width: 32, height: 32, color: "#3B82F6" }} />
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222", margin: 0 }}>
                            Navette Bateau
                        </h1>
                        <p style={{ fontSize: "0.875rem", color: "#6B7280", margin: 0 }}>
                            Suivi en temps réel
                        </p>
                    </div>
                </div>
            </div>

            {/* Live Boat Position */}
            <div
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    marginBottom: "1.5rem",
                    border: "1px solid #E5E7EB",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <span style={{ fontWeight: 600, color: "#222" }}>Position du bateau</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: boatInfo.status === "sailing" ? "#22C55E" : "#F59E0B",
                                animation: boatInfo.status === "sailing" ? "pulse 1s infinite" : "none",
                            }}
                        />
                        <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                            {boatInfo.status === "sailing" ? "En navigation" :
                                boatInfo.status === "loading" ? "Embarquement" : "Débarquement"}
                        </span>
                    </div>
                </div>

                {/* Visual Map */}
                <div
                    style={{
                        position: "relative",
                        height: "120px",
                        backgroundColor: "#EFF6FF",
                        borderRadius: "16px",
                        overflow: "hidden",
                        marginBottom: "1rem",
                    }}
                >
                    {/* Water pattern */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "repeating-linear-gradient(90deg, rgba(59,130,246,0.1) 0px, transparent 1px, transparent 20px)",
                        }}
                    />

                    {/* Parking dock */}
                    <div
                        style={{
                            position: "absolute",
                            left: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                backgroundColor: "#FFF",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.5rem",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                        >
                            🅿️
                        </div>
                        <p style={{ fontSize: "0.6rem", color: "#6B7280", marginTop: "4px" }}>Parking</p>
                    </div>

                    {/* Island dock */}
                    <div
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                backgroundColor: "#FFF",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.5rem",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                        >
                            🏝️
                        </div>
                        <p style={{ fontSize: "0.6rem", color: "#6B7280", marginTop: "4px" }}>Coucou Beach</p>
                    </div>

                    {/* Route line */}
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "70px",
                            right: "70px",
                            height: "4px",
                            backgroundColor: "#BFDBFE",
                            borderRadius: "2px",
                            transform: "translateY(-50%)",
                        }}
                    />

                    {/* Boat icon */}
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: `calc(70px + ${boatInfo.position}% * (100% - 140px) / 100)`,
                            transform: "translate(-50%, -50%)",
                            transition: "left 0.5s ease",
                        }}
                    >
                        <div
                            style={{
                                width: "44px",
                                height: "44px",
                                backgroundColor: "#3B82F6",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
                                border: "3px solid #FFF",
                            }}
                        >
                            <Ship style={{ width: 22, height: 22, color: "#FFF" }} />
                        </div>
                    </div>
                </div>

                {/* Progress percentage */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6B7280" }}>
                    <span>Départ</span>
                    <span style={{ fontWeight: 600, color: "#3B82F6" }}>{Math.round(boatInfo.position)}% du trajet</span>
                    <span>Arrivée</span>
                </div>
            </div>

            {/* Next Departure Countdown */}
            {nextDeparture && (
                <div
                    style={{
                        background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                        borderRadius: "20px",
                        padding: "1.5rem",
                        marginBottom: "1.5rem",
                        color: "#FFF",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <p style={{ fontSize: "0.75rem", opacity: 0.9, marginBottom: "4px" }}>Prochaine navette</p>
                            <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>{nextDeparture.time}</p>
                            <p style={{ fontSize: "0.875rem", opacity: 0.9, marginTop: "4px" }}>
                                {nextDeparture.direction === "parking_to_island" ? "Parking → Île" : "Île → Parking"}
                            </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div
                                style={{
                                    fontSize: "2.5rem",
                                    fontWeight: 700,
                                    lineHeight: 1,
                                }}
                            >
                                {countdown}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                                <Users style={{ width: 14, height: 14 }} />
                                <span style={{ fontSize: "0.75rem" }}>
                                    {nextDeparture.booked}/{nextDeparture.capacity} places
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notification toggle */}
                    <button
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        style={{
                            marginTop: "1rem",
                            padding: "10px 16px",
                            backgroundColor: notificationsEnabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            borderRadius: "100px",
                            color: "#FFF",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            width: "100%",
                            justifyContent: "center",
                        }}
                    >
                        <Bell style={{ width: 14, height: 14 }} />
                        {notificationsEnabled ? "Notifications activées ✓" : "Me rappeler 10 min avant"}
                    </button>
                </div>
            )}

            {/* Schedule List */}
            <div
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    border: "1px solid #E5E7EB",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Clock style={{ width: 18, height: 18, color: "#6B7280" }} />
                        <span style={{ fontWeight: 600, color: "#222" }}>Horaires du jour</span>
                    </div>
                    <button
                        onClick={() => setSchedule(generateSchedule())}
                        style={{
                            padding: "6px",
                            backgroundColor: "#F3F4F6",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <RefreshCw style={{ width: 16, height: 16, color: "#6B7280" }} />
                    </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {upcomingDepartures.map((dep) => (
                        <div
                            key={dep.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px",
                                backgroundColor: dep.isNext ? "#EFF6FF" : "#F9FAFB",
                                borderRadius: "12px",
                                border: dep.isNext ? "2px solid #3B82F6" : "1px solid #E5E7EB",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        backgroundColor: dep.isNext ? "#3B82F6" : "#E5E7EB",
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Ship style={{ width: 20, height: 20, color: dep.isNext ? "#FFF" : "#6B7280" }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, color: "#222", margin: 0 }}>{dep.time}</p>
                                    <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: "2px 0 0 0" }}>
                                        {dep.direction === "parking_to_island" ? "Parking → Île" : "Île → Parking"}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        marginBottom: "4px",
                                    }}
                                >
                                    <Users style={{ width: 12, height: 12, color: "#6B7280" }} />
                                    <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                                        {dep.booked}/{dep.capacity}
                                    </span>
                                </div>
                                {dep.isNext && (
                                    <span
                                        style={{
                                            padding: "2px 8px",
                                            backgroundColor: "#DCFCE7",
                                            color: "#166534",
                                            fontSize: "0.65rem",
                                            fontWeight: 600,
                                            borderRadius: "100px",
                                        }}
                                    >
                                        PROCHAIN
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* View all schedule */}
                <button
                    style={{
                        marginTop: "1rem",
                        padding: "12px",
                        backgroundColor: "#F3F4F6",
                        border: "none",
                        borderRadius: "12px",
                        color: "#374151",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                    }}
                >
                    Voir tous les horaires
                    <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
            </div>

            {/* CSS for pulse animation */}
            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
