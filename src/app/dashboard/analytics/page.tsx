import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                        <BarChart3 style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                            Statistiques
                        </h1>
                    </div>
                    <p style={{ color: "#7A7A7A" }}>
                        Analyse des réservations et tendances
                    </p>
                </div>
                <Link
                    href="/dashboard/reservations"
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 20px", backgroundColor: "#F3F4F6",
                        borderRadius: "100px", color: "#222", textDecoration: "none",
                        fontWeight: 500
                    }}
                >
                    <ArrowLeft style={{ width: 18, height: 18 }} />
                    Réservations
                </Link>
            </div>
            <AnalyticsDashboard />
        </div>
    );
}
