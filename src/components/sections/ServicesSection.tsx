"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Star, Car, Ship, Utensils, Umbrella } from "lucide-react";
import * as Icons from "lucide-react";
import { getServices } from "@/app/actions/cms";
import Link from "next/link";

interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    link?: string;
}

const inclusions = [
    {
        icon: Car,
        label: "Parking Sécurisé",
        description: "Stationnement privé et surveillé pour votre tranquillité d'esprit pendant votre journée."
    },
    {
        icon: Ship,
        label: "Traversée en Bateau",
        description: "Transport en Zodiac depuis le parking jusqu'à la plage, une aventure en soi."
    },
    {
        icon: Utensils,
        label: "Déjeuner Complet",
        description: "Savourez un délicieux repas de poisson frais préparé par nos chefs."
    },
    {
        icon: Umbrella,
        label: "Équipement Plage",
        description: "Cabane, paillote en mer et parasol inclus pour toute la journée."
    },
];

export function ServicesSection({ experienceImages = [] }: { experienceImages?: { url: string; alt?: string }[] }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    // Default images if CMS doesn't provide any
    const defaultImages = [
        { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", alt: "Plage tropicale" },
        { url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", alt: "Parasol plage" },
    ];
    const images = experienceImages.length >= 2 ? experienceImages : defaultImages;

    useEffect(() => {
        const loadServices = async () => {
            const data = await getServices();
            setServices(data || []);
            setLoading(false);
        };
        loadServices();
    }, []);

    const renderIcon = (iconName: string) => {
        const Icon = (Icons as any)[iconName] || Star;
        return <Icon style={{ width: 32, height: 32, color: "#FFFFFF" }} />;
    };

    return (
        <section
            id="services"
            ref={ref}
            style={{
                padding: "7rem 0",
                backgroundColor: "#FFFFFF",
            }}
        >
            <div className="container">
                {/* Experience Section - New Layout */}
                <div className="experience-grid">
                    {/* Left: Organic Images - 2 shapes like reference */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="experience-images"
                    >
                        {/* Large shape - rounded top-right, curved bottom */}
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: "300px",
                                height: "480px",
                                borderRadius: "0 150px 150px 150px",
                                overflow: "hidden",
                                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.12)",
                            }}
                        >
                            <img
                                src={images[0]?.url}
                                alt={images[0]?.alt || "Experience 1"}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                        {/* Vertical oval shape - overlapping right */}
                        <div
                            style={{
                                position: "absolute",
                                left: "210px",
                                top: "100px",
                                width: "260px",
                                height: "360px",
                                borderRadius: "130px",
                                overflow: "hidden",
                                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
                                border: "8px solid #FFFFFF",
                                background: "#FFFFFF",
                            }}
                        >
                            <img
                                src={images[1]?.url}
                                alt={images[1]?.alt || "Experience 2"}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                    </motion.div>

                    {/* Right: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h2
                            style={{
                                fontSize: "2.8rem",
                                color: "#222222",
                                marginBottom: "1.5rem",
                                lineHeight: 1.2,
                            }}
                        >
                            <span style={{ fontWeight: 700 }}>Vivez une </span>
                            <span style={{ fontWeight: 300 }}>Expérience</span>
                            <br />
                            <span style={{ fontWeight: 300 }}>Unique.</span>
                        </h2>
                        <p
                            style={{
                                fontSize: "1rem",
                                color: "#7A7A7A",
                                lineHeight: 1.7,
                                marginBottom: "2.5rem",
                            }}
                        >
                            Situé sur la plage Coucou, accessible uniquement par bateau depuis notre parking privé,
                            le Latino Coucou Beach vous propose un forfait complet pour une journée inoubliable
                            sur une plage vierge loin de tout encombrement.
                        </p>

                        {/* Features List */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {inclusions.map((item, index) => {
                                const Icon = item.icon;
                                // Alternate between brand colors
                                const iconColors = ["#E8A87C", "#43B0A8", "#E8A87C", "#43B0A8"];
                                const bgColor = iconColors[index % iconColors.length];
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "1rem",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius: "12px",
                                                backgroundColor: bgColor,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon style={{ width: 24, height: 24, color: "#FFFFFF" }} />
                                        </div>
                                        <div>
                                            <h4 style={{
                                                fontSize: "1.1rem",
                                                fontWeight: 600,
                                                color: "#222222",
                                                marginBottom: "0.25rem",
                                            }}>
                                                {item.label}
                                            </h4>
                                            <p style={{
                                                fontSize: "0.9rem",
                                                color: "#7A7A7A",
                                                lineHeight: 1.5,
                                                margin: 0,
                                            }}>
                                                {item.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* Services Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ textAlign: "center", marginBottom: "3rem" }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            color: "#E8A87C",
                            textTransform: "uppercase",
                            letterSpacing: "2px",
                            marginBottom: "0.5rem",
                        }}
                    >
                        Ce que nous offrons
                    </span>
                    <h3
                        style={{
                            fontSize: "2rem",
                            fontWeight: 600,
                            color: "#222222",
                        }}
                    >
                        Nos Services
                    </h3>
                </motion.div>

                {loading && (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                        <p style={{ color: "#7A7A7A" }}>Chargement des services...</p>
                    </div>
                )}

                {!loading && services.length === 0 && (
                    <div style={{ textAlign: "center", padding: "2rem", backgroundColor: "#FEF2F2", borderRadius: "12px", color: "#DC2626" }}>
                        <p>Aucun service trouvé.</p>
                    </div>
                )}

                {/* Service Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "2rem",
                    }}
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id || index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            style={{
                                backgroundColor: "#FFFFFF",
                                borderRadius: "24px",
                                padding: "2.5rem",
                                textAlign: "center",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-8px)";
                                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.12)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
                            }}
                        >
                            <div
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    margin: "0 auto 1.5rem",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #E8A87C, #C68B5B)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {renderIcon(service.icon)}
                            </div>
                            <h3
                                style={{
                                    fontSize: "1.4rem",
                                    fontWeight: 600,
                                    marginBottom: "1rem",
                                    color: "#222222",
                                }}
                            >
                                {service.title}
                            </h3>
                            <p
                                style={{
                                    fontSize: "1rem",
                                    color: "#7A7A7A",
                                    lineHeight: 1.6,
                                    marginBottom: "1.5rem",
                                }}
                            >
                                {service.description}
                            </p>
                            <a
                                href="#"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    color: "#E8A87C",
                                    fontWeight: 500,
                                    textDecoration: "none",
                                }}
                            >
                                {service.link || "En savoir plus"}
                                <ArrowRight style={{ width: 16, height: 16 }} />
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Responsive */}
            <style jsx global>{`
                .experience-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    margin-bottom: 5rem;
                    align-items: center;
                }
                .experience-images {
                    position: relative;
                    height: 500px;
                    min-height: 500px;
                }
                @media (max-width: 1024px) {
                    .experience-grid {
                        grid-template-columns: 1fr;
                        gap: 3rem;
                    }
                    .experience-images {
                        display: none;
                    }
                }
            `}</style>
        </section>
    );
}

