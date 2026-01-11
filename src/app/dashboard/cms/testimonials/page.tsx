"use client";

import { useState, useEffect } from "react";
import {
    MessageSquare,
    ArrowLeft,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Star,
    Quote,
    User,
    MapPin,
    X,
    Save,
    Loader2
} from "lucide-react";
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "@/app/actions/cms";

interface Testimonial {
    id: string;
    author_name: string;
    author_location: string;
    content: string;
    rating: number;
    is_active: boolean;
    is_featured: boolean;
}

export default function TestimonialsManagerPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTestimonial, setShowNewTestimonial] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newTestimonial, setNewTestimonial] = useState({
        author_name: "",
        author_location: "",
        content: "",
        rating: 5,
    });

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        setLoading(true);
        const data = await getTestimonials();
        setTestimonials(data as Testimonial[]);
        setLoading(false);
    };

    const handleToggleActive = async (testimonial: Testimonial) => {
        const result = await updateTestimonial(testimonial.id, { is_active: !testimonial.is_active });
        if (result.success) {
            setTestimonials(testimonials.map(t => t.id === testimonial.id ? { ...t, is_active: !t.is_active } : t));
        }
    };

    const handleToggleFeatured = async (testimonial: Testimonial) => {
        const result = await updateTestimonial(testimonial.id, { is_featured: !testimonial.is_featured });
        if (result.success) {
            setTestimonials(testimonials.map(t => t.id === testimonial.id ? { ...t, is_featured: !t.is_featured } : t));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cet avis ?")) return;
        const result = await deleteTestimonial(id);
        if (result.success) {
            setTestimonials(testimonials.filter(t => t.id !== id));
        } else {
            alert("Erreur: " + result.error);
        }
    };

    const handleCreateTestimonial = async () => {
        if (!newTestimonial.author_name.trim() || !newTestimonial.content.trim()) {
            alert("Le nom et le contenu sont requis");
            return;
        }

        setSaving(true);
        const result = await createTestimonial(newTestimonial);

        if (result.success) {
            await loadTestimonials();
            setShowNewTestimonial(false);
            setNewTestimonial({ author_name: "", author_location: "", content: "", rating: 5 });
        } else {
            alert("Erreur: " + result.error);
        }
        setSaving(false);
    };

    const activeCount = testimonials.filter(t => t.is_active).length;
    const featuredCount = testimonials.filter(t => t.is_featured).length;
    const avgRating = testimonials.length > 0
        ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
        : "0";

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
                <Loader2 style={{ width: 32, height: 32, color: "#6366F1", animation: "spin 1s linear infinite" }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <a href="/dashboard/cms" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7A7A7A", textDecoration: "none", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                        Retour au Dashboard
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <MessageSquare style={{ width: 32, height: 32, color: "#6366F1" }} />
                        <div>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>Avis Clients</h1>
                            <p style={{ color: "#7A7A7A" }}>{testimonials.length} avis • {activeCount} affichés • Note moyenne: {avgRating}/5</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowNewTestimonial(true)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        backgroundColor: "#6366F1",
                        color: "#FFF",
                        border: "none",
                        borderRadius: "100px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    <Plus style={{ width: 18, height: 18 }} />
                    Ajouter un avis
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ backgroundColor: "#FFF", padding: "1.25rem", borderRadius: "16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#6366F1" }}>{testimonials.length}</div>
                    <div style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>Total avis</div>
                </div>
                <div style={{ backgroundColor: "#FFF", padding: "1.25rem", borderRadius: "16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#10B981" }}>{activeCount}</div>
                    <div style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>Visibles</div>
                </div>
                <div style={{ backgroundColor: "#FFF", padding: "1.25rem", borderRadius: "16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#F59E0B" }}>{featuredCount}</div>
                    <div style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>Mis en avant</div>
                </div>
                <div style={{ backgroundColor: "#FFF", padding: "1.25rem", borderRadius: "16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                        <span style={{ fontSize: "2rem", fontWeight: 700, color: "#222" }}>{avgRating}</span>
                        <Star style={{ width: 24, height: 24, color: "#F59E0B", fill: "#F59E0B" }} />
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>Note moyenne</div>
                </div>
            </div>

            {/* Testimonials List */}
            {testimonials.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "#F9FAFB", borderRadius: "16px" }}>
                    <MessageSquare style={{ width: 48, height: 48, color: "#D1D5DB", margin: "0 auto 1rem" }} />
                    <h3 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Aucun avis</h3>
                    <p style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>Ajoutez des témoignages de vos clients</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {testimonials.map(testimonial => (
                        <div
                            key={testimonial.id}
                            style={{
                                backgroundColor: "#FFF",
                                borderRadius: "16px",
                                border: `1px solid ${testimonial.is_featured ? "#6366F1" : "#E5E7EB"}`,
                                padding: "1.5rem",
                                opacity: testimonial.is_active ? 1 : 0.7,
                            }}
                        >
                            <div style={{ display: "flex", gap: "1.25rem" }}>
                                <div
                                    style={{
                                        width: "56px",
                                        height: "56px",
                                        borderRadius: "50%",
                                        backgroundColor: "#F3F4F6",
                                        overflow: "hidden",
                                        flexShrink: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <User style={{ width: 24, height: 24, color: "#9CA3AF" }} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <h3 style={{ fontWeight: 600, color: "#222", fontSize: "1rem" }}>{testimonial.author_name}</h3>
                                                {testimonial.is_featured && (
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", backgroundColor: "#EEF2FF", color: "#6366F1", fontSize: "0.625rem", fontWeight: 600, borderRadius: "100px" }}>
                                                        <Star style={{ width: 10, height: 10, fill: "#6366F1" }} />
                                                        Mis en avant
                                                    </span>
                                                )}
                                            </div>
                                            {testimonial.author_location && (
                                                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#7A7A7A" }}>
                                                    <MapPin style={{ width: 12, height: 12 }} />
                                                    {testimonial.author_location}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", gap: "2px" }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    style={{
                                                        width: 16,
                                                        height: 16,
                                                        color: i < testimonial.rating ? "#F59E0B" : "#E5E7EB",
                                                        fill: i < testimonial.rating ? "#F59E0B" : "none",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ position: "relative", paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                                        <Quote style={{ position: "absolute", left: 0, top: 0, width: 16, height: 16, color: "#D1D5DB" }} />
                                        <p style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.6, fontStyle: "italic" }}>
                                            {testimonial.content}
                                        </p>
                                    </div>

                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button
                                            onClick={() => handleToggleActive(testimonial)}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                padding: "8px 14px",
                                                backgroundColor: testimonial.is_active ? "#DCFCE7" : "#FEE2E2",
                                                color: testimonial.is_active ? "#166534" : "#DC2626",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontSize: "0.75rem",
                                                fontWeight: 500,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {testimonial.is_active ? <Eye style={{ width: 14, height: 14 }} /> : <EyeOff style={{ width: 14, height: 14 }} />}
                                            {testimonial.is_active ? "Visible" : "Masqué"}
                                        </button>
                                        <button
                                            onClick={() => handleToggleFeatured(testimonial)}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                padding: "8px 14px",
                                                backgroundColor: testimonial.is_featured ? "#EEF2FF" : "#FFF",
                                                color: testimonial.is_featured ? "#6366F1" : "#6B7280",
                                                border: `1px solid ${testimonial.is_featured ? "#6366F1" : "#E5E7EB"}`,
                                                borderRadius: "8px",
                                                fontSize: "0.75rem",
                                                fontWeight: 500,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Star style={{ width: 14, height: 14, fill: testimonial.is_featured ? "#6366F1" : "none" }} />
                                            {testimonial.is_featured ? "Mis en avant" : "Mettre en avant"}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(testimonial.id)}
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: "#FFF",
                                                border: "1px solid #FECACA",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Trash2 style={{ width: 14, height: 14, color: "#EF4444" }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Testimonial Modal */}
            {showNewTestimonial && (
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
                    onClick={() => setShowNewTestimonial(false)}
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
                            <h2 style={{ fontWeight: 700, color: "#222" }}>Nouvel avis</h2>
                            <button onClick={() => setShowNewTestimonial(false)} style={{ padding: "8px", border: "none", backgroundColor: "#F3F4F6", borderRadius: "8px", cursor: "pointer" }}>
                                <X style={{ width: 20, height: 20, color: "#6B7280" }} />
                            </button>
                        </div>
                        <div style={{ padding: "1.5rem" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Nom *</label>
                                <input
                                    type="text"
                                    value={newTestimonial.author_name}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, author_name: e.target.value })}
                                    placeholder="Marie L."
                                    style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem" }}
                                />
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Localisation</label>
                                <input
                                    type="text"
                                    value={newTestimonial.author_location}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, author_location: e.target.value })}
                                    placeholder="Paris, France"
                                    style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem" }}
                                />
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Note</label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setNewTestimonial({ ...newTestimonial, rating })}
                                            style={{
                                                padding: "10px",
                                                border: "1px solid #E5E7EB",
                                                borderRadius: "8px",
                                                backgroundColor: newTestimonial.rating >= rating ? "#FEF3C7" : "#FFF",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Star style={{ width: 20, height: 20, color: newTestimonial.rating >= rating ? "#F59E0B" : "#D1D5DB", fill: newTestimonial.rating >= rating ? "#F59E0B" : "none" }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Témoignage *</label>
                                <textarea
                                    value={newTestimonial.content}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                                    placeholder="Un endroit magique ! L'ambiance, la nourriture, le service..."
                                    rows={4}
                                    style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem", resize: "vertical" }}
                                />
                            </div>
                            <button
                                onClick={handleCreateTestimonial}
                                disabled={saving}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    backgroundColor: "#6366F1",
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
                                    <><Save style={{ width: 18, height: 18 }} />Ajouter l&apos;avis</>
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
