"use client";

import { useState, useEffect, useMemo } from "react";
import { MapPin, Users, Clock, AlertCircle, Check, X, AlertTriangle, ShoppingBag, Sparkles, UserPlus, ChevronLeft, ChevronRight, Anchor, Ship, Calendar } from "lucide-react";
import { AvailabilityCalendar } from "@/components/reservation/AvailabilityCalendar";
import { getReservations } from "@/app/actions/reservations";
// Zone status for beach club (day-long stays)
type ZoneStatus = "libre" | "reserve" | "occupe";

interface Zone {
    id: string;
    type: "cabane_vip" | "cabane_normale" | "parasole" | "paillote";
    label: string;
    capacity: number;
    status: ZoneStatus;
    occupiedSince?: string; // ISO timestamp when occupation started
    reservation?: {
        name: string;
        time: string;
        guests: number;
    };
}

// Generate initial zones with timestamps
const generateInitialZones = (): Zone[] => {
    const now = new Date();
    return [
        // Cabanes Normales (9)
        { id: "C1", type: "cabane_normale", label: "Cabane 1", capacity: 6, status: "occupe", occupiedSince: new Date(now.getTime() - 45 * 60000).toISOString() },
        { id: "C2", type: "cabane_normale", label: "Cabane 2", capacity: 6, status: "libre" },
        { id: "C3", type: "cabane_normale", label: "Cabane 3", capacity: 6, status: "reserve", reservation: { name: "Martin", time: new Date(now.getTime() + 20 * 60000).toTimeString().slice(0, 5), guests: 4 } },
        { id: "C4", type: "cabane_normale", label: "Cabane 4", capacity: 6, status: "libre" },
        { id: "C5", type: "cabane_normale", label: "Cabane 5", capacity: 6, status: "occupe", occupiedSince: new Date(now.getTime() - 120 * 60000).toISOString() }, // 2h - LONG
        { id: "C6", type: "cabane_normale", label: "Cabane 6", capacity: 6, status: "libre" },
        { id: "C7", type: "cabane_normale", label: "Cabane 7", capacity: 6, status: "occupe", occupiedSince: new Date(now.getTime() - 30 * 60000).toISOString() }, // ORDER DELAY
        { id: "C8", type: "cabane_normale", label: "Cabane 8", capacity: 6, status: "libre" },
        { id: "C9", type: "cabane_normale", label: "Cabane 9", capacity: 6, status: "occupe", occupiedSince: new Date(now.getTime() - 55 * 60000).toISOString() },
        { id: "C10", type: "cabane_normale", label: "Cabane 10", capacity: 6, status: "libre" },

        // Cabanes VIP (5)
        { id: "VIP1", type: "cabane_vip", label: "VIP 1", capacity: 10, status: "reserve", reservation: { name: "VIP Event", time: new Date(now.getTime() + 10 * 60000).toTimeString().slice(0, 5), guests: 8 } }, // IMMINENT
        { id: "VIP2", type: "cabane_vip", label: "VIP 2", capacity: 10, status: "libre" },
        { id: "VIP3", type: "cabane_vip", label: "VIP 3", capacity: 10, status: "occupe", occupiedSince: new Date(now.getTime() - 90 * 60000).toISOString() },
        { id: "VIP4", type: "cabane_vip", label: "VIP 4", capacity: 10, status: "libre" },
        { id: "VIP5", type: "cabane_vip", label: "VIP 5", capacity: 10, status: "libre" },

        // Parasoles (6)
        { id: "P1", type: "parasole", label: "Parasole 1", capacity: 4, status: "occupe", occupiedSince: new Date(now.getTime() - 35 * 60000).toISOString() },
        { id: "P2", type: "parasole", label: "Parasole 2", capacity: 4, status: "libre" },
        { id: "P3", type: "parasole", label: "Parasole 3", capacity: 4, status: "occupe", occupiedSince: new Date(now.getTime() - 25 * 60000).toISOString() },
        { id: "P4", type: "parasole", label: "Parasole 4", capacity: 4, status: "reserve", reservation: { name: "Famille", time: new Date(now.getTime() - 5 * 60000).toTimeString().slice(0, 5), guests: 4 } }, // LATE
        { id: "P5", type: "parasole", label: "Parasole 5", capacity: 4, status: "libre" },
        { id: "P6", type: "parasole", label: "Parasole 6", capacity: 4, status: "occupe", occupiedSince: new Date(now.getTime() - 40 * 60000).toISOString() },

        // Paillotes (16)
        { id: "M1", type: "paillote", label: "Paillote 1", capacity: 2, status: "occupe", occupiedSince: new Date(now.getTime() - 60 * 60000).toISOString() },
        { id: "M2", type: "paillote", label: "Paillote 2", capacity: 2, status: "libre" },
        { id: "M3", type: "paillote", label: "Paillote 3", capacity: 2, status: "occupe", occupiedSince: new Date(now.getTime() - 20 * 60000).toISOString() },
        { id: "M4", type: "paillote", label: "Paillote 4", capacity: 2, status: "libre" },
        { id: "M5", type: "paillote", label: "Paillote 5", capacity: 2, status: "libre" },
        { id: "M6", type: "paillote", label: "Paillote 6", capacity: 2, status: "reserve", reservation: { name: "Couple", time: new Date(now.getTime() + 45 * 60000).toTimeString().slice(0, 5), guests: 2 } },
        { id: "M7", type: "paillote", label: "Paillote 7", capacity: 2, status: "libre" },
        { id: "M8", type: "paillote", label: "Paillote 8", capacity: 2, status: "occupe", occupiedSince: new Date(now.getTime() - 50 * 60000).toISOString() },
        { id: "M9", type: "paillote", label: "Paillote 9", capacity: 2, status: "libre" },
        { id: "M10", type: "paillote", label: "Paillote 10", capacity: 2, status: "libre" },
        { id: "M11", type: "paillote", label: "Paillote 11", capacity: 2, status: "occupe", occupiedSince: new Date(now.getTime() - 75 * 60000).toISOString() },
        { id: "M12", type: "paillote", label: "Paillote 12", capacity: 2, status: "libre" },
        { id: "M13", type: "paillote", label: "Paillote 13", capacity: 2, status: "libre" },
        { id: "M14", type: "paillote", label: "Paillote 14", capacity: 2, status: "occupe", occupiedSince: new Date(now.getTime() - 30 * 60000).toISOString() },
        { id: "M15", type: "paillote", label: "Paillote 15", capacity: 2, status: "libre" },
        { id: "M16", type: "paillote", label: "Paillote 16", capacity: 2, status: "libre" },
    ];
};

