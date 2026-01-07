"use client";

import { useState } from "react";
import { Calendar, Clock, Users, Utensils, ArrowRight } from "lucide-react";

const reservationTypes = [
    { value: "dejeuner", label: "Déjeuner" },
    { value: "diner", label: "Dîner" },
    { value: "brunch", label: "Brunch" },
    { value: "evenement", label: "Événement privé" },
];

const timeSlots = [
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
];

const guestOptions = Array.from({ length: 20 }, (_, i) => i + 1);

export function BookingBar() {
    const [formData, setFormData] = useState({
        type: "",
        date: "",
        time: "",
        guests: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!formData.type || !formData.date || !formData.time || !formData.guests) {
            alert("Veuillez remplir tous les champs");
            return;
        }
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert("Réservation envoyée !");
        setIsLoading(false);
    };

    return (
        <div
            style={{
                position: "relative",
                zIndex: 50,
                marginTop: "-60px",
                marginBottom: "-60px",
                padding: "0 1.5rem",
                maxWidth: "1280px",
                marginLeft: "auto",
                marginRight: "auto",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "24px",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
                    overflow: "hidden",
                    flexWrap: "wrap",
                }}
            >
                {/* Type de réservation */}
                <div
                    style={{
                        flex: "1 1 200px",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "2rem",
                        borderRight: "1px solid #eee",
                    }}
                >
                    <div
                        style={{
                            width: "45px",
                            height: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#F9F5F0",
                            borderRadius: "50%",
                            color: "#222222",
                            flexShrink: 0,
                        }}
                    >
                        <Utensils style={{ width: 18, height: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#222222",
                                marginBottom: "4px",
                            }}
                        >
                            Type de réservation
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            style={{
                                width: "100%",
                                padding: 0,
                                fontSize: "0.9rem",
                                color: "#7A7A7A",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                            }}
                        >
                            <option value="">Sélectionner</option>
                            {reservationTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Date */}
                <div
                    style={{
                        flex: "1 1 200px",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "2rem",
                        borderRight: "1px solid #eee",
                    }}
                >
                    <div
                        style={{
                            width: "45px",
                            height: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#F9F5F0",
                            borderRadius: "50%",
                            color: "#222222",
                            flexShrink: 0,
                        }}
                    >
                        <Calendar style={{ width: 18, height: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#222222",
                                marginBottom: "4px",
                            }}
                        >
                            Date
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            min={new Date().toISOString().split("T")[0]}
                            style={{
                                width: "100%",
                                padding: 0,
                                fontSize: "0.9rem",
                                color: "#7A7A7A",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                            }}
                        />
                    </div>
                </div>

                {/* Heure */}
                <div
                    style={{
                        flex: "1 1 200px",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "2rem",
                        borderRight: "1px solid #eee",
                    }}
                >
                    <div
                        style={{
                            width: "45px",
                            height: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#F9F5F0",
                            borderRadius: "50%",
                            color: "#222222",
                            flexShrink: 0,
                        }}
                    >
                        <Clock style={{ width: 18, height: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#222222",
                                marginBottom: "4px",
                            }}
                        >
                            Heure
                        </label>
                        <select
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            style={{
                                width: "100%",
                                padding: 0,
                                fontSize: "0.9rem",
                                color: "#7A7A7A",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                            }}
                        >
                            <option value="">Sélectionner</option>
                            {timeSlots.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Personnes */}
                <div
                    style={{
                        flex: "1 1 200px",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "2rem",
                    }}
                >
                    <div
                        style={{
                            width: "45px",
                            height: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#F9F5F0",
                            borderRadius: "50%",
                            color: "#222222",
                            flexShrink: 0,
                        }}
                    >
                        <Users style={{ width: 18, height: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#222222",
                                marginBottom: "4px",
                            }}
                        >
                            Personnes
                        </label>
                        <select
                            value={formData.guests}
                            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                            style={{
                                width: "100%",
                                padding: 0,
                                fontSize: "0.9rem",
                                color: "#7A7A7A",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                            }}
                        >
                            <option value="">Sélectionner</option>
                            {guestOptions.map((num) => (
                                <option key={num} value={num}>
                                    {num} {num === 1 ? "personne" : "personnes"}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "2rem 3rem",
                        backgroundColor: "#222222",
                        color: "#FFFFFF",
                        fontSize: "1rem",
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.3s ease",
                    }}
                >
                    {isLoading ? "..." : "Réserver"}
                    {!isLoading && <ArrowRight style={{ width: 18, height: 18 }} />}
                </button>
            </div>
        </div>
    );
}
