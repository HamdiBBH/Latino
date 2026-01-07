"use client";

import { useState } from "react";
import { ChefHat, Plus, Edit2, Trash2, Check, X, AlertTriangle } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    available: boolean;
}

const initialProducts: Product[] = [
    { id: "1", name: "Salade Méditerranéenne", description: "Tomates, concombre, feta, olives", price: 18, category: "Entrées", available: true },
    { id: "2", name: "Bruschetta Trio", description: "Tomates, pesto, tapenade", price: 14, category: "Entrées", available: true },
    { id: "3", name: "Poisson Grillé du Jour", description: "Accompagné de légumes de saison", price: 35, category: "Plats", available: true },
    { id: "4", name: "Burger Latino", description: "Boeuf, guacamole, jalapeños", price: 28, category: "Plats", available: false },
    { id: "5", name: "Paella Valencia", description: "Fruits de mer, poulet, chorizo", price: 42, category: "Plats", available: true },
    { id: "6", name: "Tiramisu Maison", description: "Café, mascarpone, cacao", price: 12, category: "Desserts", available: true },
    { id: "7", name: "Mojito Classique", description: "Rhum, menthe, citron vert", price: 14, category: "Boissons", available: true },
    { id: "8", name: "Sangria Pitcher", description: "Vin rouge, fruits frais", price: 25, category: "Boissons", available: true },
];

const categories = ["Toutes", "Entrées", "Plats", "Desserts", "Boissons"];

export default function MenuPage() {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [selectedCategory, setSelectedCategory] = useState("Toutes");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", description: "", price: 0, category: "Plats" });

    const filteredProducts = selectedCategory === "Toutes"
        ? products
        : products.filter(p => p.category === selectedCategory);

    const toggleAvailability = (id: string) => {
        setProducts(products.map(p =>
            p.id === id ? { ...p, available: !p.available } : p
        ));
    };

    const deleteProduct = (id: string) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const addProduct = () => {
        if (newProduct.name && newProduct.price > 0) {
            setProducts([...products, {
                id: Date.now().toString(),
                ...newProduct,
                available: true,
            }]);
            setNewProduct({ name: "", description: "", price: 0, category: "Plats" });
            setShowAddForm(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                        <ChefHat style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                            Carte & Produits
                        </h1>
                    </div>
                    <p style={{ color: "#7A7A7A" }}>
                        Gérez vos plats, prix et disponibilités
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
                    <h3 style={{ fontWeight: 600, color: "#222222", marginBottom: "1rem" }}>Nouveau produit</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Nom du produit"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            style={{ padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            style={{ padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                        />
                        <input
                            type="number"
                            placeholder="Prix (DT)"
                            value={newProduct.price || ""}
                            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
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

            {/* Category Filter */}
            <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "100px",
                            border: "none",
                            backgroundColor: selectedCategory === category ? "#222222" : "#F3F4F6",
                            color: selectedCategory === category ? "#FFFFFF" : "#6B7280",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Stock Alert */}
            {products.filter(p => !p.available).length > 0 && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "1rem",
                        backgroundColor: "#FEF3C7",
                        borderRadius: "12px",
                        marginBottom: "1.5rem",
                    }}
                >
                    <AlertTriangle style={{ width: 20, height: 20, color: "#92400E" }} />
                    <span style={{ color: "#92400E", fontWeight: 500 }}>
                        {products.filter(p => !p.available).length} produit(s) en rupture de stock
                    </span>
                </div>
            )}

            {/* Products Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "1rem",
                }}
            >
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        style={{
                            backgroundColor: "#FFFFFF",
                            padding: "1.5rem",
                            borderRadius: "16px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                            border: `1px solid ${product.available ? "#E5E7EB" : "#FEE2E2"}`,
                            opacity: product.available ? 1 : 0.7,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                            <div>
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "4px 10px",
                                        backgroundColor: "#F3F4F6",
                                        color: "#6B7280",
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                        borderRadius: "100px",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {product.category}
                                </span>
                                <h3 style={{ fontWeight: 600, color: "#222222", fontSize: "1.1rem" }}>{product.name}</h3>
                            </div>
                            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#E8A87C" }}>
                                {product.price} DT
                            </span>
                        </div>
                        <p style={{ color: "#7A7A7A", fontSize: "0.875rem", marginBottom: "1rem" }}>
                            {product.description}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <button
                                onClick={() => toggleAvailability(product.id)}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: "100px",
                                    border: "none",
                                    backgroundColor: product.available ? "#DCFCE7" : "#FEE2E2",
                                    color: product.available ? "#166534" : "#B91C1C",
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                {product.available ? "✓ Disponible" : "✗ Rupture"}
                            </button>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    onClick={() => setEditingId(product.id)}
                                    style={{
                                        padding: "8px",
                                        backgroundColor: "#F3F4F6",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        color: "#6B7280",
                                    }}
                                >
                                    <Edit2 style={{ width: 16, height: 16 }} />
                                </button>
                                <button
                                    onClick={() => deleteProduct(product.id)}
                                    style={{
                                        padding: "8px",
                                        backgroundColor: "#FEE2E2",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        color: "#B91C1C",
                                    }}
                                >
                                    <Trash2 style={{ width: 16, height: 16 }} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
