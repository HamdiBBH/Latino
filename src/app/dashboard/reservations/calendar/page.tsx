import { ManagerCalendar } from "@/components/admin/ManagerCalendar";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                        <Calendar style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                            Vue Calendrier
                        </h1>
                    </div>
                    <p style={{ color: "#7A7A7A" }}>
                        Vue d'ensemble des réservations par mois
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
                    Vue Liste
                </Link>
            </div>
            <ManagerCalendar />
        </div>
    );
}
