"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Utensils, Fish, Flame, Anchor, ArrowRight, Loader2, Star, Info } from "lucide-react";
import { getMenuItems } from "@/app/actions/cms";

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    tags: string[];
    is_active: boolean;
    rating?: number;
    badge?: string;
    old_price?: number;
    image_url?: string;
}

interface RestaurantMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceImage: string;
    serviceDescription: string;
}

// Group menu items by main category with subcategories
const menuGroups = [
    {
        id: "group-standard",
        title: "Menu Standard",
        subtitle: "Inclus dans le forfait",
        icon: Anchor,
        color: "#66B2FF",
        isSingle: true,
        subcategories: [
            {
                id: "menu-standard",
                title: "Plats",
                icon: Anchor,
                color: "#66B2FF"
            }
        ]
    },
    {
        id: "group-extras",
        title: "Plats en Extra",
        subtitle: "Découvrez nos spécialités",
        icon: Star,
        color: "#E8A87C",
        isSingle: false,
        subcategories: [
            {
                id: "pasta",
                title: "Latino's Pasta",
                icon: Utensils,
                color: "#E8A87C"
            },
            {
                id: "grill",
                title: "Latino's Grill",
                icon: Flame,
                color: "#FF6B6B"
            },
            {
                id: "seafood",
                title: "Spécialités & Fruits de mer",
                icon: Fish,
                color: "#4ECDC4"
            }
        ]
    }
];

// Default images for items without custom images
const defaultImages: Record<string, string> = {
    'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&h=200&fit=crop',
    'seafood': 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=300&h=200&fit=crop',
    'grill': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop',
    'menu-standard': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
};

