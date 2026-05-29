"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Info, AlertCircle, Users, X, Bell, Send, ChevronDown, ChevronUp, Eye, EyeOff, ExternalLink } from "lucide-react";
import { detectConflicts, dismissConflict, getTomorrowReservations, sendTomorrowReminders } from "@/app/actions/manager";
import type { SmartConflict, ConflictSeverity } from "@/app/actions/manager";
import Link from "next/link";

interface TomorrowReservation {
    id: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    guest_count: number;
}

const severityConfig: Record<ConflictSeverity, {
    icon: typeof AlertTriangle;
    color: string;
    bg: string;
    border: string;
    lightBg: string;
}> = {
    critical: {
        icon: AlertTriangle,
        color: "#DC2626",
        bg: "#FEE2E2",
        border: "#FECACA",
        lightBg: "#FFF5F5",
    },
    warning: {
        icon: AlertCircle,
        color: "#D97706",
        bg: "#FEF3C7",
        border: "#FDE68A",
        lightBg: "#FFFBEB",
    },
    info: {
        icon: Info,
        color: "#2563EB",
        bg: "#DBEAFE",
        border: "#BFDBFE",
        lightBg: "#EFF6FF",
    },
};

export function ManagerAlerts() {
    const [conflicts, setConflicts] = useState<SmartConflict[]>([]);
    const [tomorrowReservations, setTomorrowReservations] = useState<TomorrowReservation[]>([]);
    const [tomorrowDate, setTomorrowDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [showRemindersModal, setShowRemindersModal] = useState(false);
    const [remindersSent, setRemindersSent] = useState(false);
    const [showInfoConflicts, setShowInfoConflicts] = useState(false);
    const [dismissingId, setDismissingId] = useState<string | null>(null);
    const [sendingReminders, setSendingReminders] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    const handleDismiss = async (conflictId: string) => {
        setDismissingId(conflictId);
        await dismissConflict(conflictId);
        // Animate out, then remove
        setTimeout(() => {
            setConflicts(prev => prev.filter(c => c.id !== conflictId));
            setDismissingId(null);
        }, 300);
    };

    const openRemindersModal = () => {
        setRemindersSent(false);
        setErrorMessage(null);
        setShowRemindersModal(true);
    };

    const handleSendReminders = async () => {
        setSendingReminders(true);
        setErrorMessage(null);
        try {
            const ids = tomorrowReservations.map(r => r.id);
            const res = await sendTomorrowReminders(ids);
            if (res.success) {
                setRemindersSent(true);
                setTimeout(() => setShowRemindersModal(false), 1500);
            } else {
                setErrorMessage(res.error || "Une erreur s'est produite lors de l'envoi des e-mails.");
            }
        } catch (err: any) {
            console.error("Error sending reminders:", err);
            setErrorMessage("Une erreur inattendue est survenue.");
        } finally {
            setSendingReminders(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });
    };

    if (loading) return null;

    // Separate conflicts by severity
    const criticalConflicts = conflicts.filter(c => c.severity === "critical");
    const warningConflicts = conflicts.filter(c => c.severity === "warning");
    const infoConflicts = conflicts.filter(c => c.severity === "info");
    const importantConflicts = [...criticalConflicts, ...warningConflicts];

    // Only show if there are conflicts or tomorrow has reservations
    if (conflicts.length === 0 && tomorrowReservations.length === 0) return null;

    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>

                {/* Critical & Warning Conflicts */}
                {importantConflicts.length > 0 && (
                    <div style={{
                        padding: "1rem 1.25rem",
                        backgroundColor: criticalConflicts.length > 0 ? "#FEE2E2" : "#FEF3C7",
                        borderRadius: "12px",
                        border: `1px solid ${criticalConflicts.length > 0 ? "#FECACA" : "#FDE68A"}`,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <AlertTriangle style={{ width: 18, height: 18, color: criticalConflicts.length > 0 ? "#DC2626" : "#D97706" }} />
                                <span style={{ fontWeight: 600, color: criticalConflicts.length > 0 ? "#DC2626" : "#D97706" }}>
                                    {importantConflicts.length} alerte{importantConflicts.length > 1 ? "s" : ""} à traiter
                                </span>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {importantConflicts.map((c) => {
                                const config = severityConfig[c.severity];
                                const Icon = config.icon;
                                const isDismissing = dismissingId === c.id;
                                return (
                                    <div
                                        key={c.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "8px",
                                            fontSize: "0.875rem",
                                            padding: "8px 12px",
                                            backgroundColor: config.lightBg,
                                            borderRadius: "8px",
                                            border: `1px solid ${config.border}`,
                                            opacity: isDismissing ? 0 : 1,
                                            transform: isDismissing ? "translateX(20px)" : "none",
                                            transition: "opacity 0.3s ease, transform 0.3s ease",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                                            <Icon style={{ width: 14, height: 14, color: config.color, flexShrink: 0 }} />
                                            <span style={{ color: "#222", fontWeight: 500 }}>{c.message}</span>
                                            {c.date && (
                                                <span style={{
                                                    padding: "2px 8px", backgroundColor: "#FFF",
                                                    borderRadius: "4px", fontSize: "0.75rem", color: config.color,
                                                    fontWeight: 500, whiteSpace: "nowrap"
                                                }}>
                                                    {formatDate(c.date)}
                                                </span>
                                            )}
                                            {c.details && (
                                                <span style={{ fontSize: "0.75rem", color: "#666" }}>— {c.details}</span>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                                            {c.actionHref && (
                                                <Link
                                                    href={c.actionHref}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: "4px",
                                                        padding: "4px 10px", backgroundColor: config.color,
                                                        color: "#FFF", borderRadius: "6px", fontSize: "0.75rem",
                                                        fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    <ExternalLink style={{ width: 10, height: 10 }} />
                                                    {c.actionLabel || "Voir"}
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => handleDismiss(c.id)}
                                                title="Ignorer cette alerte"
                                                style={{
                                                    background: "none", border: "none", cursor: "pointer",
                                                    padding: "4px", display: "flex", alignItems: "center",
                                                    opacity: 0.5, transition: "opacity 0.2s",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
                                            >
                                                <EyeOff style={{ width: 14, height: 14, color: "#666" }} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Info Conflicts (collapsible) */}
                {infoConflicts.length > 0 && (
                    <div style={{
                        padding: "0.75rem 1.25rem",
                        backgroundColor: "#F0F9FF",
                        borderRadius: "12px",
                        border: "1px solid #BAE6FD",
                    }}>
                        <button
                            onClick={() => setShowInfoConflicts(!showInfoConflicts)}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                width: "100%", background: "none", border: "none", cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Info style={{ width: 16, height: 16, color: "#0284C7" }} />
                                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#0284C7" }}>
                                    {infoConflicts.length} info{infoConflicts.length > 1 ? "s" : ""} — réservations multiples du même client
                                </span>
                            </div>
                            {showInfoConflicts
                                ? <ChevronUp style={{ width: 16, height: 16, color: "#0284C7" }} />
                                : <ChevronDown style={{ width: 16, height: 16, color: "#0284C7" }} />
                            }
                        </button>

                        {showInfoConflicts && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "0.75rem" }}>
                                {infoConflicts.map((c) => {
                                    const isDismissing = dismissingId === c.id;
                                    return (
                                        <div
                                            key={c.id}
                                            style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                gap: "8px", fontSize: "0.875rem", padding: "6px 10px",
                                                backgroundColor: "#FFF", borderRadius: "6px",
                                                border: "1px solid #E0F2FE",
                                                opacity: isDismissing ? 0 : 1,
                                                transition: "opacity 0.3s ease",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ color: "#333" }}>{c.details}</span>
                                                {c.date && (
                                                    <span style={{
                                                        padding: "1px 6px", backgroundColor: "#DBEAFE",
                                                        borderRadius: "4px", fontSize: "0.7rem", color: "#1D4ED8"
                                                    }}>
                                                        {formatDate(c.date)}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                {c.actionHref && (
                                                    <Link
                                                        href={c.actionHref}
                                                        style={{
                                                            fontSize: "0.75rem", color: "#2563EB",
                                                            textDecoration: "none", fontWeight: 500,
                                                        }}
                                                    >
                                                        {c.actionLabel || "Voir"}
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => handleDismiss(c.id)}
                                                    title="Ignorer"
                                                    style={{
                                                        background: "none", border: "none", cursor: "pointer",
                                                        padding: "2px", display: "flex", opacity: 0.4,
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
                                                >
                                                    <X style={{ width: 12, height: 12, color: "#999" }} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Tomorrow Reminders */}
                {tomorrowReservations.length > 0 && (
                    <div style={{
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
                            onClick={openRemindersModal}
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
                            <button 
                                onClick={() => !sendingReminders && setShowRemindersModal(false)} 
                                disabled={sendingReminders}
                                style={{ background: "none", border: "none", cursor: sendingReminders ? "not-allowed" : "pointer", opacity: sendingReminders ? 0.5 : 1 }}
                            >
                                <X style={{ width: 20, height: 20, color: "#7A7A7A" }} />
                            </button>
                        </div>

                        {errorMessage && (
                            <div style={{
                                padding: "0.75rem 1rem",
                                backgroundColor: "#FEE2E2",
                                color: "#DC2626",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                marginBottom: "1rem",
                                whiteSpace: "pre-line"
                            }}>
                                {errorMessage}
                            </div>
                        )}

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
                                        disabled={sendingReminders}
                                        style={{
                                            flex: 1, padding: "12px", backgroundColor: "#F3F4F6",
                                            border: "none", borderRadius: "8px", 
                                            cursor: sendingReminders ? "not-allowed" : "pointer",
                                            fontWeight: 500, opacity: sendingReminders ? 0.5 : 1
                                        }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSendReminders}
                                        disabled={sendingReminders}
                                        style={{
                                            flex: 1, padding: "12px", 
                                            backgroundColor: sendingReminders ? "#CBD5E1" : "#E8A87C",
                                            color: "#FFF", border: "none", borderRadius: "8px",
                                            cursor: sendingReminders ? "not-allowed" : "pointer", 
                                            fontWeight: 600, display: "flex",
                                            alignItems: "center", justifyContent: "center", gap: "8px"
                                        }}
                                    >
                                        {sendingReminders ? (
                                            <span>Envoi en cours...</span>
                                        ) : (
                                            <>
                                                <Send style={{ width: 16, height: 16 }} />
                                                Envoyer ({tomorrowReservations.length})
                                            </>
                                        )}
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
