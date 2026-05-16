"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Car, Ship, Utensils, Umbrella, X } from "lucide-react";
import * as Icons from "lucide-react";
import { getServices } from "@/app/actions/cms";
import { RestaurantMenuModal } from "@/components/modals/RestaurantMenuModal";
import { DrinksMenuModal } from "@/components/modals/DrinksMenuModal";
import { BeachInstallationsModal } from "@/components/modals/BeachInstallationsModal";

interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    image_url?: string;
    link?: string;
}

// Default images for services without custom image
const defaultServiceImages: Record<string, string> = {
    "Restaurant": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
    "Cocktails Exotiques": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
    "Plage Privée": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    "Loisirs & Divertissement": "https://images.unsplash.com/photo-1571266028243-d220c6a8b0e7?w=600&q=80",
};

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
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showRestaurantMenu, setShowRestaurantMenu] = useState(false);
    const [showDrinksMenu, setShowDrinksMenu] = useState(false);
    const [showBeachModal, setShowBeachModal] = useState(false);

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

    const getServiceImage = (service: Service) => {
        if (service.image_url) return service.image_url;
        return defaultServiceImages[service.title] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80";
    };

    return (
        <section
            id="services"
            ref={ref}
            style={{
                padding: "7rem 0",
                backgroundColor: "#FFFFFF",
                overflow: "hidden",
            }}
        >
            <div className="container">
                {/* Experience Section - Kept the same */}
                <div className="experience-grid">
                    {/* Left: Organic Images */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="experience-images"
                    >
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
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ minWidth: 0 }}
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
                                const iconColors = ["#E8A87C", "#43B0A8", "#E8A87C", "#43B0A8"];
                                const bgColor = iconColors[index % iconColors.length];
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={isInView ? { opacity: 1, y: 0 } : {}}
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

                {/* NEW: Image-based Service Cards with Hover Effects */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "1.5rem",
                    }}
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id || index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            className="service-card"
                            onClick={() => {
                                // Check if it's the Restaurant service
                                if (service.title.toLowerCase().includes("restaurant")) {
                                    setShowRestaurantMenu(true);
                                    setSelectedService(service);
                                } else if (service.title.toLowerCase().includes("cocktail") || service.title.toLowerCase().includes("bar")) {
                                    setShowDrinksMenu(true);
                                    setSelectedService(service);
                                } else if (service.title.toLowerCase().includes("plage")) {
                                    setShowBeachModal(true);
                                    setSelectedService(service);
                                } else {
                                    setSelectedService(service);
                                }
                            }}
                            style={{
                                position: "relative",
                                borderRadius: "24px",
                                overflow: "hidden",
                                cursor: "pointer",
                                height: "380px",
                            }}
                        >
                            {/* Background Image */}
                            <div
                                className="service-card-image"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    backgroundImage: `url(${getServiceImage(service)})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    transition: "transform 0.5s ease",
                                }}
                            />

                            {/* Gradient Overlay - Hidden by default, appears on hover */}
                            <div
                                className="service-card-overlay"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)",
                                    transition: "background 0.4s ease",
                                }}
                            />

                            {/* Top-left: Icon + Title in glass container */}
                            <div
                                className="service-card-header"
                                style={{
                                    position: "absolute",
                                    top: "1.5rem",
                                    left: "1.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px 20px 12px 14px",
                                    borderRadius: "16px",
                                    background: "rgba(255,255,255,0.15)",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                }}
                            >
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "10px",
                                        background: "rgba(255,255,255,0.2)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {renderIcon(service.icon)}
                                </div>
                                <h3
                                    style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 600,
                                        color: "#FFFFFF",
                                        margin: 0,
                                        textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {service.title}
                                </h3>
                            </div>

                            {/* Bottom content - Appears on hover */}
                            <div
                                className="service-card-content"
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: "2rem",
                                    color: "#FFFFFF",
                                    opacity: 0,
                                    transform: "translateY(20px)",
                                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                            >
                                {/* Description */}
                                <p
                                    style={{
                                        fontSize: "0.95rem",
                                        lineHeight: 1.6,
                                        marginBottom: "1.25rem",
                                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                                    }}
                                >
                                    {service.description}
                                </p>

                                {/* Button */}
                                <button
                                    className="service-card-button"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "12px 24px",
                                        backgroundColor: "#FFFFFF",
                                        color: "#222222",
                                        border: "none",
                                        borderRadius: "100px",
                                        fontWeight: 600,
                                        fontSize: "0.9rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    En savoir plus
                                    <ArrowRight style={{ width: 16, height: 16 }} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Service Detail Modal (for non-restaurant/drinks services) */}
            <AnimatePresence>
                {selectedService && !showRestaurantMenu && !showDrinksMenu && !showBeachModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedService(null)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0,0,0,0.8)",
                            zIndex: 9999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "2rem",
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: "#FFFFFF",
                                borderRadius: "24px",
                                overflow: "hidden",
                                maxWidth: "600px",
                                width: "100%",
                                maxHeight: "90vh",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Modal Image */}
                            <div
                                style={{
                                    position: "relative",
                                    height: "280px",
                                    backgroundImage: `url(${getServiceImage(selectedService)})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)",
                                    }}
                                />
                                <button
                                    onClick={() => setSelectedService(null)}
                                    style={{
                                        position: "absolute",
                                        top: "1rem",
                                        right: "1rem",
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        backgroundColor: "rgba(255,255,255,0.9)",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <X style={{ width: 20, height: 20, color: "#222222" }} />
                                </button>
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "1.5rem",
                                        left: "1.5rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "56px",
                                            height: "56px",
                                            borderRadius: "14px",
                                            background: "linear-gradient(135deg, #E8A87C, #C68B5B)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {renderIcon(selectedService.icon)}
                                    </div>
                                    <h2
                                        style={{
                                            fontSize: "1.75rem",
                                            fontWeight: 700,
                                            color: "#FFFFFF",
                                            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                        }}
                                    >
                                        {selectedService.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div style={{ padding: "2rem" }}>
                                {selectedService.title.includes("Loisirs") ? (
                                    <div style={{ marginBottom: "2.5rem" }}>
                                        <p style={{ fontSize: "1.05rem", color: "#555555", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                                            Découvrez un éventail d'activités pour agrémenter votre journée. Entre sensations fortes et détente absolue, il y en a pour tous les goûts :
                                        </p>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                                            {[
                                                { title: "Balade en Mer", icon: "Sailboat", color: "#43B0A8", desc: "Explorez la côte" },
                                                { title: "Jet Ski", icon: "Zap", color: "#E8A87C", desc: "Sensations fortes" },
                                                { title: "Paddle", icon: "Waves", color: "#85DCB0", desc: "Glisse paisible" },
                                                { title: "Billard", icon: "Target", color: "#D4A853", desc: "Détente entre amis" },
                                                { title: "Piscine", icon: "Droplets", color: "#6CB4EE", desc: "Baignade rafraîchissante" },
                                                { title: "Coins Photos", icon: "Camera", color: "#C78EC2", desc: "Décors instagrammables" }
                                            ].map((act, i) => {
                                                const ActIcon = (Icons as any)[act.icon] || Star;
                                                return (
                                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", backgroundColor: "#F9F5F0", borderRadius: "12px" }}>
                                                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: act.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                            <ActIcon style={{ width: 20, height: 20, color: "#FFFFFF" }} />
                                                        </div>
                                                        <div>
                                                            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#222222", margin: "0 0 2px 0" }}>{act.title}</h4>
                                                            <p style={{ fontSize: "0.8rem", color: "#7A7A7A", margin: 0 }}>{act.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <p
                                        style={{
                                            fontSize: "1.1rem",
                                            lineHeight: 1.8,
                                            color: "#555555",
                                            marginBottom: "2rem",
                                        }}
                                    >
                                        {selectedService.description}
                                    </p>
                                )}

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <button
                                        onClick={() => {
                                            setSelectedService(null);
                                            // Scroll to reservation section
                                            document.getElementById("forfaits")?.scrollIntoView({ behavior: "smooth" });
                                        }}
                                        style={{
                                            flex: 1,
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
                                    >
                                        Réserver maintenant
                                        <ArrowRight style={{ width: 18, height: 18 }} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Restaurant Menu Modal */}
            {selectedService && (
                <RestaurantMenuModal
                    isOpen={showRestaurantMenu}
                    onClose={() => {
                        setShowRestaurantMenu(false);
                        setSelectedService(null);
                    }}
                    serviceImage={getServiceImage(selectedService)}
                    serviceDescription={selectedService.description}
                />
            )}

            {/* Drinks Menu Modal */}
            {selectedService && (
                <DrinksMenuModal
                    isOpen={showDrinksMenu}
                    onClose={() => {
                        setShowDrinksMenu(false);
                        setSelectedService(null);
                    }}
                    serviceImage={getServiceImage(selectedService)}
                    serviceDescription={selectedService.description}
                />
            )}

            {/* Beach Installations Modal */}
            {selectedService && (
                <BeachInstallationsModal
                    isOpen={showBeachModal}
                    onClose={() => {
                        setShowBeachModal(false);
                        setSelectedService(null);
                    }}
                    serviceImage={getServiceImage(selectedService)}
                    serviceDescription={selectedService.description}
                />
            )}

            {/* Responsive & Hover Styles */}
            <style jsx global>{`
                .experience-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                    gap: 4rem;
                    margin-bottom: 5rem;
                    align-items: center;
                    min-width: 0;
                }
                .experience-images {
                    position: relative;
                    height: 500px;
                    min-height: 500px;
                    width: 100%;
                    max-width: 470px;
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

                /* Service Card Hover Effects */
                .service-card:hover .service-card-image {
                    transform: scale(1.05);
                }
                .service-card:hover .service-card-overlay {
                    background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.85) 100%) !important;
                }
                .service-card:hover .service-card-content {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }

                /* Mobile: Always show content */
                @media (max-width: 768px) {
                    .service-card {
                        height: 320px !important;
                    }
                    .service-card .service-card-overlay {
                        background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.85) 100%) !important;
                    }
                    .service-card .service-card-content {
                        opacity: 1 !important;
                        transform: translateY(0) !important;
                    }
                }
            `}</style>
        </section>
    );
}
