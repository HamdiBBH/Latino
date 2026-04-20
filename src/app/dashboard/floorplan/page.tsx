"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MapPin, Users, Clock, AlertCircle, Check, X, AlertTriangle, ShoppingBag, Sparkles, UserPlus, ChevronLeft, ChevronRight, Anchor, Ship, Calendar, Loader2 } from "lucide-react";
import { AvailabilityCalendar } from "@/components/reservation/AvailabilityCalendar";
import { getReservations, createReservation, updateReservationStatus } from "@/app/actions/reservations";
import { getReservationConfig, type ReservationConfig } from "@/app/actions/settings";
import { getPackages } from "@/app/actions/cms";

// Zone status for beach club (day-long stays)
type ZoneStatus = "libre" | "reserve" | "occupe";

interface Zone {
    id: string;
    type: "cabane_vip" | "cabane_normale" | "parasole" | "paillote";
    label: string;
    capacity: number;
    status: ZoneStatus;
    occupiedSince?: string;
    reservation?: {
        id: string;
        name: string;
        time: string;
        guests: number;
        packageName: string;
        email?: string;
        phone?: string;
        specialRequest?: string;
        estimatedPrice?: number;
    };
}

// DB Reservation type
interface DBReservation {
    id: string;
    package_id: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    reservation_date: string;
    time_slot: string;
    guest_count: number;
    special_request: string | null;
    estimated_price: number | null;
    status: string;
    created_at: string;
    packages?: { name: string };
}

// Season constants
const SEASON_START_MONTH = 5; // June (0-indexed)
const SEASON_END_MONTH = 8;  // September (0-indexed)
const SEASON_START_DAY = 1;
const SEASON_END_DAY = 30;

// Helper: check if a date is within season (June 1 - September 30)
const isDateInSeason = (date: Date): boolean => {
    const month = date.getMonth();
    const day = date.getDate();
    if (month < SEASON_START_MONTH) return false;
    if (month === SEASON_START_MONTH && day < SEASON_START_DAY) return false;
    if (month > SEASON_END_MONTH) return false;
    if (month === SEASON_END_MONTH && day > SEASON_END_DAY) return false;
    return true;
};

// Map package name to zone type
const packageNameToZoneType = (packageName: string): Zone["type"] => {
    const name = packageName.toLowerCase();
    if (name.includes("vip")) return "cabane_vip";
    if (name.includes("parasol")) return "parasole";
    if (name.includes("paillote") || name.includes("mer")) return "paillote";
    if (name.includes("cabane")) return "cabane_normale";
    // Default: cabane_normale for unknown packages
    return "cabane_normale";
};

// Zone layout definition (fixed positions in the beach club)
const ZONE_LAYOUT = {
    cabane_normale: Array.from({ length: 10 }, (_, i) => ({
        id: `C${i + 1}`,
        type: "cabane_normale" as const,
        label: `Cabane ${i + 1}`,
        capacity: 6,
    })),
    cabane_vip: Array.from({ length: 5 }, (_, i) => ({
        id: `VIP${i + 1}`,
        type: "cabane_vip" as const,
        label: `VIP ${i + 1}`,
        capacity: 10,
    })),
    parasole: Array.from({ length: 6 }, (_, i) => ({
        id: `P${i + 1}`,
        type: "parasole" as const,
        label: `Parasole ${i + 1}`,
        capacity: 4,
    })),
    paillote: Array.from({ length: 16 }, (_, i) => ({
        id: `M${i + 1}`,
        type: "paillote" as const,
        label: `Paillote ${i + 1}`,
        capacity: 2,
    })),
};

