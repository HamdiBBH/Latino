"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface GalleryImage {
    id: string | number;
    src: string;
    alt: string;
    caption?: string;
    size?: string;
    category?: string;
}

interface GallerySectionProps {
    images?: GalleryImage[];
}

export function GallerySection({ images = [] }: GallerySectionProps) {
    const displayImages = images;
    const [selectedImageId, setSelectedImageId] = useState<string | number | null>(null);
    const [visibleCount, setVisibleCount] = useState(8); // Start with ~3 visual rows
    const [activeCategory, setActiveCategory] = useState("Tout");

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Extract unique categories
    const categories = ["Tout", ...Array.from(new Set(displayImages.map(img => img.category || "Autre")))];

    // Filter images
    const filteredImages = activeCategory === "Tout"
        ? displayImages
        : displayImages.filter(img => (img.category || "Autre") === activeCategory);

    // Reset visible count when category changes
    useEffect(() => {
        setVisibleCount(8);
    }, [activeCategory]);

    // Function to determine bento size based on index (Deterministic pattern)
    const getBentoStyle = (index: number) => {
        // Pattern of 10 items repeats
        const patternIndex = index % 10;

        // 0: Large (2x2)
        // 1: Normal
        // 2: Normal
        // 3: Wide (2x1)
        // 4: Normal
        // 5: Normal
        // 6: Large (2x2)
        // 7: Normal
        // 8: Normal
        // 9: Wide (2x1)

        if (patternIndex === 0 || patternIndex === 6) {
            return { gridColumn: "span 2", gridRow: "span 2", height: "420px" };
        }
        if (patternIndex === 3 || patternIndex === 9) {
            return { gridColumn: "span 2", gridRow: "span 1", height: "200px" };
        }
        // Default normal
        return { gridColumn: "span 1", gridRow: "span 1", height: "200px" };
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 8);
    };

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageId === null) return;
        const currentIndex = filteredImages.findIndex(img => img.id === selectedImageId);
        if (currentIndex === -1) return;
        const nextIndex = (currentIndex + 1) % filteredImages.length;
        setSelectedImageId(filteredImages[nextIndex].id);
    }, [selectedImageId, filteredImages]);

    const handlePrev = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageId === null) return;
        const currentIndex = filteredImages.findIndex(img => img.id === selectedImageId);
        if (currentIndex === -1) return;
        const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
        setSelectedImageId(filteredImages[prevIndex].id);
    }, [selectedImageId, filteredImages]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageId === null) return;
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "Escape") setSelectedImageId(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImageId, handleNext, handlePrev]);

    const selectedImage = displayImages.find(img => img.id === selectedImageId);

    // Slice for display
    const visibleImages = filteredImages.slice(0, visibleCount);

    return (
        <section
            id="gallery"
            ref={ref}
            style={{
                padding: "7rem 0",
                backgroundColor: "#222222",
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
                        Découvrez notre univers
                    </span>
                    <h2
                        style={{
                            fontSize: "3.5rem",
                            color: "#FFFFFF",
                            lineHeight: 1.2,
                        }}
                    >
                        <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>Notre</span>
                        <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>Galerie</span>
                    </h2>
                </motion.div>

                {/* Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2 }}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "1rem",
                        marginBottom: "3rem",
                        flexWrap: "wrap",
                        position: "relative",
                        zIndex: 10
                    }}
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            style={{
                                padding: "8px 24px",
                                borderRadius: "100px",
                                border: `1px solid ${activeCategory === category ? "#E8A87C" : "rgba(255,255,255,0.2)"}`,
                                backgroundColor: activeCategory === category ? "#E8A87C" : "transparent",
                                color: activeCategory === category ? "#222222" : "#FFFFFF",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                {/* Gallery Grid (Bento) */}
                <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", // Responsive columns
                        gridAutoFlow: "dense", // Helps fill gaps
                        gap: "1rem",
                    }}
                    className="gallery-grid" // Class for media queries if needed
                >
                    <style jsx>{`
                        @media (min-width: 1024px) {
                            .gallery-grid {
                                grid-template-columns: repeat(4, 1fr) !important;
                            }
                        }
                    `}</style>

                    {visibleImages.map((image, index) => {
                        const style = getBentoStyle(index);
                        return (
                            <motion.div
                                key={image.id}
                                layoutId={`image-${image.id}`}
                                onClick={() => setSelectedImageId(image.id)}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
                                    overflow: "hidden",
                                    borderRadius: "16px",
                                    ...style
                                }}
                            >
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    style={{
                                        objectFit: "cover",
                                        transition: "transform 0.5s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.target as HTMLImageElement).style.transform = "scale(1.1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.target as HTMLImageElement).style.transform = "scale(1)";
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                                        opacity: 0,
                                        transition: "opacity 0.3s ease",
                                        display: "flex",
                                        alignItems: "flex-end",
                                        padding: "1rem",
                                    }}
                                    className="gallery-overlay"
                                >
                                    <span style={{ color: "#FFFFFF", fontWeight: 500 }}>{image.caption}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Load More Button */}
                {visibleCount < displayImages.length && (
                    <div style={{ textAlign: "center", marginTop: "4rem" }}>
                        <button
                            onClick={handleLoadMore}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "14px 28px",
                                backgroundColor: "transparent",
                                color: "#FFFFFF",
                                border: "1px solid rgba(255,255,255,0.3)",
                                borderRadius: "100px",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#FFFFFF";
                                e.currentTarget.style.color = "#222222";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#FFFFFF";
                            }}
                        >
                            <Plus size={18} />
                            Afficher plus
                        </button>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImageId(null)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 2000,
                            backgroundColor: "rgba(0, 0, 0, 0.95)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "2rem",
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedImageId(null)}
                            style={{
                                position: "absolute",
                                top: "1.5rem",
                                right: "1.5rem",
                                color: "#FFFFFF",
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                                borderRadius: "50%",
                                width: "48px",
                                height: "48px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                zIndex: 20,
                                transition: "background 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        >
                            <X style={{ width: 24, height: 24 }} />
                        </button>

                        {/* Navigation Buttons */}
                        <button
                            onClick={handlePrev}
                            style={{
                                position: "absolute",
                                left: "1.5rem",
                                color: "#FFFFFF",
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                                borderRadius: "50%",
                                width: "56px",
                                height: "56px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                zIndex: 20,
                                transition: "background 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        >
                            <ChevronLeft style={{ width: 32, height: 32 }} />
                        </button>

                        <button
                            onClick={handleNext}
                            style={{
                                position: "absolute",
                                right: "1.5rem",
                                color: "#FFFFFF",
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                                borderRadius: "50%",
                                width: "56px",
                                height: "56px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                zIndex: 20,
                                transition: "background 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        >
                            <ChevronRight style={{ width: 32, height: 32 }} />
                        </button>

                        <motion.div
                            key={selectedImage.id} // Re-render on key change for animation
                            initial={{ scale: 0.9, opacity: 0, x: 20 }}
                            animate={{ scale: 1, opacity: 1, x: 0 }}
                            exit={{ scale: 0.9, opacity: 0, x: -20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: "relative",
                                maxWidth: "90vw",
                                maxHeight: "85vh",
                            }}
                        >
                            <Image
                                src={selectedImage.src}
                                alt={selectedImage.alt}
                                width={1600}
                                height={1200}
                                style={{
                                    maxHeight: "85vh",
                                    width: "auto",
                                    maxWidth: "100%",
                                    objectFit: "contain",
                                    borderRadius: "16px",
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                                }}
                            />
                            {selectedImage.caption && (
                                <p
                                    style={{
                                        marginTop: "1.5rem",
                                        textAlign: "center",
                                        color: "rgba(255, 255, 255, 0.9)",
                                        fontSize: "1.1rem",
                                        fontWeight: 500
                                    }}
                                >
                                    {selectedImage.caption}
                                </p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
