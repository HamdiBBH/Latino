"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sun } from "lucide-react";

const stats = [
    { value: "10+", label: "Années d'expérience" },
    { value: "50K+", label: "Clients satisfaits" },
    { value: "200+", label: "Événements par an" },
];

interface AboutSectionProps {
    images?: {
        url: string;
        alt_text?: string;
    }[];
}

export function AboutSection({ images = [] }: AboutSectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Fallback images if no CMS images provided
    const mainImage = images[0]?.url || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80";
    const secondaryImage = images[1]?.url || "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=400&q=80";

    return (
        <section
            id="about"
            ref={ref}
            style={{
                padding: "var(--section-padding-about-top) 0 var(--section-padding-lg) 0",
                backgroundColor: "#F9F5F0",
                overflow: "hidden",
            }}
        >
            <div className="container">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
                        gap: "var(--section-grid-gap-xl)",
                        alignItems: "center",
                    }}
                >
                    {/* Content */}
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
                            Notre Histoire
                        </span>
                        <h2
                            style={{
                                fontSize: "var(--font-size-section-title-lg)",
                                marginBottom: "1.5rem",
                                color: "#222222",
                                lineHeight: 1.2,
                            }}
                        >
                            <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>Un paradis</span>
                            <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>au bord de l&apos;eau</span>
                        </h2>
                        <p
                            style={{
                                fontSize: "1.1rem",
                                color: "#7A7A7A",
                                marginBottom: "1rem",
                                lineHeight: 1.6,
                            }}
                        >
                            Niché sur les plus belles plages de la Méditerranée, Latino Coucou Beach vous offre
                            une expérience unique alliant gastronomie raffinée, mocktails signature et ambiance
                            festive. Depuis notre ouverture, nous avons créé un lieu où chaque instant devient
                            un souvenir inoubliable.
                        </p>
                        <p
                            style={{
                                fontSize: "1.1rem",
                                color: "#7A7A7A",
                                marginBottom: "2.5rem",
                                lineHeight: 1.6,
                            }}
                        >
                            Notre équipe passionnée vous accueille dans un cadre exceptionnel, entre sable fin
                            et eaux cristallines, pour des journées ensoleillées et des soirées magiques.
                        </p>
                    </motion.div>

                    {/* Image Stack */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ position: "relative", width: "100%", maxWidth: "540px", margin: "0 auto" }}
                    >
                        <div style={{ position: "relative", zIndex: 10 }}>
                            <Image
                                src={mainImage}
                                alt="Beach club ambiance"
                                width={500}
                                height={600}
                                style={{
                                    borderRadius: "24px",
                                    objectFit: "cover",
                                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
                                    width: "100%",
                                    height: "auto",
                                }}
                            />
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                bottom: "-32px",
                                right: 0,
                                zIndex: 20,
                                width: "min(250px, 48%)",
                                aspectRatio: "5 / 6",
                            }}
                        >
                            <Image
                                src={secondaryImage}
                                alt="Cocktails sur la plage"
                                fill
                                style={{
                                    borderRadius: "24px",
                                    objectFit: "cover",
                                    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.15)",
                                }}
                            />
                        </div>
                        {/* Accent Box */}
                        <div
                            style={{
                                position: "absolute",
                                top: "-24px",
                                right: 0,
                                width: "120px",
                                height: "120px",
                                backgroundColor: "#E8A87C",
                                borderRadius: "16px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 30,
                            }}
                        >
                            <Sun style={{ width: 32, height: 32, color: "#FFFFFF", marginBottom: "8px" }} />
                            <span
                                style={{
                                    color: "#FFFFFF",
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    textAlign: "center",
                                    lineHeight: 1.2,
                                }}
                            >
                                Beach Life
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
