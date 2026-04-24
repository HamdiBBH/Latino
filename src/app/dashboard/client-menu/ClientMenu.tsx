"use client";

import { useState } from "react";

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string | null;
    available: boolean;
}

export default function ClientMenu({ items }: { items: MenuItem[] }) {
    // Extract unique categories
    const categories = ["Toutes", ...Array.from(new Set(items.map(item => item.category)))];
    const [selectedCategory, setSelectedCategory] = useState("Toutes");

    const filteredItems = selectedCategory === "Toutes" 
        ? items 
        : items.filter(item => item.category === selectedCategory);

    return (
        <div>
            {/* Category Filter */}
            <div style={{ marginBottom: "2rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                            padding: "8px 20px",
                            borderRadius: "100px",
                            border: "none",
                            backgroundColor: selectedCategory === category ? "#E8A87C" : "#FFF",
                            color: selectedCategory === category ? "#FFF" : "#6B7280",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: selectedCategory === category ? "0 4px 12px rgba(232, 168, 124, 0.3)" : "0 2px 4px rgba(0,0,0,0.05)",
                            transition: "all 0.2s ease"
                        }}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
                gap: "1.5rem" 
            }}>
                {filteredItems.map((item) => (
                    <div 
                        key={item.id}
                        style={{
                            backgroundColor: "#FFF",
                            borderRadius: "16px",
                            overflow: "hidden",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            border: "1px solid #E5E7EB",
                            display: "flex",
                            flexDirection: "column",
                            opacity: 1,
                            transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {/* Image Placeholder or Actual Image */}
                        <div style={{ height: "200px", backgroundColor: "#FEF3E2", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {item.image_url ? (
                                <img 
                                    src={item.image_url} 
                                    alt={item.name} 
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                />
                            ) : (
                                <span style={{ fontSize: "3rem" }}>🍽️</span>
                            )}
                        </div>

                        {/* Content */}
                        <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#222", margin: 0 }}>{item.name}</h3>
                                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#E8A87C", marginLeft: "1rem", whiteSpace: "nowrap" }}>
                                    {item.price} DT
                                </span>
                            </div>
                            <p style={{ color: "#6B7280", fontSize: "0.875rem", lineHeight: "1.5", margin: "0 0 1rem 0", flex: 1 }}>
                                {item.description}
                            </p>
                            
                            <div style={{ 
                                display: "inline-block", 
                                alignSelf: "flex-start",
                                padding: "4px 10px", 
                                backgroundColor: "#F3F4F6", 
                                color: "#4B5563", 
                                fontSize: "0.7rem", 
                                borderRadius: "6px",
                                fontWeight: 500
                            }}>
                                {item.category}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredItems.length === 0 && (
                <div style={{ textAlign: "center", padding: "4rem 0", color: "#6B7280", backgroundColor: "#FFF", borderRadius: "16px", border: "1px dashed #E5E7EB" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                    <p style={{ fontSize: "1.1rem", fontWeight: 500, margin: 0 }}>Aucun produit trouvé dans cette catégorie.</p>
                </div>
            )}
        </div>
    );
}
