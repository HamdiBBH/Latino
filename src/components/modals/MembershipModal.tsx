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
        // Don't show if already dismissed this session
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
                            backgroundColor: "rgba(0, 0, 0, 0.55)",
                            backdropFilter: "blur(4px)",
                            zIndex: 9998,
                        }}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal-content"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Rejoignez les membres Latino Coucou Beach"
                        initial={{ opacity: 0, scale: 0.88, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 9999,
                            width: "min(480px, calc(100vw - 2rem))",
                            borderRadius: "28px",
                            overflow: "hidden",
                            boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
                        }}
                    >
                        {/* Background */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(145deg, #0A1628 0%, #0F2040 60%, #0D1E35 100%)",
                            }}
                        />
                        {/* Decorative glow */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                top: "-60px",
                                right: "-60px",
                                width: "250px",
                                height: "250px",
                                borderRadius: "50%",
                                background: "radial-gradient(circle, rgba(232,168,124,0.2) 0%, transparent 70%)",
                                pointerEvents: "none",
                            }}
                        />
                        <div
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                bottom: "-40px",
                                left: "-40px",
                                width: "200px",
                                height: "200px",
                                borderRadius: "50%",
                                background: "radial-gradient(circle, rgba(67,176,168,0.15) 0%, transparent 70%)",
                                pointerEvents: "none",
                            }}
                        />

                        {/* Content */}
                        <div style={{ position: "relative", padding: "2.5rem 2rem 2rem" }}>
                            {/* Close button */}
                            <button
                                onClick={dismiss}
                                aria-label="Fermer"
                                style={{
                                    position: "absolute",
                                    top: "1rem",
                                    right: "1rem",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "background-color 0.2s ease",
                                }}
                            >
                                <X style={{ width: 16, height: 16, color: "rgba(255,255,255,0.6)" }} />
                            </button>

                            {/* Icon badge */}
                            <div
                                style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "20px",
                                    background: "linear-gradient(135deg, #E8A87C, #D4905A)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "1.5rem",
                                    boxShadow: "0 8px 24px rgba(232,168,124,0.35)",
                                }}
                            >
                                <Gift style={{ width: 30, height: 30, color: "#FFFFFF" }} />
                            </div>

                            {/* Title */}
                            <h2
                                style={{
                                    fontSize: "1.6rem",
                                    fontWeight: 700,
                                    color: "#FFFFFF",
                                    marginBottom: "0.75rem",
                                    lineHeight: 1.25,
                                }}
                            >
                                🌴 Rejoignez la famille{" "}
                                <span style={{ color: "#E8A87C" }}>Latino Coucou Beach</span> !
                            </h2>

                            {/* Subtitle */}
                            <p
                                style={{
                                    fontSize: "1rem",
                                    color: "rgba(255,255,255,0.65)",
                                    lineHeight: 1.65,
                                    marginBottom: "1.75rem",
                                }}
                            >
                                Créez votre compte gratuitement et obtenez{" "}
                                <strong style={{ color: "#E8A87C" }}>-10% sur votre première réservation</strong>{" "}
                                + accès prioritaire à tous nos événements exclusifs.
                            </p>

                            {/* Perks row */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: "0.75rem",
                                    flexWrap: "wrap",
                                    marginBottom: "1.75rem",
                                }}
                            >
                                {["✅ -10% immédiat", "🎊 Invitations VIP", "📅 Résa prioritaire"].map((perk) => (
                                    <span
                                        key={perk}
                                        style={{
                                            fontSize: "0.82rem",
                                            fontWeight: 500,
                                            color: "rgba(255,255,255,0.75)",
                                            backgroundColor: "rgba(255,255,255,0.07)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "100px",
                                            padding: "6px 14px",
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
                                    padding: "16px 28px",
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    borderRadius: "14px",
                                    background: "linear-gradient(135deg, #E8A87C, #D4905A)",
                                    color: "#FFFFFF",
                                    textDecoration: "none",
                                    boxShadow: "0 8px 24px rgba(232,168,124,0.35)",
                                    transition: "opacity 0.2s ease",
                                    marginBottom: "0.875rem",
                                    letterSpacing: "0.3px",
                                }}
                            >
                                Créer mon compte gratuitement
                                <ArrowRight style={{ width: 18, height: 18 }} />
                            </Link>

                            {/* Dismiss link */}
                            <button
                                onClick={dismiss}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    textAlign: "center",
                                    fontSize: "0.85rem",
                                    color: "rgba(255,255,255,0.35)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "0.25rem",
                                    transition: "color 0.2s ease",
                                }}
                            >
                                Non merci, continuer sans compte
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
