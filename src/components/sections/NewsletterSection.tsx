"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail } from "lucide-react";

export function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

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
        </section>
    );
}
