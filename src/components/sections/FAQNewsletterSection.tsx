"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Mail, Send } from "lucide-react";

const faqs = [
    {
        question: "Quels sont vos horaires d'ouverture ?",
        answer: "Nous sommes ouverts tous les jours de 9h à 19h, du 1er juin au 30 septembre.",
    },
    {
        question: "Comment accéder au Latino Coucou Beach ?",
        answer: "Notre beach club est situé à Coucou Beach, Ghar El Melh. Des navettes sont disponibles depuis le port.",
    },
    {
        question: "Les enfants sont-ils les bienvenus ?",
        answer: "Absolument ! Les enfants de moins de 4 ans sont gratuits. Les 4-12 ans bénéficient d'un tarif réduit.",
    },
    {
        question: "Peut-on organiser un événement privé ?",
        answer: "Oui, nous proposons la privatisation partielle ou totale pour vos événements.",
    },
    {
        question: "Comment annuler ma réservation ?",
        answer: "Vous pouvez annuler gratuitement jusqu'à 48h avant la date prévue.",
    },
];

export function FAQNewsletterSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert("Inscription réussie !");
        setEmail("");
        setIsSubmitting(false);
    };

    return (
        <section
            id="faq"
            ref={ref}
            style={{
                padding: "6rem 0",
                backgroundColor: "#F9F5F0",
            }}
        >
            <div className="container">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                        gap: "4rem",
                        alignItems: "start",
                    }}
                >
                    {/* FAQ Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
                            <HelpCircle style={{ width: 24, height: 24, color: "#E8A87C" }} />
                            <h2 style={{ fontSize: "1.8rem", fontWeight: 600, color: "#222222", margin: 0 }}>
                                Questions fréquentes
                            </h2>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    style={{
                                        backgroundColor: "#FFFFFF",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        boxShadow: openIndex === index ? "0 4px 15px rgba(0,0,0,0.08)" : "none",
                                        transition: "box-shadow 0.3s ease",
                                    }}
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        aria-expanded={openIndex === index}
                                        style={{
                                            width: "100%",
                                            padding: "16px 20px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "12px",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "#222222" }}>
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            style={{
                                                width: 18,
                                                height: 18,
                                                color: "#E8A87C",
                                                flexShrink: 0,
                                                transform: openIndex === index ? "rotate(180deg)" : "rotate(0)",
                                                transition: "transform 0.3s ease",
                                            }}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                style={{ overflow: "hidden" }}
                                            >
                                                <div
                                                    style={{
                                                        padding: "0 20px 16px",
                                                        color: "#7A7A7A",
                                                        fontSize: "0.9rem",
                                                        lineHeight: 1.6,
                                                    }}
                                                >
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Newsletter Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "24px",
                            padding: "2.5rem",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                            <Mail style={{ width: 24, height: 24, color: "#41B3A3" }} />
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#222222", margin: 0 }}>
                                Newsletter
                            </h2>
                        </div>

                        <p style={{ color: "#7A7A7A", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                            Inscrivez-vous pour recevoir nos offres exclusives, les événements à venir et les dernières actualités du beach club.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div style={{ position: "relative", marginBottom: "1rem" }}>
                                <Mail
                                    style={{
                                        position: "absolute",
                                        left: "1rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: 20,
                                        height: 20,
                                        color: "#7A7A7A",
                                    }}
                                />
                                <input
                                    type="email"
                                    required
                                    placeholder="Votre adresse email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "1rem 1rem 1rem 3rem",
                                        fontSize: "1rem",
                                        border: "1px solid #E5E5E5",
                                        borderRadius: "12px",
                                        backgroundColor: "#F9F5F0",
                                        outline: "none",
                                    }}
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
                                    padding: "1rem",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    borderRadius: "12px",
                                    backgroundColor: "#222222",
                                    color: "#FFFFFF",
                                    border: "none",
                                    cursor: isSubmitting ? "not-allowed" : "pointer",
                                    opacity: isSubmitting ? 0.7 : 1,
                                    transition: "all 0.3s ease",
                                }}
                            >
                                <Send style={{ width: 18, height: 18 }} />
                                {isSubmitting ? "Inscription..." : "S'inscrire"}
                            </button>
                        </form>

                        <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "1rem", textAlign: "center" }}>
                            Pas de spam, désabonnement à tout moment.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Responsive */}
            <style jsx>{`
                @media (max-width: 850px) {
                    section > div > div {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}
