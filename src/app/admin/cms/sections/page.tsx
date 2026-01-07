"use client";

import { useState, useEffect } from "react";
import {
    Layers,
    GripVertical,
    Eye,
    EyeOff,
    Save,
    ArrowLeft,
    Image,
    Calendar,
    Info,
    Star,
    Package,
    Video,
    Images,
    MessageCircle,
    CalendarDays,
    Handshake,
    Phone,
    MapPin,
    Mail,
    Layout,
    Check,
    Loader2
} from "lucide-react";
import { getSections, updateSectionOrder, toggleSectionActive } from "@/app/actions/cms";

interface Section {
    id: string;
    name: string;
    label: string;
    description: string;
    is_active: boolean;
    display_order: number;
    icon: string;
}

const iconMap: Record<string, React.ElementType> = {
    "image": Image,
    "calendar": Calendar,
    "info": Info,
    "star": Star,
    "package": Package,
    "video": Video,
    "images": Images,
    "message-circle": MessageCircle,
    "calendar-days": CalendarDays,
    "handshake": Handshake,
    "phone": Phone,
    "map-pin": MapPin,
    "mail": Mail,
    "layout": Layout,
};

export default function SectionsManagerPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    useEffect(() => {
        loadSections();
    }, []);

    const loadSections = async () => {
        setLoading(true);
        const data = await getSections();
        setSections(data as Section[]);
        setLoading(false);
    };

    const toggleSection = async (id: string) => {
        const section = sections.find(s => s.id === id);
        if (!section) return;

        // Optimistic update
        setSections(sections.map(s =>
            s.id === id ? { ...s, is_active: !s.is_active } : s
        ));

        const result = await toggleSectionActive(id, !section.is_active);
        if (!result.success) {
            // Revert on error
            setSections(sections.map(s =>
                s.id === id ? { ...s, is_active: section.is_active } : s
            ));
            alert("Erreur: " + result.error);
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItem(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedItem || draggedItem === targetId) return;

        const draggedIndex = sections.findIndex(s => s.id === draggedItem);
        const targetIndex = sections.findIndex(s => s.id === targetId);

        const newSections = [...sections];
        const [removed] = newSections.splice(draggedIndex, 1);
        newSections.splice(targetIndex, 0, removed);

        const reordered = newSections.map((s, index) => ({
            ...s,
            display_order: index + 1,
        }));

        setSections(reordered);
        setDraggedItem(null);
        setHasChanges(true);
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);

        const updates = sections.map(s => ({
            id: s.id,
            display_order: s.display_order,
        }));

        const result = await updateSectionOrder(updates);

        setSaving(false);

        if (result.success) {
            setHasChanges(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            alert("Erreur: " + result.error);
        }
    };

    const activeCount = sections.filter(s => s.is_active).length;

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
                <Loader2 style={{ width: 32, height: 32, color: "#3B82F6", animation: "spin 1s linear infinite" }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <a
                        href="/admin/cms"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            color: "#7A7A7A",
                            textDecoration: "none",
                            fontSize: "0.875rem",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                        Retour au Dashboard
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Layers style={{ width: 32, height: 32, color: "#3B82F6" }} />
                        <div>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                                Gestion des Sections
                            </h1>
                            <p style={{ color: "#7A7A7A" }}>
                                {activeCount}/{sections.length} sections actives • Glissez pour réorganiser
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        backgroundColor: saved ? "#10B981" : hasChanges ? "#222222" : "#E5E7EB",
                        color: hasChanges || saved ? "#FFF" : "#9CA3AF",
                        border: "none",
                        borderRadius: "100px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: hasChanges ? "pointer" : "not-allowed",
                        transition: "all 0.3s ease",
                    }}
                >
                    {saving ? (
                        <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />Enregistrement...</>
                    ) : saved ? (
                        <><Check style={{ width: 18, height: 18 }} />Enregistré !</>
                    ) : (
                        <><Save style={{ width: 18, height: 18 }} />Enregistrer les modifications</>
                    )}
                </button>
            </div>

            {/* Info Banner */}
            <div
                style={{
                    backgroundColor: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    borderRadius: "12px",
                    padding: "1rem 1.5rem",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}
            >
                <Info style={{ width: 20, height: 20, color: "#3B82F6", flexShrink: 0 }} />
                <p style={{ fontSize: "0.875rem", color: "#1E40AF" }}>
                    Les sections désactivées ne seront pas affichées sur le site. L&apos;ordre des sections détermine leur position sur la page.
                </p>
            </div>

            {/* Sections List */}
            <div
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "20px",
                    border: "1px solid #E5E7EB",
                    overflow: "hidden",
                }}
            >
                {sections.map((section) => {
                    const IconComponent = iconMap[section.icon] || Layers;
                    return (
                        <div
                            key={section.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, section.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, section.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1rem 1.5rem",
                                borderBottom: "1px solid #F3F4F6",
                                backgroundColor: draggedItem === section.id ? "#F9FAFB" : "#FFF",
                                opacity: section.is_active ? 1 : 0.6,
                                transition: "all 0.2s ease",
                                cursor: "grab",
                            }}
                        >
                            <GripVertical style={{ width: 20, height: 20, color: "#9CA3AF", flexShrink: 0 }} />

                            <div
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "8px",
                                    backgroundColor: "#F3F4F6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#6B7280",
                                    flexShrink: 0,
                                }}
                            >
                                {section.display_order}
                            </div>

                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    backgroundColor: section.is_active ? "#3B82F620" : "#F3F4F6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <IconComponent style={{ width: 20, height: 20, color: section.is_active ? "#3B82F6" : "#9CA3AF" }} />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontWeight: 600, color: "#222222", marginBottom: "2px" }}>
                                    {section.label}
                                </h4>
                                <p style={{ fontSize: "0.875rem", color: "#7A7A7A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {section.description}
                                </p>
                            </div>

                            <div
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: "100px",
                                    backgroundColor: section.is_active ? "#DCFCE7" : "#FEE2E2",
                                    color: section.is_active ? "#166534" : "#B91C1C",
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    flexShrink: 0,
                                }}
                            >
                                {section.is_active ? "Actif" : "Inactif"}
                            </div>

                            <button
                                onClick={() => toggleSection(section.id)}
                                style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "12px",
                                    border: "1px solid #E5E7EB",
                                    backgroundColor: section.is_active ? "#FFF" : "#F9FAFB",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    flexShrink: 0,
                                }}
                            >
                                {section.is_active ? (
                                    <Eye style={{ width: 20, height: 20, color: "#10B981" }} />
                                ) : (
                                    <EyeOff style={{ width: 20, height: 20, color: "#9CA3AF" }} />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div
                style={{
                    marginTop: "1.5rem",
                    padding: "1rem 1.5rem",
                    backgroundColor: "#FEF3C7",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}
            >
                <Eye style={{ width: 20, height: 20, color: "#92400E", flexShrink: 0 }} />
                <p style={{ fontSize: "0.875rem", color: "#92400E" }}>
                    <strong>Prévisualisation :</strong> Les changements de visibilité sont enregistrés immédiatement. L&apos;ordre nécessite de cliquer sur "Enregistrer".
                </p>
            </div>
        </div>
    );
}
