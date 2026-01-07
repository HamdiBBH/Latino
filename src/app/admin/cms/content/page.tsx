"use client";

import { useState } from "react";
import { rewriteSection } from "@/app/actions/ai";
import {
    Type,
    ArrowLeft,
    Save,
    Check,
    ChevronDown,
    Eye,
    RefreshCw,
    Smartphone,
    Monitor,
    Image,
    Layout,
    Star,
    Info,
    FileText,
    Sparkles
} from "lucide-react";

interface ContentField {
    id: string;
    sectionName: string;
    fieldName: string;
    fieldType: "text" | "richtext" | "textarea";
    label: string;
    content: string;
    placeholder?: string;
}

interface Section {
    name: string;
    label: string;
    icon: React.ElementType;
}

const sections: Section[] = [
    { name: "hero", label: "Hero", icon: Image },
    { name: "about", label: "À propos", icon: Info },
    { name: "services", label: "Services", icon: Star },
    { name: "cta", label: "Call to Action", icon: Layout },
];

// Mock content data
const initialContent: ContentField[] = [
    { id: "1", sectionName: "hero", fieldName: "title_light", fieldType: "text", label: "Titre (léger)", content: "Bienvenue au", placeholder: "Première ligne du titre" },
    { id: "2", sectionName: "hero", fieldName: "title_bold", fieldType: "text", label: "Titre (gras)", content: "Latino Coucou Beach.", placeholder: "Deuxième ligne du titre" },
    { id: "3", sectionName: "hero", fieldName: "subtitle", fieldType: "textarea", label: "Sous-titre", content: "L'expérience beach club ultime sous le soleil méditerranéen", placeholder: "Description courte" },
    { id: "4", sectionName: "hero", fieldName: "tags", fieldType: "text", label: "Tags (séparés par virgule)", content: "Beach Club, Restaurant, Cocktails, DJ Sets, Sunset, Plage Privée", placeholder: "Tag1, Tag2, Tag3" },
    { id: "5", sectionName: "about", fieldName: "label", fieldType: "text", label: "Label", content: "Notre Histoire", placeholder: "Label au-dessus du titre" },
    { id: "6", sectionName: "about", fieldName: "title_light", fieldType: "text", label: "Titre (léger)", content: "Un paradis", placeholder: "Première ligne" },
    { id: "7", sectionName: "about", fieldName: "title_bold", fieldType: "text", label: "Titre (gras)", content: "au bord de l'eau", placeholder: "Deuxième ligne" },
    { id: "8", sectionName: "about", fieldName: "description", fieldType: "richtext", label: "Description", content: "Niché sur les plus belles plages de la Méditerranée, Latino Coucou Beach vous offre une expérience unique alliant gastronomie raffinée, cocktails signature et ambiance festive.", placeholder: "Description complète" },
    { id: "9", sectionName: "services", fieldName: "label", fieldType: "text", label: "Label", content: "Ce que nous offrons", placeholder: "Label" },
    { id: "10", sectionName: "services", fieldName: "title_light", fieldType: "text", label: "Titre (léger)", content: "Nos", placeholder: "Première ligne" },
    { id: "11", sectionName: "services", fieldName: "title_bold", fieldType: "text", label: "Titre (gras)", content: "Services", placeholder: "Deuxième ligne" },
    { id: "12", sectionName: "cta", fieldName: "label", fieldType: "text", label: "Label", content: "Réservation", placeholder: "Label" },
    { id: "13", sectionName: "cta", fieldName: "title_light", fieldType: "text", label: "Titre (léger)", content: "Réservez votre", placeholder: "Première ligne" },
    { id: "14", sectionName: "cta", fieldName: "title_bold", fieldType: "text", label: "Titre (gras)", content: "Moment de Paradis", placeholder: "Deuxième ligne" },
];

