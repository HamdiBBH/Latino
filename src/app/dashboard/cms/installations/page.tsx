"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, Save, X, Image as ImageIcon, Check } from "lucide-react";
import { getBeachInstallations, createBeachInstallation, updateBeachInstallation, deleteBeachInstallation, getMedia } from "@/app/actions/cms";
import * as Icons from "lucide-react";

export default function InstallationsCMSPage() {
    const [installations, setInstallations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentInst, setCurrentInst] = useState<any>(null);

    // Media modal states
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);

    useEffect(() => {
        loadInstallations();
    }, []);

    useEffect(() => {
        if (showMediaModal) {
            loadMedia();
        }
    }, [showMediaModal]);

    const loadMedia = async () => {
        setLoadingMedia(true);
        const data = await getMedia();
        setMediaFiles(data || []);
        setLoadingMedia(false);
    };

    const loadInstallations = async () => {
        setLoading(true);
        const data = await getBeachInstallations();
        setInstallations(data || []);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const instData = {
            title: currentInst.title,
            description: currentInst.description,
            price: currentInst.price,
            image_url: currentInst.image_url,
            icon: currentInst.icon,
            color: currentInst.color,
            badge: currentInst.badge || null,
        };

        if (currentInst.id) {
            await updateBeachInstallation(currentInst.id, instData);
        } else {
            await createBeachInstallation(instData);
        }

        setIsEditing(false);
        setCurrentInst(null);
        loadInstallations();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette installation ?")) {
            await deleteBeachInstallation(id);
            loadInstallations();
        }
    };

    const renderIcon = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName] || Icons.Umbrella;
        return <IconComponent style={{ width: 24, height: 24, color: "#FFFFFF" }} />;
    };

    return (
        <div style={{ paddingBottom: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                <div>
                    <a href="/dashboard/cms" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7A7A7A", textDecoration: "none", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                        Retour au CMS
                    </a>
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                        Installations Plage
                    </h1>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => {
                            setCurrentInst({ title: "", description: "", price: 0, image_url: "", icon: "Umbrella", color: "#43B0A8", badge: "" });
                            setIsEditing(true);
                        }}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 20px",
                            backgroundColor: "#43B0A8",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        <Plus style={{ width: 18, height: 18 }} />
                        Ajouter
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "4rem" }}>
                    <Loader2 style={{ width: 40, height: 40, color: "#43B0A8", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                </div>
            ) : isEditing ? (
                <div style={{ backgroundColor: "#FFFFFF", padding: "2rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                        {currentInst.id ? "Modifier l'installation" : "Nouvelle installation"}
                    </h2>
                    <form onSubmit={handleSave} style={{ display: "grid", gap: "1.5rem" }}>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Titre *</label>
                                <input
                                    required
                                    type="text"
                                    value={currentInst.title}
                                    onChange={(e) => setCurrentInst({ ...currentInst, title: e.target.value })}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Prix (DT) *</label>
                                <input
                                    required
                                    type="number"
                                    value={currentInst.price}
                                    onChange={(e) => setCurrentInst({ ...currentInst, price: Number(e.target.value) })}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB" }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Description *</label>
                            <textarea
                                required
                                value={currentInst.description}
                                onChange={(e) => setCurrentInst({ ...currentInst, description: e.target.value })}
                                rows={3}
                                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", resize: "vertical" }}
                            />
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Image de l'installation</label>
                            
                            <div style={{ 
                                display: "flex", alignItems: "center", gap: "1rem", 
                                padding: "1rem", backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px" 
                            }}>
                                {currentInst.image_url ? (
                                    <div style={{ width: "80px", height: "60px", borderRadius: "6px", overflow: "hidden", border: "1px solid #D1D5DB" }}>
                                        <img src={currentInst.image_url} alt="Aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                ) : (
                                    <div style={{ width: "80px", height: "60px", borderRadius: "6px", backgroundColor: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <ImageIcon style={{ width: 24, height: 24, color: "#9CA3AF" }} />
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaModal(true)}
                                        style={{ padding: "8px 16px", backgroundColor: "#FFF", border: "1px solid #D1D5DB", borderRadius: "6px", fontSize: "0.875rem", cursor: "pointer", fontWeight: 500 }}
                                    >
                                        Sélectionner depuis la médiathèque
                                    </button>
                                    {currentInst.image_url && (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentInst({ ...currentInst, image_url: "" })}
                                            style={{ marginLeft: "8px", padding: "8px 16px", backgroundColor: "#FEF2F2", color: "#EF4444", border: "none", borderRadius: "6px", fontSize: "0.875rem", cursor: "pointer", fontWeight: 500 }}
                                        >
                                            Retirer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Icône (Lucide)</label>
                                <input
                                    type="text"
                                    value={currentInst.icon}
                                    onChange={(e) => setCurrentInst({ ...currentInst, icon: e.target.value })}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB" }}
                                    placeholder="Ex: Umbrella, Crown, Sun"
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Couleur HEX</label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <input
                                        type="color"
                                        value={currentInst.color}
                                        onChange={(e) => setCurrentInst({ ...currentInst, color: e.target.value })}
                                        style={{ width: "40px", height: "40px", padding: "0", border: "none", borderRadius: "8px" }}
                                    />
                                    <input
                                        type="text"
                                        value={currentInst.color}
                                        onChange={(e) => setCurrentInst({ ...currentInst, color: e.target.value })}
                                        style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB" }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Badge (Optionnel)</label>
                                <input
                                    type="text"
                                    value={currentInst.badge}
                                    onChange={(e) => setCurrentInst({ ...currentInst, badge: e.target.value })}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB" }}
                                    placeholder="Ex: PREMIUM"
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setCurrentInst(null); }}
                                style={{ flex: 1, padding: "12px", backgroundColor: "#F3F4F6", color: "#4B5563", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                style={{ flex: 1, padding: "12px", backgroundColor: "#43B0A8", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                            >
                                {currentInst.id ? "Mettre à jour" : "Créer"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : installations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "#F9FAFB", borderRadius: "16px", border: "1px dashed #D1D5DB" }}>
                    <p style={{ color: "#6B7280", marginBottom: "1rem" }}>Aucune installation trouvée.</p>
                    <button
                        onClick={() => {
                            setCurrentInst({ title: "", description: "", price: 0, image_url: "", icon: "Umbrella", color: "#43B0A8", badge: "" });
                            setIsEditing(true);
                        }}
                        style={{ padding: "8px 16px", backgroundColor: "#43B0A8", color: "white", borderRadius: "8px", border: "none", cursor: "pointer" }}
                    >
                        Créer ma première installation
                    </button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                    {installations.map((inst) => (
                        <div key={inst.id} style={{ backgroundColor: "#FFF", borderRadius: "16px", overflow: "hidden", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column" }}>
                            <div style={{ height: "160px", backgroundImage: `url(${inst.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80'})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
                                {inst.badge && (
                                    <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: inst.color, color: "#FFF", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "bold" }}>
                                        {inst.badge}
                                    </div>
                                )}
                                <div style={{ position: "absolute", bottom: "-16px", right: "16px", width: "40px", height: "40px", backgroundColor: inst.color, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #FFF" }}>
                                    {renderIcon(inst.icon)}
                                </div>
                            </div>
                            <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>{inst.title}</h3>
                                    <span style={{ fontWeight: "bold", color: inst.color }}>{inst.price} DT</span>
                                </div>
                                <p style={{ fontSize: "0.85rem", color: "#6B7280", flex: 1, marginBottom: "1rem" }}>
                                    {inst.description}
                                </p>
                                <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid #E5E7EB", paddingTop: "1rem" }}>
                                    <button
                                        onClick={() => { setCurrentInst(inst); setIsEditing(true); }}
                                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px", backgroundColor: "#F3F4F6", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer" }}
                                    >
                                        <Edit2 style={{ width: 14, height: 14 }} /> Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(inst.id)}
                                        style={{ padding: "8px", backgroundColor: "#FEF2F2", color: "#EF4444", border: "none", borderRadius: "8px", cursor: "pointer" }}
                                    >
                                        <Trash2 style={{ width: 16, height: 16 }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Media Library Modal */}
            {showMediaModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ backgroundColor: "#FFF", borderRadius: "16px", width: "90%", maxWidth: "800px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "1.5rem", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111" }}>Sélectionner une image</h3>
                            <button onClick={() => setShowMediaModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                                <X style={{ width: 24, height: 24, color: "#6B7280" }} />
                            </button>
                        </div>

                        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
                            {loadingMedia ? (
                                <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                                    <Loader2 style={{ width: 32, height: 32, color: "#43B0A8", animation: "spin 1s linear infinite" }} />
                                </div>
                            ) : mediaFiles.length === 0 ? (
                                <div style={{ textAlign: "center", color: "#6B7280", padding: "2rem" }}>
                                    Aucune image trouvée dans la médiathèque.
                                </div>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
                                    {mediaFiles.map(file => (
                                        <div
                                            key={file.id}
                                            onClick={() => {
                                                setCurrentInst({ ...currentInst, image_url: file.url });
                                                setShowMediaModal(false);
                                            }}
                                            style={{
                                                aspectRatio: "1",
                                                borderRadius: "8px",
                                                overflow: "hidden",
                                                border: currentInst.image_url === file.url ? "3px solid #43B0A8" : "1px solid #E5E7EB",
                                                cursor: "pointer",
                                                position: "relative"
                                            }}
                                        >
                                            <img src={file.url} alt={file.filename} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            {currentInst.image_url === file.url && (
                                                <div style={{ position: "absolute", top: 4, right: 4, backgroundColor: "#43B0A8", borderRadius: "50%", padding: 2 }}>
                                                    <Check style={{ width: 14, height: 14, color: "#FFF" }} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
