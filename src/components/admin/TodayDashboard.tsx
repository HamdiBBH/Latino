"use client";

import { useState, useEffect } from "react";
import { Users, Clock, Calendar, AlertTriangle, CheckCircle2, Anchor } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MAX_DAILY_CAPACITY } from "@/lib/config";

interface TodayStats {
    totalGuests: number;
    reservationCount: number;
    pendingCount: number;
    confirmedCount: number;
    earlyArrivals: number; // Clients qui arrivent avant midi (traversée)
}

export function TodayDashboard() {
    const [stats, setStats] = useState<TodayStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTodayStats();
    }, []);

    const loadTodayStats = async () => {
        const supabase = createClient();
        const today = new Date().toISOString().split("T")[0];

        const { data: reservations } = await supabase
            .from("reservations")
            .select("guest_count, status, special_request")
            .eq("reservation_date", today)
            .in("status", ["pending", "confirmed"]);

        if (reservations) {
            const stats: TodayStats = {
                totalGuests: 0,
                reservationCount: reservations.length,
                pendingCount: 0,
                confirmedCount: 0,
                earlyArrivals: 0,
            };

            reservations.forEach(r => {
                stats.totalGuests += r.guest_count;
                if (r.status === "pending") stats.pendingCount++;
                if (r.status === "confirmed") stats.confirmedCount++;
                // Count early arrivals (traversée)
                if (r.special_request?.includes("midi") || r.special_request?.includes("traversée")) {
                    stats.earlyArrivals++;
                }
            });

            setStats(stats);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{ padding: "1.5rem", backgroundColor: "#FFF", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                <p style={{ color: "#7A7A7A" }}>Chargement...</p>
            </div>
        );
    }

    if (!stats) return null;

    const capacityPercent = Math.round((stats.totalGuests / MAX_DAILY_CAPACITY) * 100);
    const isNearCapacity = capacityPercent >= 80;
    const isOverCapacity = capacityPercent > 100;

    return (
        <div style={{
            padding: "1.5rem", backgroundColor: "#FFF", borderRadius: "16px",
            border: isOverCapacity ? "2px solid #EF4444" : isNearCapacity ? "2px solid #F59E0B" : "1px solid #E5E7EB",
            marginBottom: "1.5rem"
        }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar style={{ width: 20, height: 20, color: "#E8A87C" }} />
                    <h3 style={{ fontWeight: 600, color: "#222" }}>Aujourd'hui</h3>
                    <span style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>
                        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                </div>
                {isOverCapacity && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 12px", backgroundColor: "#FEE2E2", borderRadius: "100px" }}>
                        <AlertTriangle style={{ width: 14, height: 14, color: "#EF4444" }} />
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#EF4444" }}>Capacité dépassée !</span>
                    </div>
                )}
                {isNearCapacity && !isOverCapacity && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 12px", backgroundColor: "#FEF3C7", borderRadius: "100px" }}>
                        <AlertTriangle style={{ width: 14, height: 14, color: "#F59E0B" }} />
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#92400E" }}>Presque complet</span>
                    </div>
                )}
            </div>

            {/* Main Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                {/* Total Guests */}
                <div style={{ backgroundColor: "#F9F5F0", padding: "1rem", borderRadius: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "4px" }}>
                        <Users style={{ width: 16, height: 16, color: "#E8A87C" }} />
                    </div>
                    <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#E8A87C" }}>{stats.totalGuests}</p>
                    <p style={{ fontSize: "0.7rem", color: "#7A7A7A" }}>Personnes</p>
                </div>

                {/* Reservations */}
                <div style={{ backgroundColor: "#F9F5F0", padding: "1rem", borderRadius: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "4px" }}>
                        <Calendar style={{ width: 16, height: 16, color: "#6366F1" }} />
                    </div>
                    <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#6366F1" }}>{stats.reservationCount}</p>
                    <p style={{ fontSize: "0.7rem", color: "#7A7A7A" }}>Réservations</p>
                </div>

                {/* Confirmed */}
                <div style={{ backgroundColor: "#DCFCE7", padding: "1rem", borderRadius: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "4px" }}>
                        <CheckCircle2 style={{ width: 16, height: 16, color: "#22C55E" }} />
                    </div>
                    <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#22C55E" }}>{stats.confirmedCount}</p>
                    <p style={{ fontSize: "0.7rem", color: "#166534" }}>Confirmées</p>
                </div>

                {/* Pending */}
                <div style={{ backgroundColor: stats.pendingCount > 0 ? "#FEF3C7" : "#F9F5F0", padding: "1rem", borderRadius: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "4px" }}>
                        <Clock style={{ width: 16, height: 16, color: "#F59E0B" }} />
                    </div>
                    <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#F59E0B" }}>{stats.pendingCount}</p>
                    <p style={{ fontSize: "0.7rem", color: "#92400E" }}>En attente</p>
                </div>

                {/* Early Arrivals (Ferry) */}
                <div style={{ backgroundColor: "#E0F2FE", padding: "1rem", borderRadius: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "4px" }}>
                        <Anchor style={{ width: 16, height: 16, color: "#0284C7" }} />
                    </div>
                    <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0284C7" }}>{stats.earlyArrivals}</p>
                    <p style={{ fontSize: "0.7rem", color: "#0369A1" }}>Traversée ⛵</p>
                </div>
            </div>

            {/* Capacity Bar */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>Capacité du jour</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: isOverCapacity ? "#EF4444" : isNearCapacity ? "#F59E0B" : "#22C55E" }}>
                        {stats.totalGuests}/{MAX_DAILY_CAPACITY} ({capacityPercent}%)
                    </span>
                </div>
                <div style={{ height: 8, backgroundColor: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                        width: `${Math.min(100, capacityPercent)}%`,
                        height: "100%",
                        backgroundColor: isOverCapacity ? "#EF4444" : isNearCapacity ? "#F59E0B" : "#22C55E",
                        borderRadius: 4,
                        transition: "width 0.3s ease"
                    }} />
                </div>
            </div>
        </div>
    );
}

