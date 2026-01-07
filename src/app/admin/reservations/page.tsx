"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Search, Plus, Eye, X, Check, ChevronLeft, ChevronRight, Star, AlertTriangle, Anchor, Users, Ship, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

// Zone types matching Coucou Beach
type ZoneType = "cabane_normale" | "cabane_vip" | "parasole" | "paillote";

interface Reservation {
    id: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    zoneType: ZoneType;
    zoneId?: string;
    date: string;
    guests: number;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    arrivalStatus: "waiting" | "arrived" | "departed"; // Boat arrival tracking
    arrivalTime?: string; // When they actually arrived
    specialRequests?: string;
    visitCount?: number;
    packageType?: string; // e.g., "Pack Cabane", "Pack VIP"
}

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => new Date().toISOString().split("T")[0];

// Helper to format date for display
const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
    return date.toLocaleDateString("fr-FR", options);
};

// Helper to add/subtract days
const addDays = (dateStr: string, days: number) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
};

// Check if it's during lunch rush (12h30 - 14h30)
const isLunchRush = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const time = hours * 60 + minutes;
    return time >= 12 * 60 + 30 && time <= 14 * 60 + 30;
};

// Get current time period
const getCurrentPeriod = () => {
    const now = new Date();
    const hours = now.getHours();
    if (hours < 9) return "before_opening";
    if (hours < 12) return "morning";
    if (hours < 15) return "lunch";
    if (hours < 19) return "afternoon";
    return "closed";
};

// Mock data with beach club context
const generateMockReservations = (): Reservation[] => {
    const today = getTodayDate();
    const tomorrow = addDays(today, 1);
    const yesterday = addDays(today, -1);

    return [
        {
            id: "1",
            guestName: "Famille Martin",
            guestEmail: "martin@email.com",
            guestPhone: "+216 55 123 456",
            zoneType: "cabane_normale",
            zoneId: "C1",
            date: today,
            guests: 4,
            status: "confirmed",
            arrivalStatus: "arrived",
            arrivalTime: "09:30",
            packageType: "Pack Cabane Sable",
            visitCount: 3,
        },
        {
            id: "2",
            guestName: "Couple Durand",
            guestEmail: "durand@email.com",
            guestPhone: "+216 98 765 432",
            zoneType: "paillote",
            zoneId: "M3",
            date: today,
            guests: 2,
            status: "confirmed",
            arrivalStatus: "arrived",
            arrivalTime: "10:15",
            packageType: "Pack Paillote Mer",
        },
        {
            id: "3",
            guestName: "Groupe Bernard",
            guestEmail: "bernard@email.com",
            guestPhone: "+216 22 333 444",
            zoneType: "cabane_vip",
            zoneId: "VIP2",
            date: today,
            guests: 8,
            status: "confirmed",
            arrivalStatus: "waiting",
            packageType: "Pack VIP Prestige",
            visitCount: 12,
            specialRequests: "Champagne à l'arrivée",
        },
        {
            id: "4",
            guestName: "Famille Petit",
            guestEmail: "petit@email.com",
            guestPhone: "+216 44 555 666",
            zoneType: "parasole",
            zoneId: "P2",
            date: today,
            guests: 4,
            status: "confirmed",
            arrivalStatus: "waiting",
            packageType: "Pack Parasole",
        },
        {
            id: "5",
            guestName: "M. Dubois",
            guestEmail: "dubois@email.com",
            guestPhone: "+216 77 888 999",
            zoneType: "cabane_normale",
            zoneId: "C5",
            date: today,
            guests: 6,
            status: "pending",
            arrivalStatus: "waiting",
            packageType: "Pack Cabane Sable",
        },
        {
            id: "6",
            guestName: "Ahmed Ben Ali",
            guestEmail: "ahmed@email.com",
            guestPhone: "+216 52 777 888",
            zoneType: "cabane_vip",
            zoneId: "VIP1",
            date: today,
            guests: 6,
            status: "confirmed",
            arrivalStatus: "arrived",
            arrivalTime: "09:00",
            visitCount: 15,
            packageType: "Pack VIP Prestige",
            specialRequests: "Client fidèle - Attention particulière",
        },
        {
            id: "7",
            guestName: "Société Tech Corp",
            guestEmail: "events@techcorp.com",
            guestPhone: "+216 71 222 333",
            zoneType: "cabane_vip",
            zoneId: "VIP3",
            date: tomorrow,
            guests: 10,
            status: "confirmed",
            arrivalStatus: "waiting",
            packageType: "Pack VIP Entreprise",
            specialRequests: "Événement d'entreprise - 10 personnes",
        },
        {
            id: "8",
            guestName: "Famille Rousseau",
            guestEmail: "rousseau@email.com",
            guestPhone: "+216 55 444 333",
            zoneType: "cabane_normale",
            zoneId: "C3",
            date: yesterday,
            guests: 5,
            status: "completed",
            arrivalStatus: "departed",
            arrivalTime: "09:45",
            packageType: "Pack Cabane Sable",
        },
    ];
};

