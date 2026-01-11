"use client";

import { useState } from "react";
import { ShoppingBag, ChevronLeft, Plus, Minus, X, Clock, Check, Search } from "lucide-react";
import Link from "next/link";

// Menu categories
const categories = [
    { id: "boissons", label: "Boissons", emoji: "🍹" },
    { id: "mocktails", label: "Mocktails", emoji: "🍸" },
    { id: "desserts", label: "Desserts", emoji: "🍨" },
    { id: "snacks", label: "Snacks", emoji: "🍟" },
    { id: "fruits", label: "Fruits", emoji: "🍉" },
];

// Menu items
const menuItems = [
    // Boissons
    { id: "1", name: "Eau Minérale", description: "50cl", price: 3, category: "boissons", image: "💧" },
    { id: "2", name: "Coca-Cola", description: "33cl", price: 4, category: "boissons", image: "🥤" },
    { id: "3", name: "Jus d'Orange Frais", description: "Pressé à la minute", price: 6, category: "boissons", image: "🍊" },
    { id: "4", name: "Limonade Maison", description: "Citron & menthe", price: 5, category: "boissons", image: "🍋" },
    { id: "5", name: "Thé Glacé", description: "Pêche ou citron", price: 5, category: "boissons", image: "🧊" },
    // Mocktails (sans alcool)
    { id: "6", name: "Virgin Mojito", description: "Menthe, citron vert, eau gazeuse", price: 8, category: "mocktails", image: "🍹", popular: true },
    { id: "7", name: "Virgin Piña Colada", description: "Coco, ananas, crème", price: 9, category: "mocktails", image: "🥥" },
    { id: "8", name: "Sunset Tropical", description: "Fruits de la passion, mangue", price: 9, category: "mocktails", image: "🍊", popular: true },
    { id: "9", name: "Blue Lagoon", description: "Citron, sirop de curaçao, eau gazeuse", price: 8, category: "mocktails", image: "🍸" },
    { id: "10", name: "Smoothie Énergisant", description: "Banane, fraise, yaourt", price: 7, category: "mocktails", image: "🌿" },
    // Desserts
    { id: "11", name: "Glace Artisanale", description: "2 boules au choix", price: 7, category: "desserts", image: "🍨", popular: true },
    { id: "12", name: "Tiramisu", description: "Recette maison", price: 9, category: "desserts", image: "🍰" },
    { id: "13", name: "Salade de Fruits", description: "Fruits frais de saison", price: 8, category: "desserts", image: "🍇" },
    // Snacks
    { id: "14", name: "Frites Maison", description: "Portion généreuse", price: 6, category: "snacks", image: "🍟" },
    { id: "15", name: "Bruschetta", description: "Tomates, basilic, mozzarella", price: 10, category: "snacks", image: "🍞" },
    { id: "16", name: "Olives Marinées", description: "Assortiment méditerranéen", price: 5, category: "snacks", image: "🫒" },
    // Fruits (gratuit avec pack)
    { id: "17", name: "Panier de Fruits", description: "Inclus dans votre pack", price: 0, category: "fruits", image: "🍉", included: true },
    { id: "18", name: "Pastèque Fraîche", description: "Tranche généreuse", price: 0, category: "fruits", image: "🍉", included: true },
];

interface CartItem {
    item: typeof menuItems[0];
    quantity: number;
}

interface OrderStatus {
    id: string;
    status: "pending" | "preparing" | "ready" | "served";
    items: CartItem[];
    createdAt: Date;
}

