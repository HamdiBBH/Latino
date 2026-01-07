"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    ArrowLeft,
    Plus,
    Trash2,
    Edit2,
    Eye,
    EyeOff,
    Star,
    Clock,
    Music,
    Utensils,
    Flame,
    X,
    Save,
    Loader2
} from "lucide-react";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/app/actions/cms";

interface Event {
    id: string;
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    category: string;
    is_active: boolean;
    is_featured: boolean;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    soiree: { label: "Soirée", icon: Music, color: "#8B5CF6" },
    brunch: { label: "Brunch", icon: Utensils, color: "#F59E0B" },
    party: { label: "Party", icon: Flame, color: "#EF4444" },
    concert: { label: "Concert", icon: Music, color: "#3B82F6" },
};

function formatDate(dateStr: string): { day: string; month: string; full: string } {
    const date = new Date(dateStr);
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    return {
        day: date.getDate().toString().padStart(2, "0"),
        month: months[date.getMonth()],
        full: date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    };
}

export default function EventsManagerPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewEvent, setShowNewEvent] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        event_date: "",
        start_time: "18:00",
        end_time: "23:00",
        category: "soiree",
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        const data = await getEvents();
        setEvents(data as Event[]);
        setLoading(false);
    };

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcomingEvents = events
        .filter(e => new Date(e.event_date) >= now)
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    const pastEvents = events
        .filter(e => new Date(e.event_date) < now)
        .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    const handleToggleActive = async (event: Event) => {
        const result = await updateEvent(event.id, { is_active: !event.is_active });
        if (result.success) {
            setEvents(events.map(e => e.id === event.id ? { ...e, is_active: !e.is_active } : e));
        }
    };

    const handleToggleFeatured = async (event: Event) => {
        const result = await updateEvent(event.id, { is_featured: !event.is_featured });
        if (result.success) {
            setEvents(events.map(e => e.id === event.id ? { ...e, is_featured: !e.is_featured } : e));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cet événement ?")) return;
        const result = await deleteEvent(id);
        if (result.success) {
            setEvents(events.filter(e => e.id !== id));
        } else {
            alert("Erreur: " + result.error);
        }
    };

    const handleCreateEvent = async () => {
        if (!newEvent.title.trim() || !newEvent.event_date) {
            alert("Le titre et la date sont requis");
            return;
        }

        setSaving(true);
        const result = await createEvent(newEvent);

        if (result.success) {
            await loadEvents();
            setShowNewEvent(false);
            setNewEvent({ title: "", description: "", event_date: "", start_time: "18:00", end_time: "23:00", category: "soiree" });
        } else {
            alert("Erreur: " + result.error);
        }
        setSaving(false);
    };

    const renderEventCard = (event: Event) => {
        const dateInfo = formatDate(event.event_date);
        const catConfig = categoryConfig[event.category] || { label: event.category, icon: Calendar, color: "#6B7280" };
        const CatIcon = catConfig.icon;

        return (
            <div
                key={event.id}
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "16px",
                    border: "1px solid #E5E7EB",
                    overflow: "hidden",
                    opacity: event.is_active ? 1 : 0.7,
                }}
            >
                <div style={{ display: "flex" }}>
                    <div
                        style={{
                            width: "80px",
                            backgroundColor: "#F9FAFB",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1.5rem 1rem",
                            borderRight: "1px solid #E5E7EB",
                        }}
                    >
                        <span style={{ fontSize: "2rem", fontWeight: 700, color: "#222", lineHeight: 1 }}>{dateInfo.day}</span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: catConfig.color, textTransform: "uppercase" }}>{dateInfo.month}</span>
                    </div>

                    <div style={{ flex: 1, padding: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                            <div>
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        padding: "4px 10px",
                                        backgroundColor: `${catConfig.color}20`,
                                        color: catConfig.color,
                                        fontSize: "0.625rem",
                                        fontWeight: 600,
                                        borderRadius: "100px",
                                        marginBottom: "6px",
                                    }}
                                >
                                    <CatIcon style={{ width: 10, height: 10 }} />
                                    {catConfig.label}
                                </span>
                                <h3 style={{ fontWeight: 600, color: "#222", fontSize: "1rem" }}>{event.title}</h3>
                            </div>
                            {event.is_featured && (
                                <Star style={{ width: 18, height: 18, color: "#F59E0B", fill: "#F59E0B" }} />
                            )}
                        </div>

                        <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                            {event.description || "Pas de description"}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.75rem", color: "#6B7280" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Clock style={{ width: 12, height: 12 }} />
                                {event.start_time} - {event.end_time}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderTop: "1px solid #F3F4F6", backgroundColor: "#FAFAFA" }}>
                    <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{dateInfo.full}</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            onClick={() => handleToggleActive(event)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 12px",
                                backgroundColor: event.is_active ? "#DCFCE7" : "#FEE2E2",
                                color: event.is_active ? "#166534" : "#DC2626",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            {event.is_active ? <Eye style={{ width: 12, height: 12 }} /> : <EyeOff style={{ width: 12, height: 12 }} />}
                            {event.is_active ? "Visible" : "Masqué"}
                        </button>
                        <button
                            onClick={() => handleToggleFeatured(event)}
                            style={{
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: event.is_featured ? "#FEF3C7" : "#FFF",
                                border: `1px solid ${event.is_featured ? "#F59E0B" : "#E5E7EB"}`,
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                        >
                            <Star style={{ width: 14, height: 14, color: event.is_featured ? "#F59E0B" : "#9CA3AF", fill: event.is_featured ? "#F59E0B" : "none" }} />
                        </button>
                        <button
                            onClick={() => handleDelete(event.id)}
                            style={{
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#FFF",
                                border: "1px solid #FECACA",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                        >
                            <Trash2 style={{ width: 14, height: 14, color: "#EF4444" }} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
                <Loader2 style={{ width: 32, height: 32, color: "#43B0A8", animation: "spin 1s linear infinite" }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <a href="/admin/cms" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7A7A7A", textDecoration: "none", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                        Retour au Dashboard
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Calendar style={{ width: 32, height: 32, color: "#43B0A8" }} />
                        <div>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>Événements</h1>
                            <p style={{ color: "#7A7A7A" }}>{upcomingEvents.length} à venir • {pastEvents.length} passés</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowNewEvent(true)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        backgroundColor: "#43B0A8",
                        color: "#FFF",
                        border: "none",
                        borderRadius: "100px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    <Plus style={{ width: 18, height: 18 }} />
                    Créer un événement
                </button>
            </div>

            {/* Upcoming Events */}
            <div style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "8px", height: "8px", backgroundColor: "#10B981", borderRadius: "50%" }} />
                    À venir
                </h2>
                {upcomingEvents.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#F9FAFB", borderRadius: "16px" }}>
                        <Calendar style={{ width: 32, height: 32, color: "#D1D5DB", margin: "0 auto 0.75rem" }} />
                        <p style={{ color: "#9CA3AF" }}>Aucun événement à venir</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {upcomingEvents.map(renderEventCard)}
                    </div>
                )}
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
                <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#9CA3AF", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "8px", height: "8px", backgroundColor: "#D1D5DB", borderRadius: "50%" }} />
                        Passés
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", opacity: 0.7 }}>
                        {pastEvents.map(renderEventCard)}
                    </div>
                </div>
            )}

            {/* New Event Modal */}
            {showNewEvent && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        padding: "2rem",
                    }}
                    onClick={() => setShowNewEvent(false)}
                >
                    <div
                        style={{
                            backgroundColor: "#FFF",
                            borderRadius: "20px",
                            width: "100%",
                            maxWidth: "500px",
                            overflow: "hidden",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ padding: "1.5rem", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontWeight: 700, color: "#222" }}>Nouvel événement</h2>
                            <button onClick={() => setShowNewEvent(false)} style={{ padding: "8px", border: "none", backgroundColor: "#F3F4F6", borderRadius: "8px", cursor: "pointer" }}>
                                <X style={{ width: 20, height: 20, color: "#6B7280" }} />
                            </button>
                        </div>
                        <div style={{ padding: "1.5rem" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Titre *</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Nom de l'événement"
                                    style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem" }}
                                />
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Catégorie</label>
                                <select
                                    value={newEvent.category}
                                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                                    style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem" }}
                                >
                                    <option value="soiree">Soirée</option>
                                    <option value="brunch">Brunch</option>
                                    <option value="party">Party</option>
                                    <option value="concert">Concert</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Date *</label>
                                <input
                                    type="date"
                                    value={newEvent.event_date}
                                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                                    style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem" }}
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Début</label>
                                    <input
                                        type="time"
                                        value={newEvent.start_time}
                                        onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                        style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Fin</label>
                                    <input
                                        type="time"
                                        value={newEvent.end_time}
                                        onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                        style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem" }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Description de l'événement"
                                    rows={3}
                                    style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem", resize: "vertical" }}
                                />
                            </div>
                            <button
                                onClick={handleCreateEvent}
                                disabled={saving}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    backgroundColor: "#43B0A8",
                                    color: "#FFF",
                                    border: "none",
                                    borderRadius: "100px",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    cursor: saving ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                }}
                            >
                                {saving ? (
                                    <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />Création...</>
                                ) : (
                                    <><Save style={{ width: 18, height: 18 }} />Créer l&apos;événement</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
