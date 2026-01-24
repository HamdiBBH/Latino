"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wine, Coffee, Citrus, GlassWater, Blend, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { getMenuItems } from "@/app/actions/cms";

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    tags: string[];
    is_active: boolean;
    image_url?: string;
}

interface DrinksMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceImage: string;
    serviceDescription: string;
}

// Drinks categories based on the menu
const drinksCategories = [
    {
        id: "cocktail",
        title: "Cocktails",
        subtitle: "Créations rafraîchissantes",
        icon: Wine,
        color: "#E85D75"
    },
    {
        id: "jus",
        title: "Jus Frais",
        subtitle: "Pressés à la minute",
        icon: Citrus,
        color: "#FF9F43"
    },
    {
        id: "duo-jus",
        title: "Duo Jus",
        subtitle: "Mélanges savoureux",
        icon: Blend,
        color: "#4ECDC4"
    },
    {
        id: "café",
        title: "Café & Autres",
        subtitle: "Boissons chaudes & plus",
        icon: Coffee,
        color: "#8B5A2B"
    },
];

// Default images for drinks categories
const defaultImages: Record<string, string> = {
    'cocktail': 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=300&h=200&fit=crop',
    'jus': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop',
    'duo-jus': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=300&h=200&fit=crop',
    'café': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop',
    'chicha': 'https://images.unsplash.com/photo-1527661591475-527312dd65f3?w=300&h=200&fit=crop',
};

