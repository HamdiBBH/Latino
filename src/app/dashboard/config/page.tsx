"use client";

import { useState } from "react";
import { Settings, Clock, Calendar, Plus, Trash2, Save } from "lucide-react";
import ReservationConfigPanel from "@/components/admin/ReservationConfigPanel";

interface ClosureDate {
    id: string;
    date: string;
    reason: string;
}

const initialClosures: ClosureDate[] = [
    { id: "1", date: "2025-01-01", reason: "Jour de l'An" },
    { id: "2", date: "2025-03-20", reason: "Fête de l'Indépendance" },
];


export default function ConfigPage() {
    const [closures, setClosures] = useState<ClosureDate[]>(initialClosures);
    const [hours, setHours] = useState({
        openTime: "09:00",
        closeTime: "00:00",
        lastOrders: "23:00",
    });
    const [showAddClosure, setShowAddClosure] = useState(false);
    const [newClosure, setNewClosure] = useState({ date: "", reason: "" });

    const addClosure = () => {
        if (newClosure.date && newClosure.reason) {
            setClosures([...closures, { id: Date.now().toString(), ...newClosure }]);
            setNewClosure({ date: "", reason: "" });
            setShowAddClosure(false);
        }
    };

    const deleteClosure = (id: string) => {
        setClosures(closures.filter(c => c.id !== id));
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                    <Settings style={{ width: 32, height: 32, color: "#E8A87C" }} />
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                        Configuration Restaurant
                    </h1>
                </div>
                <p style={{ color: "#7A7A7A" }}>
                    Horaires et fermetures exceptionnelles
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: "1.5rem",
                }}
            >
                {/* Horaires */}
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <Clock style={{ width: 24, height: 24, color: "#E8A87C" }} />
                        <h3 style={{ fontWeight: 600, color: "#222222" }}>Horaires d&apos;ouverture</h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>
                                Ouverture
                            </label>
                            <input
                                type="time"
                                value={hours.openTime}
                                onChange={(e) => setHours({ ...hours, openTime: e.target.value })}
                                style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>
                                Fermeture
                            </label>
                            <input
                                type="time"
                                value={hours.closeTime}
                                onChange={(e) => setHours({ ...hours, closeTime: e.target.value })}
                                style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>
                                Dernières commandes
                            </label>
                            <input
                                type="time"
                                value={hours.lastOrders}
                                onChange={(e) => setHours({ ...hours, lastOrders: e.target.value })}
                                style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                            />
                        </div>
                    </div>

                    <button
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 20px",
                            backgroundColor: "#E8A87C",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: 500,
                            cursor: "pointer",
                            marginTop: "1.5rem",
                        }}
                    >
                        <Save style={{ width: 16, height: 16 }} />
                        Enregistrer
                    </button>
                </div>

                {/* Fermetures */}
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Calendar style={{ width: 24, height: 24, color: "#E8A87C" }} />
                            <h3 style={{ fontWeight: 600, color: "#222222" }}>Jours de fermeture</h3>
                        </div>
                        <button
                            onClick={() => setShowAddClosure(true)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                                backgroundColor: "#F3F4F6",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <Plus style={{ width: 16, height: 16 }} />
                            Ajouter
                        </button>
                    </div>

                    {showAddClosure && (
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                            <input
                                type="date"
                                value={newClosure.date}
                                onChange={(e) => setNewClosure({ ...newClosure, date: e.target.value })}
                                style={{ flex: 1, padding: "10px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                            />
                            <input
                                type="text"
                                placeholder="Raison"
                                value={newClosure.reason}
                                onChange={(e) => setNewClosure({ ...newClosure, reason: e.target.value })}
                                style={{ flex: 2, padding: "10px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                            />
                            <button onClick={addClosure} style={{ padding: "10px", backgroundColor: "#22C55E", color: "#FFF", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                OK
                            </button>
                        </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {closures.map((closure) => (
                            <div
                                key={closure.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "12px",
                                    backgroundColor: "#F9FAFB",
                                    borderRadius: "8px",
                                }}
                            >
                                <div>
                                    <span style={{ fontWeight: 500, color: "#222222" }}>
                                        {new Date(closure.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                                    </span>
                                    <span style={{ color: "#7A7A7A", fontSize: "0.875rem", marginLeft: "8px" }}>
                                        — {closure.reason}
                                    </span>
                                </div>
                                <button
                                    onClick={() => deleteClosure(closure.id)}
                                    style={{ padding: "6px", backgroundColor: "#FEE2E2", border: "none", borderRadius: "6px", cursor: "pointer", color: "#B91C1C" }}
                                >
                                    <Trash2 style={{ width: 14, height: 14 }} />
                                </button>
                            </div>
                        ))}
                        {closures.length === 0 && (
                            <p style={{ color: "#9CA3AF", textAlign: "center", padding: "1rem" }}>Aucune fermeture prévue</p>
                        )}
                    </div>
                </div>
            </div>


            <ReservationConfigPanel />
        </div>
    );
}
