"use client";

import { useState, useEffect } from "react";
import {
    BarChart3, TrendingUp, Calendar, Users, Package,
    ArrowUp, ArrowDown, Percent, Clock
} from "lucide-react";
import { getReservationAnalytics } from "@/app/actions/manager";

interface Analytics {
    totalReservations: number;
    totalConfirmed: number;
    totalDeclined: number;
    totalGuests: number;
    avgGuestsPerReservation: number;
    mostPopularDay: string;
    mostPopularDayCount: number;
    dayOfWeekData: { name: string; count: number }[];
    packageCount: Record<string, number>;
}

export function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        const data = await getReservationAnalytics();
        setAnalytics(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{ padding: "2rem", backgroundColor: "#FFF", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                <p style={{ color: "#7A7A7A" }}>Chargement des statistiques...</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div style={{ padding: "2rem", backgroundColor: "#FFF", borderRadius: "16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
                <BarChart3 style={{ width: 48, height: 48, color: "#E5E7EB", margin: "0 auto 1rem" }} />
                <p style={{ color: "#7A7A7A" }}>Aucune donnée disponible</p>
            </div>
        );
    }

    const confirmationRate = analytics.totalReservations > 0
        ? Math.round((analytics.totalConfirmed / analytics.totalReservations) * 100)
        : 0;

    const maxDayCount = Math.max(...analytics.dayOfWeekData.map(d => d.count), 1);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                {/* Total Reservations */}
                <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "8px", backgroundColor: "#E8A87C20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Calendar style={{ width: 18, height: 18, color: "#E8A87C" }} />
                        </div>
                        <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>Réservations</span>
                    </div>
                    <p style={{ fontSize: "2rem", fontWeight: 700, color: "#222" }}>{analytics.totalReservations}</p>
                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginTop: "4px" }}>
                        {analytics.totalConfirmed} confirmées
                    </p>
                </div>

                {/* Total Guests */}
                <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "8px", backgroundColor: "#6366F120", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Users style={{ width: 18, height: 18, color: "#6366F1" }} />
                        </div>
                        <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>Clients accueillis</span>
                    </div>
                    <p style={{ fontSize: "2rem", fontWeight: 700, color: "#222" }}>{analytics.totalGuests}</p>
                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginTop: "4px" }}>
                        ~{analytics.avgGuestsPerReservation} pers./résa
                    </p>
                </div>

                {/* Confirmation Rate */}
                <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "8px", backgroundColor: "#22C55E20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Percent style={{ width: 18, height: 18, color: "#22C55E" }} />
                        </div>
                        <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>Taux confirmation</span>
                    </div>
                    <p style={{ fontSize: "2rem", fontWeight: 700, color: confirmationRate >= 80 ? "#22C55E" : confirmationRate >= 50 ? "#F59E0B" : "#EF4444" }}>
                        {confirmationRate}%
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginTop: "4px" }}>
                        {analytics.totalDeclined} refusées
                    </p>
                </div>

                {/* Most Popular Day */}
                <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "8px", backgroundColor: "#F59E0B20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <TrendingUp style={{ width: 18, height: 18, color: "#F59E0B" }} />
                        </div>
                        <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>Jour populaire</span>
                    </div>
                    <p style={{ fontSize: "2rem", fontWeight: 700, color: "#222" }}>{analytics.mostPopularDay}</p>
                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginTop: "4px" }}>
                        {analytics.mostPopularDayCount} réservations
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
                {/* Day of Week Chart */}
                <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem" }}>
                        <BarChart3 style={{ width: 20, height: 20, color: "#E8A87C" }} />
                        <h3 style={{ fontWeight: 600, color: "#222" }}>Réservations par jour</h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: 160 }}>
                        {analytics.dayOfWeekData.map((day, i) => {
                            const height = maxDayCount > 0 ? (day.count / maxDayCount) * 100 : 0;
                            const isPopular = day.name === analytics.mostPopularDay;
                            return (
                                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#222" }}>{day.count}</span>
                                    <div style={{
                                        width: "100%",
                                        height: `${Math.max(height, 5)}%`,
                                        backgroundColor: isPopular ? "#E8A87C" : "#E5E7EB",
                                        borderRadius: "4px 4px 0 0",
                                        transition: "height 0.3s ease"
                                    }} />
                                    <span style={{
                                        fontSize: "0.75rem",
                                        color: isPopular ? "#E8A87C" : "#7A7A7A",
                                        fontWeight: isPopular ? 600 : 400
                                    }}>
                                        {day.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Insights */}
                <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem" }}>
                        <TrendingUp style={{ width: 20, height: 20, color: "#E8A87C" }} />
                        <h3 style={{ fontWeight: 600, color: "#222" }}>Insights</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ padding: "1rem", backgroundColor: "#F9F5F0", borderRadius: "12px" }}>
                            <p style={{ fontSize: "0.875rem", color: "#7A7A7A", marginBottom: "4px" }}>📈 Performance</p>
                            <p style={{ fontWeight: 500, color: "#222" }}>
                                {confirmationRate >= 80
                                    ? "Excellent taux de confirmation !"
                                    : confirmationRate >= 50
                                        ? "Bon taux, peut être amélioré"
                                        : "Taux à améliorer"}
                            </p>
                        </div>
                        <div style={{ padding: "1rem", backgroundColor: "#F9F5F0", borderRadius: "12px" }}>
                            <p style={{ fontSize: "0.875rem", color: "#7A7A7A", marginBottom: "4px" }}>🗓️ Tendance</p>
                            <p style={{ fontWeight: 500, color: "#222" }}>
                                Le {analytics.mostPopularDay} est votre jour le plus demandé
                            </p>
                        </div>
                        <div style={{ padding: "1rem", backgroundColor: "#F9F5F0", borderRadius: "12px" }}>
                            <p style={{ fontSize: "0.875rem", color: "#7A7A7A", marginBottom: "4px" }}>👥 Groupes</p>
                            <p style={{ fontWeight: 500, color: "#222" }}>
                                Moyenne de {analytics.avgGuestsPerReservation} personnes par réservation
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
