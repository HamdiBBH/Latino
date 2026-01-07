"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Play, Eye, ChevronLeft, ChevronRight, Instagram, X } from "lucide-react";

interface Reel {
    id: string | number;
    src: string;
    label: string;
    views: string;
    embedId: string;
}

interface ReelsSectionProps {
    reels?: Reel[];
}

export function ReelsSection({ reels = [] }: ReelsSectionProps) {
    const ref = useRef(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);

    // Lock body scroll when overlay is open
    useEffect(() => {
        if (activeReelIndex !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [activeReelIndex]);

    // Handle scroll inside overlay to update internal index tracking if needed (optional)
    // For now we just let CSS scroll snap handle the navigation feeling

    const scroll = (direction: "left" | "right") => {
        if (carouselRef.current) {
            const scrollAmount = 200;
            carouselRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const openReel = (index: number) => {
        setActiveReelIndex(index);
    };

    const closeReel = () => {
        setActiveReelIndex(null);
    };

    if (reels.length === 0) return null; // Don't render if no reels

    return (
        <section
            ref={ref}
            style={{
                padding: "7rem 0",
                backgroundColor: "#FFFFFF",
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
                    <h2
                        style={{
                            fontSize: "3.5rem",
                            color: "#222222",
                            lineHeight: 1.2,
                        }}
                    >
                        <span style={{ fontWeight: 200, color: "#E8A87C" }}>Nos </span>
                        <span style={{ fontWeight: 500, color: "#43B0A8" }}>Moments</span>
                        <span style={{ fontWeight: 200, color: "#E8A87C" }}> en vidéo</span>
                    </h2>
                </motion.div>

                {/* Carousel */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{ position: "relative" }}
                >
                    <button
                        onClick={() => scroll("left")}
                        style={{
                            position: "absolute",
                            left: "-24px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            backgroundColor: "#FFFFFF",
                            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.15)",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                        }}
                    >
                        <ChevronLeft style={{ width: 24, height: 24, color: "#222222" }} />
                    </button>

                    <div
                        ref={carouselRef}
                        style={{
                            display: "flex",
                            gap: "1.5rem",
                            overflowX: "auto",
                            scrollBehavior: "smooth",
                            padding: "1rem",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        {reels.map((reel, index) => (
                            <div
                                key={reel.id}
                                style={{ flexShrink: 0, textAlign: "center", cursor: "pointer", width: "160px" }}
                                onClick={() => openReel(index)}
                            >
                                <div
                                    style={{
                                        position: "relative",
                                        width: "160px",
                                        height: "280px",
                                        margin: "0 auto 1rem",
                                        borderRadius: "16px",
                                        overflow: "hidden",
                                        border: "3px solid #E8A87C",
                                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                                    }}
                                >
                                    <Image src={reel.src} alt={reel.label} fill style={{ objectFit: "cover" }} />
                                    {/* Play Button Overlay */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "rgba(0, 0, 0, 0.25)",
                                            transition: "background-color 0.3s ease",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius: "50%",
                                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Play style={{ width: 20, height: 20, color: "#222222", marginLeft: "3px" }} />
                                        </div>
                                    </div>
                                </div>
                                <p style={{ fontWeight: 500, color: "#222222", marginBottom: "4px", fontSize: "1rem" }}>{reel.label}</p>
                                <p
                                    style={{
                                        fontSize: "0.9rem",
                                        color: "#7A7A7A",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <Eye style={{ width: 16, height: 16 }} />
                                    {reel.views}
                                </p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => scroll("right")}
                        style={{
                            position: "absolute",
                            right: "-24px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            backgroundColor: "#FFFFFF",
                            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.15)",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                        }}
                    >
                        <ChevronRight style={{ width: 24, height: 24, color: "#222222" }} />
                    </button>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    style={{ textAlign: "center", marginTop: "3rem" }}
                >
                    <button
                        onClick={() => window.open("https://www.instagram.com/latinocoucoubeach", "_blank")}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "20px 35px",
                            fontSize: "1rem",
                            fontWeight: 600,
                            borderRadius: "100px",
                            backgroundColor: "transparent",
                            color: "#43B0A8",
                            border: "2px solid #43B0A8",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                        }}
                    >
                        <Instagram style={{ width: 20, height: 20 }} />
                        Suivez-nous sur Instagram
                    </button>
                </motion.div>
            </div>

            {/* Reels Overlay */}
            <AnimatePresence>
                {activeReelIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9999,
                            backgroundColor: "#000000",
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeReel}
                            style={{
                                position: "absolute",
                                top: "20px",
                                right: "20px",
                                zIndex: 100,
                                color: "#FFFFFF",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                opacity: 0.7,
                                transition: "opacity 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
                        >
                            <X size={32} />
                        </button>

                        {/* Scroll Container */}
                        <div
                            style={{
                                height: "100vh",
                                overflowY: "scroll",
                                scrollSnapType: "y mandatory",
                                scrollBehavior: "smooth",
                            }}
                            // Auto-scroll to selected reel on mount
                            ref={(el) => {
                                if (el && activeReelIndex !== null) {
                                    // Calculate position: index * viewport height
                                    // Use a small timeout to ensure layout is ready
                                    setTimeout(() => {
                                        el.scrollTo({ top: activeReelIndex * window.innerHeight, behavior: "instant" });
                                    }, 10);
                                }
                            }}
                        >
                            {reels.map((reel) => (
                                <div
                                    key={reel.id}
                                    style={{
                                        height: "100vh",
                                        width: "100%",
                                        scrollSnapAlign: "start",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                    }}
                                >
                                    {/* Embed Container */}
                                    <div
                                        style={{
                                            width: "100%",
                                            maxWidth: "400px", // Typical mobile width
                                            height: "100%",
                                            maxHeight: "100vh",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: "relative",
                                                paddingBottom: "177.77%", // 9:16 aspect ratio
                                                height: 0,
                                                overflow: "hidden",
                                                borderRadius: "12px",
                                                backgroundColor: "#111",
                                            }}
                                        >
                                            <iframe
                                                src={`https://www.instagram.com/reel/${reel.embedId}/embed/`}
                                                width="100%"
                                                height="100%"
                                                style={{ border: "none", overflow: "hidden", position: "absolute", top: 0, left: 0 }}
                                                scrolling="no"
                                                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                            ></iframe>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
