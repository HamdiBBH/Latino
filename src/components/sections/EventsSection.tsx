"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Waves, Zap, Sailboat, Target, Droplets, Camera } from "lucide-react";

const activities = [
    {
        id: 1,
        title: "Balade en Mer",
        description: "Explorez les eaux cristallines et découvrez la côte depuis la mer.",
        icon: Sailboat,
        color: "#43B0A8",
    },
    {
        id: 2,
        title: "Jet Ski",
        description: "Sensations fortes garanties avec nos jet skis dernière génération.",
        icon: Zap,
        color: "#E8A87C",
    },
    {
        id: 3,
        title: "Paddle",
        description: "Glissez sur l'eau en toute sérénité avec nos planches de paddle.",
        icon: Waves,
        color: "#85DCB0",
    },
    {
        id: 4,
        title: "Billard",
        description: "Détendez-vous autour d'une partie de billard entre amis.",
        icon: Target,
        color: "#D4A853",
    },
    {
        id: 5,
        title: "Piscine",
        description: "Profitez de notre piscine avec vue imprenable sur la mer.",
        icon: Droplets,
        color: "#6CB4EE",
    },
    {
        id: 6,
        title: "Coins Photos",
        description: "Immortalisez vos moments avec nos décors instagrammables.",
        icon: Camera,
        color: "#C78EC2",
    },
];

export function EventsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            id="events"
            ref={ref}
            style={{
                padding: "7rem 0",
                backgroundColor: "#FFFFFF",
            }}
        >
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    style={{
                        textAlign: "center",
                        marginBottom: "4rem",
                    }}
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
                        Détente & Aventure
                    </span>
                    <h2
                        style={{
                            fontSize: "3.5rem",
                            lineHeight: 1.2,
                        }}
                    >
                        <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>Loisirs</span>
                        <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>&amp; Activités</span>
                    </h2>
                    <p
                        style={{
                            maxWidth: "600px",
                            margin: "1.5rem auto 0",
                            fontSize: "1.05rem",
                            color: "#7A7A7A",
                            lineHeight: 1.6,
                        }}
                    >
                        Bien plus qu&apos;une plage, un véritable terrain de jeu pour petits et grands.
                    </p>
                </motion.div>

                {/* Activities Grid */}
                <div
                    className="activities-grid"
                    style={{
                        display: "grid",
                        gap: "1.5rem",
                    }}
                >
                    {activities.map((activity, index) => {
                        const Icon = activity.icon;
                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                style={{
                                    backgroundColor: "#F9F5F0",
                                    borderRadius: "20px",
                                    padding: "2rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                    gap: "1rem",
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                    cursor: "default",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-6px)";
                                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                {/* Icon Circle */}
                                <div
                                    style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: "50%",
                                        backgroundColor: activity.color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: `0 6px 20px ${activity.color}44`,
                                    }}
                                >
                                    <Icon style={{ width: 28, height: 28, color: "#FFFFFF" }} />
                                </div>

                                {/* Text */}
                                <h3
                                    style={{
                                        fontSize: "1.2rem",
                                        fontWeight: 600,
                                        color: "#222222",
                                        margin: 0,
                                    }}
                                >
                                    {activity.title}
                                </h3>
                                <p
                                    style={{
                                        fontSize: "0.9rem",
                                        color: "#7A7A7A",
                                        margin: 0,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {activity.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
