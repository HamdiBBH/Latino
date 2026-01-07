"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Instagram, Facebook } from "lucide-react";

const contactInfo = [
    {
        icon: MapPin,
        label: "Adresse",
        value: "123 Boulevard de la Plage",
        subValue: "06400 Cannes, France",
    },
    {
        icon: Clock,
        label: "Horaires",
        value: "Lun - Dim: 10h00 - 02h00",
        subValue: "Brunch Dimanche: 11h00 - 16h00",
    },
    {
        icon: Phone,
        label: "Téléphone",
        value: "+33 6 00 00 00 00",
        href: "tel:+33600000000",
    },
    {
        icon: Mail,
        label: "Email",
        value: "contact@latinocoucoubeach.com",
        href: "mailto:contact@latinocoucoubeach.com",
    },
];

export function ContactSection() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        alert("Message envoyé avec succès !");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        setIsSubmitting(false);
    };

    const inputStyle = {
        width: "100%",
        padding: "1rem",
        fontSize: "1rem",
        border: "1px solid #ddd",
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
        outline: "none",
        transition: "border-color 0.3s ease",
    };

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
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                        gap: "5rem",
                    }}
                >
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
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
                                fontSize: "3.5rem",
                                color: "#222222",
                                marginBottom: "1.5rem",
                                lineHeight: 1.2,
                            }}
                        >
                            <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>Venez nous</span>
                            <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>Rendre Visite</span>
                        </h2>

                        {/* Info Cards */}
                        <div style={{ marginBottom: "2.5rem" }}>
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
                                            marginBottom: "1rem",
                                            transition: "background-color 0.3s ease",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "48px",
                                                height: "48px",
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
                                            <p style={{ fontSize: "0.9rem", color: "#7A7A7A", marginBottom: "4px" }}>
                                                {item.label}
                                            </p>
                                            <p style={{ fontWeight: 500, color: "#222222" }}>{item.value}</p>
                                            {item.subValue && <p style={{ color: "#7A7A7A" }}>{item.subValue}</p>}
                                        </div>
                                    </div>
                                );

                                return item.href ? (
                                    <a key={item.label} href={item.href} style={{ textDecoration: "none" }}>
                                        {content}
                                    </a>
                                ) : (
                                    <div key={item.label}>{content}</div>
                                );
                            })}
                        </div>

                        {/* Social Links */}
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    backgroundColor: "#222222",
                                    color: "#FFFFFF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "background-color 0.3s ease",
                                }}
                            >
                                <Facebook style={{ width: 20, height: 20 }} />
                            </a>
                            <a
                                href="https://instagram.com/latinocoucoubeach"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    backgroundColor: "#222222",
                                    color: "#FFFFFF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "background-color 0.3s ease",
                                }}
                            >
                                <Instagram style={{ width: 20, height: 20 }} />
                            </a>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <form
                            onSubmit={handleSubmit}
                            style={{
                                backgroundColor: "#F9F5F0",
                                borderRadius: "24px",
                                padding: "2.5rem",
                            }}
                        >
                            <div style={{ marginBottom: "1.5rem" }}>
                                <input
                                    type="text"
                                    required
                                    placeholder="Votre nom"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                                <input
                                    type="email"
                                    required
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={inputStyle}
                                />
                                <input
                                    type="tel"
                                    placeholder="Téléphone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <select
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    style={{ ...inputStyle, cursor: "pointer" }}
                                >
                                    <option value="">Sujet de votre message</option>
                                    <option value="reservation">Réservation</option>
                                    <option value="evenement">Événement privé</option>
                                    <option value="information">Information</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Votre message"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    style={{ ...inputStyle, resize: "none" }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    width: "100%",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "10px",
                                    padding: "20px 35px",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    borderRadius: "100px",
                                    backgroundColor: "#222222",
                                    color: "#FFFFFF",
                                    border: "none",
                                    cursor: isSubmitting ? "not-allowed" : "pointer",
                                    opacity: isSubmitting ? 0.7 : 1,
                                    transition: "all 0.3s ease",
                                }}
                            >
                                <Send style={{ width: 20, height: 20 }} />
                                {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
