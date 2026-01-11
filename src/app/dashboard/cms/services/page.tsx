"use client";

import { useState, useEffect } from "react";
import { getServices, createService, updateService, deleteService } from "@/app/actions/cms";
import { rewriteSection } from "@/app/actions/ai";
import { Plus, Trash2, Edit2, ArrowLeft, Star, Sun, Umbrella, Music, Utensils, Waves, Palmtree, Wind, MapPin, Coffee, GlassWater, Sparkles, Loader2 } from "lucide-react";
import * as Icons from "lucide-react";

interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    is_active: boolean;
}

const IconPicker = ({ selected, onSelect, onClose }: { selected: string, onSelect: (icon: string) => void, onClose: () => void }) => {
    const icons = ["Star", "Sun", "Umbrella", "Music", "Utensils", "Waves", "Palmtree", "Wind", "MapPin", "Coffee", "GlassWater"];

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100
        }} onClick={onClose}>
            <div style={{
                backgroundColor: "#FFF", borderRadius: "12px", padding: "20px", width: "300px",
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px"
            }} onClick={e => e.stopPropagation()}>
                {icons.map(name => {
                    const Icon = (Icons as any)[name];
                    return (
                        <button key={name} onClick={() => { onSelect(name); onClose(); }} style={{
                            padding: "10px", borderRadius: "8px", border: selected === name ? "2px solid #10B981" : "1px solid #E5E7EB",
                            backgroundColor: selected === name ? "#F0FDF4" : "#FFF", cursor: "pointer", display: "flex", justifyContent: "center"
                        }}>
                            {Icon && <Icon size={24} />}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("Star");

    // AI State
    const [isRewriting, setIsRewriting] = useState(false);

    const handleAiRewrite = async () => {
        if (!title && !description) return;

        setIsRewriting(true);
        try {
            const fields = [
                { id: "title", label: "Titre du service", content: title },
                { id: "description", label: "Description courte et attractive", content: description }
            ];

            const result = await rewriteSection("Détail Service (Latino Coucou Beach)", fields);

            if (result.success && result.content) {
                if (result.content.title) setTitle(result.content.title);
                if (result.content.description) setDescription(result.content.description);
            } else {
                alert("Erreur lors de la réécriture IA");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur inattendue");
        } finally {
            setIsRewriting(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        const data = await getServices();
        setServices(data);
    };

    const handleEdit = (service: Service) => {
        setEditingId(service.id);
        setTitle(service.title);
        setDescription(service.description || "");
        setIcon(service.icon || "Star");
        setIsAdding(true);
    };

    const handleSave = async () => {
        const data = { title, description, icon };

        if (editingId) {
            await updateService(editingId, data);
        } else {
            await createService(data);
        }

        setIsAdding(false);
        setEditingId(null);
        resetForm();
        loadServices();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
            await deleteService(id);
            loadServices();
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setIcon("Star");
    };

    // Helper to render dynamic icon safely
    const renderIcon = (iconName: string) => {
        const Icon = (Icons as any)[iconName] || Star;
        return <Icon size={20} />;
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <a href="/dashboard/cms" style={{ color: "#6B7280" }}><ArrowLeft /></a>
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Services</h1>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "#222", color: "#FFF", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}
                >
                    <Plus size={18} /> Ajouter un service
                </button>
            </div>

            {isAdding && (
                <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "12px", border: "1px solid #E5E7EB", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h2 style={{ margin: 0 }}>{editingId ? "Modifier le service" : "Nouveau service"}</h2>
                        <button
                            onClick={handleAiRewrite}
                            disabled={isRewriting || (!title && !description)}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                                color: "#FFF", padding: "8px 16px", borderRadius: "100px",
                                border: "none", cursor: isRewriting ? "wait" : "pointer",
                                fontSize: "0.875rem", fontWeight: 500
                            }}
                        >
                            {isRewriting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {isRewriting ? "Réécriture..." : "Améliorer avec IA"}
                        </button>
                    </div>
                    <div style={{ display: "grid", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Icône</label>
                            <button
                                onClick={() => setShowIconPicker(true)}
                                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "6px", background: "#FFF", cursor: "pointer" }}
                            >
                                {renderIcon(icon)} <span>{icon}</span>
                            </button>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Titre</label>
                            <input
                                type="text" value={title} onChange={e => setTitle(e.target.value)}
                                style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "6px" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Description</label>
                            <textarea
                                value={description} onChange={e => setDescription(e.target.value)} rows={3}
                                style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "6px" }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            <button onClick={handleSave} style={{ background: "#10B981", color: "#FFF", padding: "10px 20px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Enregistrer</button>
                            <button onClick={() => setIsAdding(false)} style={{ background: "#E5E7EB", color: "#374151", padding: "10px 20px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}

            {showIconPicker && <IconPicker selected={icon} onSelect={setIcon} onClose={() => setShowIconPicker(false)} />}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {services.map(service => (
                    <div key={service.id} style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                            <div style={{ padding: "10px", backgroundColor: "#F9FAF8", borderRadius: "50%", color: "#10B981" }}>
                                {renderIcon(service.icon)}
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => handleEdit(service)} style={{ padding: "6px", color: "#6B7280", border: "none", background: "transparent", cursor: "pointer" }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(service.id)} style={{ padding: "6px", color: "#EF4444", border: "none", background: "transparent", cursor: "pointer" }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>{service.title}</h3>
                        <p style={{ color: "#6B7280", fontSize: "0.875rem", lineHeight: "1.5" }}>{service.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
