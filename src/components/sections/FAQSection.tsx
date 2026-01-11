"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "Quels sont vos horaires d'ouverture ?",
        answer: "Nous sommes ouverts tous les jours de 9h à 19h, du 1er juin au 30 septembre. Pensez à réserver à l'avance pour garantir votre place !",
    },
    {
        question: "Comment accéder au Latino Coucou Beach ?",
        answer: "Notre beach club est situé à Coucou Beach, Ghar El Melh. Des navettes sont disponibles depuis le port. Contactez-nous pour plus de détails sur l'accès.",
    },
    {
        question: "Quels forfaits proposez-vous ?",
        answer: "Nous proposons plusieurs forfaits adaptés à vos besoins : Forfait Duo, Famille, VIP, et Groupe. Chaque forfait inclut l'accès à la plage privée, transats, parasol et différentes options de restauration.",
    },
    {
        question: "Les enfants sont-ils les bienvenus ?",
        answer: "Absolument ! Les enfants de moins de 4 ans sont gratuits. Pour les enfants de 4 à 12 ans, nous proposons un tarif réduit de 45 DT. Le mercredi, 2 enfants sont gratuits avec le forfait adulte !",
    },
    {
        question: "Peut-on organiser un événement privé ?",
        answer: "Oui, nous proposons la privatisation partielle ou totale du beach club pour vos événements : anniversaires, mariages, séminaires d'entreprise... Contactez-nous pour un devis personnalisé.",
    },
    {
        question: "Comment annuler ou modifier ma réservation ?",
        answer: "Vous pouvez modifier ou annuler votre réservation gratuitement jusqu'à 48h avant la date prévue. Contactez-nous par téléphone ou WhatsApp pour toute demande de modification.",
    },
    {
        question: "Quels moyens de paiement acceptez-vous ?",
        answer: "Nous acceptons les paiements en espèces et par carte bancaire. Un acompte peut être demandé pour les grandes réservations.",
    },
    {
        question: "Y a-t-il un service de restauration ?",
        answer: "Oui ! Notre restaurant propose une cuisine méditerranéenne fraîche : salades, grillades, poissons, et spécialités tunisiennes. Nous avons également un bar avec cocktails, mocktails et boissons fraîches.",
    },
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section
            id="faq"
            ref={ref}
            style={{
                padding: "7rem 0",
                backgroundColor: "#F9F5F0",
            }}
        >
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: "center", marginBottom: "4rem" }}
                >
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
                        <HelpCircle style={{ width: 18, height: 18 }} />
                        Questions Fréquentes
                    </span>
                    <h2
                        style={{
                            fontSize: "3rem",
                            color: "#222222",
                            marginBottom: "1rem",
                            lineHeight: 1.2,
                        }}
                    >
                        <span style={{ display: "block", fontWeight: 200 }}>Vous avez des</span>
                        <span style={{ display: "block", fontWeight: 500, color: "#41B3A3" }}>Questions ?</span>
                    </h2>
                    <p style={{ color: "#7A7A7A", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
                        Retrouvez les réponses aux questions les plus fréquentes. Si vous ne trouvez pas ce que vous cherchez, contactez-nous !
                    </p>
                </motion.div>

                {/* FAQ Items */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{ maxWidth: "800px", margin: "0 auto" }}
                >
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            style={{
                                marginBottom: "12px",
                                backgroundColor: "#FFFFFF",
                                borderRadius: "16px",
                                overflow: "hidden",
                                boxShadow: openIndex === index ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
                                transition: "box-shadow 0.3s ease",
                            }}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                aria-expanded={openIndex === index}
                                style={{
                                    width: "100%",
                                    padding: "20px 24px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "16px",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "1.05rem",
                                        fontWeight: 500,
                                        color: "#222222",
                                    }}
                                >
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    style={{
                                        width: 20,
                                        height: 20,
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
                                                padding: "0 24px 20px",
                                                color: "#7A7A7A",
                                                fontSize: "1rem",
                                                lineHeight: 1.7,
                                            }}
                                        >
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    style={{ textAlign: "center", marginTop: "3rem" }}
                >
                    <p style={{ color: "#7A7A7A", marginBottom: "1rem" }}>
                        Vous n'avez pas trouvé votre réponse ?
                    </p>
                    <a
                        href="#contact"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "15px 30px",
                            backgroundColor: "#222222",
                            color: "#FFFFFF",
                            borderRadius: "100px",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            transition: "background-color 0.3s ease",
                        }}
                    >
                        Contactez-nous
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