export function RestaurantMenuModal({ isOpen, onClose, serviceImage, serviceDescription }: RestaurantMenuModalProps) {
    const router = useRouter();
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
        setMenuItems(data as MenuItem[]);
        setLoading(false);
    };

    const getItemsByTag = (tag: string) => {
        return menuItems.filter(item =>
            item.is_active && item.tags?.includes(tag)
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
                                            background: "linear-gradient(135deg, #E8A87C, #C68B5B)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Utensils style={{ width: 24, height: 24, color: "#FFFFFF" }} />
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
                                            Restaurant
                                        </h2>
                                        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                                            Notre Carte
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
                                    <Loader2 style={{ width: 40, height: 40, color: "#E8A87C", animation: "spin 1s linear infinite" }} />
                                    <p style={{ marginTop: "1rem", color: "#7A7A7A" }}>Chargement du menu...</p>
                                </div>
                            ) : (
                                <div style={{ display: "grid", gap: "1.5rem" }}>
                                    {menuGroups.map((group) => {
                                        // Check if group has any items across subcategories
                                        const hasItems = group.subcategories.some(sub => getItemsByTag(sub.id).length > 0);
                                        if (!hasItems) return null;

                                        const GroupIcon = group.icon;
                                        return (
                                            <div
                                                key={group.id}
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
                                                {/* Group Header */}
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "12px",
                                                    marginBottom: "1rem",
                                                    paddingBottom: "0.75rem",
                                                    borderBottom: `2px solid ${group.color}20`,
                                                }}>
                                                    <div
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            borderRadius: "10px",
                                                            backgroundColor: `${group.color}15`,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <GroupIcon style={{ width: 20, height: 20, color: group.color }} />
                                                    </div>
                                                    <div>
                                                        <h3 style={{
                                                            fontSize: "1.125rem",
                                                            fontWeight: 700,
                                                            color: "#222222",
                                                            margin: 0,
                                                        }}>
                                                            {group.title}
                                                        </h3>
                                                        <span style={{
                                                            fontSize: "0.75rem",
                                                            color: group.color,
                                                            fontWeight: 500,
                                                        }}>
                                                            {group.subtitle}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Smart UX Notice for Menu Standard */}
                                                {group.id === 'group-standard' && (
                                                    <div style={{
                                                        backgroundColor: `${group.color}10`,
                                                        border: `1px solid ${group.color}30`,
                                                        borderLeft: `4px solid ${group.color}`,
                                                        padding: "12px 16px",
                                                        borderRadius: "8px",
                                                        marginBottom: "1.25rem",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "12px",
                                                    }}>
                                                        <Info style={{ width: 24, height: 24, color: group.color, flexShrink: 0 }} />
                                                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#444", lineHeight: 1.5 }}>
                                                            <strong>Choix unique :</strong> Chaque forfait inclut <strong>un seul plat principal au choix</strong> par personne (Cordon bleu, Escalope ou Dorade).
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Subcategories */}
                                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                                    {group.subcategories.map((sub) => {
                                                        const items = getItemsByTag(sub.id);
                                                        if (items.length === 0) return null;

                                                        const SubIcon = sub.icon;

                                                        return (
                                                            <div key={sub.id}>
                                                                {/* Subcategory Header */}
                                                                {!group.isSingle && (
                                                                    <div style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "8px",
                                                                        marginBottom: "1rem",
                                                                    }}>
                                                                        <SubIcon style={{ width: 18, height: 18, color: sub.color }} />
                                                                        <h4 style={{
                                                                            fontSize: "1rem",
                                                                            fontWeight: 600,
                                                                            color: "#333",
                                                                            margin: 0,
                                                                        }}>
                                                                            {sub.title}
                                                                        </h4>
                                                                    </div>
                                                                )}

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
                                                                        scrollbarColor: `${group.color}40 transparent`,
                                                                    }}
                                                                    className="menu-cards-scroll"
                                                                >
                                                                    {items.map((item) => {
                                                                        const imageUrl = item.image_url || defaultImages[sub.id] || defaultImages['menu-standard'];

                                                                        return (
                                                                            <div
                                                                                key={item.id}
                                                                                style={{
                                                                                    minWidth: "180px",
                                                                                    maxWidth: "180px",
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
                                                                                    height: "120px",
                                                                                    backgroundImage: `url(${imageUrl})`,
                                                                                    backgroundSize: "cover",
                                                                                    backgroundPosition: "center",
                                                                                }}>
                                                                                    {/* Rating Badge */}
                                                                                    {item.rating && (
                                                                                        <div style={{
                                                                                            position: "absolute",
                                                                                            top: "8px",
                                                                                            right: "8px",
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                            gap: "3px",
                                                                                            padding: "4px 8px",
                                                                                            backgroundColor: "rgba(255,255,255,0.95)",
                                                                                            borderRadius: "20px",
                                                                                            fontSize: "0.75rem",
                                                                                            fontWeight: 600,
                                                                                            color: "#333",
                                                                                        }}>
                                                                                            <Star style={{
                                                                                                width: 12,
                                                                                                height: 12,
                                                                                                color: "#FFB800",
                                                                                                fill: "#FFB800"
                                                                                            }} />
                                                                                            {item.rating.toFixed(1)}
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Badge (Populaire, etc.) */}
                                                                                    {item.badge && (
                                                                                        <div style={{
                                                                                            position: "absolute",
                                                                                            bottom: "8px",
                                                                                            left: "8px",
                                                                                            padding: "4px 10px",
                                                                                            backgroundColor: sub.color,
                                                                                            color: "#FFFFFF",
                                                                                            borderRadius: "6px",
                                                                                            fontSize: "0.65rem",
                                                                                            fontWeight: 600,
                                                                                            textTransform: "uppercase",
                                                                                            letterSpacing: "0.5px",
                                                                                        }}>
                                                                                            {item.badge}
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
                                                                                        marginBottom: "8px",
                                                                                        lineHeight: 1.3,
                                                                                        display: "-webkit-box",
                                                                                        WebkitLineClamp: 2,
                                                                                        WebkitBoxOrient: "vertical",
                                                                                        overflow: "hidden",
                                                                                    }}>
                                                                                        {item.name}
                                                                                    </h4>

                                                                                    {/* Price */}
                                                                                    {item.price > 0 && (
                                                                                        <div style={{
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                            gap: "6px",
                                                                                        }}>
                                                                                            <span style={{
                                                                                                fontSize: "1rem",
                                                                                                fontWeight: 700,
                                                                                                color: sub.color,
                                                                                            }}>
                                                                                                {item.price} DT
                                                                                            </span>
                                                                                            {item.old_price && (
                                                                                                <span style={{
                                                                                                    fontSize: "0.75rem",
                                                                                                    color: "#999",
                                                                                                    textDecoration: "line-through",
                                                                                                }}>
                                                                                                    {item.old_price} DT
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Inclus tag for Menu Standard */}
                                                                                    {item.price === 0 && sub.id === "menu-standard" && (
                                                                                        <span style={{
                                                                                            fontSize: "0.75rem",
                                                                                            color: "#4CAF50",
                                                                                            fontWeight: 600,
                                                                                        }}>
                                                                                            ✓ Inclus
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
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
                                    router.push("/reservation");
                                }}
                                style={{
                                    width: "100%",
                                    padding: "14px 24px",
                                    backgroundColor: "#E8A87C",
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
                                    e.currentTarget.style.backgroundColor = "#D4956B";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#E8A87C";
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
