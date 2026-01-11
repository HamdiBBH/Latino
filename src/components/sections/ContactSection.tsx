"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Navigation } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/config";

const contactInfo = [
    {
        icon: MapPin,
        label: "Adresse",
        value: RESTAURANT_INFO.location,
        subValue: RESTAURANT_INFO.country,
        href: RESTAURANT_INFO.googleMapsUrl,
    },
    {
        icon: Clock,
        label: "Horaires",
        value: RESTAURANT_INFO.hours,
        subValue: `Saison: ${RESTAURANT_INFO.season}`,
    },
    {
        icon: Phone,
        label: "Téléphone",
        value: RESTAURANT_INFO.phone,
        href: `tel:${RESTAURANT_INFO.phone.replace(/\s/g, "")}`,
    },
    {
        icon: Mail,
        label: "Email",
        value: RESTAURANT_INFO.email,
        href: `mailto:${RESTAURANT_INFO.email}`,
    },
];

export function ContactSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const { coordinates, googleMapsUrl } = RESTAURANT_INFO;

    return (
        <section
            id="contact"
            ref={ref}
            style={{
                padding: "7rem 0",
                backgroundColor: "#FFFFFF",
            }}
        >
            <div className="container">
                <div className="contact-grid">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="contact-info-wrapper"
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
                            Contactez-nous
                        </span>
                        <h2
                            style={{
                                fontSize: "3rem",
                                color: "#222222",
                                marginBottom: "1.5rem",
                                lineHeight: 1.2,
                            }}
                        >
                            <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>Venez nous</span>
                            <span style={{ display: "block", fontWeight: 500, color: "#41B3A3" }}>Rendre Visite</span>
                        </h2>

                        {/* Info Cards */}
                        <div style={{ marginBottom: "2rem" }}>
                            {contactInfo.map((item) => {
                                const Icon = item.icon;
                                const content = (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "1rem",
                                            padding: "1rem",
                                            backgroundColor: "#F9F5F0",
                                            borderRadius: "16px",
                                            marginBottom: "0.75rem",
                                            transition: "background-color 0.3s ease",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "50%",
                                                backgroundColor: "rgba(232, 168, 124, 0.2)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "0.85rem", color: "#7A7A7A", marginBottom: "2px" }}>
                                                {item.label}
                                            </p>
                                            <p style={{ fontWeight: 500, color: "#222222", margin: 0 }}>{item.value}</p>
                                            {item.subValue && <p style={{ color: "#7A7A7A", margin: 0, fontSize: "0.9rem" }}>{item.subValue}</p>}
                                        </div>
                                    </div>
                                );

                                return item.href ? (
                                    <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                                        {content}
                                    </a>
                                ) : (
                                    <div key={item.label}>{content}</div>
                                );
                            })}
                        </div>

                        {/* Social Links */}
                        <div className="contact-socials" style={{ display: "flex", gap: "1rem" }}>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    backgroundColor: "#222222",
                                    color: "#FFFFFF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Facebook style={{ width: 20, height: 20 }} />
                            </a>
                            <a
                                href="https://instagram.com/latinocoucoubeach"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    backgroundColor: "#222222",
                                    color: "#FFFFFF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Instagram style={{ width: 20, height: 20 }} />
                            </a>
                        </div>
                    </motion.div>

                    {/* Google Maps Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="contact-map-wrapper"
                    >
                        <div
                            className="contact-map-container"
                            style={{
                                borderRadius: "24px",
                                overflow: "hidden",
                                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <iframe
                                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${coordinates.lng}!3d${coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDA4JzMyLjQiTiAxMMKwMTInMzcuNSJF!5e0!3m2!1sfr!2stn!4v1704800000000!5m2!1sfr!2stn`}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Localisation Latino Coucou Beach"
                            />
                        </div>

                        {/* Open in Maps Button */}
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-maps-button"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                padding: "15px 25px",
                                backgroundColor: "#222222",
                                color: "#FFFFFF",
                                borderRadius: "100px",
                                textDecoration: "none",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                            }}
                        >
                            <Navigation style={{ width: 18, height: 18 }} />
                            Ouvrir dans Google Maps
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Responsive Styles */}
            <style jsx global>{`
                .contact-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 4rem;
                    align-items: start;
                }
                .contact-map-container {
                    height: 400px;
                }
                .contact-maps-button {
                    margin-top: 1rem;
                }
                @media (min-width: 900px) {
                    .contact-grid {
                        align-items: stretch;
                    }
                    .contact-info-wrapper {
                        display: flex;
                        flex-direction: column;
                    }
                    .contact-socials {
                        margin-top: auto;
                    }
                    .contact-map-wrapper {
                        display: flex;
                        flex-direction: column;
                    }
                    .contact-map-container {
                        flex: 1;
                        height: auto;
                        min-height: 300px;
                    }
                    .contact-maps-button {
                        margin-top: 1rem;
                    }
                }
                @media (max-width: 850px) {
                    .contact-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}
