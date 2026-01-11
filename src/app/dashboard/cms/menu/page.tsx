"use client";

import { useState, useEffect, useRef } from "react";
import {
    UtensilsCrossed,
    ArrowLeft,
    Plus,
    Trash2,
    Edit2,
    Eye,
    EyeOff,
    Star,
    Search,
    Wine,
    Coffee,
    Salad,
    Cake,
    Loader2,
    X,
    Save,
    Upload,
    Image as ImageIcon,
    Wand2
} from "lucide-react";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, uploadMedia, generateAndSaveMenuImage } from "@/app/actions/cms";
import Image from "next/image";
import { convertToWebP, analyzeImageWithAI, renameFile } from "@/lib/imageUtils";

interface MenuItem {
    id: string;
    category: string;
    name: string;
    description: string;
    price: number;
    is_active: boolean;
    is_featured: boolean;
    tags: string[];
    image_id?: string;
    site_media?: {
        url: string;
    };
}

const categories = [
    { id: "all", label: "Tout", icon: UtensilsCrossed },
    { id: "entrees", label: "Entrées", icon: Salad },
    { id: "plats", label: "Plats", icon: UtensilsCrossed },
    { id: "desserts", label: "Desserts", icon: Cake },
    { id: "boissons", label: "Boissons", icon: Coffee },
    { id: "cocktails", label: "Cocktails", icon: Wine },
];

