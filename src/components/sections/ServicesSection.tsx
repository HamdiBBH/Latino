"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import * as Icons from "lucide-react";
import { getServices } from "@/app/actions/cms";

interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    link?: string;
}

export function ServicesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadServices = async () => {
            const data = await getServices();
            // Filter only active services if that column exists, otherwise show all
            setServices(data || []);
            setLoading(false);
        };
        loadServices();
    }, []);

    // Helper to render dynamic icon
    const renderIcon = (iconName: string) => {
        const Icon = (Icons as any)[iconName] || Star;
        return <Icon style={{ width: 32, height: 32, color: "#FFFFFF" }} />;
    };

    if (loading) {
        return (
            <section style={{ padding: "7rem 0", backgroundColor: "#FFFFFF" }}>
                <div className="container" style={{ textAlign: "center" }}>
                    <p>Chargement des services...</p>
                </div>
            </section>
        );
    }

    console.log("Client Services Render:", services); // Debug

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
                {/* Header */}
                <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: "center", marginBottom: "5rem" }}
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
                        Ce que nous offrons
                    </span>
                    <h2
                        style={{
                            fontSize: "3.5rem",
                            color: "#222222",
                            marginBottom: "1.5rem",
                            lineHeight: 1.2,
                        }}
                    >
                        <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>Nos</span>
                        <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>Services</span>
                    </h2>
                    <p
                        style={{
                            fontSize: "1.2rem",
                            color: "#7A7A7A",
                            maxWidth: "600px",
                            margin: "0 auto",
                        }}
                    >
                        Une expérience complète pour des moments inoubliables
                    </p>
                </motion.div>

                {services.length === 0 && (
                    <div style={{ textAlign: "center", padding: "2rem", backgroundColor: "#FEF2F2", borderRadius: "12px", color: "#DC2626" }}>
                        <p>Aucun service trouvé. (Empty services list)</p>
                        <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Vérifiez la migration des données.</p>
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
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0 }}
                            style={{
                                backgroundColor: "#F9F5F0",
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
                                    transition: "transform 0.3s ease",
                                }}
                            >
                                {renderIcon(service.icon)}
                            </div>
                            <h3
                                style={{
                                    fontSize: "1.4rem",
                                    fontWeight: 600,
                                    marginBottom: "1rem",
                                    transition: "color 0.5s ease",
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
                                    transition: "color 0.5s ease",
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
                                    transition: "color 0.5s ease",
                                }}
                            >
                                {service.link || "En savoir plus"}
                                <ArrowRight style={{ width: 16, height: 16 }} />
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
