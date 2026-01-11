"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Navigation, Clock, Phone } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/config";

export function MapSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const { coordinates, googleMapsUrl } = RESTAURANT_INFO;

    return (
        <section
            id="map"
            ref={ref}
            style={{
                padding: "5rem 0",
                backgroundColor: "#FFFFFF",
            }}
        >
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                        gap: "3rem",
                        alignItems: "center",
                    }}
                >
                    {/* Info Side */}
                    <div>
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                color: "#E8A87C",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                marginBottom: "1rem",
                            }}
                        >
                            <MapPin style={{ width: 18, height: 18 }} />
                            Localisation
                        </span>
                        <h2
                            style={{
                                fontSize: "2.5rem",
                                color: "#222222",
                                marginBottom: "1.5rem",
                                lineHeight: 1.2,
                            }}
                        >
                            <span style={{ display: "block", fontWeight: 200 }}>Retrouvez-nous à</span>
                            <span style={{ display: "block", fontWeight: 500, color: "#41B3A3" }}>
                                {RESTAURANT_INFO.location}
                            </span>
                        </h2>

                        {/* Info Cards */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "1rem",
                                    backgroundColor: "#F9F5F0",
                                    borderRadius: "12px",
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
                                    }}
                                >
                                    <Clock style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: "0.85rem", color: "#7A7A7A", margin: 0 }}>Horaires</p>
                                    <p style={{ fontWeight: 500, color: "#222222", margin: 0 }}>{RESTAURANT_INFO.hours}</p>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "1rem",
                                    backgroundColor: "#F9F5F0",
                                    borderRadius: "12px",
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
                                    }}
                                >
                                    <Phone style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: "0.85rem", color: "#7A7A7A", margin: 0 }}>Téléphone</p>
                                    <a
                                        href={`tel:${RESTAURANT_INFO.phone.replace(/\s/g, "")}`}
                                        style={{ fontWeight: 500, color: "#222222", textDecoration: "none" }}
                                    >
                                        {RESTAURANT_INFO.phone}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Google Maps Button */}
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "15px 25px",
                                backgroundColor: "#222222",
                                color: "#FFFFFF",
                                borderRadius: "100px",
                                textDecoration: "none",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                transition: "background-color 0.3s ease",
                            }}
                        >
                            <Navigation style={{ width: 18, height: 18 }} />
                            Ouvrir dans Google Maps
                        </a>
                    </div>

                    {/* Map Side */}
                    <div
                        style={{
                            borderRadius: "24px",
                            overflow: "hidden",
                            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                            height: "400px",
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
                </motion.div>
            </div>
        </section>
    );
}
