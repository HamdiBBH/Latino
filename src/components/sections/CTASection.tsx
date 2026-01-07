"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Phone, CheckCircle2 } from "lucide-react";

const features = [
    "Réponse sous 24h",
    "Annulation gratuite",
    "Service personnalisé",
];

export function CTASection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            id="reservation"
            ref={ref}
            style={{
                position: "relative",
                padding: "10rem 0",
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
                    background: "linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%)",
                }}
            />

            {/* Content */}
            <div className="container" style={{ position: "relative", zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: "600px" }}
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
                            fontSize: "3.5rem",
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
                            fontSize: "1.2rem",
                            color: "rgba(255, 255, 255, 0.8)",
                            marginBottom: "2.5rem",
                            lineHeight: 1.6,
                        }}
                    >
                        Que ce soit pour un déjeuner en famille, une soirée entre amis ou
                        un événement privé, notre équipe est là pour vous offrir une
                        expérience sur-mesure.
                    </p>

                    {/* CTA Buttons */}
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "1rem",
                            marginBottom: "2.5rem",
                        }}
                    >
                        <button
                            onClick={() => (window.location.href = "tel:+33600000000")}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "22px 40px",
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                borderRadius: "100px",
                                backgroundColor: "#222222",
                                color: "#FFFFFF",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                            }}
                        >
                            <Phone style={{ width: 20, height: 20 }} />
                            +33 6 00 00 00 00
                        </button>
                        <button
                            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "22px 40px",
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                borderRadius: "100px",
                                backgroundColor: "transparent",
                                color: "#43B0A8",
                                border: "2px solid #43B0A8",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                            }}
                        >
                            Formulaire de contact
                        </button>
                    </div>

                    {/* Features */}
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "2rem",
                        }}
                    >
                        {features.map((feature) => (
                            <div
                                key={feature}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    color: "rgba(255, 255, 255, 0.9)",
                                }}
                            >
                                <CheckCircle2 style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
