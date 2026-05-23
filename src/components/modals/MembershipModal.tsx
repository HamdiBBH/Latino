"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Gift } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "lcb_membership_modal_dismissed";

export function MembershipModal() {
    const [isVisible, setIsVisible] = useState(false);

    const dismiss = useCallback(() => {
        setIsVisible(false);
        try {
            sessionStorage.setItem(STORAGE_KEY, "true");
        } catch {
            // sessionStorage might be unavailable in some contexts
        }
    }, []);

    useEffect(() => {
        try {
            if (sessionStorage.getItem(STORAGE_KEY)) return;
        } catch {
            // ignore
        }

        // Trigger 1: After 45 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 45000);

        // Trigger 2: After scrolling 70% of the page
        const handleScroll = () => {
            const scrolled = window.scrollY;
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0 && scrolled / totalHeight >= 0.70) {
                setIsVisible(true);
                window.removeEventListener("scroll", handleScroll);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            clearTimeout(timer);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={dismiss}
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            backdropFilter: "blur(4px)",
                            WebkitBackdropFilter: "blur(4px)",
                            zIndex: 9998,
                            // Centrage du modal via flexbox — évite le conflit transform CSS + Framer Motion
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1rem",
                        }}
                        aria-hidden="true"
                    >
                        {/* Modal — positionné par flexbox, pas par position absolute */}
                        <motion.div
                            key="modal-content"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Rejoignez les membres Latino Coucou Beach"
                            initial={{ opacity: 0, scale: 0.88, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 16 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            onClick={(e) => e.stopPropagation()} // prevent backdrop click from closing when clicking modal
                            style={{
                                position: "relative",
                                zIndex: 9999,
                                width: "100%",
                                maxWidth: "460px",
                                borderRadius: "24px",
                                overflow: "hidden",
                                boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                                background: "linear-gradient(145deg, #0A1628 0%, #0F2040 60%, #0D1E35 100%)",
                            }}
                        >
                            {/* Decorative glows */}
                            <div
                                aria-hidden="true"
                                style={{
                                    position: "absolute",
                                    top: "-60px",
                                    right: "-60px",
                                    width: "220px",
                                    height: "220px",
                                    borderRadius: "50%",
                                    background: "radial-gradient(circle, rgba(232,168,124,0.22) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }}
                            />
                            <div
                                aria-hidden="true"
                                style={{
                                    position: "absolute",
                                    bottom: "-40px",
                                    left: "-40px",
                                    width: "180px",
                                    height: "180px",
                                    borderRadius: "50%",
                                    background: "radial-gradient(circle, rgba(67,176,168,0.15) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }}
                            />

                            {/* Content */}
                            <div style={{ position: "relative", padding: "2rem 1.75rem 1.75rem" }}>
                                {/* Close button */}
                                <button
                                    onClick={dismiss}
                                    aria-label="Fermer"
                                    style={{
                                        position: "absolute",
                                        top: "1rem",
                                        right: "1rem",
                                        width: "34px",
                                        height: "34px",
                                        borderRadius: "50%",
                                        backgroundColor: "rgba(255,255,255,0.08)",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        flexShrink: 0,
                                    }}
                                >
                                    <X style={{ width: 15, height: 15, color: "rgba(255,255,255,0.6)" }} />
                                </button>

                                {/* Icon */}
                                <div
                                    style={{
                                        width: "56px",
                                        height: "56px",
                                        borderRadius: "16px",
                                        background: "linear-gradient(135deg, #E8A87C, #D4905A)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "1.25rem",
                                        boxShadow: "0 8px 24px rgba(232,168,124,0.35)",
                                    }}
                                >
                                    <Gift style={{ width: 26, height: 26, color: "#FFFFFF" }} />
                                </div>

                                {/* Title */}
                                <h2
                                    style={{
                                        fontSize: "clamp(1.25rem, 5vw, 1.5rem)",
                                        fontWeight: 700,
                                        color: "#FFFFFF",
                                        marginBottom: "0.75rem",
                                        lineHeight: 1.3,
                                        paddingRight: "2rem", // avoid overlap with close button
                                    }}
                                >
                                    🌴 Rejoignez la famille{" "}
                                    <span style={{ color: "#E8A87C" }}>Latino Coucou Beach</span> !
                                </h2>

                                {/* Description */}
                                <p
                                    style={{
                                        fontSize: "0.95rem",
                                        color: "rgba(255,255,255,0.65)",
                                        lineHeight: 1.65,
                                        marginBottom: "1.5rem",
                                    }}
                                >
                                    Créez votre compte gratuitement et profitez de{" "}
                                    <strong style={{ color: "#E8A87C" }}>
                                        réductions exclusives sur tous nos forfaits
                                    </strong>{" "}
                                    ainsi que d'un accès prioritaire à nos événements et soirées privées.
                                </p>

                                {/* Perks */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "0.5rem",
                                        flexWrap: "wrap",
                                        marginBottom: "1.5rem",
                                    }}
                                >
                                    {[
                                        "✅ Réductions exclusives",
                                        "🎊 Invitations VIP",
                                        "📅 Résa prioritaire",
                                    ].map((perk) => (
                                        <span
                                            key={perk}
                                            style={{
                                                fontSize: "0.8rem",
                                                fontWeight: 500,
                                                color: "rgba(255,255,255,0.75)",
                                                backgroundColor: "rgba(255,255,255,0.07)",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                borderRadius: "100px",
                                                padding: "5px 12px",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {perk}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <Link
                                    href="/register"
                                    onClick={dismiss}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        width: "100%",
                                        padding: "15px 24px",
                                        fontSize: "0.95rem",
                                        fontWeight: 700,
                                        borderRadius: "12px",
                                        background: "linear-gradient(135deg, #E8A87C, #D4905A)",
                                        color: "#FFFFFF",
                                        textDecoration: "none",
                                        boxShadow: "0 8px 24px rgba(232,168,124,0.35)",
                                        marginBottom: "0.75rem",
                                        letterSpacing: "0.2px",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    Créer mon compte gratuitement
                                    <ArrowRight style={{ width: 17, height: 17 }} />
                                </Link>

                                {/* Dismiss */}
                                <button
                                    onClick={dismiss}
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        textAlign: "center",
                                        fontSize: "0.82rem",
                                        color: "rgba(255,255,255,0.3)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "0.25rem",
                                    }}
                                >
                                    Non merci, continuer sans compte
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