export default function MenuEditorPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewItem, setShowNewItem] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<"converting" | "analyzing" | "uploading" | null>(null);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState({
        category: "plats",
        name: "",
        description: "",
        price: 0,
        tags: [] as string[],
        image_id: undefined as string | undefined,
        preview_url: undefined as string | undefined
    });

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        const data = await getMenuItems();
        setItems(data as MenuItem[]);
        setLoading(false);
    };

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
        const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleToggleActive = async (item: MenuItem) => {
        const result = await updateMenuItem(item.id, { is_active: !item.is_active });
        if (result.success) {
            setItems(items.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
        }
    };

    const handleToggleFeatured = async (item: MenuItem) => {
        const result = await updateMenuItem(item.id, { is_featured: !item.is_featured });
        if (result.success) {
            setItems(items.map(i => i.id === item.id ? { ...i, is_featured: !i.is_featured } : i));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce plat ?")) return;
        const result = await deleteMenuItem(id);
        if (result.success) {
            setItems(items.filter(i => i.id !== id));
        } else {
            alert("Erreur: " + result.error);
        }
    };

    const handleEdit = (item: MenuItem) => {
        setEditingId(item.id);
        setNewItem({
            category: item.category,
            name: item.name,
            description: item.description || "",
            price: item.price,
            tags: item.tags || [],
            image_id: item.image_id,
            preview_url: item.site_media?.url
        });
        setShowNewItem(true);
    };

    const handleSaveItem = async () => {
        if (!newItem.name.trim()) {
            alert("Le nom est requis");
            return;
        }

        setSaving(true);

        let result;
        if (editingId) {
            result = await updateMenuItem(editingId, {
                category: newItem.category,
                name: newItem.name,
                description: newItem.description,
                price: newItem.price,
                tags: newItem.tags,
                image_id: newItem.image_id
            });
        } else {
            result = await createMenuItem({
                category: newItem.category,
                name: newItem.name,
                description: newItem.description,
                price: newItem.price,
                tags: newItem.tags,
                image_id: newItem.image_id
            });
        }

        if (result.success) {
            await loadItems();
            setShowNewItem(false);
            resetForm();
        } else {
            alert("Erreur: " + result.error);
        }
        setSaving(false);
    };

    const resetForm = () => {
        setEditingId(null);
        setNewItem({ category: "plats", name: "", description: "", price: 0, tags: [], image_id: undefined, preview_url: undefined });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];

        setUploading(true);
        setUploadStatus("converting");

        try {
            // 1. Convert to WebP
            const webpFile = await convertToWebP(file, 0.8, 1200, 1200);

            // 2. AI Naming
            setUploadStatus("analyzing");
            const analysis = await analyzeImageWithAI(webpFile, "menu_items");

            // 3. Rename
            const renamedFile = renameFile(webpFile, analysis.filename);

            // 4. Upload
            setUploadStatus("uploading");
            const formData = new FormData();
            formData.append("file", renamedFile);
            formData.append("folder", "menu");

            const result = await uploadMedia(formData);

            if (result.success && result.data) {
                setNewItem(prev => ({
                    ...prev,
                    image_id: result.data.id,
                    preview_url: result.data.url
                }));
            } else {
                alert("Erreur upload: " + result.error);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Erreur lors de l'upload ou de l'analyse IA");
        } finally {
            setUploading(false);
            setUploadStatus(null);
        }
    };

    const handleGenerateImage = async () => {
        if (!newItem.name) return;

        setUploading(true);
        setUploadStatus("analyzing"); // Reuse 'analyzing' state for generation message

        try {
            const result = await generateAndSaveMenuImage(newItem.name);
            if (result.success && result.data) {
                setNewItem(prev => ({
                    ...prev,
                    image_id: result.data.id,
                    preview_url: result.data.url
                }));
            } else {
                alert("Erreur génération: " + result.error);
            }
        } catch (error) {
            console.error("Gen Error:", error);
            alert("Erreur lors de la génération");
        } finally {
            setUploading(false);
            setUploadStatus(null);
        }
    };

    const getCategoryLabel = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.label || categoryId;
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
                <Loader2 style={{ width: 32, height: 32, color: "#E8A87C", animation: "spin 1s linear infinite" }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <a href="/dashboard/cms" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7A7A7A", textDecoration: "none", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                        Retour au Dashboard
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <UtensilsCrossed style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <div>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>Carte Restaurant</h1>
                            <p style={{ color: "#7A7A7A" }}>{items.length} plats • {items.filter(i => i.is_active).length} actifs</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowNewItem(true); }}
                    style={{
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
                    }}
                >
                    <Plus style={{ width: 18, height: 18 }} />
                    Ajouter un plat
                </button>
            </div>

            {/* Categories Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                {categories.map(cat => {
                    const Icon = cat.icon;
                    const count = cat.id === "all"
                        ? items.length
                        : items.filter(i => i.category === cat.id).length;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "10px 18px",
                                backgroundColor: selectedCategory === cat.id ? "#FEF3E2" : "#FFF",
                                color: selectedCategory === cat.id ? "#E8A87C" : "#6B7280",
                                border: `1px solid ${selectedCategory === cat.id ? "#E8A87C" : "#E5E7EB"}`,
                                borderRadius: "100px",
                                fontSize: "0.875rem",
                                fontWeight: selectedCategory === cat.id ? 600 : 400,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <Icon style={{ width: 16, height: 16 }} />
                            {cat.label}
                            <span style={{ fontSize: "0.75rem", padding: "2px 6px", backgroundColor: selectedCategory === cat.id ? "#E8A87C" : "#F3F4F6", color: selectedCategory === cat.id ? "#FFF" : "#9CA3AF", borderRadius: "100px" }}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ position: "relative", maxWidth: "400px" }}>
                    <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "#9CA3AF" }} />
                    <input
                        type="text"
                        placeholder="Rechercher un plat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 12px 12px 42px",
                            border: "1px solid #E5E7EB",
                            borderRadius: "12px",
                            fontSize: "0.875rem",
                            outline: "none",
                        }}
                    />
                </div>
            </div>

            {/* Menu Items Grid */}
            {filteredItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "#F9FAFB", borderRadius: "16px" }}>
                    <UtensilsCrossed style={{ width: 48, height: 48, color: "#D1D5DB", margin: "0 auto 1rem" }} />
                    <h3 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Aucun plat</h3>
                    <p style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>Ajoutez des plats pour commencer</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            style={{
                                backgroundColor: "#FFF",
                                borderRadius: "16px",
                                border: "1px solid #E5E7EB",
                                overflow: "hidden",
                                opacity: item.is_active ? 1 : 0.7,
                            }}
                        >
                            <div style={{ position: "relative", height: "180px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                {item.site_media?.url ? (
                                    <Image
                                        src={item.site_media.url}
                                        alt={item.name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <UtensilsCrossed style={{ width: 32, height: 32, color: "#D1D5DB" }} />
                                )}

                                {item.is_featured && (
                                    <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: "#E8A87C", color: "#FFF", padding: "4px 10px", borderRadius: "100px", fontSize: "0.625rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", zIndex: 2 }}>
                                        <Star style={{ width: 10, height: 10, fill: "#FFF" }} />
                                        Recommandé
                                    </div>
                                )}

                                {!item.is_active && (
                                    <div style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "#EF4444", color: "#FFF", padding: "4px 10px", borderRadius: "100px", fontSize: "0.625rem", fontWeight: 600, zIndex: 2 }}>
                                        Masqué
                                    </div>
                                )}

                                <div style={{ position: "absolute", bottom: "10px", left: "10px", backgroundColor: "rgba(0,0,0,0.7)", color: "#FFF", padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", zIndex: 2 }}>
                                    {getCategoryLabel(item.category)}
                                </div>
                            </div>

                            <div style={{ padding: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                    <h3 style={{ fontWeight: 600, color: "#222", fontSize: "1rem" }}>{item.name}</h3>
                                    <span style={{ fontWeight: 700, color: "#E8A87C", fontSize: "1.125rem" }}>{item.price}DT</span>
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                                    {item.description || "Pas de description"}
                                </p>

                                {item.tags && item.tags.length > 0 && (
                                    <div style={{ display: "flex", gap: "4px", marginBottom: "0.75rem" }}>
                                        {item.tags.map(tag => (
                                            <span key={tag} style={{ fontSize: "0.625rem", padding: "3px 8px", backgroundColor: "#DCFCE7", color: "#166534", borderRadius: "100px" }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid #F3F4F6" }}>
                                    <button
                                        onClick={() => handleToggleActive(item)}
                                        style={{
                                            flex: 1,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "6px",
                                            padding: "8px",
                                            backgroundColor: item.is_active ? "#FFF" : "#FEE2E2",
                                            border: `1px solid ${item.is_active ? "#E5E7EB" : "#FECACA"}`,
                                            borderRadius: "8px",
                                            fontSize: "0.75rem",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {item.is_active ? <Eye style={{ width: 14, height: 14, color: "#10B981" }} /> : <EyeOff style={{ width: 14, height: 14, color: "#EF4444" }} />}
                                        {item.is_active ? "Visible" : "Masqué"}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#FFF",
                                            border: "1px solid #E5E7EB",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Edit2 style={{ width: 16, height: 16, color: "#6B7280" }} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleFeatured(item)}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: item.is_featured ? "#FEF3E2" : "#FFF",
                                            border: `1px solid ${item.is_featured ? "#E8A87C" : "#E5E7EB"}`,
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Star style={{ width: 16, height: 16, color: item.is_featured ? "#E8A87C" : "#9CA3AF", fill: item.is_featured ? "#E8A87C" : "none" }} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#FFF",
                                            border: "1px solid #FECACA",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Trash2 style={{ width: 16, height: 16, color: "#EF4444" }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New/Edit Item Modal */}
            {showNewItem && (
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
                    onClick={() => setShowNewItem(false)}
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
                            <h2 style={{ fontWeight: 700, color: "#222" }}>{editingId ? "Modifier le plat" : "Nouveau plat"}</h2>
                            <button onClick={() => setShowNewItem(false)} style={{ padding: "8px", border: "none", backgroundColor: "#F3F4F6", borderRadius: "8px", cursor: "pointer" }}>
                                <X style={{ width: 20, height: 20, color: "#6B7280" }} />
                            </button>
                        </div>
                        <div style={{ padding: "1.5rem", maxHeight: "80vh", overflowY: "auto" }}>

                            {/* Image Upload */}
                            {/* Image Upload */}
                            <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                                <div style={{
                                    width: "100%", height: "150px",
                                    backgroundColor: "#F9FAFB", border: "2px dashed #E5E7EB", borderRadius: "12px",
                                    marginBottom: "1rem", overflow: "hidden", position: "relative",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    {newItem.preview_url ? (
                                        <Image
                                            src={newItem.preview_url}
                                            alt="Preview"
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div style={{ textAlign: "center", color: "#9CA3AF" }}>
                                            <ImageIcon style={{ width: 32, height: 32, marginBottom: "4px" }} />
                                            <p style={{ fontSize: "0.75rem" }}>Aucune image</p>
                                        </div>
                                    )}

                                    {uploading && (
                                        <div style={{
                                            position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.9)",
                                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px"
                                        }}>
                                            <Loader2 style={{ animation: "spin 1s linear infinite", color: "#E8A87C", width: 32, height: 32 }} />
                                            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#E8A87C" }}>
                                                {uploadStatus === "converting" && "Optimisation WebP..."}
                                                {uploadStatus === "converting" && "Optimisation WebP..."}
                                                {uploadStatus === "analyzing" && "Analyse..."}
                                                {uploadStatus === "uploading" && "Envoi en cours..."}
                                                {uploadStatus === "uploading" && "Envoi en cours..."}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <label style={{
                                    display: "inline-flex", alignItems: "center", gap: "8px",
                                    padding: "8px 16px", backgroundColor: "#F3F4F6", borderRadius: "100px",
                                    cursor: "pointer", fontSize: "0.875rem", fontWeight: 500
                                }}>
                                    <Upload style={{ width: 16, height: 16 }} />
                                    {newItem.preview_url ? "Changer la photo" : "Ajouter une photo"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ display: "none" }}
                                        disabled={uploading}
                                    />
                                </label>


                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Catégorie</label>
                                <select
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem" }}
                                >
                                    {categories.filter(c => c.id !== "all").map(c => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Nom *</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="Nom du plat"
                                    style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem" }}
                                />
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Description</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Description du plat"
                                    rows={3}
                                    style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem", resize: "vertical" }}
                                />
                            </div>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>Prix (DT)</label>
                                <input
                                    type="number"
                                    value={newItem.price}
                                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                    step="0.01"
                                    style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem" }}
                                />
                            </div>
                            <button
                                onClick={handleSaveItem}
                                disabled={saving}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    backgroundColor: "#E8A87C",
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
                                    <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />Enregistrement...</>
                                ) : (
                                    <><Save style={{ width: 18, height: 18 }} />{editingId ? "Sauvegarder" : "Créer le plat"}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div >
    );
}
