"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Zap, Tag, Mail, CalendarCheck, Crown, Star } from "lucide-react";
import Link from "next/link";

const benefits = [
    {
        icon: Tag,
        title: "Réductions exclusives membres",
        description: "Profitez de tarifs préférentiels réservés aux membres sur l'ensemble de nos forfaits et installations tout au long de la saison.",
        color: "#E8A87C",
    },
    {
        icon: CalendarCheck,
        title: "Réservation prioritaire",
        description: "Accédez en avant-première aux créneaux les plus demandés. En haute saison, ne laissez plus les meilleures places vous échapper.",
        color: "#43B0A8",
    },
    {
        icon: Crown,
        title: "Invitations VIP",
        description: "Soirées privées, DJ Sets, événements exclusifs… En tant que membre, vous êtes toujours les premiers invités.",
        color: "#D4A853",
    },
    {
        icon: Mail,
        title: "Offres sur mesure",
        description: "Recevez des promotions personnalisées directement dans votre boîte mail, avant même qu'elles soient annoncées au grand public.",
        color: "#E8A87C",
    },
    {
        icon: Star,
        title: "Historique de vos séjours",
        description: "Retrouvez toutes vos réservations passées et à venir depuis votre espace personnel. Simple, clair et toujours accessible.",
        color: "#43B0A8",
    },
    {
        icon: Zap,
        title: "Réservation express",
        description: "Vos informations sont mémorisées : réservez en quelques secondes, sans jamais ressaisir vos coordonnées.",
        color: "#D4A853",
    },
];

export function MemberBenefitsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section
            id="membres"
            ref={ref}
            style={{
                position: "relative",
                padding: "var(--section-padding-xl) 0",
                overflow: "hidden",
                backgroundColor: "#0A1628",
            }}
        >
            {/* Decorative blobs */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: "-120px",
                    left: "-120px",
                    width: "500px",
                    height: "500px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(67,176,168,0.15) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    bottom: "-100px",
                    right: "-100px",
                    width: "450px",
                    height: "450px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(232,168,124,0.12) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <div className="container" style={{ position: "relative", zIndex: 2 }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                    style={{ textAlign: "center", marginBottom: "4rem" }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "#E8A87C",
                            textTransform: "uppercase",
                            letterSpacing: "3px",
                            marginBottom: "1rem",
                        }}
                    >
                        Espace Membres
                    </span>
                    <h2
                        style={{
                            fontSize: "clamp(2rem, 5vw, 3.2rem)",
                            color: "#FFFFFF",
                            marginBottom: "1.25rem",
                            lineHeight: 1.15,
                        }}
                    >
                        <span style={{ display: "block", fontWeight: 200, fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>
                            Rejoignez la famille
                        </span>
                        <span style={{ display: "block", fontWeight: 600 }}>
                            Latino Coucou Beach
                        </span>
                    </h2>
                    <p
                        style={{
                            fontSize: "1.15rem",
                            color: "rgba(255,255,255,0.65)",
                            maxWidth: "560px",
                            margin: "0 auto",
                            lineHeight: 1.7,
                        }}
                    >
                        Créez un compte <strong style={{ color: "#E8A87C" }}>gratuitement</strong> et profitez d'avantages exclusifs réservés à nos membres.
                    </p>
                </motion.div>

                {/* Benefits Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "1.5rem",
                        marginBottom: "3.5rem",
                    }}
                >
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.1 + index * 0.08 }}
                                style={{
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: "20px",
                                    padding: "1.75rem",
                                    display: "flex",
                                    gap: "1rem",
                                    transition: "transform 0.3s ease, border-color 0.3s ease",
                                    cursor: "default",
                                }}
                                whileHover={{
                                    scale: 1.02,
                                    borderColor: "rgba(255,255,255,0.2)",
                                }}
                            >
                                <div
                                    style={{
                                        flexShrink: 0,
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "14px",
                                        backgroundColor: `${benefit.color}20`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Icon style={{ width: 22, height: 22, color: benefit.color }} />
                                </div>
                                <div>
                                    <h3
                                        style={{
                                            fontSize: "1rem",
                                            fontWeight: 600,
                                            color: "#FFFFFF",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        {benefit.title}
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: "0.9rem",
                                            color: "rgba(255,255,255,0.55)",
                                            lineHeight: 1.6,
                                            margin: 0,
                                        }}
                                    >
                                        {benefit.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* CTA Block */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.6 }}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "1.25rem",
                        textAlign: "center",
                    }}
                >
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
                        <Link
                            href="/register"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "18px 40px",
                                fontSize: "1rem",
                                fontWeight: 700,
                                borderRadius: "100px",
                                background: "linear-gradient(135deg, #E8A87C, #D4905A)",
                                color: "#FFFFFF",
                                textDecoration: "none",
                                boxShadow: "0 8px 30px rgba(232,168,124,0.4)",
                                transition: "all 0.3s ease",
                                letterSpacing: "0.3px",
                            }}
                        >
                            Créer mon compte gratuitement
                            <ArrowRight style={{ width: 18, height: 18 }} />
                        </Link>
                        <Link
                            href="/login"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "18px 40px",
                                fontSize: "1rem",
                                fontWeight: 600,
                                borderRadius: "100px",
                                backgroundColor: "transparent",
                                color: "rgba(255,255,255,0.8)",
                                textDecoration: "none",
                                border: "1px solid rgba(255,255,255,0.2)",
                                transition: "all 0.3s ease",
                            }}
                        >
                            Déjà membre ? Se connecter
                        </Link>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                        Inscription 100% gratuite · Aucune carte bancaire requise
                    </p>
                </motion.div>
            </div>

            {/* Responsive styles */}
            <style>{`
                #membres .container > div:nth-child(3) {
                    flex-direction: column;
                }
                @media (max-width: 600px) {
                    #membres .container > div:nth-child(3) a {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </section>
    );
}
