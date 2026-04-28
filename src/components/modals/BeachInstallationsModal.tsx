"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Umbrella, ArrowRight, Crown, Sun, Waves, TreePalm } from "lucide-react";
import { useRouter } from "next/navigation";

interface BeachInstallation {
    id: string;
    title: string;
    price: number;
    description: string;
    image: string;
    icon: React.ElementType;
    color: string;
    badge?: string;
}

import { useState, useEffect } from "react";
import { getBeachInstallations } from "@/app/actions/cms";
import * as Icons from "lucide-react";

interface BeachInstallationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceImage: string;
    serviceDescription: string;
}

export function BeachInstallationsModal({
    isOpen,
    onClose,
    serviceImage,
    serviceDescription,
}: BeachInstallationsModalProps) {
    const router = useRouter();
    const [installations, setInstallations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadInstallations();
        }
    }, [isOpen]);

    const loadInstallations = async () => {
        setLoading(true);
        const data = await getBeachInstallations();
        setInstallations(data || []);
        setLoading(false);
    };

    const renderIcon = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName] || Icons.Umbrella;
        return IconComponent;
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
                                    background:
                                        "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)",
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
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform = "scale(1.1)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform = "scale(1)")
                                }
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
                                            background:
                                                "linear-gradient(135deg, #43B0A8, #2D8A83)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Umbrella
                                            style={{ width: 24, height: 24, color: "#FFFFFF" }}
                                        />
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
                                            Plage Privée
                                        </h2>
                                        <p
                                            style={{
                                                fontSize: "0.875rem",
                                                color: "rgba(255,255,255,0.8)",
                                                margin: 0,
                                            }}
                                        >
                                            Nos Installations
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                overflowX: "hidden",
                                padding: "1.5rem",
                            }}
                        >
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

                            {/* Section title */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    marginBottom: "1.25rem",
                                    paddingBottom: "0.75rem",
                                    borderBottom: "2px solid rgba(67,176,168,0.2)",
                                }}
                            >
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "10px",
                                        backgroundColor: "rgba(67,176,168,0.1)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Umbrella
                                        style={{ width: 20, height: 20, color: "#43B0A8" }}
                                    />
                                </div>
                                <div>
                                    <h3
                                        style={{
                                            fontSize: "1.125rem",
                                            fontWeight: 700,
                                            color: "#222222",
                                            margin: 0,
                                        }}
                                    >
                                        Nos Installations
                                    </h3>
                                    <span
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "#43B0A8",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Choisissez votre confort
                                    </span>
                                </div>
                            </div>

                            {/* Installation Cards - 2x2 Grid */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    gap: "1rem",
                                }}
                                className="beach-installations-grid"
                            >
                                {loading ? (
                                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "#7A7A7A" }}>
                                        Chargement des installations...
                                    </div>
                                ) : installations.map((installation, index) => {
                                    const Icon = renderIcon(installation.icon);
                                    return (
                                        <motion.div
                                            key={installation.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.4,
                                                delay: index * 0.1,
                                            }}
                                            style={{
                                                backgroundColor: "#FFFFFF",
                                                borderRadius: "16px",
                                                overflow: "hidden",
                                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                                border: "1px solid rgba(0,0,0,0.05)",
                                                transition:
                                                    "transform 0.3s ease, box-shadow 0.3s ease",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform =
                                                    "translateY(-4px)";
                                                e.currentTarget.style.boxShadow =
                                                    "0 12px 30px rgba(0,0,0,0.14)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform =
                                                    "translateY(0)";
                                                e.currentTarget.style.boxShadow =
                                                    "0 4px 20px rgba(0,0,0,0.08)";
                                            }}
                                        >
                                            {/* Image */}
                                            <div
                                                style={{
                                                    position: "relative",
                                                    height: "140px",
                                                    backgroundImage: `url(${installation.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80'})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                }}
                                            >
                                                {/* Badge */}
                                                {installation.badge && (
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            top: "10px",
                                                            left: "10px",
                                                            padding: "4px 10px",
                                                            backgroundColor:
                                                                installation.color,
                                                            color: "#FFFFFF",
                                                            borderRadius: "6px",
                                                            fontSize: "0.65rem",
                                                            fontWeight: 700,
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.5px",
                                                        }}
                                                    >
                                                        {installation.badge}
                                                    </div>
                                                )}

                                                {/* Icon badge bottom-right */}
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        bottom: "-16px",
                                                        right: "12px",
                                                        width: "36px",
                                                        height: "36px",
                                                        borderRadius: "10px",
                                                        backgroundColor: installation.color,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        boxShadow:
                                                            "0 4px 12px rgba(0,0,0,0.15)",
                                                        border: "2px solid #FFFFFF",
                                                    }}
                                                >
                                                    <Icon
                                                        style={{
                                                            width: 16,
                                                            height: 16,
                                                            color: "#FFFFFF",
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div style={{ padding: "16px 14px 14px" }}>
                                                <h4
                                                    style={{
                                                        fontSize: "0.9rem",
                                                        fontWeight: 700,
                                                        color: "#222",
                                                        margin: 0,
                                                        marginBottom: "6px",
                                                        lineHeight: 1.3,
                                                    }}
                                                >
                                                    {installation.title}
                                                </h4>
                                                <p
                                                    style={{
                                                        fontSize: "0.78rem",
                                                        color: "#777",
                                                        lineHeight: 1.5,
                                                        margin: 0,
                                                        marginBottom: "10px",
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {installation.description}
                                                </p>

                                                {/* Price */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "baseline",
                                                        gap: "4px",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: "0.7rem",
                                                            color: "#999",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        à partir de
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: "1.15rem",
                                                            fontWeight: 700,
                                                            color: installation.color,
                                                        }}
                                                    >
                                                        {installation.price}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: "0.8rem",
                                                            fontWeight: 600,
                                                            color: installation.color,
                                                        }}
                                                    >
                                                        DT
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer CTA */}
                        <div
                            style={{
                                padding: "1.25rem 1.5rem",
                                borderTop: "1px solid rgba(0,0,0,0.08)",
                                background: "rgba(255,255,255,0.8)",
                                flexShrink: 0,
                            }}
                        >
                            <button
                                onClick={() => {
                                    onClose();
                                    router.push("/reservation");
                                }}
                                style={{
                                    width: "100%",
                                    padding: "14px 24px",
                                    backgroundColor: "#43B0A8",
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
                                    e.currentTarget.style.backgroundColor = "#389890";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#43B0A8";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                Réserver maintenant
                                <ArrowRight style={{ width: 18, height: 18 }} />
                            </button>
                        </div>
                    </motion.div>

                    {/* Responsive grid: 1 column on mobile */}
                    <style jsx global>{`
                        @media (max-width: 560px) {
                            .beach-installations-grid {
                                grid-template-columns: 1fr !important;
                            }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
