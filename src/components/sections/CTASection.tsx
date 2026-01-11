"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle2, Calendar, Users, Sparkles } from "lucide-react";
import Link from "next/link";

const features = [
    { icon: Calendar, text: "Réponse sous 24h" },
    { icon: CheckCircle2, text: "Annulation gratuite" },
    { icon: Users, text: "Service personnalisé" },
];

const defaultInstallations = [
    { name: "Parasol", price: "35 DT" },
    { name: "Paillote", price: "75 DT" },
    { name: "Cabane VIP", price: "150 DT" },
    { name: "Espace Lounge", price: "250 DT" },
];

interface Package {
    id: string;
    name: string;
    price: string;
}

interface CTASectionProps {
    packages?: Package[];
}

export function CTASection({ packages = [] }: CTASectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Use database packages if available, otherwise fallback to defaults
    const installations = packages.length > 0
        ? packages.map(pkg => ({ name: pkg.name, price: pkg.price || "Sur demande" }))
        : defaultInstallations;


    return (
        <section
            id="reservation"
            ref={ref}
            style={{
                position: "relative",
                padding: "8rem 0",
                overflow: "hidden",
            }}
        >
            {/* Background */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.75) 100%)",
                }}
            />

            {/* Content */}
            <div className="container" style={{ position: "relative", zIndex: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <span
                            style={{
                                display: "inline-block",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                color: "#E8A87C",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                marginBottom: "1rem",
                            }}
                        >
                            Réservation
                        </span>
                        <h2
                            style={{
                                fontSize: "3rem",
                                color: "#FFFFFF",
                                marginBottom: "1.5rem",
                                lineHeight: 1.2,
                            }}
                        >
                            <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>Réservez votre</span>
                            <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>Moment de Paradis</span>
                        </h2>
                        <p
                            style={{
                                fontSize: "1.1rem",
                                color: "rgba(255, 255, 255, 0.85)",
                                marginBottom: "2rem",
                                lineHeight: 1.7,
                            }}
                        >
                            Que ce soit pour un déjeuner en famille, une soirée entre amis ou
                            un événement privé, notre équipe est là pour vous offrir une
                            expérience sur-mesure.
                        </p>

                        {/* CTA Button */}
                        <Link
                            href="/reservation"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "20px 40px",
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                borderRadius: "100px",
                                backgroundColor: "#E8A87C",
                                color: "#FFFFFF",
                                textDecoration: "none",
                                transition: "all 0.3s ease",
                                boxShadow: "0 8px 30px rgba(232, 168, 124, 0.4)",
                            }}
                        >
                            Réserver maintenant
                            <ArrowRight style={{ width: 20, height: 20 }} />
                        </Link>

                        {/* Features */}
                        <div
                            style={{
                                display: "flex",
                                gap: "2rem",
                                marginTop: "2.5rem",
                                flexWrap: "wrap",
                            }}
                        >
                            {features.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={feature.text}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            color: "rgba(255, 255, 255, 0.9)",
                                        }}
                                    >
                                        <Icon style={{ width: 18, height: 18, color: "#E8A87C" }} />
                                        <span style={{ fontSize: "0.9rem" }}>{feature.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Right: Installations Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                backdropFilter: "blur(20px)",
                                borderRadius: "24px",
                                padding: "2rem",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                                <Sparkles style={{ width: 24, height: 24, color: "#E8A87C" }} />
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#FFFFFF" }}>
                                    Nos installations
                                </h3>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {installations.map((inst) => (
                                    <div
                                        key={inst.name}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "1rem 1.25rem",
                                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                        }}
                                    >
                                        <span style={{ color: "#FFFFFF", fontWeight: 500 }}>{inst.name}</span>
                                        <span style={{ color: "#E8A87C", fontWeight: 600 }}>à partir de {inst.price}</span>
                                    </div>
                                ))}
                            </div>

                            <p style={{
                                fontSize: "0.85rem",
                                color: "rgba(255, 255, 255, 0.6)",
                                marginTop: "1.5rem",
                                textAlign: "center"
                            }}>
                                Tarifs journée complète · Parking sécurisé · Traversée en bateau (Zodiac) · Déjeuner complet poisson
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Responsive Styles */}
            <style jsx>{`
                @media (max-width: 900px) {
                    section > div > div {
                        grid-template-columns: 1fr !important;
                        text-align: center;
                    }
                }
            `}</style>
        </section>
    );
}
