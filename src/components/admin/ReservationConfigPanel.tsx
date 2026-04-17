"use client";

import { useState, useEffect } from "react";
import { Calendar, Save, Sun, Users, Tag, Loader2, Info } from "lucide-react";
import { getReservationConfig, saveReservationConfig, ReservationConfig } from "@/app/actions/settings";

const DAYS = ["Diamnche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export default function ReservationConfigPanel() {
    const [config, setConfig] = useState<ReservationConfig | null>(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getReservationConfig().then((data) => {
            setConfig(data);
            setLoading(false);
        });
    }, []);

    if (loading || !config) {
        return (
            <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
                <Loader2 style={{ animation: "spin 1s linear infinite", width: 24, height: 24, color: "#E8A87C" }} />
            </div>
        );
    }

    const handleSave = async () => {
        setSaving(true);
        const res = await saveReservationConfig(config);
        setSaving(false);
        if (res.success) {
            alert("Configuration enregistrée avec succès !");
        } else {
            alert("Erreur lors de l'enregistrement: " + res.error);
        }
    };

    const updateNestedField = (path: string[], value: any) => {
        setConfig((prev: any) => {
            const next = { ...prev };
            let current = next;
            for (let i = 0; i < path.length - 1; i++) {
                current[path[i]] = { ...current[path[i]] };
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return next;
        });
    };

    const toggleOffer = (dayIndex: number) => {
        const hasOffer = !!config.weeklyOffers[String(dayIndex)];
        if (hasOffer) {
            updateNestedField(["weeklyOffers", String(dayIndex)], null);
        } else {
            updateNestedField(["weeklyOffers", String(dayIndex)], { type: "discount", value: "-10%", description: "Remise spéciale" });
        }
    };

    const cardStyle = {
        backgroundColor: "#FFFFFF", padding: "1.5rem", borderRadius: "16px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", border: "1px solid #E5E7EB",
        marginBottom: "1.5rem"
    };

    return (
        <div style={{ marginTop: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222" }}>Réservations & Calendrier</h2>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px",
                        backgroundColor: "#E8A87C", color: "#FFFFFF", border: "none", borderRadius: "8px",
                        fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? <Loader2 style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} /> : <Save style={{ width: 16, height: 16 }} />}
                    Plublier les paramètres
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
                {/* Dates de base */}
                <div style={cardStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <Sun style={{ width: 24, height: 24, color: "#E8A87C" }} />
                        <h3 style={{ fontWeight: 600, color: "#222" }}>Saison d'ouverture</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {/* Start */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>Date d'ouverture (Mois-Jour)</label>
                            <input
                                type="text"
                                placeholder="06-01"
                                value={config.seasonStart}
                                onChange={(e) => setConfig({ ...config, seasonStart: e.target.value })}
                                style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                            />
                        </div>
                        {/* End */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>Date de fermeture (Mois-Jour)</label>
                            <input
                                type="text"
                                placeholder="09-30"
                                value={config.seasonEnd}
                                onChange={(e) => setConfig({ ...config, seasonEnd: e.target.value })}
                                style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Haute Saison */}
                <div style={cardStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <Calendar style={{ width: 24, height: 24, color: "#E8A87C" }} />
                        <h3 style={{ fontWeight: 600, color: "#222" }}>Haute Saison (Restrictions Forfaits)</h3>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#7A7A7A", marginBottom: "1rem" }}>Période durant laquelle les règles strictes d'affectation des forfaits s'appliquent.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>Début de haute saison</label>
                            <input
                                type="text"
                                placeholder="06-01"
                                value={config.restrictionStart}
                                onChange={(e) => setConfig({ ...config, restrictionStart: e.target.value })}
                                style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>Fin de haute saison</label>
                            <input
                                type="text"
                                placeholder="07-15"
                                value={config.restrictionEnd}
                                onChange={(e) => setConfig({ ...config, restrictionEnd: e.target.value })}
                                style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Règles par personnes */}
                <div style={cardStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <Users style={{ width: 24, height: 24, color: "#E8A87C" }} />
                        <h3 style={{ fontWeight: 600, color: "#222" }}>Limites Groupes (Haute Saison)</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                         <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>Maximum de personnes pour un Parasol</label>
                            <input
                                type="number"
                                value={config.rules.parasolMaxGuests}
                                onChange={(e) => updateNestedField(["rules", "parasolMaxGuests"], parseInt(e.target.value))}
                                style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>Maximum de personnes Cabane Normale / Paillote</label>
                            <input
                                type="number"
                                value={config.rules.cabanePailloteMaxGuests}
                                onChange={(e) => updateNestedField(["rules", "cabanePailloteMaxGuests"], parseInt(e.target.value))}
                                style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: "#6B7280", marginBottom: "0.5rem" }}>Minimum de personnes Cabane VIP</label>
                            <input
                                type="number"
                                value={config.rules.vipMinGuests}
                                onChange={(e) => updateNestedField(["rules", "vipMinGuests"], parseInt(e.target.value))}
                                style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                            />
                        </div>
                    </div>
                </div>

                 {/* Offres de la semaine */}
                 <div style={cardStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <Tag style={{ width: 24, height: 24, color: "#E8A87C" }} />
                        <h3 style={{ fontWeight: 600, color: "#222" }}>Offres de la semaine</h3>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#7A7A7A", marginBottom: "1rem" }}>Configurez les promotions affichées par jour.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {DAYS.map((dayName, idx) => {
                            const offer = config.weeklyOffers[String(idx)];
                            return (
                                <div key={idx} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: offer ? "#F9FAFB" : "#FFF" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: offer ? "12px" : "0" }}>
                                        <span style={{ fontWeight: 600, color: "#222" }}>{dayName}</span>
                                        <button 
                                            onClick={() => toggleOffer(idx)}
                                            style={{ padding: "6px 12px", borderRadius: "6px", border: "none", backgroundColor: offer ? "#FEE2E2" : "#E8A87C", color: offer ? "#EF4444" : "#FFF", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                                        >
                                            {offer ? "Désactiver" : "Activer une offre"}
                                        </button>
                                    </div>
                                    {offer && (
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <select
                                                value={offer.type}
                                                onChange={(e) => updateNestedField(["weeklyOffers", String(idx), "type"], e.target.value)}
                                                style={{ padding: "8px", border: "1px solid #E5E7EB", borderRadius: "6px" }}
                                            >
                                                <option value="discount">Remise</option>
                                                <option value="free_children">Enfants Gratuits</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Valeur (ex: -20%)"
                                                value={offer.value}
                                                onChange={(e) => updateNestedField(["weeklyOffers", String(idx), "value"], e.target.value)}
                                                style={{ width: "100px", padding: "8px", border: "1px solid #E5E7EB", borderRadius: "6px" }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Description affichée au client"
                                                value={offer.description}
                                                onChange={(e) => updateNestedField(["weeklyOffers", String(idx), "description"], e.target.value)}
                                                style={{ flex: 1, padding: "8px", border: "1px solid #E5E7EB", borderRadius: "6px" }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
