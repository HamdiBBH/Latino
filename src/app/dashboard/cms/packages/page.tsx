"use client";

import { useState, useEffect } from "react";
import { getPackages, createPackage, updatePackage, deletePackage } from "@/app/actions/cms";
import { rewriteSection } from "@/app/actions/ai";
import { Plus, Trash2, Edit2, ArrowLeft, Check, X, Sparkles, Loader2 } from "lucide-react";

interface Package {
    id: string;
    name: string;
    price: string;
    features: string[]; // JSONB stored as array
    is_popular: boolean;
    is_active: boolean;
}

export default function PackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [featuresInput, setFeaturesInput] = useState(""); // Textarea for features (one per line)
    const [isPopular, setIsPopular] = useState(false);

    // AI State
    const [isRewriting, setIsRewriting] = useState(false);

    const handleAiRewrite = async () => {
        if (!name && !featuresInput) return;

        setIsRewriting(true);
        try {
            const fields = [
                { id: "name", label: "Nom du forfait", content: name },
                { id: "features", label: "Liste des avantages (1 par ligne)", content: featuresInput }
            ];

            const result = await rewriteSection("Détail Forfait (Latino Coucou Beach)", fields);

            if (result.success && result.content) {
                if (result.content.name) setName(result.content.name);
                if (result.content.features) setFeaturesInput(result.content.features);
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
        loadPackages();
    }, []);

    const loadPackages = async () => {
        const data = await getPackages();
        // Ensure features is parsed correctly if it comes as string, though supabase returns jsonb as objects/arrays usually
        const parsedPackages = data.map((pkg: any) => ({
            ...pkg,
            features: Array.isArray(pkg.features) ? pkg.features : []
        }));
        setPackages(parsedPackages);
    };

    const handleEdit = (pkg: Package) => {
        setEditingId(pkg.id);
        setName(pkg.name);
        setPrice(pkg.price);
        setFeaturesInput(pkg.features.join("\n"));
        setIsPopular(pkg.is_popular);
        setIsAdding(true);
    };

    const handleSave = async () => {
        // Split features by newline and remove empty strings
        const features = featuresInput.split("\n").map(f => f.trim()).filter(f => f.length > 0);

        const data = { name, price, features, is_popular: isPopular };

        if (editingId) {
            await updatePackage(editingId, data);
        } else {
            await createPackage(data);
        }

        setIsAdding(false);
        setEditingId(null);
        resetForm();
        loadPackages();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce forfait ?")) {
            await deletePackage(id);
            loadPackages();
        }
    };

    const resetForm = () => {
        setName("");
        setPrice("");
        setFeaturesInput("");
        setIsPopular(false);
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <a href="/dashboard/cms" style={{ color: "#6B7280" }}><ArrowLeft /></a>
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Packages & Forfaits</h1>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "#222", color: "#FFF", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}
                >
                    <Plus size={18} /> Ajouter un forfait
                </button>
            </div>

            {isAdding && (
                <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "12px", border: "1px solid #E5E7EB", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h2 style={{ margin: 0 }}>{editingId ? "Modifier le forfait" : "Nouveau forfait"}</h2>
                        <button
                            onClick={handleAiRewrite}
                            disabled={isRewriting || (!name && !featuresInput)}
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
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Nom du forfait</label>
                                <input
                                    type="text" value={name} onChange={e => setName(e.target.value)} placeholder="ex: Journée Détente"
                                    style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "6px" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Prix</label>
                                <input
                                    type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="ex: 45DT / pers"
                                    style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "6px" }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Caractéristiques (une par ligne)</label>
                            <textarea
                                value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} rows={5} placeholder="- Transat réservé&#10;- Mocktail offert&#10;- Serviette incluse"
                                style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "6px" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={isPopular}
                                    onChange={e => setIsPopular(e.target.checked)}
                                    style={{ width: "16px", height: "16px" }}
                                />
                                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Marquer comme "Populaire"</span>
                            </label>
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            <button onClick={handleSave} style={{ background: "#10B981", color: "#FFF", padding: "10px 20px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Enregistrer</button>
                            <button onClick={() => setIsAdding(false)} style={{ background: "#E5E7EB", color: "#374151", padding: "10px 20px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {packages.map(pkg => (
                    <div key={pkg.id} style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "12px", border: pkg.is_popular ? "2px solid #10B981" : "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", position: "relative" }}>
                        {pkg.is_popular && (
                            <div style={{ position: "absolute", top: "-12px", right: "20px", backgroundColor: "#10B981", color: "#FFF", padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600 }}>
                                Populaire
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                            <div>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111" }}>{pkg.name}</h3>
                                <div style={{ color: "#10B981", fontWeight: 600, fontSize: "1.125rem", marginTop: "4px" }}>{pkg.price}</div>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => handleEdit(pkg)} style={{ padding: "6px", color: "#6B7280", border: "none", background: "transparent", cursor: "pointer" }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(pkg.id)} style={{ padding: "6px", color: "#EF4444", border: "none", background: "transparent", cursor: "pointer" }}><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div style={{ marginTop: "1.5rem", borderTop: "1px solid #F3F4F6", paddingTop: "1rem" }}>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {pkg.features.map((feature: any, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", fontSize: "0.875rem", color: "#4B5563" }}>
                                        <Check size={14} color="#10B981" />
                                        {typeof feature === "object" && feature !== null ? feature.text : feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
