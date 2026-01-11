"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Phone,
    Mail,
    Check,
    X,
    RefreshCw,
    Filter,
    ChevronRight,
    AlertCircle,
} from "lucide-react";
import { getReservations, confirmReservation, declineReservation } from "@/app/actions/reservations";
import { TodayDashboard } from "@/components/admin/TodayDashboard";
import { ManagerAlerts } from "@/components/admin/ManagerAlerts";

interface Reservation {
    id: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    reservation_date: string;
    time_slot: string;
    guest_count: number;
    special_request: string | null;
    estimated_price: number;
    status: string;
    created_at: string;
    packages: {
        name: string;
    };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "En attente", color: "#F59E0B", bg: "#FEF3C7" },
    confirmed: { label: "Confirmée", color: "#22C55E", bg: "#DCFCE7" },
    declined: { label: "Refusée", color: "#EF4444", bg: "#FEE2E2" },
    alternative_proposed: { label: "Alternative proposée", color: "#6366F1", bg: "#E0E7FF" },
    cancelled: { label: "Annulée", color: "#6B7280", bg: "#F3F4F6" },
};

const timeSlotLabels: Record<string, string> = {
    full_day: "Journée",
    morning: "Matin",
    afternoon: "Après-midi",
};

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [declineReason, setDeclineReason] = useState("");
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [autoConfirmEnabled, setAutoConfirmEnabled] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("autoConfirmEnabled") === "true";
        }
        return false;
    });

    useEffect(() => {
        loadReservations();
    }, [filter]);

    const loadReservations = async () => {
        setLoading(true);
        const data = await getReservations({ status: filter });
        setReservations(data as Reservation[]);
        setLoading(false);
    };

    const handleConfirm = async (id: string) => {
        setActionLoading(true);
        const result = await confirmReservation(id);
        if (result.success) {
            await loadReservations();
            setSelectedReservation(null);
        } else {
            alert("Erreur: " + result.error);
        }
        setActionLoading(false);
    };

    const handleDecline = async () => {
        if (!selectedReservation || !declineReason.trim()) return;
        setActionLoading(true);
        const result = await declineReservation(selectedReservation.id, declineReason);
        if (result.success) {
            await loadReservations();
            setSelectedReservation(null);
            setShowDeclineModal(false);
            setDeclineReason("");
        } else {
            alert("Erreur: " + result.error);
        }
        setActionLoading(false);
    };

    const handleConfirmAll = async () => {
        const pendingReservations = reservations.filter(r => r.status === "pending");
        if (pendingReservations.length === 0) return;

        setActionLoading(true);
        let successCount = 0;

        for (const reservation of pendingReservations) {
            const result = await confirmReservation(reservation.id);
            if (result.success) successCount++;
        }

        await loadReservations();
        setActionLoading(false);
        alert(`${successCount} réservation(s) confirmée(s) sur ${pendingReservations.length}`);
    };

    const pendingCount = reservations.filter(r => r.status === "pending").length;

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Calendar style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222" }}>Réservations</h1>
                        {pendingCount > 0 && (
                            <span style={{
                                backgroundColor: "#EF4444", color: "#FFF", padding: "4px 12px",
                                borderRadius: "100px", fontSize: "0.875rem", fontWeight: 600
                            }}>
                                {pendingCount} en attente
                            </span>
                        )}
                    </div>
                    <p style={{ color: "#7A7A7A", marginTop: "4px" }}>Gérez les demandes de réservation</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Link
                        href="/dashboard/reservations/calendar"
                        style={{
                            display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px",
                            backgroundColor: "#E8A87C", color: "#FFF", borderRadius: "12px",
                            textDecoration: "none", fontWeight: 500
                        }}
                    >
                        📅 Calendrier
                    </Link>
                    <Link
                        href="/dashboard/analytics"
                        style={{
                            display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px",
                            backgroundColor: "#6366F1", color: "#FFF", borderRadius: "12px",
                            textDecoration: "none", fontWeight: 500
                        }}
                    >
                        📊 Stats
                    </Link>
                    <button
                        onClick={loadReservations}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px",
                            backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "12px", cursor: "pointer"
                        }}
                    >
                        <RefreshCw style={{ width: 18, height: 18, color: "#7A7A7A" }} />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Auto-confirmation toggle + Actions rapides */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "1rem", backgroundColor: "#F9F5F0", borderRadius: "12px",
                marginBottom: "1.5rem", border: "1px solid #E5E7EB"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={autoConfirmEnabled}
                            onChange={(e) => {
                                setAutoConfirmEnabled(e.target.checked);
                                localStorage.setItem("autoConfirmEnabled", e.target.checked ? "true" : "false");
                            }}
                            style={{ width: 20, height: 20, accentColor: "#E8A87C" }}
                        />
                        <span style={{ fontWeight: 500, color: "#222" }}>🤖 Confirmation automatique</span>
                    </label>
                    <span style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>
                        (Si capacité &lt; 50%, confirmation auto)
                    </span>
                </div>
                {pendingCount > 0 && (
                    <button
                        onClick={handleConfirmAll}
                        disabled={actionLoading}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px",
                            backgroundColor: "#22C55E", color: "#FFF", border: "none",
                            borderRadius: "8px", fontWeight: 600, cursor: "pointer"
                        }}
                    >
                        <Check style={{ width: 16, height: 16 }} />
                        Confirmer tout ({pendingCount})
                    </button>
                )}
            </div>

            {/* Today Dashboard Widget */}
            <TodayDashboard />

            {/* Conflicts & Reminders Alerts */}
            <ManagerAlerts />

            {/* Filters */}
            <div style={{
                display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap"
            }}>
                {[
                    { value: "all", label: "Toutes" },
                    { value: "pending", label: "En attente" },
                    { value: "confirmed", label: "Confirmées" },
                    { value: "declined", label: "Refusées" },
                ].map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "100px",
                            border: filter === f.value ? "none" : "1px solid #E5E7EB",
                            backgroundColor: filter === f.value ? "#E8A87C" : "#FFF",
                            color: filter === f.value ? "#FFF" : "#222",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ display: "grid", gridTemplateColumns: selectedReservation ? "1fr 400px" : "1fr", gap: "1.5rem" }}>
                {/* List */}
                <div style={{ backgroundColor: "#FFF", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                    {loading ? (
                        <div style={{ padding: "3rem", textAlign: "center", color: "#7A7A7A" }}>Chargement...</div>
                    ) : reservations.length === 0 ? (
                        <div style={{ padding: "3rem", textAlign: "center", color: "#7A7A7A" }}>
                            Aucune réservation trouvée
                        </div>
                    ) : (
                        reservations.map((res, index) => {
                            const status = statusConfig[res.status] || statusConfig.pending;
                            return (
                                <div
                                    key={res.id}
                                    onClick={() => setSelectedReservation(res)}
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        padding: "1.25rem", cursor: "pointer",
                                        backgroundColor: selectedReservation?.id === res.id ? "#F9F5F0" : "#FFF",
                                        borderBottom: index < reservations.length - 1 ? "1px solid #E5E7EB" : "none",
                                        transition: "background-color 0.2s ease",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: "12px",
                                            backgroundColor: "#E8A87C20", display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            <MapPin style={{ width: 24, height: 24, color: "#E8A87C" }} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, color: "#222" }}>{res.guest_name}</p>
                                            <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>
                                                {res.packages?.name || "Forfait"} · {res.guest_count} pers.
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ textAlign: "right" }}>
                                            <p style={{ fontWeight: 500, color: "#222" }}>
                                                {new Date(res.reservation_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                            </p>
                                            <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>
                                                {timeSlotLabels[res.time_slot]}
                                            </p>
                                        </div>
                                        <span style={{
                                            padding: "4px 12px", borderRadius: "100px",
                                            backgroundColor: status.bg, color: status.color,
                                            fontSize: "0.75rem", fontWeight: 600
                                        }}>
                                            {status.label}
                                        </span>
                                        <ChevronRight style={{ width: 20, height: 20, color: "#7A7A7A" }} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Detail Panel */}
                {selectedReservation && (
                    <div style={{ backgroundColor: "#FFF", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222" }}>Détails</h3>
                            <button onClick={() => setSelectedReservation(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                                <X style={{ width: 20, height: 20, color: "#7A7A7A" }} />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                            <div>
                                <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginBottom: "4px" }}>Client</p>
                                <p style={{ fontWeight: 600, color: "#222" }}>{selectedReservation.guest_name}</p>
                            </div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginBottom: "4px" }}>Email</p>
                                    <a href={`mailto:${selectedReservation.guest_email}`} style={{ color: "#E8A87C", fontSize: "0.875rem" }}>
                                        {selectedReservation.guest_email}
                                    </a>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginBottom: "4px" }}>Téléphone</p>
                                    <a href={`tel:${selectedReservation.guest_phone}`} style={{ color: "#E8A87C", fontSize: "0.875rem" }}>
                                        {selectedReservation.guest_phone}
                                    </a>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginBottom: "4px" }}>Forfait</p>
                                    <p style={{ fontWeight: 500 }}>{selectedReservation.packages?.name || "-"}</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginBottom: "4px" }}>Personnes</p>
                                    <p style={{ fontWeight: 500 }}>{selectedReservation.guest_count}</p>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginBottom: "4px" }}>Date</p>
                                    <p style={{ fontWeight: 500 }}>
                                        {new Date(selectedReservation.reservation_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                                    </p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginBottom: "4px" }}>Créneau</p>
                                    <p style={{ fontWeight: 500 }}>{timeSlotLabels[selectedReservation.time_slot]}</p>
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginBottom: "4px" }}>Montant estimé</p>
                                <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#E8A87C" }}>{selectedReservation.estimated_price}DT</p>
                            </div>
                            {selectedReservation.special_request && (
                                <div style={{ backgroundColor: "#FEF3C7", padding: "1rem", borderRadius: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                        <AlertCircle style={{ width: 16, height: 16, color: "#F59E0B" }} />
                                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#92400E" }}>Demande spéciale</p>
                                    </div>
                                    <p style={{ fontSize: "0.875rem", color: "#222" }}>{selectedReservation.special_request}</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {selectedReservation.status === "pending" && (
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <button
                                    onClick={() => handleConfirm(selectedReservation.id)}
                                    disabled={actionLoading}
                                    style={{
                                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                        padding: "12px", backgroundColor: "#22C55E", color: "#FFF",
                                        border: "none", borderRadius: "12px", fontWeight: 600, cursor: "pointer"
                                    }}
                                >
                                    <Check style={{ width: 18, height: 18 }} />
                                    Confirmer
                                </button>
                                <button
                                    onClick={() => setShowDeclineModal(true)}
                                    disabled={actionLoading}
                                    style={{
                                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                        padding: "12px", backgroundColor: "#FFF", color: "#EF4444",
                                        border: "2px solid #EF4444", borderRadius: "12px", fontWeight: 600, cursor: "pointer"
                                    }}
                                >
                                    <X style={{ width: 18, height: 18 }} />
                                    Refuser
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Decline Modal */}
            {showDeclineModal && (
                <div style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
                }}>
                    <div style={{ backgroundColor: "#FFF", borderRadius: "16px", padding: "2rem", width: "450px", maxHeight: "90vh", overflowY: "auto" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Refuser la réservation</h3>
                        <p style={{ color: "#7A7A7A", marginBottom: "1rem" }}>
                            Sélectionnez un motif de refus
                        </p>

                        {/* Predefined reasons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1rem" }}>
                            {[
                                { id: "complet", label: "🚫 Complet", text: "Nous sommes désolés, mais nous n'avons plus de disponibilité pour la date et le créneau que vous avez sélectionnés. Nous vous invitons à choisir une autre date ou à nous contacter directement." },
                                { id: "capacite", label: "👥 Capacité dépassée", text: "Malheureusement, le nombre de personnes indiqué dépasse la capacité disponible pour ce forfait. Veuillez réduire le nombre de convives ou choisir un forfait adapté." },
                                { id: "fermeture", label: "🏖️ Fermeture exceptionnelle", text: "Notre établissement sera exceptionnellement fermé à la date demandée. Nous vous prions de nous excuser pour ce désagrément et vous invitons à réserver pour une autre date." },
                                { id: "meteo", label: "⛈️ Conditions météo", text: "En raison de prévisions météorologiques défavorables, nous avons décidé de ne pas accueillir de réservations pour cette date. Votre sécurité est notre priorité." },
                                { id: "evenement", label: "🎉 Événement privé", text: "Un événement privé est prévu à cette date et notre établissement ne sera pas ouvert au public. Nous vous invitons à réserver pour une autre date." },
                                { id: "autre", label: "📝 Autre motif", text: "" },
                            ].map((reason) => (
                                <button
                                    key={reason.id}
                                    onClick={() => setDeclineReason(reason.text)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "10px",
                                        padding: "12px 16px", textAlign: "left",
                                        backgroundColor: declineReason === reason.text && reason.text !== "" ? "#FEE2E2" : "#F9F5F0",
                                        border: declineReason === reason.text && reason.text !== "" ? "2px solid #EF4444" : "1px solid #E5E7EB",
                                        borderRadius: "12px", cursor: "pointer",
                                        fontWeight: 500, color: "#222"
                                    }}
                                >
                                    {reason.label}
                                </button>
                            ))}
                        </div>

                        <p style={{ fontSize: "0.875rem", color: "#7A7A7A", marginBottom: "0.5rem" }}>
                            Message envoyé au client :
                        </p>
                        <textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder="Écrivez un message personnalisé..."
                            rows={4}
                            style={{
                                width: "100%", padding: "1rem", border: "2px solid #E5E7EB",
                                borderRadius: "12px", fontSize: "0.9rem", resize: "none", marginBottom: "1rem"
                            }}
                        />
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button
                                onClick={() => { setShowDeclineModal(false); setDeclineReason(""); }}
                                style={{
                                    flex: 1, padding: "12px", backgroundColor: "#F3F4F6",
                                    border: "none", borderRadius: "12px", fontWeight: 500, cursor: "pointer"
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDecline}
                                disabled={!declineReason.trim() || actionLoading}
                                style={{
                                    flex: 1, padding: "12px", backgroundColor: declineReason.trim() ? "#EF4444" : "#CCC", color: "#FFF",
                                    border: "none", borderRadius: "12px", fontWeight: 600, cursor: declineReason.trim() ? "pointer" : "not-allowed"
                                }}
                            >
                                {actionLoading ? "..." : "Confirmer le refus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
