"use client";

import { useState } from "react";
import { Package, AlertTriangle, Plus, Minus, Search, Trash2, Check, X } from "lucide-react";

interface StockItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minStock: number;
    lastUpdated: string;
}

const initialStock: StockItem[] = [
    { id: "1", name: "Tomates fraîches", category: "Légumes", quantity: 25, unit: "kg", minStock: 10, lastUpdated: "2025-01-05" },
    { id: "2", name: "Mozzarella", category: "Produits laitiers", quantity: 8, unit: "kg", minStock: 5, lastUpdated: "2025-01-05" },
    { id: "3", name: "Farine", category: "Épicerie", quantity: 50, unit: "kg", minStock: 20, lastUpdated: "2025-01-04" },
    { id: "4", name: "Huile d'olive", category: "Épicerie", quantity: 12, unit: "L", minStock: 10, lastUpdated: "2025-01-04" },
    { id: "5", name: "Poisson frais", category: "Poissons", quantity: 3, unit: "kg", minStock: 8, lastUpdated: "2025-01-05" },
    { id: "6", name: "Sirop de menthe", category: "Boissons", quantity: 6, unit: "bouteilles", minStock: 4, lastUpdated: "2025-01-03" },
    { id: "7", name: "Menthe fraîche", category: "Herbes", quantity: 2, unit: "bottes", minStock: 5, lastUpdated: "2025-01-05" },
    { id: "8", name: "Citrons verts", category: "Fruits", quantity: 40, unit: "pièces", minStock: 30, lastUpdated: "2025-01-05" },
    { id: "9", name: "Boeuf haché", category: "Viandes", quantity: 4, unit: "kg", minStock: 6, lastUpdated: "2025-01-04" },
    { id: "10", name: "Pain burger", category: "Boulangerie", quantity: 24, unit: "pièces", minStock: 20, lastUpdated: "2025-01-05" },
];

const categories = ["Tous", "Légumes", "Fruits", "Viandes", "Poissons", "Produits laitiers", "Épicerie", "Boissons", "Herbes", "Boulangerie"];