export default function MenuOrderPage() {
    const [activeCategory, setActiveCategory] = useState("mocktails");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState<OrderStatus | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = menuItems.filter((item) => {
        const matchesCategory = item.category === activeCategory;
        const matchesSearch = searchQuery === "" ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const addToCart = (item: typeof menuItems[0]) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.item.id === item.id);
            if (existing) {
                return prev.map((c) =>
                    c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
                );
            }
            return [...prev, { item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.item.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map((c) =>
                    c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
                );
            }
            return prev.filter((c) => c.item.id !== itemId);
        });
    };

    const clearCart = () => setCart([]);

    const totalPrice = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
    const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);

    const placeOrder = () => {
        if (cart.length === 0) return;

        const order: OrderStatus = {
            id: `ORD-${Date.now()}`,
            status: "pending",
            items: [...cart],
            createdAt: new Date(),
        };

        setOrderPlaced(order);
        setCart([]);
        setShowCart(false);

        // Simulate order progress
        setTimeout(() => {
            setOrderPlaced((prev) => prev ? { ...prev, status: "preparing" } : null);
        }, 3000);

        setTimeout(() => {
            setOrderPlaced((prev) => prev ? { ...prev, status: "ready" } : null);
        }, 8000);
    };

    return (
        <div style={{ maxWidth: "100%", paddingBottom: cart.length > 0 ? "100px" : "0" }}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <Link
                    href="/dashboard"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#6B7280",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        marginBottom: "0.5rem",
                    }}
                >
                    <ChevronLeft style={{ width: 16, height: 16 }} />
                    Retour
                </Link>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <ShoppingBag style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222", margin: 0 }}>
                            Commander
                        </h1>
                    </div>
                </div>
            </div>

            {/* Active Order Status */}
            {orderPlaced && (
                <div
                    style={{
                        marginBottom: "1.5rem",
                        padding: "1rem",
                        backgroundColor: orderPlaced.status === "ready" ? "#DCFCE7" : "#FEF3C7",
                        borderRadius: "16px",
                        border: orderPlaced.status === "ready" ? "2px solid #22C55E" : "2px solid #F59E0B",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {orderPlaced.status === "ready" ? (
                                <Check style={{ width: 24, height: 24, color: "#22C55E" }} />
                            ) : (
                                <Clock style={{ width: 24, height: 24, color: "#F59E0B" }} />
                            )}
                            <div>
                                <p style={{ fontWeight: 600, color: orderPlaced.status === "ready" ? "#166534" : "#92400E", margin: 0 }}>
                                    {orderPlaced.status === "pending" && "Commande envoyée"}
                                    {orderPlaced.status === "preparing" && "En préparation..."}
                                    {orderPlaced.status === "ready" && "Prête ! 🎉"}
                                </p>
                                <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: "2px 0 0 0" }}>
                                    {orderPlaced.items.length} article(s) • {orderPlaced.id}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setOrderPlaced(null)}
                            style={{
                                padding: "4px",
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            <X style={{ width: 16, height: 16, color: "#6B7280" }} />
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}
            <div style={{ marginBottom: "1rem" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        backgroundColor: "#FFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <Search style={{ width: 18, height: 18, color: "#9CA3AF" }} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: "0.875rem",
                            backgroundColor: "transparent",
                        }}
                    />
                </div>
            </div>

            {/* Categories */}
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    overflowX: "auto",
                    paddingBottom: "12px",
                    marginBottom: "1rem",
                }}
            >
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "10px 16px",
                            backgroundColor: activeCategory === cat.id ? "#E8A87C" : "#FFF",
                            color: activeCategory === cat.id ? "#FFF" : "#222",
                            border: activeCategory === cat.id ? "none" : "1px solid #E5E7EB",
                            borderRadius: "100px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <span>{cat.emoji}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Menu Items Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "12px",
                }}
            >
                {filteredItems.map((item) => {
                    const cartItem = cart.find((c) => c.item.id === item.id);
                    const quantity = cartItem?.quantity || 0;

                    return (
                        <div
                            key={item.id}
                            style={{
                                backgroundColor: "#FFF",
                                borderRadius: "16px",
                                padding: "1rem",
                                border: quantity > 0 ? "2px solid #E8A87C" : "1px solid #E5E7EB",
                                position: "relative",
                            }}
                        >
                            {/* Popular badge */}
                            {item.popular && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "8px",
                                        right: "8px",
                                        padding: "2px 6px",
                                        backgroundColor: "#FEF3C7",
                                        color: "#92400E",
                                        fontSize: "0.6rem",
                                        fontWeight: 600,
                                        borderRadius: "100px",
                                    }}
                                >
                                    POPULAIRE
                                </span>
                            )}

                            {/* Item emoji/image */}
                            <div
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    backgroundColor: item.included ? "#DCFCE7" : "#FEF3E2",
                                    borderRadius: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "2rem",
                                    marginBottom: "10px",
                                }}
                            >
                                {item.image}
                            </div>

                            {/* Item info */}
                            <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#222", margin: "0 0 4px 0" }}>
                                {item.name}
                            </h3>
                            <p style={{ fontSize: "0.7rem", color: "#6B7280", margin: "0 0 10px 0" }}>
                                {item.description}
                            </p>

                            {/* Price and add button */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "1rem", fontWeight: 700, color: item.included ? "#22C55E" : "#222" }}>
                                    {item.included ? "Gratuit" : `${item.price} TND`}
                                </span>

                                {quantity === 0 ? (
                                    <button
                                        onClick={() => addToCart(item)}
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            backgroundColor: "#E8A87C",
                                            border: "none",
                                            borderRadius: "10px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Plus style={{ width: 20, height: 20, color: "#FFF" }} />
                                    </button>
                                ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                backgroundColor: "#F3F4F6",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Minus style={{ width: 14, height: 14, color: "#6B7280" }} />
                                        </button>
                                        <span style={{ fontWeight: 600, color: "#E8A87C", minWidth: "20px", textAlign: "center" }}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => addToCart(item)}
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                backgroundColor: "#E8A87C",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Plus style={{ width: 14, height: 14, color: "#FFF" }} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "calc(100% - 40px)",
                        maxWidth: "500px",
                        zIndex: 50,
                    }}
                >
                    <button
                        onClick={() => setShowCart(true)}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "16px 20px",
                            backgroundColor: "#E8A87C",
                            border: "none",
                            borderRadius: "16px",
                            cursor: "pointer",
                            boxShadow: "0 10px 40px rgba(232,168,124,0.4)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    backgroundColor: "rgba(255,255,255,0.3)",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <ShoppingBag style={{ width: 16, height: 16, color: "#FFF" }} />
                            </div>
                            <span style={{ color: "#FFF", fontWeight: 600 }}>
                                {totalItems} article{totalItems > 1 ? "s" : ""}
                            </span>
                        </div>
                        <span style={{ color: "#FFF", fontWeight: 700, fontSize: "1.125rem" }}>
                            {totalPrice} TND →
                        </span>
                    </button>
                </div>
            )}

            {/* Cart Modal */}
            {showCart && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 100,
                        display: "flex",
                        alignItems: "flex-end",
                    }}
                    onClick={(e) => e.target === e.currentTarget && setShowCart(false)}
                >
                    <div
                        style={{
                            width: "100%",
                            maxHeight: "80vh",
                            backgroundColor: "#FFF",
                            borderRadius: "24px 24px 0 0",
                            padding: "1.5rem",
                            overflowY: "auto",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#222", margin: 0 }}>
                                Votre commande
                            </h2>
                            <button
                                onClick={() => setShowCart(false)}
                                style={{
                                    padding: "8px",
                                    backgroundColor: "#F3F4F6",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                }}
                            >
                                <X style={{ width: 20, height: 20, color: "#6B7280" }} />
                            </button>
                        </div>

                        {/* Cart items */}
                        <div style={{ marginBottom: "1.5rem" }}>
                            {cart.map((cartItem) => (
                                <div
                                    key={cartItem.item.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "12px 0",
                                        borderBottom: "1px solid #E5E7EB",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            backgroundColor: "#FEF3E2",
                                            borderRadius: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.5rem",
                                        }}
                                    >
                                        {cartItem.item.image}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 500, color: "#222", margin: 0 }}>{cartItem.item.name}</p>
                                        <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: "2px 0 0 0" }}>
                                            {cartItem.item.price} TND x {cartItem.quantity}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <button
                                            onClick={() => removeFromCart(cartItem.item.id)}
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                backgroundColor: "#F3F4F6",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Minus style={{ width: 14, height: 14, color: "#6B7280" }} />
                                        </button>
                                        <span style={{ fontWeight: 600, minWidth: "20px", textAlign: "center" }}>
                                            {cartItem.quantity}
                                        </span>
                                        <button
                                            onClick={() => addToCart(cartItem.item)}
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                backgroundColor: "#E8A87C",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Plus style={{ width: 14, height: 14, color: "#FFF" }} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "1rem 0",
                                borderTop: "2px solid #E5E7EB",
                                marginBottom: "1rem",
                            }}
                        >
                            <span style={{ fontWeight: 600, color: "#222" }}>Total</span>
                            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222" }}>{totalPrice} TND</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={clearCart}
                                style={{
                                    flex: 1,
                                    padding: "14px",
                                    backgroundColor: "#F3F4F6",
                                    border: "none",
                                    borderRadius: "12px",
                                    color: "#374151",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                Vider
                            </button>
                            <button
                                onClick={placeOrder}
                                style={{
                                    flex: 2,
                                    padding: "14px",
                                    backgroundColor: "#E8A87C",
                                    border: "none",
                                    borderRadius: "12px",
                                    color: "#FFF",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Commander maintenant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
