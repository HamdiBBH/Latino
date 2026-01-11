"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
    WEEKLY_OFFERS,
    isWithinOpeningSeason,
    OPENING_MONTH_START,
    OPENING_MONTH_END,
    MAX_DAILY_CAPACITY,
} from "@/lib/config";

interface DatePickerDropdownProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    onClose: () => void;
    packageId?: string;
}

interface DayInfo {
    fillRate: number;
    offer?: {
        type: "discount" | "free_children";
        value: string;
        description: string;
    };
    isOutOfSeason?: boolean;
}

const MONTHS_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const DAYS_FR = ["L", "M", "M", "J", "V", "S", "D"];

export function DatePickerDropdown({ selectedDate, onDateSelect, onClose, packageId }: DatePickerDropdownProps) {
    const today = new Date();
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const [currentMonth, setCurrentMonth] = useState(getInitialMonth);
    const [currentYear, setCurrentYear] = useState(getInitialYear);
    const [availability, setAvailability] = useState<Record<string, DayInfo>>({});

    useEffect(() => {
        loadAvailability();
    }, [currentMonth, currentYear, packageId]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const loadAvailability = async () => {
        const supabase = createClient();
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        const { data: reservations } = await supabase
            .from("reservations")
            .select("reservation_date, guest_count")
            .gte("reservation_date", startDate.toISOString().split("T")[0])
            .lte("reservation_date", endDate.toISOString().split("T")[0])
            .in("status", ["pending", "confirmed"]);

        const newAvailability: Record<string, DayInfo> = {};
        const guestsByDate: Record<string, number> = {};

        reservations?.forEach(r => {
            guestsByDate[r.reservation_date] = (guestsByDate[r.reservation_date] || 0) + r.guest_count;
        });

        for (let day = 1; day <= endDate.getDate(); day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = date.toISOString().split("T")[0];
            const dayOfWeek = date.getDay();

            const guests = guestsByDate[dateStr] || 0;
            const fillRate = Math.round((guests / MAX_DAILY_CAPACITY) * 100);

            let offer: DayInfo["offer"];
            const weeklyOffer = WEEKLY_OFFERS[dayOfWeek];
            if (weeklyOffer && isWithinOpeningSeason(date)) {
                offer = {
                    type: weeklyOffer.type as "discount" | "free_children",
                    value: weeklyOffer.value,
                    description: weeklyOffer.description
                };
            }

            const isOutOfSeason = !isWithinOpeningSeason(date);

            newAvailability[dateStr] = { fillRate, offer, isOutOfSeason };
        }

        setAvailability(newAvailability);
    };

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const prevMonth = () => {
        if (currentMonth === OPENING_MONTH_START - 1) return;
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === OPENING_MONTH_END - 1) return;
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const isPast = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return date < todayStart;
    };

    const getDateString = (day: number) => {
        const m = (currentMonth + 1).toString().padStart(2, "0");
        const d = day.toString().padStart(2, "0");
        return `${currentYear}-${m}-${d}`;
    };

    const handleDayClick = (day: number) => {
        if (isPast(day)) return;
        const dateStr = getDateString(day);
        const dayInfo = availability[dateStr];
        if (dayInfo?.fillRate === 100 || dayInfo?.isOutOfSeason) return;
        onDateSelect(dateStr);
        onClose();
    };

    const getDayStyle = (day: number): React.CSSProperties => {
        const dateStr = getDateString(day);
        const dayInfo = availability[dateStr];
        const past = isPast(day);
        const isFull = dayInfo?.fillRate === 100;
        const isOutOfSeason = dayInfo?.isOutOfSeason;
        const hasOffer = dayInfo?.offer && !past && !isFull && !isOutOfSeason;
        const isSelected = selectedDate === dateStr;

        if (past || isOutOfSeason) {
            return { backgroundColor: "#F3F4F6", color: "#9CA3AF", cursor: "not-allowed" };
        }
        if (isFull) {
            return { backgroundColor: "#FEE2E2", color: "#EF4444", cursor: "not-allowed" };
        }
        if (isSelected) {
            return { backgroundColor: "#E8A87C", color: "#FFF", fontWeight: 600 };
        }
        if (hasOffer) {
            return { backgroundColor: "#DCFCE7", color: "#166534" };
        }
        return { backgroundColor: "#FFF", color: "#222", cursor: "pointer" };
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 9998,
                }}
                onClick={onClose}
            />
            {/* Modal */}
            <div
                ref={dropdownRef}
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "#FFF",
                    borderRadius: "20px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    padding: "1.5rem",
                    zIndex: 9999,
                    width: "340px",
                    maxWidth: "90vw",
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <button onClick={prevMonth} disabled={currentMonth === OPENING_MONTH_START - 1} style={{ background: "none", border: "none", cursor: "pointer", opacity: currentMonth === OPENING_MONTH_START - 1 ? 0.3 : 1 }}>
                        <ChevronLeft style={{ width: 20, height: 20, color: "#222" }} />
                    </button>
                    <span style={{ fontWeight: 600, color: "#222" }}>{MONTHS_FR[currentMonth]} {currentYear}</span>
                    <button onClick={nextMonth} disabled={currentMonth === OPENING_MONTH_END - 1} style={{ background: "none", border: "none", cursor: "pointer", opacity: currentMonth === OPENING_MONTH_END - 1 ? 0.3 : 1 }}>
                        <ChevronRight style={{ width: 20, height: 20, color: "#222" }} />
                    </button>
                </div>

                {/* Days header */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
                    {DAYS_FR.map((day, i) => (
                        <div key={i} style={{ textAlign: "center", fontSize: "0.7rem", color: "#7A7A7A", fontWeight: 500, padding: "4px" }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                    {Array(firstDay).fill(null).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const dateStr = getDateString(day);
                        const dayInfo = availability[dateStr];
                        const hasOffer = dayInfo?.offer && !isPast(day) && dayInfo?.fillRate !== 100 && !dayInfo?.isOutOfSeason;

                        return (
                            <div
                                key={day}
                                onClick={() => handleDayClick(day)}
                                style={{
                                    position: "relative",
                                    aspectRatio: "1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "8px",
                                    fontSize: "0.85rem",
                                    transition: "all 0.2s",
                                    ...getDayStyle(day),
                                }}
                            >
                                {day}
                                {hasOffer && (
                                    <span style={{
                                        position: "absolute",
                                        top: 2,
                                        right: 2,
                                        fontSize: "0.6rem",
                                    }}>
                                        {dayInfo?.offer?.type === "discount" ? "🏷️" : "👶"}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", fontSize: "0.65rem", color: "#7A7A7A", flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "#DCFCE7" }} /> Offre
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "#FEE2E2" }} /> Complet
                    </span>
                </div>
            </div>
        </>
    );
}
