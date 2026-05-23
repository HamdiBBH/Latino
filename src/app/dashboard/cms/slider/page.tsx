"use client";

import { useState, useEffect, useRef } from "react";
import {
    SlidersHorizontal,
    ArrowLeft,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    GripVertical,
    Monitor,
    Smartphone,
    X,
    Check,
    Loader2,
    Image,
    AlertCircle,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import {
    getHeroSlides,
    createHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    reorderHeroSlides,
    getMedia,
} from "@/app/actions/cms";

interface SlideMedia {
    id: string;
    url: string;
    filename: string;
    alt_text: string | null;
}

interface Slide {
    id: string;
    media_id: string | null;
    mobile_media_id: string | null;
    display_order: number;
    is_active: boolean;
    alt_text: string | null;
    site_media?: SlideMedia | null;
    mobile_media?: SlideMedia | null;
}

type ModalMode = "desktop" | "mobile";

// ─── helpers ──────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
    backgroundColor: "#FFF",
    borderRadius: "20px",
    border: "1px solid #E5E7EB",
    overflow: "hidden",
};

const btnPrimary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#E8A87C",
    color: "#FFF",
    border: "none",
    borderRadius: "100px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "transparent",
    color: "#6B7280",
    border: "1px solid #E5E7EB",
    borderRadius: "100px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    cursor: "pointer",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SliderManagerPage() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [activeTab, setActiveTab] = useState<"desktop" | "mobile">("desktop");

    // Media picker modal
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<ModalMode>("desktop");
    const [pickerTargetSlide, setPickerTargetSlide] = useState<string | null>(null); // slide id or "new"
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
    const [loadingMedia, setLoadingMedia] = useState(false);

    // New slide pending (media_id chosen but not yet saved)
    const [pendingDesktopId, setPendingDesktopId] = useState<string | null>(null);

    // Load on mount
    useEffect(() => {
        loadSlides();
    }, []);

    const loadSlides = async () => {
        setLoading(true);
        const data = await getHeroSlides();
        setSlides(data as Slide[]);
        setLoading(false);
    };

    const loadMedia = async () => {
        setLoadingMedia(true);
        const data = await getMedia();
        setMediaFiles(data);
        setLoadingMedia(false);
    };

    const showToast = (msg: string, type: "success" | "error") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Open picker ──────────────────────────────────────────────────────────
    const openPicker = (slideId: string, mode: ModalMode) => {
        setPickerTargetSlide(slideId);
        setPickerMode(mode);
        setSelectedMediaId(null);
        setShowPicker(true);
        loadMedia();
    };

    // ── Confirm picker selection ─────────────────────────────────────────────
    const confirmPicker = async () => {
        if (!selectedMediaId || !pickerTargetSlide) return;

        // "new" = creating first slide
        if (pickerTargetSlide === "new") {
            if (pickerMode === "desktop") {
                // Step 1: choose desktop → save and open mobile picker
                setPendingDesktopId(selectedMediaId);
                setShowPicker(false);
                // Trigger mobile picker for this new slide
                setTimeout(() => {
                    setPickerTargetSlide("new-mobile");
                    setPickerMode("mobile");
                    setSelectedMediaId(null);
                    setShowPicker(true);
                    loadMedia();
                }, 100);
            } else {
                // Step 2: mobile chosen → create slide
                setSaving(true);
                setShowPicker(false);
                const result = await createHeroSlide({
                    media_id: pendingDesktopId!,
                    mobile_media_id: selectedMediaId,
                });
                if ("success" in result && result.success) {
                    showToast("Slide créée avec succès !", "success");
                    await loadSlides();
                } else {
                    showToast("Erreur lors de la création", "error");
                }
                setPendingDesktopId(null);
                setSaving(false);
            }
            return;
        }

        // Existing slide
        setSaving(true);
        setShowPicker(false);
        const field = pickerMode === "desktop" ? "media_id" : "mobile_media_id";
        const result = await updateHeroSlide(pickerTargetSlide, { [field]: selectedMediaId });
        if ("success" in result && result.success) {
            showToast("Image mise à jour !", "success");
            await loadSlides();
        } else {
            showToast("Erreur lors de la mise à jour", "error");
        }
        setSaving(false);
    };

    // ── Skip mobile selection ────────────────────────────────────────────────
    const skipMobile = async () => {
        if (pickerTargetSlide === "new-mobile") {
            setSaving(true);
            setShowPicker(false);
            const result = await createHeroSlide({
                media_id: pendingDesktopId!,
                mobile_media_id: null,
            });
            if ("success" in result && result.success) {
                showToast("Slide créée (sans image mobile) !", "success");
                await loadSlides();
            } else {
                showToast("Erreur lors de la création", "error");
            }
            setPendingDesktopId(null);
            setSaving(false);
        } else {
            // Remove mobile image from existing slide
            setSaving(true);
            setShowPicker(false);
            await updateHeroSlide(pickerTargetSlide!, { mobile_media_id: null });
            showToast("Image mobile supprimée.", "success");
            await loadSlides();
            setSaving(false);
        }
    };

    // ── Toggle active ────────────────────────────────────────────────────────
    const toggleActive = async (slide: Slide) => {
        const result = await updateHeroSlide(slide.id, { is_active: !slide.is_active });
        if ("success" in result && result.success) {
            setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, is_active: !s.is_active } : s));
        } else {
            showToast("Erreur", "error");
        }
    };

    // ── Delete slide ─────────────────────────────────────────────────────────
    const deleteSlide = async (id: string) => {
        if (!confirm("Supprimer cette slide définitivement ?")) return;
        const result = await deleteHeroSlide(id);
        if ("success" in result && result.success) {
            showToast("Slide supprimée.", "success");
            setSlides(prev => prev.filter(s => s.id !== id));
        } else {
            showToast("Erreur lors de la suppression", "error");
        }
    };

    // ── Reorder (move up/down) ───────────────────────────────────────────────
    const moveSlide = async (index: number, dir: "up" | "down") => {
        const newSlides = [...slides];
        const swapIdx = dir === "up" ? index - 1 : index + 1;
        if (swapIdx < 0 || swapIdx >= newSlides.length) return;
        [newSlides[index], newSlides[swapIdx]] = [newSlides[swapIdx], newSlides[index]];

        // Reassign display_order
        const reordered = newSlides.map((s, i) => ({ ...s, display_order: i + 1 }));
        setSlides(reordered);

        await reorderHeroSlides(reordered.map(s => ({ id: s.id, display_order: s.display_order })));
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
                <Loader2 style={{ width: 40, height: 40, color: "#E8A87C", animation: "spin 1s linear infinite" }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: "fixed", top: 24, right: 24, zIndex: 9999,
                    padding: "14px 22px", borderRadius: "12px",
                    backgroundColor: toast.type === "success" ? "#D1FAE5" : "#FEE2E2",
                    color: toast.type === "success" ? "#065F46" : "#991B1B",
                    fontWeight: 600, fontSize: "0.875rem",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    display: "flex", alignItems: "center", gap: "8px",
                }}>
                    {toast.type === "success" ? <Check style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <a href="/dashboard/cms" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7A7A7A", textDecoration: "none", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                    <ArrowLeft style={{ width: 16, height: 16 }} />
                    Retour au Dashboard CMS
                </a>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <SlidersHorizontal style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <div>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222" }}>Slider Hero</h1>
                            <p style={{ color: "#7A7A7A", fontSize: "0.875rem" }}>
                                {slides.length} slide{slides.length !== 1 ? "s" : ""} • Gestion séparée Desktop/Mobile
                            </p>
                        </div>
                    </div>
                    {activeTab === "desktop" && (
                        <button
                            onClick={() => openPicker("new", "desktop")}
                            style={btnPrimary}
                            disabled={saving}
                        >
                            <Plus style={{ width: 18, height: 18 }} />
                            Nouvelle slide
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: "flex",
                gap: "8px",
                borderBottom: "2px solid #E5E7EB",
                marginBottom: "2rem",
            }}>
                <button
                    onClick={() => setActiveTab("desktop")}
                    style={{
                        padding: "12px 24px",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        backgroundColor: "transparent",
                        border: "none",
                        borderBottom: activeTab === "desktop" ? "3px solid #E8A87C" : "3px solid transparent",
                        marginBottom: "-2px",
                        color: activeTab === "desktop" ? "#222" : "#6B7280",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                    }}
                >
                    <Monitor style={{ width: 18, height: 18, color: activeTab === "desktop" ? "#E8A87C" : "#6B7280" }} />
                    Version Desktop (16:9)
                </button>
                <button
                    onClick={() => setActiveTab("mobile")}
                    style={{
                        padding: "12px 24px",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        backgroundColor: "transparent",
                        border: "none",
                        borderBottom: activeTab === "mobile" ? "3px solid #8B5CF6" : "3px solid transparent",
                        marginBottom: "-2px",
                        color: activeTab === "mobile" ? "#222" : "#6B7280",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                    }}
                >
                    <Smartphone style={{ width: 18, height: 18, color: activeTab === "mobile" ? "#8B5CF6" : "#6B7280" }} />
                    Version Mobile (9:16)
                </button>
            </div>

            {/* Info Banner */}
            <div style={{
                padding: "1rem 1.25rem",
                backgroundColor: activeTab === "desktop" ? "#FFF9F5" : "#F5F3FF",
                border: activeTab === "desktop" ? "1px solid #FDDCBB" : "1px solid #DDD6FE",
                borderRadius: "12px",
                marginBottom: "1.5rem",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
            }}>
                <AlertCircle style={{ width: 18, height: 18, color: activeTab === "desktop" ? "#E8A87C" : "#8B5CF6", flexShrink: 0, marginTop: 2 }} />
                {activeTab === "desktop" ? (
                    <div style={{ fontSize: "0.8125rem", color: "#6B5440", lineHeight: 1.6 }}>
                        <strong>Version Desktop (Ratio Paysage 16:9) :</strong> C'est la configuration principale de vos slides. Vous pouvez ajouter, réordonner, masquer ou supprimer des slides ici.
                    </div>
                ) : (
                    <div style={{ fontSize: "0.8125rem", color: "#4C1D95", lineHeight: 1.6 }}>
                        <strong>Version Mobile (Ratio Portrait 9:16) :</strong> Associez une image verticale spécifique à chaque slide pour un rendu parfait sur mobile. Si aucune image mobile n'est sélectionnée, l'image desktop sera affichée par défaut.
                    </div>
                )}
            </div>

            {/* Empty State */}
            {slides.length === 0 && (
                <div style={{ ...cardStyle, padding: "4rem 2rem", textAlign: "center" }}>
                    <SlidersHorizontal style={{ width: 56, height: 56, color: "#D1D5DB", margin: "0 auto 1rem" }} />
                    <h3 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Aucune slide pour le moment</h3>
                    <p style={{ color: "#9CA3AF", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                        Ajoutez votre première slide pour gérer le slider hero du site.
                    </p>
                    <button onClick={() => openPicker("new", "desktop")} style={btnPrimary}>
                        <Plus style={{ width: 18, height: 18 }} />
                        Ajouter une slide
                    </button>
                </div>
            )}

            {/* Slides List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {slides.map((slide, index) => (
                    <SlideCard
                        key={slide.id}
                        slide={slide}
                        index={index}
                        total={slides.length}
                        saving={saving}
                        activeTab={activeTab}
                        onMoveUp={() => moveSlide(index, "up")}
                        onMoveDown={() => moveSlide(index, "down")}
                        onToggleActive={() => toggleActive(slide)}
                        onDelete={() => deleteSlide(slide.id)}
                        onPickDesktop={() => openPicker(slide.id, "desktop")}
                        onPickMobile={() => openPicker(slide.id, "mobile")}
                        onRemoveMobile={async () => {
                            setSaving(true);
                            await updateHeroSlide(slide.id, { mobile_media_id: null });
                            showToast("Image mobile supprimée.", "success");
                            await loadSlides();
                            setSaving(false);
                        }}
                    />
                ))}
            </div>

            {/* Media Picker Modal */}
            {showPicker && (
                <MediaPickerModal
                    mode={pickerMode}
                    mediaFiles={mediaFiles}
                    loading={loadingMedia}
                    selectedId={selectedMediaId}
                    onSelect={setSelectedMediaId}
                    onConfirm={confirmPicker}
                    onSkipMobile={pickerTargetSlide?.startsWith("new") ? skipMobile : undefined}
                    onClose={() => {
                        setShowPicker(false);
                        setPendingDesktopId(null);
                    }}
                />
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

// ─── SlideCard ────────────────────────────────────────────────────────────────

interface SlideCardProps {
    slide: Slide;
    index: number;
    total: number;
    saving: boolean;
    activeTab: "desktop" | "mobile";
    onMoveUp: () => void;
    onMoveDown: () => void;
    onToggleActive: () => void;
    onDelete: () => void;
    onPickDesktop: () => void;
    onPickMobile: () => void;
    onRemoveMobile: () => void;
}

function SlideCard({
    slide,
    index,
    total,
    saving,
    activeTab,
    onMoveUp,
    onMoveDown,
    onToggleActive,
    onDelete,
    onPickDesktop,
    onPickMobile,
    onRemoveMobile,
}: SlideCardProps) {
    const desktopUrl = slide.site_media?.url;
    const mobileUrl = slide.mobile_media?.url;
    const isDesktopTab = activeTab === "desktop";

    return (
        <div style={{
            ...cardStyle,
            border: `1px solid ${slide.is_active ? "#E5E7EB" : "#FECACA"}`,
            opacity: slide.is_active ? 1 : 0.75,
            transition: "all 0.2s ease",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
            {/* Top bar */}
            <div style={{
                padding: "0.875rem 1.25rem",
                backgroundColor: slide.is_active ? "#FAFAFA" : "#FFF5F5",
                borderBottom: "1px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                gap: "12px",
            }}>
                {isDesktopTab && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button
                            onClick={onMoveUp}
                            disabled={index === 0 || saving}
                            style={{ background: "none", border: "none", cursor: index === 0 ? "default" : "pointer", color: index === 0 ? "#D1D5DB" : "#6B7280", padding: 0 }}
                        >
                            <ChevronUp style={{ width: 16, height: 16 }} />
                        </button>
                        <button
                            onClick={onMoveDown}
                            disabled={index === total - 1 || saving}
                            style={{ background: "none", border: "none", cursor: index === total - 1 ? "default" : "pointer", color: index === total - 1 ? "#D1D5DB" : "#6B7280", padding: 0 }}
                        >
                            <ChevronDown style={{ width: 16, height: 16 }} />
                        </button>
                    </div>
                )}

                <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    backgroundColor: isDesktopTab ? "#E8A87C" : "#8B5CF6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "0.75rem", color: "#FFF",
                    flexShrink: 0,
                }}>
                    {slide.display_order}
                </div>

                <span style={{ flex: 1, fontWeight: 600, fontSize: "0.9375rem", color: "#222" }}>
                    Slide {slide.display_order}
                    {!slide.is_active && <span style={{ marginLeft: 8, fontSize: "0.75rem", padding: "2px 8px", backgroundColor: "#FEE2E2", color: "#DC2626", borderRadius: "4px", fontWeight: 500 }}>Masquée</span>}
                </span>

                {isDesktopTab ? (
                    <div style={{ display: "flex", gap: 6 }}>
                        <button
                            onClick={onToggleActive}
                            style={btnGhost}
                            title={slide.is_active ? "Masquer la slide" : "Afficher la slide"}
                        >
                            {slide.is_active
                                ? <Eye style={{ width: 15, height: 15, color: "#10B981" }} />
                                : <EyeOff style={{ width: 15, height: 15, color: "#EF4444" }} />}
                            {slide.is_active ? "Visible" : "Masquée"}
                        </button>
                        <button
                            onClick={onDelete}
                            style={{ ...btnGhost, color: "#EF4444", borderColor: "#FECACA" }}
                            title="Supprimer"
                        >
                            <Trash2 style={{ width: 15, height: 15 }} />
                        </button>
                    </div>
                ) : (
                    <span style={{ fontSize: "0.75rem", padding: "3px 8px", backgroundColor: slide.is_active ? "#D1FAE5" : "#FEE2E2", color: slide.is_active ? "#065F46" : "#991B1B", borderRadius: "6px", fontWeight: 600 }}>
                        {slide.is_active ? "Visible en ligne" : "Masquée"}
                    </span>
                )}
            </div>

            {/* Content area: changes based on activeTab */}
            {isDesktopTab ? (
                /* ─── DESKTOP VIEW ─── */
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "1.5rem", padding: "1.25rem" }}>
                    {/* Left details */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Configuration Desktop</h4>
                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280", lineHeight: 1.4 }}>
                                Cette image s'affichera sur les écrans d'ordinateurs et de tablettes au ratio paysage (16:9). C'est l'image par défaut du slider.
                            </p>
                        </div>
                        
                        {/* Alt text */}
                        <div style={{ marginTop: "1rem" }}>
                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#4B5563", marginBottom: "4px" }}>Texte alternatif (SEO) :</label>
                            <div style={{ padding: "8px 12px", backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "6px", fontSize: "0.75rem", color: "#374151" }}>
                                {slide.alt_text || <em>Aucun texte alternatif défini.</em>}
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div>
                        {desktopUrl ? (
                            <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "16/9", marginBottom: "0.75rem", cursor: "pointer", border: "1px solid #E5E7EB" }} onClick={onPickDesktop}>
                                <img src={desktopUrl} alt={slide.alt_text || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                <div style={{
                                    position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "background-color 0.2s ease",
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.35)")}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)")}
                                >
                                    <Image style={{ width: 24, height: 24, color: "#FFF", opacity: 0 }} />
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                aspectRatio: "16/9",
                                backgroundColor: "#F9FAFB",
                                border: "2px dashed #D1D5DB",
                                borderRadius: "10px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                color: "#9CA3AF",
                                marginBottom: "0.75rem",
                            }}>
                                <Monitor style={{ width: 28, height: 28 }} />
                                <span style={{ fontSize: "0.75rem" }}>Aucune image sélectionnée</span>
                            </div>
                        )}

                        <button onClick={onPickDesktop} style={{
                            ...btnGhost,
                            width: "100%",
                            justifyContent: "center",
                            borderColor: "#E8A87C",
                            color: "#E8A87C",
                            fontWeight: 600,
                            backgroundColor: "#FFF9F5",
                        }}>
                            <Image style={{ width: 14, height: 14 }} />
                            {desktopUrl ? "Changer l'image Desktop" : "Choisir une image Desktop"}
                        </button>
                    </div>
                </div>
            ) : (
                /* ─── MOBILE VIEW ─── */
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", padding: "1.25rem" }}>
                    
                    {/* Left: Desktop Reference */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid #F3F4F6", paddingRight: "1.5rem" }}>
                        <div>
                            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Image Desktop de Référence</h4>
                            <p style={{ margin: "0 0 1rem 0", fontSize: "0.75rem", color: "#6B7280", lineHeight: 1.4 }}>
                                Visualisez l'image desktop associée. C'est l'image qui sera remplacée sur mobile (portrait).
                            </p>
                        </div>
                        {desktopUrl && (
                            <div style={{ borderRadius: "8px", overflow: "hidden", aspectRatio: "16/9", border: "1px solid #E5E7EB", opacity: 0.8 }}>
                                <img src={desktopUrl} alt="Référence" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                        )}
                        <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: "8px" }}>
                            Ratio de référence : Paysage 16:9
                        </div>
                    </div>

                    {/* Right: Mobile Image Management */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#374151" }}>Image Mobile Dédiée</span>
                            <span style={{ fontSize: "0.6875rem", color: "#9CA3AF" }}>Portrait 9:16</span>
                        </div>

                        {mobileUrl ? (
                            <>
                                <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "9/16", height: 160, alignSelf: "center", border: "1px solid #E5E7EB", cursor: "pointer" }} onClick={onPickMobile}>
                                    <img src={mobileUrl} alt={slide.alt_text || ""} style={{ height: "100%", width: "auto", maxHeight: 160, display: "block", objectFit: "cover" }} />
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button onClick={onPickMobile} style={{
                                        ...btnGhost,
                                        flex: 1,
                                        justifyContent: "center",
                                        borderColor: "#8B5CF6",
                                        color: "#8B5CF6",
                                        fontWeight: 600,
                                        backgroundColor: "#F5F3FF",
                                    }}>
                                        <Smartphone style={{ width: 14, height: 14 }} />
                                        Remplacer
                                    </button>
                                    <button onClick={onRemoveMobile} style={{
                                        ...btnGhost,
                                        borderColor: "#FECACA",
                                        color: "#EF4444",
                                    }} title="Supprimer l'image mobile">
                                        <Trash2 style={{ width: 14, height: 14 }} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    aspectRatio: "9/16",
                                    height: 120,
                                    alignSelf: "center",
                                    backgroundColor: "#FFFBEB",
                                    border: "2px dashed #FCD34D",
                                    borderRadius: "10px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    color: "#D97706",
                                    padding: "0.5rem",
                                    width: "100%",
                                }}>
                                    <Smartphone style={{ width: 18, height: 18 }} />
                                    <span style={{ fontSize: "0.7rem", textAlign: "center", fontWeight: 500, lineHeight: 1.3 }}>
                                        Mode repli actif<br />
                                        <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "#B45309" }}>Utilise l'image desktop</span>
                                    </span>
                                </div>
                                <button onClick={onPickMobile} style={{
                                    ...btnGhost,
                                    width: "100%",
                                    justifyContent: "center",
                                    borderColor: "#8B5CF6",
                                    color: "#8B5CF6",
                                    fontWeight: 600,
                                    backgroundColor: "#F5F3FF",
                                }}>
                                    <Smartphone style={{ width: 14, height: 14 }} />
                                    Définir l'image mobile
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── MediaPickerModal ─────────────────────────────────────────────────────────

