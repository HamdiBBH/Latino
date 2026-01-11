"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Users, Copy, X, Calendar, Bell, Send } from "lucide-react";
import { detectConflicts, getTomorrowReservations } from "@/app/actions/manager";

interface Conflict {
    type: string;
    message: string;
    date?: string;
    details?: string;
}

interface TomorrowReservation {
    id: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    guest_count: number;
}

export function ManagerAlerts() {
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [tomorrowReservations, setTomorrowReservations] = useState<TomorrowReservation[]>([]);
    const [tomorrowDate, setTomorrowDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [showRemindersModal, setShowRemindersModal] = useState(false);
    const [remindersSent, setRemindersSent] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        const [conflictsResult, tomorrowResult] = await Promise.all([
            detectConflicts(),
            getTomorrowReservations()
        ]);

        setConflicts(conflictsResult.conflicts);
        setTomorrowReservations(tomorrowResult.reservations);
        setTomorrowDate(tomorrowResult.date);
        setLoading(false);
    };

    const handleSendReminders = async () => {
        // In a real implementation, this would send emails/SMS
        // For now, just mark as sent
        setRemindersSent(true);
        setTimeout(() => setShowRemindersModal(false), 1500);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });
    };

    if (loading) return null;

    // Only show if there are conflicts or tomorrow has reservations
    if (conflicts.length === 0 && tomorrowReservations.length === 0) return null;

    return (
        <>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {/* Conflicts Alert */}
                {conflicts.length > 0 && (
                    <div style={{
                        flex: 1,
                        minWidth: 280,
                        padding: "1rem 1.25rem",
                        backgroundColor: "#FEE2E2",
                        borderRadius: "12px",
                        border: "1px solid #FECACA"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                            <AlertTriangle style={{ width: 18, height: 18, color: "#DC2626" }} />
                            <span style={{ fontWeight: 600, color: "#DC2626" }}>
                                {conflicts.length} conflit{conflicts.length > 1 ? "s" : ""} détecté{conflicts.length > 1 ? "s" : ""}
                            </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {conflicts.slice(0, 3).map((c, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem" }}>
                                    <span style={{ color: "#991B1B" }}>{c.message}</span>
                                    {c.date && (
                                        <span style={{ padding: "2px 6px", backgroundColor: "#FFF", borderRadius: "4px", fontSize: "0.75rem", color: "#DC2626" }}>
                                            {formatDate(c.date)}
                                        </span>
                                    )}
                                    {c.details && (
                                        <span style={{ fontSize: "0.75rem", color: "#7F1D1D" }}>({c.details})</span>
                                    )}
                                </div>
                            ))}
                            {conflicts.length > 3 && (
                                <span style={{ fontSize: "0.75rem", color: "#991B1B" }}>
                                    +{conflicts.length - 3} autre{conflicts.length - 3 > 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Tomorrow Reminders */}
                {tomorrowReservations.length > 0 && (
                    <div style={{
                        flex: 1,
                        minWidth: 280,
                        padding: "1rem 1.25rem",
                        backgroundColor: "#DBEAFE",
                        borderRadius: "12px",
                        border: "1px solid #BFDBFE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <Bell style={{ width: 18, height: 18, color: "#1D4ED8" }} />
                                <span style={{ fontWeight: 600, color: "#1D4ED8" }}>
                                    {tomorrowReservations.length} réservation{tomorrowReservations.length > 1 ? "s" : ""} demain
                                </span>
                            </div>
                            <p style={{ fontSize: "0.875rem", color: "#1E40AF" }}>
                                {tomorrowReservations.reduce((sum, r) => sum + r.guest_count, 0)} personnes attendues
                            </p>
                        </div>
                        <button
                            onClick={() => setShowRemindersModal(true)}
                            style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "8px 14px", backgroundColor: "#2563EB",
                                color: "#FFF", border: "none", borderRadius: "8px",
                                fontWeight: 500, cursor: "pointer", fontSize: "0.875rem"
                            }}
                        >
                            <Send style={{ width: 14, height: 14 }} />
                            Envoyer rappels
                        </button>
                    </div>
                )}
            </div>

            {/* Reminders Modal */}
            {showRemindersModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
                    alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "#FFF", borderRadius: "16px", padding: "2rem",
                        maxWidth: 500, width: "90%", maxHeight: "80vh", overflow: "auto"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ fontWeight: 600, color: "#222" }}>Rappels pour demain</h3>
                            <button onClick={() => setShowRemindersModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                                <X style={{ width: 20, height: 20, color: "#7A7A7A" }} />
                            </button>
                        </div>

                        {remindersSent ? (
                            <div style={{ textAlign: "center", padding: "2rem" }}>
                                <div style={{ width: 60, height: 60, borderRadius: "50%", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                                    <Send style={{ width: 28, height: 28, color: "#22C55E" }} />
                                </div>
                                <p style={{ fontWeight: 600, color: "#22C55E" }}>Rappels envoyés !</p>
                            </div>
                        ) : (
                            <>
                                <p style={{ color: "#7A7A7A", marginBottom: "1rem", fontSize: "0.875rem" }}>
                                    Envoyer un rappel aux {tomorrowReservations.length} client{tomorrowReservations.length > 1 ? "s" : ""} de demain :
                                </p>

                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem" }}>
                                    {tomorrowReservations.map(r => (
                                        <div key={r.id} style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            padding: "0.75rem", backgroundColor: "#F9F5F0", borderRadius: "8px"
                                        }}>
                                            <div>
                                                <p style={{ fontWeight: 500, color: "#222" }}>{r.guest_name}</p>
                                                <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>{r.guest_email}</p>
                                            </div>
                                            <span style={{ fontSize: "0.875rem", color: "#E8A87C", fontWeight: 500 }}>
                                                {r.guest_count} pers.
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => setShowRemindersModal(false)}
                                        style={{
                                            flex: 1, padding: "12px", backgroundColor: "#F3F4F6",
                                            border: "none", borderRadius: "8px", cursor: "pointer",
                                            fontWeight: 500
                                        }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSendReminders}
                                        style={{
                                            flex: 1, padding: "12px", backgroundColor: "#E8A87C",
                                            color: "#FFF", border: "none", borderRadius: "8px",
                                            cursor: "pointer", fontWeight: 600, display: "flex",
                                            alignItems: "center", justifyContent: "center", gap: "8px"
                                        }}
                                    >
                                        <Send style={{ width: 16, height: 16 }} />
                                        Envoyer ({tomorrowReservations.length})
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