export function DrinksMenuModal({ isOpen, onClose, serviceImage, serviceDescription }: DrinksMenuModalProps) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadMenuItems();
        }
    }, [isOpen]);

    const loadMenuItems = async () => {
        setLoading(true);
        const data = await getMenuItems();
        // Filter only drinks (cocktails and boissons categories)
        const drinks = (data as MenuItem[]).filter(item =>
            item.category === "cocktails" || item.category === "boissons"
        );
        setMenuItems(drinks);
        setLoading(false);
    };

    const getItemsByTag = (tag: string) => {
        return menuItems.filter(item =>
            item.is_active && item.tags?.includes(tag)
        );
    };

    // Special handling for chicha which has its own tag
    const getChichaItems = () => {
        return menuItems.filter(item =>
            item.is_active && item.tags?.includes("chicha")
        );
    };

    // Get café items including chicha
    const getCafeAndOthers = () => {
        return menuItems.filter(item =>
            item.is_active && (item.tags?.includes("café") || item.tags?.includes("chicha"))
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.85)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: "rgba(255,255,255,0.95)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            borderRadius: "24px",
                            overflow: "hidden",
                            maxWidth: "900px",
                            width: "100%",
                            maxHeight: "90vh",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Header with Image */}
                        <div
                            style={{
                                position: "relative",
                                height: "200px",
                                backgroundImage: `url(${serviceImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                flexShrink: 0,
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)",
                                }}
                            />
                            <button
                                onClick={onClose}
                                style={{
                                    position: "absolute",
                                    top: "1rem",
                                    right: "1rem",
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(255,255,255,0.9)",
                                    backdropFilter: "blur(10px)",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "transform 0.2s",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                            >
                                <X style={{ width: 22, height: 22, color: "#222222" }} />
                            </button>

                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "1.5rem",
                                    left: "1.5rem",
                                    right: "1.5rem",
                                }}
                            >
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "12px 20px",
                                        borderRadius: "16px",
                                        background: "rgba(255,255,255,0.15)",
                                        backdropFilter: "blur(12px)",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "12px",
                                            background: "linear-gradient(135deg, #E85D75, #C94B63)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Wine style={{ width: 24, height: 24, color: "#FFFFFF" }} />
                                    </div>
                                    <div>
                                        <h2
                                            style={{
                                                fontSize: "1.5rem",
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                margin: 0,
                                                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                            }}
                                        >
                                            Bar & Boissons
                                        </h2>
                                        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                                            Cocktails & Jus Frais
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menu Content */}
                        <div style={{
                            flex: 1,
                            overflowY: "auto",
                            overflowX: "hidden",
                            padding: "1.5rem",
                        }}>
                            {/* Description */}
                            <p
                                style={{
                                    fontSize: "1rem",
                                    lineHeight: 1.6,
                                    color: "#555555",
                                    marginBottom: "1.5rem",
                                    textAlign: "center",
                                }}
                            >
                                {serviceDescription}
                            </p>

                            {loading ? (
                                <div style={{ textAlign: "center", padding: "3rem" }}>
                                    <Loader2 style={{ width: 40, height: 40, color: "#E85D75", animation: "spin 1s linear infinite" }} />
                                    <p style={{ marginTop: "1rem", color: "#7A7A7A" }}>Chargement des boissons...</p>
                                </div>
                            ) : (
                                <div style={{ display: "grid", gap: "1.5rem" }}>
                                    {drinksCategories.map((category) => {
                                        // Special handling for café category to include chicha
                                        const items = category.id === "café"
                                            ? getCafeAndOthers()
                                            : getItemsByTag(category.id);

                                        if (items.length === 0) return null;

                                        const Icon = category.icon;
                                        return (
                                            <div
                                                key={category.id}
                                                style={{
                                                    padding: "1.25rem",
                                                    borderRadius: "16px",
                                                    background: "rgba(255,255,255,0.6)",
                                                    backdropFilter: "blur(10px)",
                                                    border: "1px solid rgba(0,0,0,0.06)",
                                                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {/* Category Header */}
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "12px",
                                                    marginBottom: "1rem",
                                                    paddingBottom: "0.75rem",
                                                    borderBottom: `2px solid ${category.color}20`,
                                                }}>
                                                    <div
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            borderRadius: "10px",
                                                            backgroundColor: `${category.color}15`,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <Icon style={{ width: 20, height: 20, color: category.color }} />
                                                    </div>
                                                    <div>
                                                        <h3 style={{
                                                            fontSize: "1.125rem",
                                                            fontWeight: 700,
                                                            color: "#222222",
                                                            margin: 0,
                                                        }}>
                                                            {category.title}
                                                        </h3>
                                                        <span style={{
                                                            fontSize: "0.75rem",
                                                            color: category.color,
                                                            fontWeight: 500,
                                                        }}>
                                                            {category.subtitle}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Menu Items - Horizontal Scroll Cards */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "1rem",
                                                        overflowX: "auto",
                                                        overflowY: "visible",
                                                        paddingBottom: "0.75rem",
                                                        marginLeft: "-0.5rem",
                                                        marginRight: "-0.5rem",
                                                        paddingLeft: "0.5rem",
                                                        paddingRight: "0.5rem",
                                                        scrollbarWidth: "thin",
                                                        scrollbarColor: `${category.color}40 transparent`,
                                                    }}
                                                    className="menu-cards-scroll"
                                                >
                                                    {items.map((item) => {
                                                        // Determine the image based on item tags
                                                        let imageUrl = defaultImages['jus'];
                                                        if (item.tags?.includes('cocktail')) imageUrl = defaultImages['cocktail'];
                                                        else if (item.tags?.includes('duo-jus')) imageUrl = defaultImages['duo-jus'];
                                                        else if (item.tags?.includes('café')) imageUrl = defaultImages['café'];
                                                        else if (item.tags?.includes('chicha')) imageUrl = defaultImages['chicha'];

                                                        // Check if this is a signature/special item
                                                        const isSignature = item.tags?.includes('signature') || item.tags?.includes('premium');

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                style={{
                                                                    minWidth: "160px",
                                                                    maxWidth: "160px",
                                                                    backgroundColor: "#FFFFFF",
                                                                    borderRadius: "16px",
                                                                    overflow: "hidden",
                                                                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                                                                    flexShrink: 0,
                                                                    transition: "transform 0.2s, box-shadow 0.2s",
                                                                    cursor: "pointer",
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = "translateY(-4px)";
                                                                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.12)";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = "translateY(0)";
                                                                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.08)";
                                                                }}
                                                            >
                                                                {/* Image Container */}
                                                                <div style={{
                                                                    position: "relative",
                                                                    height: "100px",
                                                                    backgroundImage: `url(${imageUrl})`,
                                                                    backgroundSize: "cover",
                                                                    backgroundPosition: "center",
                                                                }}>
                                                                    {/* Signature Badge */}
                                                                    {isSignature && (
                                                                        <div style={{
                                                                            position: "absolute",
                                                                            top: "8px",
                                                                            right: "8px",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "3px",
                                                                            padding: "4px 8px",
                                                                            backgroundColor: "rgba(232,93,117,0.95)",
                                                                            borderRadius: "20px",
                                                                            fontSize: "0.65rem",
                                                                            fontWeight: 600,
                                                                            color: "#FFF",
                                                                        }}>
                                                                            <Sparkles style={{
                                                                                width: 10,
                                                                                height: 10,
                                                                            }} />
                                                                            Signature
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Content */}
                                                                <div style={{ padding: "12px" }}>
                                                                    <h4 style={{
                                                                        fontSize: "0.85rem",
                                                                        fontWeight: 600,
                                                                        color: "#222",
                                                                        margin: 0,
                                                                        marginBottom: "6px",
                                                                        lineHeight: 1.3,
                                                                        display: "-webkit-box",
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: "vertical",
                                                                        overflow: "hidden",
                                                                    }}>
                                                                        {item.name}
                                                                    </h4>

                                                                    {/* Price */}
                                                                    <span style={{
                                                                        fontSize: "1rem",
                                                                        fontWeight: 700,
                                                                        color: category.color,
                                                                    }}>
                                                                        {item.price} DT
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer CTA */}
                        <div style={{
                            padding: "1.25rem 1.5rem",
                            borderTop: "1px solid rgba(0,0,0,0.08)",
                            background: "rgba(255,255,255,0.8)",
                            flexShrink: 0,
                        }}>
                            <button
                                onClick={() => {
                                    onClose();
                                    document.getElementById("forfaits")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                style={{
                                    width: "100%",
                                    padding: "14px 24px",
                                    backgroundColor: "#E85D75",
                                    color: "#FFFFFF",
                                    border: "none",
                                    borderRadius: "12px",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#D4495F";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#E85D75";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                Réserver maintenant
                                <ArrowRight style={{ width: 18, height: 18 }} />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
