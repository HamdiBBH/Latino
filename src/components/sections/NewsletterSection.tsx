"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import { subscribeNewsletter } from "@/app/actions/public";

export function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "" });
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsSubmitting(true);
        
        const result = await subscribeNewsletter(email);
        
        if (result.success) {
            setEmail("");
            setNotification({ show: true, message: result.message });
            setTimeout(() => setNotification({ show: false, message: "" }), 5000);
        } else {
            alert(result.message);
        }
        setIsSubmitting(false);
    };

    return (
        <section
            ref={ref}
            style={{
                padding: "5rem 0",
                backgroundColor: "#F9F5F0",
            }}
        >
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    style={{
                        maxWidth: "600px",
                        margin: "0 auto",
                        textAlign: "center",
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
                        Newsletter
                    </span>
                    <h2
                        style={{
                            fontSize: "2.5rem",
                            color: "#222222",
                            marginBottom: "1rem",
                            lineHeight: 1.2,
                        }}
                    >
                        Restez informé
                    </h2>
                    <p
                        style={{
                            fontSize: "1.1rem",
                            color: "#7A7A7A",
                            marginBottom: "2rem",
                        }}
                    >
                        Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives
                        et les dernières actualités.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: "flex",
                            gap: "1rem",
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        <div style={{ position: "relative", flex: "1 1 300px", maxWidth: "400px" }}>
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
                                placeholder="Votre email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "1rem 1rem 1rem 3rem",
                                    fontSize: "1rem",
                                    border: "1px solid #ddd",
                                    borderRadius: "100px",
                                    backgroundColor: "#FFFFFF",
                                    outline: "none",
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "1rem 2rem",
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
                            {isSubmitting ? "..." : "S'inscrire"}
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        style={{
                            position: "fixed",
                            bottom: "2rem",
                            right: "2rem",
                            zIndex: 9999,
                            backgroundColor: "#4CAF50",
                            color: "white",
                            padding: "1rem 1.5rem",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            boxShadow: "0 10px 30px rgba(76, 175, 80, 0.3)",
                            fontWeight: 500,
                            maxWidth: "400px",
                            lineHeight: 1.5,
                        }}
                    >
                        <div style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "50%", padding: "4px", flexShrink: 0 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