export default function ContentEditorPage() {
    const [content, setContent] = useState<ContentField[]>(initialContent);
    const [selectedSection, setSelectedSection] = useState<string>("hero");
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
    const [showDropdown, setShowDropdown] = useState(false);

    // AI State
    const [isRewritingSection, setIsRewritingSection] = useState(false);

    const filteredContent = content.filter(c => c.sectionName === selectedSection);
    const currentSection = sections.find(s => s.name === selectedSection);
    const CurrentIcon = currentSection?.icon || FileText;

    const updateContent = (id: string, newContent: string) => {
        setContent(content.map(c =>
            c.id === id ? { ...c, content: newContent } : c
        ));
        setHasChanges(true);
        setSaved(false);
    };

    const handleSectionRewrite = async () => {
        if (!currentSection) return;
        setIsRewritingSection(true);

        try {
            // Prepare fields for rewrite
            const fieldsToRewrite = filteredContent.map(f => ({
                id: f.id,
                label: f.label,
                content: f.content
            }));

            const result = await rewriteSection(currentSection.label, fieldsToRewrite);

            if (result.success && result.content) {
                // Update all fields at once
                const newContentState = content.map(c => {
                    if (c.sectionName === selectedSection && result.content[c.id]) {
                        return { ...c, content: result.content[c.id] };
                    }
                    return c;
                });
                setContent(newContentState);
                setHasChanges(true);
                setSaved(false);
            } else {
                alert(result.error || "Erreur de réécriture");
            }
        } catch (e) {
            console.error(e);
            alert("Erreur inattendue");
        }
        setIsRewritingSection(false);
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
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
                        Retour au CMS
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Type style={{ width: 32, height: 32, color: "#10B981" }} />
                        <div>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                                Éditeur de Contenu
                            </h1>
                            <p style={{ color: "#7A7A7A" }}>
                                Modifiez les textes de chaque section avec prévisualisation en direct
                            </p>
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    {/* Device Toggle */}
                    <div style={{ display: "flex", backgroundColor: "#F3F4F6", borderRadius: "10px", padding: "4px" }}>
                        <button
                            onClick={() => setPreviewDevice("desktop")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: previewDevice === "desktop" ? "#FFF" : "transparent",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                boxShadow: previewDevice === "desktop" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                            }}
                        >
                            <Monitor style={{ width: 18, height: 18, color: previewDevice === "desktop" ? "#222" : "#9CA3AF" }} />
                        </button>
                        <button
                            onClick={() => setPreviewDevice("mobile")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: previewDevice === "mobile" ? "#FFF" : "transparent",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                boxShadow: previewDevice === "mobile" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                            }}
                        >
                            <Smartphone style={{ width: 18, height: 18, color: previewDevice === "mobile" ? "#222" : "#9CA3AF" }} />
                        </button>
                    </div>

                    {/* Save Button */}
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
                        }}
                    >
                        {saving ? (
                            <><RefreshCw style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />Enregistrement...</>
                        ) : saved ? (
                            <><Check style={{ width: 18, height: 18 }} />Enregistré !</>
                        ) : (
                            <><Save style={{ width: 18, height: 18 }} />Enregistrer</>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "1.5rem", flex: 1, minHeight: 0 }}>
                {/* Editor Panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Section Selector */}
                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "14px 16px",
                                backgroundColor: "#FFF",
                                border: "1px solid #E5E7EB",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <CurrentIcon style={{ width: 18, height: 18, color: "#10B981" }} />
                                <span style={{ fontWeight: 600, color: "#222" }}>{currentSection?.label}</span>
                            </span>
                            <ChevronDown style={{ width: 18, height: 18, color: "#9CA3AF", transform: showDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                        </button>
                        {showDropdown && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    right: 0,
                                    marginTop: "4px",
                                    backgroundColor: "#FFF",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "12px",
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                    zIndex: 50,
                                    overflow: "hidden",
                                }}
                            >
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <button
                                            key={section.name}
                                            onClick={() => {
                                                setSelectedSection(section.name);
                                                setShowDropdown(false);
                                            }}
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                padding: "12px 16px",
                                                backgroundColor: selectedSection === section.name ? "#F0FDF4" : "#FFF",
                                                border: "none",
                                                borderBottom: "1px solid #F3F4F6",
                                                cursor: "pointer",
                                                textAlign: "left",
                                            }}
                                        >
                                            <Icon style={{ width: 18, height: 18, color: selectedSection === section.name ? "#10B981" : "#9CA3AF" }} />
                                            <span style={{ fontWeight: selectedSection === section.name ? 600 : 400, color: "#222" }}>{section.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Global Rewrite Button */}
                    <button
                        onClick={handleSectionRewrite}
                        disabled={isRewritingSection}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            padding: "12px",
                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                            color: "#6366f1",
                            border: "1px dashed #6366f1",
                            borderRadius: "12px",
                            cursor: isRewritingSection ? "wait" : "pointer",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            marginBottom: "1rem",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => !isRewritingSection && (e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.2)")}
                        onMouseLeave={(e) => !isRewritingSection && (e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.1)")}
                    >
                        {isRewritingSection ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        {isRewritingSection ? "Réécriture de la section en cours..." : "Réécrire toute la section avec l'IA"}
                    </button>

                    {/* Content Fields */}
                    <div
                        style={{
                            flex: 1,
                            backgroundColor: "#FFF",
                            borderRadius: "16px",
                            border: "1px solid #E5E7EB",
                            padding: "1.5rem",
                            overflowY: "auto",
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {filteredContent.map((field) => (
                                <div key={field.id}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                        <label
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                                color: "#374151",
                                            }}
                                        >
                                            {field.label}
                                        </label>

                                    </div>
                                    {field.fieldType === "textarea" || field.fieldType === "richtext" ? (
                                        <textarea
                                            value={field.content}
                                            onChange={(e) => updateContent(field.id, e.target.value)}
                                            placeholder={field.placeholder}
                                            rows={4}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                fontSize: "0.875rem",
                                                border: "1px solid #E5E7EB",
                                                borderRadius: "10px",
                                                resize: "vertical",
                                                outline: "none",
                                                transition: "border-color 0.2s",
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = "#10B981"}
                                            onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={field.content}
                                            onChange={(e) => updateContent(field.id, e.target.value)}
                                            placeholder={field.placeholder}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                fontSize: "0.875rem",
                                                border: "1px solid #E5E7EB",
                                                borderRadius: "10px",
                                                outline: "none",
                                                transition: "border-color 0.2s",
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = "#10B981"}
                                            onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div
                    style={{
                        backgroundColor: "#1F2937",
                        borderRadius: "16px",
                        padding: "1rem",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9CA3AF", fontSize: "0.875rem" }}>
                            <Eye style={{ width: 16, height: 16 }} />
                            Prévisualisation en direct
                        </span>
                        <div style={{ display: "flex", gap: "6px" }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#EF4444" }} />
                            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#10B981" }} />
                        </div>
                    </div>
                    <div
                        style={{
                            flex: 1,
                            backgroundColor: "#FFF",
                            borderRadius: "12px",
                            overflow: "hidden",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: previewDevice === "mobile" ? "flex-start" : "stretch",
                            padding: previewDevice === "mobile" ? "1rem" : 0,
                        }}
                    >
                        <div
                            style={{
                                width: previewDevice === "mobile" ? "375px" : "100%",
                                height: "100%",
                                backgroundColor: "#F9F5F0",
                                borderRadius: previewDevice === "mobile" ? "24px" : 0,
                                overflow: "auto",
                                boxShadow: previewDevice === "mobile" ? "0 25px 50px rgba(0,0,0,0.25)" : "none",
                            }}
                        >
                            {/* Preview Content based on selected section */}
                            {selectedSection === "hero" && (
                                <div
                                    style={{
                                        minHeight: "400px",
                                        background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%), url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800)",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "2rem",
                                    }}
                                >
                                    <div style={{ textAlign: "center", color: "#FFF" }}>
                                        <h1 style={{ fontSize: previewDevice === "mobile" ? "2rem" : "3rem", marginBottom: "1rem" }}>
                                            <span style={{ display: "block", fontWeight: 200 }}>
                                                {filteredContent.find(c => c.fieldName === "title_light")?.content}
                                            </span>
                                            <span style={{ display: "block", fontWeight: 600 }}>
                                                {filteredContent.find(c => c.fieldName === "title_bold")?.content}
                                            </span>
                                        </h1>
                                        <p style={{ fontSize: "1rem", opacity: 0.9, marginBottom: "1.5rem" }}>
                                            {filteredContent.find(c => c.fieldName === "subtitle")?.content}
                                        </p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                                            {filteredContent.find(c => c.fieldName === "tags")?.content.split(",").map((tag, i) => (
                                                <span key={i} style={{ padding: "8px 16px", border: "1px solid rgba(255,255,255,0.5)", borderRadius: "100px", fontSize: "0.75rem" }}>
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selectedSection === "about" && (
                                <div style={{ padding: "3rem 2rem", backgroundColor: "#F9F5F0" }}>
                                    <span style={{ color: "#E8A87C", fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "2px" }}>
                                        {filteredContent.find(c => c.fieldName === "label")?.content}
                                    </span>
                                    <h2 style={{ fontSize: previewDevice === "mobile" ? "2rem" : "2.5rem", marginTop: "0.5rem", marginBottom: "1rem" }}>
                                        <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>
                                            {filteredContent.find(c => c.fieldName === "title_light")?.content}
                                        </span>
                                        <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>
                                            {filteredContent.find(c => c.fieldName === "title_bold")?.content}
                                        </span>
                                    </h2>
                                    <p style={{ color: "#7A7A7A", lineHeight: 1.7 }}>
                                        {filteredContent.find(c => c.fieldName === "description")?.content}
                                    </p>
                                </div>
                            )}
                            {selectedSection === "services" && (
                                <div style={{ padding: "3rem 2rem", backgroundColor: "#FFF", textAlign: "center" }}>
                                    <span style={{ color: "#E8A87C", fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "2px" }}>
                                        {filteredContent.find(c => c.fieldName === "label")?.content}
                                    </span>
                                    <h2 style={{ fontSize: previewDevice === "mobile" ? "2rem" : "2.5rem", marginTop: "0.5rem" }}>
                                        <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>
                                            {filteredContent.find(c => c.fieldName === "title_light")?.content}
                                        </span>
                                        <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>
                                            {filteredContent.find(c => c.fieldName === "title_bold")?.content}
                                        </span>
                                    </h2>
                                </div>
                            )}
                            {selectedSection === "cta" && (
                                <div
                                    style={{
                                        minHeight: "300px",
                                        background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%), url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800)",
                                        backgroundSize: "cover",
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "3rem 2rem",
                                    }}
                                >
                                    <div>
                                        <span style={{ color: "#E8A87C", fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "2px" }}>
                                            {filteredContent.find(c => c.fieldName === "label")?.content}
                                        </span>
                                        <h2 style={{ fontSize: previewDevice === "mobile" ? "2rem" : "2.5rem", marginTop: "0.5rem", color: "#FFF" }}>
                                            <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>
                                                {filteredContent.find(c => c.fieldName === "title_light")?.content}
                                            </span>
                                            <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>
                                                {filteredContent.find(c => c.fieldName === "title_bold")?.content}
                                            </span>
                                        </h2>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