interface MediaPickerModalProps {
    mode: ModalMode;
    mediaFiles: any[];
    loading: boolean;
    selectedId: string | null;
    onSelect: (id: string) => void;
    onConfirm: () => void;
    onSkipMobile?: () => void;
    onClose: () => void;
}

function MediaPickerModal({ mode, mediaFiles, loading, selectedId, onSelect, onConfirm, onSkipMobile, onClose }: MediaPickerModalProps) {
    const isDesktop = mode === "desktop";
    const accentColor = isDesktop ? "#E8A87C" : "#8B5CF6";

    return (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
            <div style={{ backgroundColor: "#FFF", borderRadius: "20px", width: "100%", maxWidth: "860px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Header */}
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {isDesktop
                            ? <Monitor style={{ width: 20, height: 20, color: accentColor }} />
                            : <Smartphone style={{ width: 20, height: 20, color: accentColor }} />}
                        <h3 style={{ fontWeight: 700, color: "#111", fontSize: "1.125rem" }}>
                            Choisir une image {isDesktop ? "Desktop (Paysage)" : "Mobile (Portrait)"}
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                        <X style={{ width: 22, height: 22, color: "#6B7280" }} />
                    </button>
                </div>

                {/* Tip */}
                <div style={{ padding: "0.75rem 1.5rem", backgroundColor: isDesktop ? "#FFF9F5" : "#F5F3FF", borderBottom: "1px solid #E5E7EB", fontSize: "0.8125rem", color: isDesktop ? "#78450F" : "#4C1D95" }}>
                    {isDesktop
                        ? "💡 Privilégiez une image en format <strong>paysage (ratio 16:9 ou 4:3)</strong> pour un rendu optimal sur desktop et tablette."
                        : "💡 Choisissez une image en format <strong>portrait (ratio 9:16)</strong> pour occuper tout l'écran mobile. Si vous n'en avez pas, ignorez cette étape."}
                </div>

                {/* Grid */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
                            <Loader2 style={{ width: 32, height: 32, color: accentColor, animation: "spin 1s linear infinite" }} />
                        </div>
                    ) : mediaFiles.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#9CA3AF", padding: "3rem" }}>
                            <Image style={{ width: 40, height: 40, margin: "0 auto 0.75rem", color: "#D1D5DB" }} />
                            <p>Aucun fichier dans la médiathèque</p>
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: isDesktop
                                ? "repeat(auto-fill, minmax(180px, 1fr))"
                                : "repeat(auto-fill, minmax(110px, 1fr))",
                            gap: "0.75rem",
                        }}>
                            {mediaFiles.map(file => {
                                const selected = selectedId === file.id;
                                return (
                                    <div
                                        key={file.id}
                                        onClick={() => onSelect(file.id)}
                                        style={{
                                            position: "relative",
                                            borderRadius: "10px",
                                            overflow: "hidden",
                                            border: selected ? `3px solid ${accentColor}` : "2px solid #E5E7EB",
                                            cursor: "pointer",
                                            transition: "border-color 0.15s ease",
                                            aspectRatio: isDesktop ? "16/9" : "9/16",
                                        }}
                                    >
                                        <img
                                            src={file.url}
                                            alt={file.filename}
                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                        />
                                        {selected && (
                                            <div style={{
                                                position: "absolute", top: 6, right: 6,
                                                width: 24, height: 24, borderRadius: "50%",
                                                backgroundColor: accentColor,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <Check style={{ width: 14, height: 14, color: "#FFF" }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                    <div>
                        {onSkipMobile && (
                            <button onClick={onSkipMobile} style={{ ...btnGhost, fontSize: "0.8125rem" }}>
                                Ignorer l&apos;image mobile
                            </button>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button onClick={onClose} style={btnGhost}>
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!selectedId}
                            style={{
                                ...btnPrimary,
                                backgroundColor: accentColor,
                                opacity: selectedId ? 1 : 0.45,
                                cursor: selectedId ? "pointer" : "not-allowed",
                            }}
                        >
                            <Check style={{ width: 16, height: 16 }} />
                            Confirmer la sélection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