export default function StocksPage() {
    const [stock, setStock] = useState<StockItem[]>(initialStock);
    const [selectedCategory, setSelectedCategory] = useState("Tous");
    const [searchQuery, setSearchQuery] = useState("");
    const [showLowOnly, setShowLowOnly] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        category: "Légumes",
        quantity: 0,
        unit: "kg",
        minStock: 5,
    });

    const filteredStock = stock
        .filter(item => selectedCategory === "Tous" || item.category === selectedCategory)
        .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(item => !showLowOnly || item.quantity <= item.minStock);

    const lowStockCount = stock.filter(item => item.quantity <= item.minStock).length;
    const totalItems = stock.length;

    const updateQuantity = (id: string, delta: number) => {
        setStock(stock.map(item =>
            item.id === id
                ? { ...item, quantity: Math.max(0, item.quantity + delta), lastUpdated: new Date().toISOString().split("T")[0] }
                : item
        ));
    };

    const addProduct = () => {
        if (newProduct.name && newProduct.quantity >= 0) {
            setStock([...stock, {
                id: Date.now().toString(),
                ...newProduct,
                lastUpdated: new Date().toISOString().split("T")[0],
            }]);
            setNewProduct({ name: "", category: "Légumes", quantity: 0, unit: "kg", minStock: 5 });
            setShowAddForm(false);
        }
    };

    const deleteProduct = (id: string) => {
        setStock(stock.filter(item => item.id !== id));
    };

    const getStockStatus = (item: StockItem) => {
        if (item.quantity === 0) return { label: "Rupture", bg: "#FEE2E2", color: "#B91C1C" };
        if (item.quantity <= item.minStock) return { label: "Stock bas", bg: "#FEF3C7", color: "#92400E" };
        return { label: "OK", bg: "#DCFCE7", color: "#166534" };
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                        <Package style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                            Gestion des Stocks
                        </h1>
                    </div>
                    <p style={{ color: "#7A7A7A" }}>
                        Suivez et gérez votre inventaire en temps réel
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        backgroundColor: "#E8A87C",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "100px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    <Plus style={{ width: 20, height: 20 }} />
                    Ajouter un produit
                </button>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                        marginBottom: "2rem",
                    }}
                >
                    <h3 style={{ fontWeight: 600, color: "#222222", marginBottom: "1rem" }}>Nouveau produit en stock</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Nom du produit"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            style={{ padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                        />
                        <select
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            style={{ padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                        >
                            {categories.slice(1).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Quantité"
                            value={newProduct.quantity || ""}
                            onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                            style={{ padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                        />
                        <input
                            type="text"
                            placeholder="Unité (kg, L, pièces...)"
                            value={newProduct.unit}
                            onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                            style={{ padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                        />
                        <input
                            type="number"
                            placeholder="Stock minimum"
                            value={newProduct.minStock || ""}
                            onChange={(e) => setNewProduct({ ...newProduct, minStock: parseInt(e.target.value) || 0 })}
                            style={{ padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button
                            onClick={addProduct}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "10px 20px",
                                backgroundColor: "#22C55E",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <Check style={{ width: 16, height: 16 }} />
                            Ajouter
                        </button>
                        <button
                            onClick={() => setShowAddForm(false)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "10px 20px",
                                backgroundColor: "#F3F4F6",
                                color: "#374151",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <X style={{ width: 16, height: 16 }} />
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "1rem",
                    marginBottom: "2rem",
                }}
            >
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                    }}
                >
                    <p style={{ color: "#7A7A7A", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Total produits</p>
                    <p style={{ fontSize: "2rem", fontWeight: 700, color: "#222222" }}>{totalItems}</p>
                </div>
                <div
                    style={{
                        backgroundColor: lowStockCount > 0 ? "#FEF3C7" : "#FFFFFF",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: lowStockCount > 0 ? "1px solid #FCD34D" : "1px solid #E5E7EB",
                    }}
                >
                    <p style={{ color: lowStockCount > 0 ? "#92400E" : "#7A7A7A", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        Stock bas
                    </p>
                    <p style={{ fontSize: "2rem", fontWeight: 700, color: lowStockCount > 0 ? "#B45309" : "#222222" }}>
                        {lowStockCount}
                    </p>
                </div>
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                    }}
                >
                    <p style={{ color: "#7A7A7A", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Catégories</p>
                    <p style={{ fontSize: "2rem", fontWeight: 700, color: "#222222" }}>{categories.length - 1}</p>
                </div>
            </div>

            {/* Alert */}
            {lowStockCount > 0 && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "1rem 1.5rem",
                        backgroundColor: "#FEF3C7",
                        borderRadius: "12px",
                        marginBottom: "1.5rem",
                        border: "1px solid #FCD34D",
                    }}
                >
                    <AlertTriangle style={{ width: 20, height: 20, color: "#B45309" }} />
                    <span style={{ color: "#92400E", fontWeight: 500 }}>
                        {lowStockCount} produit(s) nécessitent un réapprovisionnement
                    </span>
                    <button
                        onClick={() => setShowLowOnly(!showLowOnly)}
                        style={{
                            marginLeft: "auto",
                            padding: "6px 12px",
                            backgroundColor: showLowOnly ? "#B45309" : "transparent",
                            color: showLowOnly ? "#FFFFFF" : "#B45309",
                            border: "1px solid #B45309",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        {showLowOnly ? "Voir tout" : "Voir seulement"}
                    </button>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
                    <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: 20, height: 20, color: "#9CA3AF" }} />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 12px 12px 44px",
                            border: "1px solid #E5E7EB",
                            borderRadius: "12px",
                            fontSize: "1rem",
                        }}
                    />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {categories.slice(0, 6).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: "10px 16px",
                                borderRadius: "100px",
                                border: "none",
                                backgroundColor: selectedCategory === cat ? "#222222" : "#F3F4F6",
                                color: selectedCategory === cat ? "#FFFFFF" : "#6B7280",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stock Table */}
            <div
                style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #E5E7EB",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px",
                        gap: "1rem",
                        padding: "1rem 1.5rem",
                        backgroundColor: "#F9FAFB",
                        borderBottom: "1px solid #E5E7EB",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "#6B7280",
                    }}
                >
                    <span>Produit</span>
                    <span>Catégorie</span>
                    <span style={{ textAlign: "center" }}>Quantité</span>
                    <span style={{ textAlign: "center" }}>Min</span>
                    <span style={{ textAlign: "center" }}>Statut</span>
                    <span style={{ textAlign: "center" }}>Actions</span>
                </div>

                {/* Rows */}
                {filteredStock.map((item, index) => {
                    const status = getStockStatus(item);
                    return (
                        <div
                            key={item.id}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px",
                                gap: "1rem",
                                padding: "1rem 1.5rem",
                                borderBottom: index < filteredStock.length - 1 ? "1px solid #E5E7EB" : "none",
                                alignItems: "center",
                                backgroundColor: item.quantity <= item.minStock ? "#FFFBEB" : "transparent",
                            }}
                        >
                            <div>
                                <p style={{ fontWeight: 500, color: "#222222" }}>{item.name}</p>
                                <p style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>MAJ: {item.lastUpdated}</p>
                            </div>
                            <span style={{ color: "#6B7280", fontSize: "0.875rem" }}>{item.category}</span>
                            <div style={{ textAlign: "center" }}>
                                <span style={{ fontWeight: 600, color: "#222222", fontSize: "1.1rem" }}>{item.quantity}</span>
                                <span style={{ color: "#9CA3AF", marginLeft: "4px" }}>{item.unit}</span>
                            </div>
                            <span style={{ textAlign: "center", color: "#9CA3AF" }}>{item.minStock} {item.unit}</span>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <span
                                    style={{
                                        padding: "4px 10px",
                                        backgroundColor: status.bg,
                                        color: status.color,
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                        borderRadius: "100px",
                                    }}
                                >
                                    {status.label}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                                <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#FEE2E2",
                                        color: "#B91C1C",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                    title="Diminuer"
                                >
                                    <Minus style={{ width: 16, height: 16 }} />
                                </button>
                                <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#DCFCE7",
                                        color: "#166534",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                    title="Augmenter"
                                >
                                    <Plus style={{ width: 16, height: 16 }} />
                                </button>
                                <button
                                    onClick={() => deleteProduct(item.id)}
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#F3F4F6",
                                        color: "#6B7280",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                    title="Supprimer"
                                >
                                    <Trash2 style={{ width: 16, height: 16 }} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filteredStock.length === 0 && (
                    <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>
                        Aucun produit trouvé
                    </div>
                )}
            </div>
        </div>
    );
}