const zoneTypeLabels: Record<ZoneType, string> = {
    cabane_normale: "Cabane",
    cabane_vip: "Cabane VIP",
    parasole: "Parasole",
    paillote: "Paillote Mer",
};

const zoneTypeColors: Record<ZoneType, { bg: string; text: string }> = {
    cabane_normale: { bg: "#DBEAFE", text: "#1E40AF" },
    cabane_vip: { bg: "#FEF3C7", text: "#92400E" },
    parasole: { bg: "#E0E7FF", text: "#3730A3" },
    paillote: { bg: "#FED7AA", text: "#C2410C" },
};

const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-gray-100 text-gray-700",
};

const statusLabels = {
    pending: "En attente",
    confirmed: "Confirmée",
    cancelled: "Annulée",
    completed: "Terminée",
};

const arrivalStatusConfig = {
    waiting: { bg: "#FEF3C7", text: "#92400E", label: "En attente", icon: "⏳" },
    arrived: { bg: "#DCFCE7", text: "#166534", label: "Arrivé", icon: "✅" },
    departed: { bg: "#F3F4F6", text: "#374151", label: "Parti", icon: "👋" },
};

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>(generateMockReservations);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [selectedDate, setSelectedDate] = useState(getTodayDate());

    // Filter and sort reservations
    const filteredReservations = useMemo(() => {
        return reservations
            .filter((r) => {
                const matchesSearch =
                    r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (r.zoneId?.toLowerCase() || "").includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === "all" || r.status === statusFilter;
                const matchesDate = r.date === selectedDate;
                return matchesSearch && matchesStatus && matchesDate;
            })
            .sort((a, b) => {
                // Sort by arrival status: waiting first, then arrived, then departed
                const order = { waiting: 0, arrived: 1, departed: 2 };
                return order[a.arrivalStatus] - order[b.arrivalStatus];
            });
    }, [reservations, searchQuery, statusFilter, selectedDate]);

    // KPIs for selected date
    const kpis = useMemo(() => {
        const dateReservations = reservations.filter((r) => r.date === selectedDate && r.status !== "cancelled");
        const waiting = dateReservations.filter((r) => r.arrivalStatus === "waiting" && r.status === "confirmed");
        const arrived = dateReservations.filter((r) => r.arrivalStatus === "arrived");
        const guests = dateReservations.reduce((sum, r) => sum + r.guests, 0);
        const arrivedGuests = arrived.reduce((sum, r) => sum + r.guests, 0);

        return {
            total: dateReservations.length,
            pending: dateReservations.filter((r) => r.status === "pending").length,
            waiting: waiting.length,
            arrived: arrived.length,
            guests,
            arrivedGuests,
            cabanes: dateReservations.filter((r) => r.zoneType === "cabane_normale" || r.zoneType === "cabane_vip").length,
            paillotes: dateReservations.filter((r) => r.zoneType === "paillote").length,
            parasoles: dateReservations.filter((r) => r.zoneType === "parasole").length,
        };
    }, [reservations, selectedDate]);

    const updateStatus = (id: string, newStatus: Reservation["status"]) => {
        setReservations((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        setSelectedReservation(null);
    };

    const markAsArrived = (id: string) => {
        const now = new Date();
        setReservations((prev) =>
            prev.map((r) =>
                r.id === id
                    ? { ...r, arrivalStatus: "arrived" as const, arrivalTime: now.toTimeString().slice(0, 5) }
                    : r
            )
        );
    };

    const markAsDeparted = (id: string) => {
        setReservations((prev) =>
            prev.map((r) =>
                r.id === id
                    ? { ...r, arrivalStatus: "departed" as const, status: "completed" as const }
                    : r
            )
        );
    };

    const isToday = selectedDate === getTodayDate();
    const currentPeriod = getCurrentPeriod();
    const lunchRush = isLunchRush();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
                        <Anchor className="w-7 h-7 text-accent" />
                        Réservations Journée
                    </h1>
                    <p className="text-text mt-1">
                        Gestion des réservations et arrivées clients
                    </p>
                </div>

                <Button variant="primary" size="sm">
                    <Plus className="w-4 h-4" />
                    Nouvelle réservation
                </Button>
            </div>

            {/* Date Navigation */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                }}
            >
                <button
                    onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                    style={{
                        width: "36px",
                        height: "36px",
                        backgroundColor: "#F3F4F6",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ChevronLeft style={{ width: 18, height: 18, color: "#6B7280" }} />
                </button>
                <div style={{ flex: 1, textAlign: "center" }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#222" }}>
                        {formatDate(selectedDate)}
                    </span>
                    {isToday && (
                        <span
                            style={{
                                marginLeft: "0.5rem",
                                padding: "2px 8px",
                                backgroundColor: "#DCFCE7",
                                color: "#166534",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                borderRadius: "100px",
                            }}
                        >
                            Aujourd&apos;hui
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                    style={{
                        width: "36px",
                        height: "36px",
                        backgroundColor: "#F3F4F6",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ChevronRight style={{ width: 18, height: 18, color: "#6B7280" }} />
                </button>
                {!isToday && (
                    <button
                        onClick={() => setSelectedDate(getTodayDate())}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#E8A87C",
                            color: "#FFF",
                            border: "none",
                            borderRadius: "100px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        Aujourd&apos;hui
                    </button>
                )}
            </div>

            {/* Lunch Rush Alert */}
            {isToday && lunchRush && (
                <div
                    style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "#FEF2F2",
                        borderRadius: "12px",
                        border: "2px solid #EF4444",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <span style={{ fontSize: "1.5rem" }}>🍽️</span>
                    <span style={{ fontWeight: 600, color: "#B91C1C" }}>
                        SERVICE DÉJEUNER EN COURS - {kpis.arrivedGuests} couverts à servir
                    </span>
                </div>
            )}

            {/* Main KPI Bar */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: "1rem",
                    padding: "1rem",
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                }}
            >
                {/* Total Reservations */}
                <div style={{ textAlign: "center", padding: "0.5rem" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#222" }}>{kpis.total}</div>
                    <div style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>Réservations</div>
                </div>

                {/* Guests */}
                <div style={{ textAlign: "center", padding: "0.5rem" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3B82F6" }}>{kpis.guests}</div>
                    <div style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>Couverts attendus</div>
                </div>

                {/* Arrived */}
                <div style={{ textAlign: "center", padding: "0.5rem", backgroundColor: "#DCFCE7", borderRadius: "8px" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#166534" }}>{kpis.arrived}</div>
                    <div style={{ fontSize: "0.75rem", color: "#166534" }}>Arrivés ({kpis.arrivedGuests}p)</div>
                </div>

                {/* Waiting */}
                <div style={{ textAlign: "center", padding: "0.5rem", backgroundColor: "#FEF3C7", borderRadius: "8px" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#92400E" }}>{kpis.waiting}</div>
                    <div style={{ fontSize: "0.75rem", color: "#92400E" }}>En attente bateau</div>
                </div>

                {/* Pending */}
                {kpis.pending > 0 && (
                    <div style={{ textAlign: "center", padding: "0.5rem", backgroundColor: "#FEE2E2", borderRadius: "8px" }}>
                        <div style={{ fontSize: "2rem", fontWeight: 700, color: "#B91C1C" }}>{kpis.pending}</div>
                        <div style={{ fontSize: "0.75rem", color: "#B91C1C" }}>Non confirmées</div>
                    </div>
                )}
            </div>

            {/* Zone Summary */}
            <div
                style={{
                    display: "flex",
                    gap: "1rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    flexWrap: "wrap",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin style={{ width: 16, height: 16, color: "#6B7280" }} />
                    <span style={{ fontSize: "0.875rem", color: "#6B7280" }}>Zones réservées:</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ padding: "2px 8px", backgroundColor: "#DBEAFE", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 500, color: "#1E40AF" }}>
                        🏠 {kpis.cabanes} Cabanes
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ padding: "2px 8px", backgroundColor: "#FED7AA", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 500, color: "#C2410C" }}>
                        🌊 {kpis.paillotes} Paillotes
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ padding: "2px 8px", backgroundColor: "#E0E7FF", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 500, color: "#3730A3" }}>
                        ⛱️ {kpis.parasoles} Parasoles
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email ou zone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmées</option>
                        <option value="completed">Terminées</option>
                        <option value="cancelled">Annulées</option>
                    </select>
                </div>
            </div>

            {/* Reservations List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personnes</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrivée</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReservations.map((reservation) => {
                                const zoneColor = zoneTypeColors[reservation.zoneType];
                                const arrivalConfig = arrivalStatusConfig[reservation.arrivalStatus];
                                const isVIP = (reservation.visitCount || 0) >= 5;

                                return (
                                    <tr key={reservation.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: "50%",
                                                        backgroundColor: isVIP ? "#FEF3C7" : "#F3F4F6",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "1rem",
                                                    }}
                                                >
                                                    {isVIP ? "⭐" : "👤"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                                        {reservation.guestName}
                                                        {isVIP && (
                                                            <span
                                                                style={{
                                                                    padding: "1px 6px",
                                                                    backgroundColor: "#FEF3C7",
                                                                    color: "#92400E",
                                                                    fontSize: "0.65rem",
                                                                    fontWeight: 600,
                                                                    borderRadius: "100px",
                                                                }}
                                                            >
                                                                VIP
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{reservation.guestPhone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "2px 8px",
                                                        backgroundColor: zoneColor.bg,
                                                        color: zoneColor.text,
                                                        fontSize: "0.75rem",
                                                        fontWeight: 500,
                                                        borderRadius: "100px",
                                                    }}
                                                >
                                                    {zoneTypeLabels[reservation.zoneType]}
                                                </span>
                                                {reservation.zoneId && (
                                                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#222" }}>
                                                        {reservation.zoneId}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users style={{ width: 16, height: 16, color: "#6B7280" }} />
                                                <span className="font-medium">{reservation.guests}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    padding: "4px 10px",
                                                    backgroundColor: arrivalConfig.bg,
                                                    color: arrivalConfig.text,
                                                    fontSize: "0.75rem",
                                                    fontWeight: 500,
                                                    borderRadius: "100px",
                                                }}
                                            >
                                                <span>{arrivalConfig.icon}</span>
                                                {arrivalConfig.label}
                                                {reservation.arrivalTime && (
                                                    <span style={{ opacity: 0.8 }}>({reservation.arrivalTime})</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={cn("px-2.5 py-1 text-xs rounded-full", statusColors[reservation.status])}>
                                                {statusLabels[reservation.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                {reservation.status === "confirmed" && reservation.arrivalStatus === "waiting" && isToday && (
                                                    <button
                                                        onClick={() => markAsArrived(reservation.id)}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "4px",
                                                            padding: "6px 12px",
                                                            backgroundColor: "#22C55E",
                                                            color: "#FFF",
                                                            border: "none",
                                                            borderRadius: "100px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: 500,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <Ship style={{ width: 14, height: 14 }} />
                                                        Arrivé
                                                    </button>
                                                )}
                                                {reservation.arrivalStatus === "arrived" && isToday && (
                                                    <button
                                                        onClick={() => markAsDeparted(reservation.id)}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "4px",
                                                            padding: "6px 12px",
                                                            backgroundColor: "#6B7280",
                                                            color: "#FFF",
                                                            border: "none",
                                                            borderRadius: "100px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: 500,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        Départ
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedReservation(reservation)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Voir détails"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredReservations.length === 0 && (
                        <div className="text-center py-12">
                            <Ship className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Aucune réservation pour cette date</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal - Using Portal to render at document root */}
            {selectedReservation && typeof window !== 'undefined' && createPortal(
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        zIndex: 9999,
                    }}
                    onClick={(e) => e.target === e.currentTarget && setSelectedReservation(null)}
                >
                    <div
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "16px",
                            maxWidth: "500px",
                            width: "100%",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: "1.5rem",
                                borderBottom: "1px solid #E5E7EB",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                            }}
                        >
                            <div>
                                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#222", margin: 0 }}>
                                    {selectedReservation.guestName}
                                </h2>
                                <p style={{ fontSize: "0.875rem", color: "#6B7280", margin: "4px 0 0 0" }}>
                                    {selectedReservation.packageType || "Réservation"}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedReservation(null)}
                                style={{
                                    padding: "8px",
                                    backgroundColor: "#F3F4F6",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <X style={{ width: 20, height: 20, color: "#6B7280" }} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: "1.5rem" }}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "1rem",
                                }}
                            >
                                <div>
                                    <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: 0 }}>Zone</p>
                                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222", margin: "4px 0 0 0" }}>
                                        {zoneTypeLabels[selectedReservation.zoneType]} - {selectedReservation.zoneId}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: 0 }}>Personnes</p>
                                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222", margin: "4px 0 0 0" }}>
                                        {selectedReservation.guests}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: 0 }}>Email</p>
                                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222", margin: "4px 0 0 0" }}>
                                        {selectedReservation.guestEmail}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: 0 }}>Téléphone</p>
                                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222", margin: "4px 0 0 0" }}>
                                        {selectedReservation.guestPhone}
                                    </p>
                                </div>
                                {selectedReservation.arrivalTime && (
                                    <div>
                                        <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: 0 }}>Heure d&apos;arrivée</p>
                                        <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222", margin: "4px 0 0 0" }}>
                                            {selectedReservation.arrivalTime}
                                        </p>
                                    </div>
                                )}
                                {selectedReservation.visitCount && (
                                    <div>
                                        <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: 0 }}>Visites précédentes</p>
                                        <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222", margin: "4px 0 0 0" }}>
                                            {selectedReservation.visitCount}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedReservation.specialRequests && (
                                <div style={{ marginTop: "1rem" }}>
                                    <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: 0 }}>Demandes spéciales</p>
                                    <p
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "#92400E",
                                            backgroundColor: "#FEF3C7",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            margin: "8px 0 0 0",
                                        }}
                                    >
                                        {selectedReservation.specialRequests}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div
                            style={{
                                padding: "1.5rem",
                                borderTop: "1px solid #E5E7EB",
                                display: "flex",
                                gap: "12px",
                            }}
                        >
                            {selectedReservation.status === "pending" && (
                                <button
                                    onClick={() => updateStatus(selectedReservation.id, "confirmed")}
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        backgroundColor: "#22C55E",
                                        color: "#FFF",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    <Check style={{ width: 16, height: 16 }} />
                                    Confirmer
                                </button>
                            )}
                            {selectedReservation.status !== "cancelled" && selectedReservation.status !== "completed" && (
                                <button
                                    onClick={() => updateStatus(selectedReservation.id, "cancelled")}
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        backgroundColor: "#FFF",
                                        color: "#EF4444",
                                        border: "1px solid #EF4444",
                                        borderRadius: "8px",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    <X style={{ width: 16, height: 16 }} />
                                    Annuler
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedReservation(null)}
                                style={{
                                    flex: 1,
                                    padding: "12px 16px",
                                    backgroundColor: "#F3F4F6",
                                    color: "#374151",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
