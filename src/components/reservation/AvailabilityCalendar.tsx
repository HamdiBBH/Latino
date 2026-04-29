"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Tag, Users, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ReservationConfig } from "@/app/actions/settings";
import { MAX_DAILY_CAPACITY } from "@/lib/config";

interface AvailabilityCalendarProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    packageId?: string;
    config: ReservationConfig;
}

interface DayInfo {
    fillRate: number; // 0-100
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

export function AvailabilityCalendar({ selectedDate, onDateSelect, packageId, config }: AvailabilityCalendarProps) {
    const today = new Date();

    const MIN_MONTH = parseInt(config.seasonStart.split("-")[0]) - 1;
    const MAX_MONTH = parseInt(config.seasonEnd.split("-")[0]) - 1;

    // Determine initial month - should be within opening season
    const getInitialMonth = () => {
        const month = today.getMonth();

        if (month >= MIN_MONTH && month <= MAX_MONTH) {
            return month; // Current month is within season
        }
        // If before June or after Sept, show June of this/next year
        return MIN_MONTH;
    };

    const getInitialYear = () => {
        const month = today.getMonth();
        
        // After end of season, show next year
        if (month > MAX_MONTH) {
            return today.getFullYear() + 1;
        }
        return today.getFullYear();
    };

    const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
    const [currentYear, setCurrentYear] = useState(getInitialYear());
    const [availability, setAvailability] = useState<Record<string, DayInfo>>({});

    useEffect(() => {
        loadAvailability();
    }, [currentMonth, currentYear, packageId]);

    const loadAvailability = async () => {
        const supabase = createClient();

        // Get first and last day of current view month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        const startDate = firstDay.toISOString().split("T")[0];
        const endDate = lastDay.toISOString().split("T")[0];

        const { data: reservations } = await supabase.rpc("get_public_reservation_capacity", {
            start_date: startDate,
            end_date: endDate,
        });

        // Calculate fill rate per day
        const dayReservations: Record<string, number> = {};

        reservations?.forEach((r: { reservation_date: string; guest_count: number }) => {
            const dateKey = r.reservation_date;
            dayReservations[dateKey] = (dayReservations[dateKey] || 0) + r.guest_count;
        });

        // Build availability map
        const availMap: Record<string, DayInfo> = {};

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const date = new Date(currentYear, currentMonth, d);
            const dayOfWeek = date.getDay();

            // Check if within opening season
            const isInSeason = currentMonth >= MIN_MONTH && currentMonth <= MAX_MONTH;

            const guestCount = dayReservations[dateStr] || 0;
            const fillRate = Math.min(100, Math.round((guestCount / MAX_DAILY_CAPACITY) * 100));

            availMap[dateStr] = {
                fillRate: !isInSeason ? 100 : fillRate,
                offer: isInSeason && config.weeklyOffers[String(dayOfWeek)] ? config.weeklyOffers[String(dayOfWeek)]! : undefined,
                isOutOfSeason: !isInSeason,
            };
        }

        setAvailability(availMap);
    };

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Convert to Monday = 0
    };

    const prevMonth = () => {
        if (currentMonth > MIN_MONTH) {
            setCurrentMonth(currentMonth - 1);
        } else {
            // Go to previous year's September
            setCurrentMonth(MAX_MONTH);
            setCurrentYear(currentYear - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth < MAX_MONTH) {
            setCurrentMonth(currentMonth + 1);
        } else {
            // Go to next year's June
            setCurrentMonth(MIN_MONTH);
            setCurrentYear(currentYear + 1);
        }
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const isToday = (day: number) => {
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    const isPast = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return date < todayStart;
    };

    const getDateString = (day: number) => {
        return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };

    const isOutsideBookingWindow = (day: number) => {
        if (!config.bookingWindowStart && !config.bookingWindowEnd) return false;
        
        const dateStr = getDateString(day);
        
        if (config.bookingWindowStart) {
            if (dateStr < config.bookingWindowStart) return true;
        }
        if (config.bookingWindowEnd) {
            if (dateStr > config.bookingWindowEnd) return true;
        }
        return false;
    };

    const getDayStyle = (day: number): React.CSSProperties => {
        const dateStr = getDateString(day);
        const dayInfo = availability[dateStr];
        const isSelected = selectedDate === dateStr;
        const past = isPast(day);
        const outsideWindow = isOutsideBookingWindow(day);
        const isFull = dayInfo?.fillRate === 100;
        const isOutOfSeason = dayInfo?.isOutOfSeason;

        // Out of season (restaurant closed)
        if (isOutOfSeason && !past) {
            return {
                backgroundColor: "#E5E7EB",
                color: "#9CA3AF",
                cursor: "not-allowed",
            };
        }

        if (past || outsideWindow) {
            return {
                backgroundColor: "#F3F4F6",
                color: "#9CA3AF",
                cursor: "not-allowed",
            };
        }

        if (isFull) {
            return {
                backgroundColor: "#FEE2E2",
                color: "#EF4444",
                cursor: "not-allowed",
            };
        }

        if (isSelected) {
            return {
                backgroundColor: "#E8A87C",
                color: "#FFF",
                cursor: "pointer",
            };
        }

        // Low availability (>70%)
        if (dayInfo?.fillRate && dayInfo.fillRate > 70) {
            return {
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                cursor: "pointer",
            };
        }

        // Has offer
        if (dayInfo?.offer) {
            return {
                backgroundColor: "#DCFCE7",
                color: "#166534",
                cursor: "pointer",
            };
        }

        return {
            backgroundColor: "#FFF",
            color: "#222",
            cursor: "pointer",
        };
    };

    return (
        <div style={{ width: "100%" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <button
                    onClick={prevMonth}
                    style={{
                        width: 40, height: 40, borderRadius: "50%",
                        border: "1px solid #E5E7EB", backgroundColor: "#FFF",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer"
                    }}
                >
                    <ChevronLeft style={{ width: 20, height: 20 }} />
                </button>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222" }}>
                    {MONTHS_FR[currentMonth]} {currentYear}
                </h3>
                <button
                    onClick={nextMonth}
                    style={{
                        width: 40, height: 40, borderRadius: "50%",
                        border: "1px solid #E5E7EB", backgroundColor: "#FFF",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer"
                    }}
                >
                    <ChevronRight style={{ width: 20, height: 20 }} />
                </button>
            </div>

            {/* Days of week header */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
                {DAYS_FR.map((day, i) => (
                    <div key={i} style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#7A7A7A", padding: "8px 0" }}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} style={{ height: 48 }} />;
                    }

                    const dateStr = getDateString(day);
                    const dayInfo = availability[dateStr];
                    const past = isPast(day);
                    const outsideWindow = isOutsideBookingWindow(day);
                    const isFull = dayInfo?.fillRate === 100;
                    const hasOffer = dayInfo?.offer && !past && !isFull && !outsideWindow;
                    const lowAvailability = dayInfo?.fillRate && dayInfo.fillRate > 70 && dayInfo.fillRate < 100;

                    return (
                        <button
                            key={day}
                            onClick={() => !past && !isFull && !outsideWindow && onDateSelect(dateStr)}
                            disabled={past || isFull || outsideWindow}
                            style={{
                                position: "relative",
                                height: 48,
                                borderRadius: "8px",
                                border: isToday(day) ? "2px solid #E8A87C" : "1px solid #E5E7EB",
                                fontSize: "0.9rem",
                                fontWeight: isToday(day) ? 700 : 500,
                                transition: "all 0.2s ease",
                                ...getDayStyle(day),
                            }}
                        >
                            {day}
                            {/* Offer indicator */}
                            {hasOffer && (
                                <span style={{
                                    position: "absolute", top: 2, right: 2,
                                    fontSize: "0.6rem", fontWeight: 700
                                }}>
                                    {dayInfo.offer?.type === "discount" ? "🏷️" : "👶"}
                                </span>
                            )}
                            {/* Low availability indicator */}
                            {lowAvailability && (
                                <span style={{
                                    position: "absolute", bottom: 2, right: 2,
                                    width: 6, height: 6, borderRadius: "50%",
                                    backgroundColor: "#F59E0B"
                                }} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#DCFCE7" }} />
                    <span style={{ color: "#166534" }}>Offre spéciale</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#FEF3C7" }} />
                    <span style={{ color: "#92400E" }}>Peu de places</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#FEE2E2" }} />
                    <span style={{ color: "#EF4444" }}>Complet</span>
                </div>
            </div>

            {/* Selected date offer */}
            {selectedDate && availability[selectedDate]?.offer && (
                <div style={{
                    marginTop: "1rem", padding: "1rem", borderRadius: "12px",
                    backgroundColor: "#DCFCE7", border: "1px solid #86EFAC"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Tag style={{ width: 16, height: 16, color: "#166534" }} />
                        <span style={{ fontWeight: 600, color: "#166534" }}>Offre du jour !</span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#166534" }}>
                        {availability[selectedDate].offer?.description}
                    </p>
                </div>
            )}
        </div>
    );
}
