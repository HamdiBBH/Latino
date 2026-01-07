"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

const heroSlides = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=80",
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80",
];

const heroTags = [
    "Beach Club",
    "Restaurant",
    "Cocktails",
    "DJ Sets",
    "Sunset",
    "Plage Privée",
];

interface HeroProps {
    titleLight?: string;
    titleBold?: string;
    subtitle?: string;
}

export function Hero({
    titleLight = "Bienvenue au",
    titleBold = "Latino Coucou Beach.",
    subtitle = "L'expérience beach club ultime sous le soleil méditerranéen",
}: HeroProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section
            id="home"
            style={{
                position: "relative",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            {/* Background Slider */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                {heroSlides.map((slide, index) => (
                    <div
                        key={slide}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url(${slide})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: index === currentSlide ? 1 : 0,
                            transform: index === currentSlide ? "scale(1)" : "scale(1.1)",
                            transition: "opacity 1s ease, transform 8s ease",
                        }}
                    />
                ))}
            </div>

            {/* Overlay */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%)",
                    zIndex: 1,
                }}
            />

            {/* Content */}
            <div
                className="container"
                style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: "3rem",
                    paddingTop: "100px",
                }}
            >
                <div style={{ maxWidth: "800px" }}>
                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        style={{
                            fontSize: "clamp(3rem, 8vw, 6rem)",
                            color: "#FFFFFF",
                            marginBottom: "1.5rem",
                            lineHeight: 1.1,
                        }}
                    >
                        <span style={{ display: "block", fontWeight: 200, fontStyle: "italic" }}>
                            {titleLight}
                        </span>
                        <span style={{ display: "block", fontWeight: 500 }}>
                            {titleBold}
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        style={{
                            fontSize: "1.6rem",
                            color: "rgba(255, 255, 255, 0.9)",
                            marginBottom: "2rem",
                        }}
                    >
                        {subtitle}
                    </motion.p>

                    {/* Tags */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                        }}
                    >
                        {heroTags.map((tag) => (
                            <span
                                key={tag}
                                style={{
                                    padding: "10px 20px",
                                    fontSize: "0.9rem",
                                    fontWeight: 500,
                                    color: "#FFFFFF",
                                    backgroundColor: "transparent",
                                    border: "1px solid rgba(255, 255, 255, 0.5)",
                                    borderRadius: "100px",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.a
                href="#about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{
                    opacity: { delay: 1, duration: 0.5 },
                    y: { delay: 1.5, duration: 2, repeat: Infinity },
                }}
                style={{
                    position: "absolute",
                    bottom: "40px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                }}
            >
                <span>Scroll</span>
                <ChevronDown style={{ width: 20, height: 20 }} />
            </motion.a>
        </section>
    );
}
