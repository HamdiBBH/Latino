"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

const partners = [
    { id: 1, name: "Brand 1", logo: "https://placehold.co/150x60/ffffff/222222?text=Brand+1" },
    { id: 2, name: "Brand 2", logo: "https://placehold.co/150x60/ffffff/222222?text=Brand+2" },
    { id: 3, name: "Brand 3", logo: "https://placehold.co/150x60/ffffff/222222?text=Brand+3" },
    { id: 4, name: "Brand 4", logo: "https://placehold.co/150x60/ffffff/222222?text=Brand+4" },
    { id: 5, name: "Brand 5", logo: "https://placehold.co/150x60/ffffff/222222?text=Brand+5" },
    { id: 6, name: "Brand 6", logo: "https://placehold.co/150x60/ffffff/222222?text=Brand+6" },
];

export function PartnersSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            ref={ref}
            style={{
                padding: "5rem 0",
                backgroundColor: "#F9F5F0",
            }}
        >
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
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
                            marginBottom: "1rem",
                        }}
                    >
                        Ils nous font confiance
                    </span>
                    <h2
                        style={{
                            fontSize: "3.5rem",
                            color: "#222222",
                            lineHeight: 1.2,
                        }}
                    >
                        <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>Nos</span>
                        <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>Partenaires</span>
                    </h2>
                </motion.div>

                {/* Partners Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "2rem",
                        alignItems: "center",
                    }}
                >
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "1rem",
                                filter: "grayscale(100%)",
                                opacity: 0.6,
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.filter = "grayscale(0%)";
                                e.currentTarget.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.filter = "grayscale(100%)";
                                e.currentTarget.style.opacity = "0.6";
                            }}
                        >
                            <Image
                                src={partner.logo}
                                alt={partner.name}
                                width={150}
                                height={60}
                                style={{ maxHeight: "48px", width: "auto", objectFit: "contain" }}
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
