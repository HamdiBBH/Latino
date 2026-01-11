"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    Users,
    Clock,
    Check,
    X,
    AlertTriangle,
    Calendar,
    Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
    OPENING_MONTH_START,
    OPENING_MONTH_END,
    MAX_DAILY_CAPACITY
} from "@/lib/config";

interface Reservation {
    id: string;
    guest_name: string;
    guest_count: number;
    time_slot: string;
    status: string;
    package_id: string;
}

interface DayData {
    reservations: Reservation[];
    totalGuests: number;
    pendingCount: number;
    confirmedCount: number;
}

const MONTHS_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const timeSlotLabels: Record<string, string> = {
    full_day: "Journée",
    morning: "Matin",
    afternoon: "Après-midi",
};

const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: "#FEF3C7", text: "#92400E" },
    confirmed: { bg: "#DCFCE7", text: "#166534" },
    declined: { bg: "#FEE2E2", text: "#EF4444" },
};

export function ManagerCalendar() {
    const today = new Date();

    const getInitialMonth = () => {
        const month = today.getMonth();
        const minMonth = OPENING_MONTH_START - 1;
        const maxMonth = OPENING_MONTH_END - 1;
        if (month >= minMonth && month <= maxMonth) return month;
        return minMonth;
    };

    const getInitialYear = () => {
        const month = today.getMonth();
        const maxMonth = OPENING_MONTH_END - 1;
        if (month > maxMonth) return today.getFullYear() + 1;
        return today.getFullYear();
    };

    const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
    const [currentYear, setCurrentYear] = useState(getInitialYear());
    const [calendarData, setCalendarData] = useState<Record<string, DayData>>({});
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const MIN_MONTH = OPENING_MONTH_START - 1;
    const MAX_MONTH = OPENING_MONTH_END - 1;

    useEffect(() => {
        loadMonthData();
    }, [currentMonth, currentYear]);

    const loadMonthData = async () => {
        setLoading(true);
        const supabase = createClient();

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        const startDate = firstDay.toISOString().split("T")[0];
        const endDate = lastDay.toISOString().split("T")[0];

        const { data: reservations } = await supabase
            .from("reservations")
            .select("id, guest_name, guest_count, time_slot, status, reservation_date, package_id")
            .gte("reservation_date", startDate)
            .lte("reservation_date", endDate)
            .order("time_slot");

        const dataMap: Record<string, DayData> = {};

        reservations?.forEach(r => {
            const dateKey = r.reservation_date;
            if (!dataMap[dateKey]) {
                dataMap[dateKey] = { reservations: [], totalGuests: 0, pendingCount: 0, confirmedCount: 0 };
            }
            dataMap[dateKey].reservations.push(r);
            dataMap[dateKey].totalGuests += r.guest_count;
            if (r.status === "pending") dataMap[dateKey].pendingCount++;
            if (r.status === "confirmed") dataMap[dateKey].confirmedCount++;
        });

        setCalendarData(dataMap);
        setLoading(false);
    };

    const prevMonth = () => {
        if (currentMonth > MIN_MONTH) {
            setCurrentMonth(currentMonth - 1);
        } else {
            setCurrentMonth(MAX_MONTH);
            setCurrentYear(currentYear - 1);
        }
        setSelectedDay(null);
    };

    const nextMonth = () => {
        if (currentMonth < MAX_MONTH) {
            setCurrentMonth(currentMonth + 1);
        } else {
            setCurrentMonth(MIN_MONTH);
            setCurrentYear(currentYear + 1);
        }
        setSelectedDay(null);
    };

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const getDateString = (day: number) => {
        return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };

    const isToday = (day: number) => {
        return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    };

    const selectedDayData = selectedDay ? calendarData[selectedDay] : null;

    return (
        <div style={{ display: "grid", gridTemplateColumns: selectedDay ? "1fr 380px" : "1fr", gap: "1.5rem" }}>
            {/* Calendar Grid */}
            <div style={{ backgroundColor: "#FFF", borderRadius: "16px", padding: "1.5rem", border: "1px solid #E5E7EB" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <button onClick={prevMonth} style={{
                        width: 40, height: 40, borderRadius: "50%", border: "1px solid #E5E7EB",
                        backgroundColor: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <ChevronLeft style={{ width: 20, height: 20 }} />
                    </button>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222" }}>
                        {MONTHS_FR[currentMonth]} {currentYear}
                    </h3>
                    <button onClick={nextMonth} style={{
                        width: 40, height: 40, borderRadius: "50%", border: "1px solid #E5E7EB",
                        backgroundColor: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <ChevronRight style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                {/* Days header */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
                    {DAYS_FR.map((day, i) => (
                        <div key={i} style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#7A7A7A", padding: "8px" }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                    {days.map((day, index) => {
                        if (day === null) return <div key={`empty-${index}`} style={{ height: 80 }} />;

                        const dateStr = getDateString(day);
                        const dayData = calendarData[dateStr];
                        const hasReservations = dayData && dayData.reservations.length > 0;
                        const isSelected = selectedDay === dateStr;
                        const hasPending = dayData && dayData.pendingCount > 0;
                        const isOverCapacity = dayData && dayData.totalGuests > MAX_DAILY_CAPACITY;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                                style={{
                                    height: 80, padding: "8px", borderRadius: "12px",
                                    border: isSelected ? "2px solid #E8A87C" : isToday(day) ? "2px solid #E8A87C" : "1px solid #E5E7EB",
                                    backgroundColor: isSelected ? "#E8A87C10" : hasReservations ? "#F9F5F0" : "#FFF",
                                    cursor: "pointer", display: "flex", flexDirection: "column",
                                    alignItems: "stretch", justifyContent: "space-between", textAlign: "left",
                                    position: "relative"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: isToday(day) ? 700 : 500, color: "#222", fontSize: "0.9rem" }}>{day}</span>
                                    {hasPending && (
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                                    )}
                                    {isOverCapacity && (
                                        <AlertTriangle style={{ width: 14, height: 14, color: "#EF4444" }} />
                                    )}
                                </div>
                                {hasReservations && (
                                    <div style={{ marginTop: "auto" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", color: "#7A7A7A" }}>
                                            <Users style={{ width: 12, height: 12 }} />
                                            <span>{dayData.totalGuests} pers.</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                                            {dayData.confirmedCount > 0 && (
                                                <span style={{ fontSize: "0.65rem", padding: "2px 4px", borderRadius: "4px", backgroundColor: "#DCFCE7", color: "#166534" }}>
                                                    {dayData.confirmedCount} ✓
                                                </span>
                                            )}
                                            {dayData.pendingCount > 0 && (
                                                <span style={{ fontSize: "0.65rem", padding: "2px 4px", borderRadius: "4px", backgroundColor: "#FEF3C7", color: "#92400E" }}>
                                                    {dayData.pendingCount} ⏳
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#7A7A7A" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                        En attente
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: "#DCFCE7" }} />
                        Confirmée
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <AlertTriangle style={{ width: 12, height: 12, color: "#EF4444" }} />
                        Capacité max
                    </div>
                </div>
            </div>

            {/* Selected Day Panel */}
            {selectedDay && (
                <div style={{ backgroundColor: "#FFF", borderRadius: "16px", padding: "1.5rem", border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <h3 style={{ fontWeight: 600, color: "#222" }}>
                            {new Date(selectedDay).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                        </h3>
                        <button onClick={() => setSelectedDay(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                            <X style={{ width: 20, height: 20, color: "#7A7A7A" }} />
                        </button>
                    </div>

                    {selectedDayData && selectedDayData.reservations.length > 0 ? (
                        <>
                            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                                <div style={{ flex: 1, padding: "0.75rem", backgroundColor: "#F9F5F0", borderRadius: "8px", textAlign: "center" }}>
                                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#E8A87C" }}>{selectedDayData.totalGuests}</p>
                                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>Personnes</p>
                                </div>
                                <div style={{ flex: 1, padding: "0.75rem", backgroundColor: "#F9F5F0", borderRadius: "8px", textAlign: "center" }}>
                                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#E8A87C" }}>{selectedDayData.reservations.length}</p>
                                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>Réservations</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {selectedDayData.reservations.map((r) => {
                                    const status = statusColors[r.status] || statusColors.pending;
                                    return (
                                        <Link
                                            key={r.id}
                                            href={`/dashboard/reservations?id=${r.id}`}
                                            style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                padding: "0.75rem", backgroundColor: "#F9F5F0", borderRadius: "8px",
                                                textDecoration: "none", color: "#222"
                                            }}
                                        >
                                            <div>
                                                <p style={{ fontWeight: 500 }}>{r.guest_name}</p>
                                                <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>
                                                    {timeSlotLabels[r.time_slot] || r.time_slot} · {r.guest_count} pers.
                                                </p>
                                            </div>
                                            <span style={{
                                                padding: "4px 8px", borderRadius: "100px", fontSize: "0.7rem",
                                                fontWeight: 600, backgroundColor: status.bg, color: status.text
                                            }}>
                                                {r.status === "confirmed" ? "✓" : r.status === "pending" ? "⏳" : "✗"}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: "center", padding: "2rem", color: "#7A7A7A" }}>
                            <Calendar style={{ width: 48, height: 48, margin: "0 auto 1rem", opacity: 0.5 }} />
                            <p>Aucune réservation ce jour</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
