"use client";

import { useState } from "react";
import { Settings, MapPin, Clock, Calendar, Plus, Trash2, Save } from "lucide-react";

interface Table {
    id: string;
    number: string;
    capacity: number;
    zone: string;
}

interface ClosureDate {
    id: string;
    date: string;
    reason: string;
}

const initialTables: Table[] = [
    { id: "1", number: "1", capacity: 2, zone: "Terrasse" },
    { id: "2", number: "2", capacity: 4, zone: "Terrasse" },
    { id: "3", number: "3", capacity: 4, zone: "Terrasse" },
    { id: "4", number: "4", capacity: 6, zone: "Plage" },
    { id: "5", number: "5", capacity: 6, zone: "Plage" },
    { id: "6", number: "6", capacity: 8, zone: "Plage" },
    { id: "7", number: "VIP1", capacity: 10, zone: "VIP" },
    { id: "8", number: "VIP2", capacity: 12, zone: "VIP" },
];

const initialClosures: ClosureDate[] = [
    { id: "1", date: "2025-01-01", reason: "Jour de l'An" },
    { id: "2", date: "2025-03-20", reason: "Fête de l'Indépendance" },
];

const zones = ["Terrasse", "Plage", "VIP", "Intérieur"];

export default function ConfigPage() {
    const [tables, setTables] = useState<Table[]>(initialTables);
    const [closures, setClosures] = useState<ClosureDate[]>(initialClosures);
    const [hours, setHours] = useState({
        openTime: "09:00",
        closeTime: "00:00",
        lastOrders: "23:00",
    });
    const [showAddTable, setShowAddTable] = useState(false);
    const [showAddClosure, setShowAddClosure] = useState(false);
    const [newTable, setNewTable] = useState({ number: "", capacity: 4, zone: "Terrasse" });
    const [newClosure, setNewClosure] = useState({ date: "", reason: "" });

    const addTable = () => {
        if (newTable.number) {
            setTables([...tables, { id: Date.now().toString(), ...newTable }]);
            setNewTable({ number: "", capacity: 4, zone: "Terrasse" });
            setShowAddTable(false);
        }
    };

    const deleteTable = (id: string) => {
        setTables(tables.filter(t => t.id !== id));
    };

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
                    Plan de salle, horaires et fermetures exceptionnelles
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

            {/* Tables / Plan de salle */}
            <div
                style={{
                    backgroundColor: "#FFFFFF",
                    padding: "1.5rem",
                    borderRadius: "16px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #E5E7EB",
                    marginTop: "1.5rem",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <MapPin style={{ width: 24, height: 24, color: "#E8A87C" }} />
                        <h3 style={{ fontWeight: 600, color: "#222222" }}>Plan de salle ({tables.length} tables)</h3>
                    </div>
                    <button
                        onClick={() => setShowAddTable(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            backgroundColor: "#E8A87C",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        <Plus style={{ width: 16, height: 16 }} />
                        Ajouter une table
                    </button>
                </div>

                {showAddTable && (
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        <input
                            type="text"
                            placeholder="N° Table"
                            value={newTable.number}
                            onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                            style={{ width: "100px", padding: "10px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                        />
                        <input
                            type="number"
                            placeholder="Places"
                            value={newTable.capacity}
                            onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 4 })}
                            style={{ width: "80px", padding: "10px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                        />
                        <select
                            value={newTable.zone}
                            onChange={(e) => setNewTable({ ...newTable, zone: e.target.value })}
                            style={{ padding: "10px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                        >
                            {zones.map(z => <option key={z} value={z}>{z}</option>)}
                        </select>
                        <button onClick={addTable} style={{ padding: "10px 20px", backgroundColor: "#22C55E", color: "#FFF", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                            Ajouter
                        </button>
                        <button onClick={() => setShowAddTable(false)} style={{ padding: "10px", backgroundColor: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                            ✕
                        </button>
                    </div>
                )}

                {/* Tables by Zone */}
                {zones.map((zone) => {
                    const zoneTables = tables.filter(t => t.zone === zone);
                    if (zoneTables.length === 0) return null;
                    return (
                        <div key={zone} style={{ marginBottom: "1.5rem" }}>
                            <h4 style={{ fontWeight: 500, color: "#6B7280", marginBottom: "0.75rem", fontSize: "0.875rem" }}>
                                {zone} ({zoneTables.length} tables)
                            </h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                                {zoneTables.map((table) => (
                                    <div
                                        key={table.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "12px 16px",
                                            backgroundColor: "#F9FAFB",
                                            borderRadius: "12px",
                                            border: "1px solid #E5E7EB",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                backgroundColor: "#E8A87C",
                                                borderRadius: "8px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#FFF",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {table.number}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 500, color: "#222222" }}>Table {table.number}</p>
                                            <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>{table.capacity} places</p>
                                        </div>
                                        <button
                                            onClick={() => deleteTable(table.id)}
                                            style={{
                                                padding: "6px",
                                                backgroundColor: "transparent",
                                                border: "none",
                                                cursor: "pointer",
                                                color: "#9CA3AF",
                                                marginLeft: "8px",
                                            }}
                                        >
                                            <Trash2 style={{ width: 14, height: 14 }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