const statusConfig: Record<ZoneStatus, { bg: string; border: string; text: string; label: string }> = {
    libre: { bg: "#DCFCE7", border: "#22C55E", text: "#166534", label: "Libre" },
    reserve: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", label: "Réservé" },
    occupe: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF", label: "Occupé" },
};

const typeConfig = {
    cabane_vip: { label: "Cabane VIP", bg: "#FACC15", border: "#CA8A04" },
    cabane_normale: { label: "Cabane", bg: "#3B82F6", border: "#1D4ED8" },
    parasole: { label: "Parasole", bg: "#60A5FA", border: "#2563EB" },
    paillote: { label: "Paillote Mer", bg: "#FED7AA", border: "#C2410C" },
};

// Helper: get occupation duration in minutes
const getOccupationMinutes = (since?: string) => {
    if (!since) return 0;
    return Math.floor((Date.now() - new Date(since).getTime()) / 60000);
};

// Helper: format duration as "Xh Ym" or "Ym"
const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h${m}` : `${h}h`;
    }
    return `${minutes}m`;
};

// Helper: check if reservation is late
const isReservationLate = (reservation?: Zone["reservation"]) => {
    if (!reservation) return false;
    const [hours, minutes] = reservation.time.split(":").map(Number);
    const reservationTime = new Date();
    reservationTime.setHours(hours, minutes, 0, 0);
    return Date.now() > reservationTime.getTime();
};

export default function FloorPlanPage() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [, setTick] = useState(0);
    const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
    const [guestCount, setGuestCount] = useState(2);
    const [pendingCount, setPendingCount] = useState(0);
    const [showCalendarPopup, setShowCalendarPopup] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    });
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const handlePreviousWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    const handleToday = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        setSelectedDate(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        setCurrentWeekStart(new Date(d.setDate(diff)));
    };

    const daysOfWeek = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [currentWeekStart]);

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // Initialize zones
    useEffect(() => {
        setZones(generateInitialZones());
        
        // Fetch pending reservations count
        const fetchPendingCount = async () => {
            const data = await getReservations({ status: "pending" });
            if (data && Array.isArray(data)) {
                setPendingCount(data.length);
            }
        };
        fetchPendingCount();
    }, []);

    // Timer tick every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => setTick((t) => t + 1), 30000);
        return () => clearInterval(interval);
    }, []);

    const stats = {
        cabanes: zones.filter(z => z.type === "cabane_normale"),
        vip: zones.filter(z => z.type === "cabane_vip"),
        parasoles: zones.filter(z => z.type === "parasole"),
        paillotes: zones.filter(z => z.type === "paillote"),
    };

    // KPIs
    const kpis = useMemo(() => {
        const occupied = zones.filter(z => z.status === "occupe");
        const reserved = zones.filter(z => z.status === "reserve");
        const lateReservations = zones.filter(z => isReservationLate(z.reservation));

        return {
            occupied: occupied.length,
            libre: zones.filter(z => z.status === "libre").length,
            reserved: reserved.length,
            lateReservations: lateReservations.length,
        };
    }, [zones]);

    // Smart assignment suggestions
    const suggestedZones = useMemo(() => {
        if (!showAssignmentPanel) return [];

        const freeZones = zones.filter(z => z.status === "libre");

        // Score zones based on capacity match
        const scored = freeZones.map(zone => {
            let score = 0;

            // Perfect capacity match = highest score
            if (zone.capacity === guestCount) score += 100;
            // Slight over-capacity is okay
            else if (zone.capacity > guestCount && zone.capacity <= guestCount + 2) score += 80;
            // Under-capacity = bad
            else if (zone.capacity < guestCount) score += 0;
            // Large over-capacity = wasteful
            else score += 50;

            // VIP for groups of 6+
            if (guestCount >= 6 && zone.type === "cabane_vip") score += 20;
            // Paillotes for couples
            if (guestCount <= 2 && zone.type === "paillote") score += 15;
            // Cabanes for medium groups
            if (guestCount >= 4 && guestCount <= 6 && zone.type === "cabane_normale") score += 10;

            return { zone, score };
        });

        // Filter viable options and sort by score
        return scored
            .filter(s => s.zone.capacity >= guestCount)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(s => s.zone);
    }, [zones, guestCount, showAssignmentPanel]);

    const updateZoneStatus = (id: string, newStatus: ZoneStatus) => {
        setZones(zones.map(z => {
            if (z.id !== id) return z;
            return {
                ...z,
                status: newStatus,
                reservation: undefined,
                occupiedSince: newStatus === "occupe" ? new Date().toISOString() : undefined,
            };
        }));
        setSelectedZone(null);
    };

    const renderZone = (zone: Zone, shape: "rect" | "hex" | "square") => {
        const status = statusConfig[zone.status];
        const isSelected = selectedZone?.id === zone.id;
        const late = isReservationLate(zone.reservation);
        const occupationMinutes = getOccupationMinutes(zone.occupiedSince);

        const baseStyle: React.CSSProperties = {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            backgroundColor: status.bg,
            border: `3px solid ${isSelected ? "#E8A87C" : status.border}`,
            boxShadow: isSelected ? "0 0 0 4px rgba(232, 168, 124, 0.4)" : "0 2px 6px rgba(0,0,0,0.15)",
            transition: "all 0.2s",
        };

        const shapeStyles: Record<string, React.CSSProperties> = {
            rect: { width: "70px", height: "50px", borderRadius: "8px" },
            hex: { width: "54px", height: "54px", borderRadius: "50%" },
            square: { width: "50px", height: "50px", borderRadius: "6px" },
        };

        return (
            <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                style={{ ...baseStyle, ...shapeStyles[shape] }}
            >
                <span style={{ fontWeight: 700, fontSize: "0.75rem", color: status.text }}>{zone.id}</span>

                {/* Duration for occupied zones */}
                {(zone.status === "occupe") && zone.occupiedSince && (
                    <span
                        style={{
                            fontSize: "0.5rem",
                            color: status.text,
                            fontWeight: 500,
                        }}
                    >
                        {formatDuration(occupationMinutes)}
                    </span>
                )}

                {/* Capacity for libre zones */}
                {zone.status === "libre" && (
                    <span style={{ fontSize: "0.55rem", color: status.text }}>{zone.capacity}p</span>
                )}

                {/* Reservation time for reserved zones */}
                {zone.status === "reserve" && zone.reservation && (
                    <span style={{ fontSize: "0.5rem", color: status.text }}>{zone.reservation.time}</span>
                )}

                {late && (
                    <div
                        style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "16px",
                            height: "16px",
                            backgroundColor: "#EF4444",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            animation: "pulse 1s infinite",
                        }}
                    >
                        <AlertTriangle style={{ width: 10, height: 10, color: "#FFF" }} />
                    </div>
                )}
            </button>
        );
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <MapPin style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>Plan de Salle</h1>
                        {pendingCount > 0 && (
                            <span style={{
                                backgroundColor: "#EF4444", color: "#FFF", padding: "4px 12px",
                                borderRadius: "100px", fontSize: "0.875rem", fontWeight: 600
                            }}>
                                {pendingCount} en attente
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setShowAssignmentPanel(!showAssignmentPanel)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 20px",
                            backgroundColor: showAssignmentPanel ? "#222222" : "#E8A87C",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "100px",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        <UserPlus style={{ width: 16, height: 16 }} />
                        {showAssignmentPanel ? "Fermer" : "Placer des clients"}
                    </button>
                </div>
                <p style={{ color: "#7A7A7A" }}>Vue en temps réel des réservations et commandes</p>
            </div>

            {/* Weekly Navigation Bar */}
            <div
                style={{
                    marginBottom: "1rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                }}
            >
                {/* Date display & Today button */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
                        <Clock style={{ width: 18, height: 18, color: "#3B82F6" }} />
                        <span style={{ fontWeight: 600, color: "#1E40AF", fontSize: "0.875rem", textTransform: "capitalize" }}>
                            {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <div style={{ position: "relative", marginLeft: "4px", display: "flex", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: "8px" }}>
                            <button 
                                onClick={() => setShowCalendarPopup(!showCalendarPopup)}
                                style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", padding: "6px" }}
                            >
                                <Calendar style={{ width: 16, height: 16 }} />
                            </button>
                            
                            {showCalendarPopup && (
                                <>
                                    <div 
                                        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                                        onClick={() => setShowCalendarPopup(false)}
                                    />
                                    <div style={{ 
                                        position: "absolute", 
                                        top: "100%", 
                                        left: 0, 
                                        marginTop: "8px", 
                                        backgroundColor: "#FFF", 
                                        padding: "1.5rem", 
                                        borderRadius: "16px", 
                                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)", 
                                        border: "1px solid #E5E7EB",
                                        zIndex: 50,
                                        width: "350px"
                                    }}>
                                        <AvailabilityCalendar
                                            selectedDate={(() => { const d = new Date(selectedDate); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; })()}
                                            onDateSelect={(dateStr) => {
                                                const newDate = new Date(dateStr);
                                                newDate.setHours(0, 0, 0, 0);
                                                setSelectedDate(newDate);
                                                const day = newDate.getDay();
                                                const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
                                                setCurrentWeekStart(new Date(new Date(newDate).setDate(diff)));
                                                setShowCalendarPopup(false);
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleToday}
                        style={{
                            padding: "4px 12px",
                            backgroundColor: "#F3F4F6",
                            color: "#4B5563",
                            border: "1px solid #E5E7EB",
                            borderRadius: "100px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Aujourd'hui
                    </button>
                </div>

                {/* Days of week selector & Week navigation */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                        onClick={handlePreviousWeek}
                        style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: "#FFF",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <ChevronLeft style={{ width: 16, height: 16, color: "#6B7280" }} />
                    </button>
                    
                    <div style={{ display: "flex", gap: "4px", backgroundColor: "#F9FAFB", padding: "4px", borderRadius: "10px", border: "1px solid #F3F4F6" }}>
                        {daysOfWeek.map((dayDate) => {
                            const isSelected = isSameDay(dayDate, selectedDate);
                            const dayName = dayDate.toLocaleDateString("fr-FR", { weekday: "short" }).substring(0, 3);
                            return (
                                <button
                                    key={dayDate.toISOString()}
                                    onClick={() => setSelectedDate(dayDate)}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        padding: "4px 12px",
                                        backgroundColor: isSelected ? "#3B82F6" : "transparent",
                                        color: isSelected ? "#FFF" : "#6B7280",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <span style={{ fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 600 }}>{dayName}</span>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>{dayDate.getDate()}</span>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleNextWeek}
                        style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: "#FFF",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <ChevronRight style={{ width: 16, height: 16, color: "#6B7280" }} />
                    </button>
                </div>
            </div>

            {/* Assignment Suggestion Panel */}
            {showAssignmentPanel && (
                <div
                    style={{
                        marginBottom: "1.5rem",
                        padding: "1.5rem",
                        backgroundColor: "#FEF3E2",
                        borderRadius: "16px",
                        border: "2px solid #E8A87C",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                        <Sparkles style={{ width: 20, height: 20, color: "#E8A87C" }} />
                        <span style={{ fontWeight: 600, color: "#222", fontSize: "1rem" }}>Suggestions intelligentes</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                        <span style={{ fontSize: "0.875rem", color: "#6B7280" }}>Nombre de personnes :</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    backgroundColor: "#FFF",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                    fontSize: "1.25rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                -
                            </button>
                            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#222", minWidth: "30px", textAlign: "center" }}>
                                {guestCount}
                            </span>
                            <button
                                onClick={() => setGuestCount(guestCount + 1)}
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    backgroundColor: "#FFF",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                    fontSize: "1.25rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {suggestedZones.length > 0 ? (
                        <div>
                            <p style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.75rem" }}>
                                Zones recommandées pour {guestCount} personne{guestCount > 1 ? "s" : ""} :
                            </p>
                            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                                {suggestedZones.map((zone, index) => (
                                    <button
                                        key={zone.id}
                                        onClick={() => {
                                            setSelectedZone(zone);
                                            setShowAssignmentPanel(false);
                                        }}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            padding: "10px 16px",
                                            backgroundColor: index === 0 ? "#22C55E" : "#FFF",
                                            color: index === 0 ? "#FFF" : "#222",
                                            border: index === 0 ? "none" : "1px solid #E5E7EB",
                                            borderRadius: "100px",
                                            cursor: "pointer",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {index === 0 && <Check style={{ width: 14, height: 14 }} />}
                                        <span style={{ fontWeight: 600 }}>{zone.id}</span>
                                        <span style={{ opacity: 0.8 }}>•</span>
                                        <span>{typeConfig[zone.type].label}</span>
                                        <span style={{ opacity: 0.8 }}>•</span>
                                        <span>{zone.capacity}p</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p style={{ fontSize: "0.875rem", color: "#B91C1C" }}>
                            ⚠️ Aucune zone disponible pour {guestCount} personne{guestCount > 1 ? "s" : ""}.
                        </p>
                    )}
                </div>
            )}

            {/* KPI Bar */}
            <div
                style={{
                    display: "flex",
                    gap: "1rem",
                    marginBottom: "1rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#EF4444" }} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{kpis.occupied}</span>
                    <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>occupées</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#22C55E" }} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{kpis.libre}</span>
                    <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>libres</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#3B82F6" }} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{kpis.reserved}</span>
                    <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>réservées</span>
                </div>

                {kpis.lateReservations > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#EF4444" }}>
                        <AlertTriangle style={{ width: 14, height: 14 }} />
                        <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{kpis.lateReservations}</span>
                        <span style={{ fontSize: "0.75rem" }}>en retard</span>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {[
                    { label: "Cabanes", data: stats.cabanes, color: "#3B82F6" },
                    { label: "VIP", data: stats.vip, color: "#FACC15" },
                    { label: "Parasoles", data: stats.parasoles, color: "#60A5FA" },
                    { label: "Paillotes Mer", data: stats.paillotes, color: "#C2410C" },
                ].map(s => (
                    <div key={s.label} style={{ backgroundColor: "#FFF", padding: "1rem", borderRadius: "12px", border: "1px solid #E5E7EB", textAlign: "center" }}>
                        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: s.color }}>{s.data.filter(z => z.status === "libre").length}/{s.data.length}</p>
                        <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>{s.label} libres</p>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                {Object.entries(statusConfig).map(([key, config]) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: 14, height: 14, backgroundColor: config.bg, border: `2px solid ${config.border}`, borderRadius: "3px" }} />
                        <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>{config.label}</span>
                    </div>
                ))}
            </div>

            {/* Floor Plan */}
            <div style={{ display: "flex", gap: "1.5rem" }}>
                <div
                    style={{
                        flex: 1,
                        backgroundColor: "#F3F4F6",
                        borderRadius: "16px",
                        padding: "1.5rem",
                        border: "1px solid #E5E7EB",
                        position: "relative",
                    }}
                >
                    {/* VIP Left */}
                    <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {stats.vip.slice(0, 3).map(zone => {
                            const status = statusConfig[zone.status];
                            const late = isReservationLate(zone.reservation);
                            const occupationMinutes = getOccupationMinutes(zone.occupiedSince);

                            return (
                                <button
                                    key={zone.id}
                                    onClick={() => setSelectedZone(zone)}
                                    style={{
                                        width: "50px",
                                        height: "80px",
                                        backgroundColor: status.bg,
                                        border: `3px solid ${selectedZone?.id === zone.id ? "#E8A87C" : status.border}`,
                                        borderRadius: "6px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                        position: "relative",
                                    }}
                                >
                                    <span style={{ fontWeight: 700, fontSize: "0.7rem", color: status.text }}>{zone.id}</span>
                                    {(zone.status === "occupe") && zone.occupiedSince && (
                                        <span style={{ fontSize: "0.5rem", color: status.text, fontWeight: 500 }}>
                                            {formatDuration(occupationMinutes)}
                                        </span>
                                    )}
                                    {zone.status === "libre" && <span style={{ fontSize: "0.55rem", color: status.text }}>{zone.capacity}p</span>}
                                    {zone.status === "reserve" && zone.reservation && <span style={{ fontSize: "0.5rem", color: status.text }}>{zone.reservation.time}</span>}
                                    {late && (
                                        <div style={{ position: "absolute", top: "-6px", right: "-6px", width: "14px", height: "14px", backgroundColor: "#EF4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1s infinite" }}>
                                            <AlertTriangle style={{ width: 8, height: 8, color: "#FFF" }} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* VIP Right */}
                    <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {stats.vip.slice(3).map(zone => {
                            const status = statusConfig[zone.status];
                            const late = isReservationLate(zone.reservation);
                            const occupationMinutes = getOccupationMinutes(zone.occupiedSince);

                            return (
                                <button
                                    key={zone.id}
                                    onClick={() => setSelectedZone(zone)}
                                    style={{
                                        width: "50px",
                                        height: "80px",
                                        backgroundColor: status.bg,
                                        border: `3px solid ${selectedZone?.id === zone.id ? "#E8A87C" : status.border}`,
                                        borderRadius: "6px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                        position: "relative",
                                    }}
                                >
                                    <span style={{ fontWeight: 700, fontSize: "0.7rem", color: status.text }}>{zone.id}</span>
                                    {(zone.status === "occupe") && zone.occupiedSince && (
                                        <span style={{ fontSize: "0.5rem", color: status.text, fontWeight: 500 }}>
                                            {formatDuration(occupationMinutes)}
                                        </span>
                                    )}
                                    {zone.status === "libre" && <span style={{ fontSize: "0.55rem", color: status.text }}>{zone.capacity}p</span>}
                                    {zone.status === "reserve" && zone.reservation && <span style={{ fontSize: "0.5rem", color: status.text }}>{zone.reservation.time}</span>}
                                    {late && (
                                        <div style={{ position: "absolute", top: "-6px", right: "-6px", width: "14px", height: "14px", backgroundColor: "#EF4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1s infinite" }}>
                                            <AlertTriangle style={{ width: 8, height: 8, color: "#FFF" }} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Content */}
                    <div style={{ marginLeft: "80px", marginRight: "80px", display: "flex", flexDirection: "column", gap: "2rem" }}>
                        {/* Row 1: Cabanes Normales */}
                        <div>
                            <p style={{ fontSize: "0.625rem", color: "#6B7280", marginBottom: "0.5rem" }}>CABANES NORMALES (10)</p>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                                {stats.cabanes.map(zone => renderZone(zone, "rect"))}
                            </div>
                        </div>

                        {/* Row 2: Parasoles */}
                        <div>
                            <p style={{ fontSize: "0.625rem", color: "#6B7280", marginBottom: "0.5rem" }}>PARASOLES (6)</p>
                            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                                {stats.parasoles.map(zone => renderZone(zone, "hex"))}
                            </div>
                        </div>

                        {/* Separator - Beach/Sea line */}
                        <div style={{ borderTop: "2px dashed #9CA3AF", margin: "0.5rem 0", position: "relative" }}>
                            <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%) translateY(-50%)", backgroundColor: "#F3F4F6", padding: "0 12px", color: "#6B7280", fontSize: "0.625rem" }}>
                                🌊 MER
                            </span>
                        </div>

                        {/* Row 3: Paillotes en mer */}
                        <div>
                            <p style={{ fontSize: "0.625rem", color: "#6B7280", marginBottom: "0.5rem" }}>PAILLOTES EN MER (16)</p>
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                                {stats.paillotes.map(zone => renderZone(zone, "square"))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Panel */}
                {selectedZone && (
                    <div style={{ width: "300px", backgroundColor: "#FFF", borderRadius: "16px", padding: "1.5rem", border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", height: "fit-content" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h3 style={{ fontWeight: 700, fontSize: "1.125rem", color: "#222" }}>{selectedZone.label}</h3>
                            <button onClick={() => setSelectedZone(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                                <X style={{ width: 20, height: 20, color: "#9CA3AF" }} />
                            </button>
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                            <span style={{ padding: "4px 10px", backgroundColor: typeConfig[selectedZone.type].bg, color: "#FFF", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 500 }}>
                                {typeConfig[selectedZone.type].label}
                            </span>
                            <span style={{ padding: "4px 10px", backgroundColor: statusConfig[selectedZone.status].bg, color: statusConfig[selectedZone.status].text, borderRadius: "100px", fontSize: "0.75rem", fontWeight: 500 }}>
                                {statusConfig[selectedZone.status].label}
                            </span>
                            <span style={{ padding: "4px 10px", backgroundColor: "#F3F4F6", borderRadius: "100px", fontSize: "0.75rem" }}>
                                <Users style={{ width: 12, height: 12, display: "inline", marginRight: "4px" }} />
                                {selectedZone.capacity} pers.
                            </span>
                        </div>

                        {/* Occupation Duration */}
                        {selectedZone.occupiedSince && (selectedZone.status === "occupe") && (
                            <div style={{ backgroundColor: "#F3F4F6", padding: "0.75rem", borderRadius: "10px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Clock style={{ width: 16, height: 16, color: "#6B7280" }} />
                                <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                                    Occupée depuis <strong>{formatDuration(getOccupationMinutes(selectedZone.occupiedSince))}</strong>
                                </span>
                            </div>
                        )}

                        {selectedZone.reservation && (
                            <div style={{ backgroundColor: isReservationLate(selectedZone.reservation) ? "#FEE2E2" : "#DBEAFE", padding: "1rem", borderRadius: "10px", marginBottom: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                    <p style={{ fontWeight: 600, color: isReservationLate(selectedZone.reservation) ? "#B91C1C" : "#1E40AF", fontSize: "0.875rem" }}>
                                        Réservation
                                    </p>
                                    {isReservationLate(selectedZone.reservation) && (
                                        <span style={{ padding: "2px 6px", backgroundColor: "#EF4444", color: "#FFF", borderRadius: "4px", fontSize: "0.625rem", fontWeight: 600 }}>EN RETARD</span>
                                    )}
                                </div>
                                <p style={{ color: isReservationLate(selectedZone.reservation) ? "#B91C1C" : "#1E40AF", fontSize: "0.875rem" }}>
                                    <Clock style={{ width: 12, height: 12, display: "inline", marginRight: "4px" }} />
                                    {selectedZone.reservation.time} - {selectedZone.reservation.name}
                                </p>
                                <p style={{ fontSize: "0.75rem", color: isReservationLate(selectedZone.reservation) ? "#DC2626" : "#3B82F6" }}>
                                    {selectedZone.reservation.guests} personnes
                                </p>
                            </div>
                        )}

                        {selectedZone.order && (
                            <div style={{ backgroundColor: isOrderDelayed(selectedZone.order) ? "#FEE2E2" : "#FEF3C7", padding: "1rem", borderRadius: "10px", marginBottom: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                    <p style={{ fontWeight: 600, color: isOrderDelayed(selectedZone.order) ? "#B91C1C" : "#92400E", fontSize: "0.875rem" }}>Commande</p>
                                    {isOrderDelayed(selectedZone.order) && (
                                        <span style={{ padding: "2px 6px", backgroundColor: "#EF4444", color: "#FFF", borderRadius: "4px", fontSize: "0.625rem", fontWeight: 600 }}>EN RETARD</span>
                                    )}
                                </div>
                                <p style={{ color: isOrderDelayed(selectedZone.order) ? "#B91C1C" : "#92400E", fontSize: "0.875rem" }}>
                                    {selectedZone.order.items} articles • {selectedZone.order.total} DT
                                </p>
                                {selectedZone.order.createdAt && (
                                    <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>
                                        Passée il y a {Math.floor((Date.now() - new Date(selectedZone.order.createdAt).getTime()) / 60000)} min
                                    </p>
                                )}
                                <span style={{ display: "inline-block", marginTop: "6px", padding: "3px 8px", backgroundColor: selectedZone.order.status === "new" ? "#EF4444" : selectedZone.order.status === "preparing" ? "#F59E0B" : "#22C55E", color: "#FFF", borderRadius: "4px", fontSize: "0.625rem", fontWeight: 500 }}>
                                    {selectedZone.order.status === "new" ? "Nouvelle" : selectedZone.order.status === "preparing" ? "En préparation" : "Prête"}
                                </span>
                            </div>
                        )}

                        <p style={{ fontWeight: 500, color: "#222", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Changer le statut</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            {(Object.keys(statusConfig) as ZoneStatus[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => updateZoneStatus(selectedZone.id, status)}
                                    style={{
                                        padding: "8px",
                                        backgroundColor: selectedZone.status === status ? statusConfig[status].border : statusConfig[status].bg,
                                        color: selectedZone.status === status ? "#FFF" : statusConfig[status].text,
                                        border: `2px solid ${statusConfig[status].border}`,
                                        borderRadius: "6px",
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    {statusConfig[status].label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </div>
    );
}