// Generate all zones with default "libre" status
const generateEmptyZones = (): Zone[] => {
    const allZones: Zone[] = [];
    for (const zones of Object.values(ZONE_LAYOUT)) {
        for (const z of zones) {
            allZones.push({ ...z, status: "libre" });
        }
    }
    return allZones;
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

export default function FloorPlanPage() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [config, setConfig] = useState<ReservationConfig | null>(null);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [, setTick] = useState(0);
    const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
    const [guestCount, setGuestCount] = useState(2);
    const [pendingCount, setPendingCount] = useState(0);
    const [showCalendarPopup, setShowCalendarPopup] = useState(false);
    const [loadingReservations, setLoadingReservations] = useState(false);
    const [confirmedReservations, setConfirmedReservations] = useState<DBReservation[]>([]);

    // Form state for new reservation
    const [packages, setPackages] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newRes, setNewRes] = useState({ guest_name: "", guest_phone: "", package_id: "", guest_count: 2 });

    // Initialize to the start of season if today is out of season
    const getInitialDate = (): Date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isDateInSeason(today)) return today;
        // If before season, show June 1st of this year
        const year = today.getMonth() > SEASON_END_MONTH ? today.getFullYear() + 1 : today.getFullYear();
        return new Date(year, SEASON_START_MONTH, SEASON_START_DAY);
    };

    const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate);

    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        const d = new Date(getInitialDate());
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    });

    // Check if today is in season
    const isTodayInSeason = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return isDateInSeason(today);
    }, []);

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
        if (!isTodayInSeason) return;
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        setSelectedDate(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        setCurrentWeekStart(new Date(new Date(d).setDate(diff)));
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

    const formatDateForQuery = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    // Fetch reservations for the selected date and populate zones
    const loadReservationsForDate = useCallback(async (date: Date) => {
        setLoadingReservations(true);
        try {
            const dateStr = formatDateForQuery(date);
            const data = await getReservations({ date: dateStr, status: "confirmed" });

            if (data && Array.isArray(data)) {
                setConfirmedReservations(data as DBReservation[]);

                // Assign reservations to zones
                const emptyZones = generateEmptyZones();

                // Group reservations by zone type
                const reservationsByType: Record<string, DBReservation[]> = {
                    cabane_vip: [],
                    cabane_normale: [],
                    parasole: [],
                    paillote: [],
                };

                for (const res of data as DBReservation[]) {
                    const packageName = res.packages?.name || "";
                    const zoneType = packageNameToZoneType(packageName);
                    reservationsByType[zoneType].push(res);
                }

                // Assign each reservation to the first available zone of its type
                const updatedZones = emptyZones.map(zone => {
                    const typeReservations = reservationsByType[zone.type];
                    if (typeReservations && typeReservations.length > 0) {
                        const res = typeReservations.shift()!;
                        return {
                            ...zone,
                            status: "reserve" as ZoneStatus,
                            reservation: {
                                id: res.id,
                                name: res.guest_name,
                                time: "09:00", // Full day reservations
                                guests: res.guest_count,
                                packageName: res.packages?.name || "Forfait",
                                email: res.guest_email,
                                phone: res.guest_phone,
                                specialRequest: res.special_request || undefined,
                                estimatedPrice: res.estimated_price || undefined,
                            },
                        };
                    }
                    return zone;
                });

                setZones(updatedZones);
            } else {
                setZones(generateEmptyZones());
            }
        } catch (error) {
            console.error("Error loading reservations:", error);
            setZones(generateEmptyZones());
        } finally {
            setLoadingReservations(false);
        }
    }, []);

    // Initialize config and pending count
    useEffect(() => {
        getReservationConfig().then(setConfig);
        getPackages().then(setPackages);

        const fetchPendingCount = async () => {
            const data = await getReservations({ status: "pending" });
            if (data && Array.isArray(data)) {
                setPendingCount(data.length);
            }
        };
        fetchPendingCount();
    }, []);

    // Load reservations when selected date changes
    useEffect(() => {
        loadReservationsForDate(selectedDate);
    }, [selectedDate, loadReservationsForDate]);

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

        return {
            occupied: occupied.length,
            libre: zones.filter(z => z.status === "libre").length,
            reserved: reserved.length,
            totalReservations: confirmedReservations.length,
        };
    }, [zones, confirmedReservations]);

    // Smart assignment suggestions
    const suggestedZones = useMemo(() => {
        if (!showAssignmentPanel) return [];

        const freeZones = zones.filter(z => z.status === "libre");

        const scored = freeZones.map(zone => {
            let score = 0;
            if (zone.capacity === guestCount) score += 100;
            else if (zone.capacity > guestCount && zone.capacity <= guestCount + 2) score += 80;
            else if (zone.capacity < guestCount) score += 0;
            else score += 50;

            if (guestCount >= 6 && zone.type === "cabane_vip") score += 20;
            if (guestCount <= 2 && zone.type === "paillote") score += 15;
            if (guestCount >= 4 && guestCount <= 6 && zone.type === "cabane_normale") score += 10;

            return { zone, score };
        });

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
                reservation: newStatus === "libre" ? undefined : z.reservation,
                occupiedSince: newStatus === "occupe" ? new Date().toISOString() : undefined,
            };
        }));
        setSelectedZone(null);
    };

    const renderZone = (zone: Zone, shape: "rect" | "hex" | "square") => {
        const status = statusConfig[zone.status];
        const isSelected = selectedZone?.id === zone.id;
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

                {/* Guest count for reserved zones */}
                {zone.status === "reserve" && zone.reservation && (
                    <span style={{ fontSize: "0.5rem", color: status.text }}>{zone.reservation.guests}p</span>
                )}

                {/* Reserved indicator dot */}
                {zone.status === "reserve" && (
                    <div
                        style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-4px",
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#F59E0B",
                            borderRadius: "50%",
                            border: "2px solid #FFF",
                        }}
                    />
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
                        {showAssignmentPanel ? "Fermer" : "Nouvelle réservation"}
                    </button>
                </div>
                <p style={{ color: "#7A7A7A" }}>Vue en temps réel des réservations confirmées — Saison Juin-Septembre</p>
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
                        {loadingReservations && (
                            <Loader2 style={{ width: 16, height: 16, color: "#3B82F6", animation: "spin 1s linear infinite" }} />
                        )}
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
                                        {config && <AvailabilityCalendar
                                            config={config}
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
                                        />}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleToday}
                        disabled={!isTodayInSeason}
                        title={!isTodayInSeason ? "Aujourd'hui est hors saison (Juin-Septembre)" : ""}
                        style={{
                            padding: "4px 12px",
                            backgroundColor: isTodayInSeason ? "#F3F4F6" : "#F9FAFB",
                            color: isTodayInSeason ? "#4B5563" : "#D1D5DB",
                            border: "1px solid #E5E7EB",
                            borderRadius: "100px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: isTodayInSeason ? "pointer" : "not-allowed",
                            opacity: isTodayInSeason ? 1 : 0.5,
                        }}
                    >
                        Aujourd&apos;hui
                    </button>
                    {!isTodayInSeason && (
                        <span style={{ fontSize: "0.7rem", color: "#F59E0B", fontWeight: 500 }}>
                            Hors saison
                        </span>
                    )}
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
                            const inSeason = isDateInSeason(dayDate);
                            const dayName = dayDate.toLocaleDateString("fr-FR", { weekday: "short" }).substring(0, 3);
                            return (
                                <button
                                    key={dayDate.toISOString()}
                                    onClick={() => inSeason && setSelectedDate(dayDate)}
                                    disabled={!inSeason}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        padding: "4px 12px",
                                        backgroundColor: isSelected ? "#3B82F6" : "transparent",
                                        color: !inSeason ? "#D1D5DB" : isSelected ? "#FFF" : "#6B7280",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: inSeason ? "pointer" : "not-allowed",
                                        transition: "all 0.2s",
                                        opacity: inSeason ? 1 : 0.4,
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

            {/* Reservation Creation Panel */}
            {showAssignmentPanel && (
                <div
                    style={{
                        marginBottom: "1.5rem",
                        padding: "1.5rem",
                        backgroundColor: "#F3F4F6",
                        borderRadius: "16px",
                        border: "1px solid #E5E7EB",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <Anchor style={{ width: 24, height: 24, color: "#3B82F6" }} />
                        <span style={{ fontWeight: 600, color: "#222", fontSize: "1.125rem" }}>
                            Créer une réservation (Manager)
                        </span>
                    </div>

                    <form 
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setIsSubmitting(true);
                            try {
                                const selectedPkg = packages.find(p => p.id === newRes.package_id);
                                const price = selectedPkg ? parseFloat(selectedPkg.price) || 0 : 0;

                                const res = await createReservation({
                                    package_id: newRes.package_id,
                                    guest_name: newRes.guest_name,
                                    guest_phone: newRes.guest_phone,
                                    guest_email: "manager@reservation.local", // Paramètre requis
                                    reservation_date: formatDateForQuery(selectedDate),
                                    time_slot: "full_day",
                                    guest_count: newRes.guest_count,
                                    estimated_price: price,
                                    autoConfirmEnabled: false
                                });

                                if (res.success && res.data) {
                                    // Make sure it's confirmed since manager created it
                                    await updateReservationStatus(res.data.id, "confirmed");
                                    await loadReservationsForDate(selectedDate);
                                    setShowAssignmentPanel(false);
                                    setNewRes({ guest_name: "", guest_phone: "", package_id: "", guest_count: 2 });
                                } else {
                                    alert(res.error || "Erreur de création");
                                }
                            } catch(err) {
                                console.error(err);
                                alert("Erreur lors de la création");
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}
                    >
                        {/* Name */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                                Nom du client
                            </label>
                            <input 
                                required
                                value={newRes.guest_name}
                                onChange={e => setNewRes({...newRes, guest_name: e.target.value})}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #D1D5DB" }}
                                placeholder="ex: John Doe"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                                Téléphone
                            </label>
                            <input 
                                required
                                value={newRes.guest_phone}
                                onChange={e => setNewRes({...newRes, guest_phone: e.target.value})}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #D1D5DB" }}
                                placeholder="ex: 50 123 456"
                            />
                        </div>

                        {/* Package */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                                Forfait (Installation)
                            </label>
                            <select
                                required
                                value={newRes.package_id}
                                onChange={e => setNewRes({...newRes, package_id: e.target.value})}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #D1D5DB", backgroundColor: "#FFF" }}
                            >
                                <option value="" disabled>Sélectionner un forfait</option>
                                {packages.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Guests count */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                                Nombre de personnes
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <button
                                    type="button"
                                    onClick={() => setNewRes({...newRes, guest_count: Math.max(1, newRes.guest_count - 1)})}
                                    style={{ width: "42px", height: "42px", border: "1px solid #D1D5DB", borderRadius: "8px", backgroundColor: "#FFF", fontSize:"1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >-</button>
                                <span style={{ width: "40px", textAlign: "center", fontWeight: 700, fontSize: "1.2rem", color: "#222" }}>{newRes.guest_count}</span>
                                <button
                                    type="button"
                                    onClick={() => setNewRes({...newRes, guest_count: newRes.guest_count + 1})}
                                    style={{ width: "42px", height: "42px", border: "1px solid #D1D5DB", borderRadius: "8px", backgroundColor: "#FFF", fontSize:"1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >+</button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    padding: "0.75rem 2rem",
                                    backgroundColor: isSubmitting ? "#9CA3AF" : "#22C55E",
                                    color: "#FFF",
                                    fontWeight: 600,
                                    borderRadius: "100px",
                                    border: "none",
                                    cursor: isSubmitting ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                            >
                                {isSubmitting && <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />}
                                Confirmer la réservation
                            </button>
                        </div>
                    </form>
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
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#3B82F6" }} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{kpis.occupied}</span>
                    <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>occupées</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#22C55E" }} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{kpis.libre}</span>
                    <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>libres</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{kpis.reserved}</span>
                    <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>réservées</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto", color: "#6B7280" }}>
                    <span style={{ fontSize: "0.75rem" }}>
                        {kpis.totalReservations} réservation{kpis.totalReservations > 1 ? "s" : ""} confirmée{kpis.totalReservations > 1 ? "s" : ""} ce jour
                    </span>
                </div>
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

            {/* Loading overlay */}
            {loadingReservations && (
                <div style={{
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    backgroundColor: "#EFF6FF",
                    borderRadius: "8px",
                    border: "1px solid #BFDBFE",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.875rem",
                    color: "#1E40AF",
                }}>
                    <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                    Chargement des réservations...
                </div>
            )}

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
                                    {zone.status === "reserve" && zone.reservation && <span style={{ fontSize: "0.5rem", color: status.text }}>{zone.reservation.guests}p</span>}
                                    {zone.status === "reserve" && (
                                        <div style={{ position: "absolute", top: "-4px", right: "-4px", width: "12px", height: "12px", backgroundColor: "#F59E0B", borderRadius: "50%", border: "2px solid #FFF" }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* VIP Right */}
                    <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {stats.vip.slice(3).map(zone => {
                            const status = statusConfig[zone.status];
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
                                    {zone.status === "reserve" && zone.reservation && <span style={{ fontSize: "0.5rem", color: status.text }}>{zone.reservation.guests}p</span>}
                                    {zone.status === "reserve" && (
                                        <div style={{ position: "absolute", top: "-4px", right: "-4px", width: "12px", height: "12px", backgroundColor: "#F59E0B", borderRadius: "50%", border: "2px solid #FFF" }} />
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

                        {/* Reservation details from DB */}
                        {selectedZone.reservation && (
                            <div style={{ backgroundColor: "#FEF3C7", padding: "1rem", borderRadius: "10px", marginBottom: "1rem", border: "1px solid #FDE68A" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                                    <p style={{ fontWeight: 600, color: "#92400E", fontSize: "0.875rem" }}>
                                        Réservation confirmée
                                    </p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <p style={{ color: "#92400E", fontSize: "0.875rem", fontWeight: 600 }}>
                                        {selectedZone.reservation.name}
                                    </p>
                                    <p style={{ fontSize: "0.75rem", color: "#B45309" }}>
                                        📦 {selectedZone.reservation.packageName}
                                    </p>
                                    <p style={{ fontSize: "0.75rem", color: "#B45309" }}>
                                        👥 {selectedZone.reservation.guests} personne{selectedZone.reservation.guests > 1 ? "s" : ""}
                                    </p>
                                    {selectedZone.reservation.email && (
                                        <p style={{ fontSize: "0.75rem", color: "#B45309" }}>
                                            ✉️ {selectedZone.reservation.email}
                                        </p>
                                    )}
                                    {selectedZone.reservation.phone && (
                                        <p style={{ fontSize: "0.75rem", color: "#B45309" }}>
                                            📞 {selectedZone.reservation.phone}
                                        </p>
                                    )}
                                    {selectedZone.reservation.estimatedPrice && (
                                        <p style={{ fontSize: "0.75rem", color: "#B45309", fontWeight: 600 }}>
                                            💰 {selectedZone.reservation.estimatedPrice} DT
                                        </p>
                                    )}
                                    {selectedZone.reservation.specialRequest && (
                                        <p style={{ fontSize: "0.75rem", color: "#B45309", marginTop: "4px", fontStyle: "italic" }}>
                                            💬 {selectedZone.reservation.specialRequest}
                                        </p>
                                    )}
                                </div>
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
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
