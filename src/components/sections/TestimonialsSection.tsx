"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { getTestimonials } from "@/app/actions/cms";
import { createClient } from "@/lib/supabase/client";

interface Testimonial {
    id: string;
    author_name: string;
    author_location: string;
    content: string;
    rating: number;
    author_image_url?: string;
}

export function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        // We need to fetch with the relation to site_media
        // The server action getTestimonials is simple, let's enhance it client side or just use a direct supabase call here if strictly needed,
        // BUT better to keep consistency. I'll stick to getTestimonials, but I need to make sure it includes the image URL.
        // Wait, looking at getTestimonials in cms.ts, it selects "*". It doesn't join. 
        // I will use a direct client fetch here to get the join easily without modifying the server action which is used by admin.
        // Actually, let's just modify the action in the next step if proper.
        // For now, I'll assume getTestimonials returns the IDs and I might need to fetch images or upgrade the action.

        // Let's rely on updating the server action in a bit. For now I'll create the component expecting a specific structure.
        // Actually, let's do a client side join or fetch.

        const supabase = createClient();
        const { data } = await supabase
            .from("testimonials")
            .select("*, site_media(url)")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (data) {
            const formatted = data.map((t: any) => ({
                id: t.id,
                author_name: t.author_name,
                author_location: t.author_location,
                content: t.content,
                rating: t.rating,
                author_image_url: t.site_media?.url || null // Allow null to trigger initials
            }));
            setTestimonials(formatted);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (testimonials.length === 0) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    if (loading || testimonials.length === 0) {
        return null; // Don't render empty section
    }

    return (
        <section
            id="testimonials"
            ref={ref}
            style={{
                padding: "7rem 0",
                backgroundColor: "#F9F5F0",
            }}
        >
            <div className="container">
                {/* Header */}
                <div
                    style={{ textAlign: "center", marginBottom: "4rem" }}
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
                        Avis clients
                    </span>
                    <h2
                        style={{
                            fontSize: "3.5rem",
                            color: "#222222",
                            lineHeight: 1.2,
                        }}
                    >
                        <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>Ce que disent</span>
                        <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>Nos Clients</span>
                    </h2>
                </div>

                {/* Testimonial Card */}
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <motion.div
                        key={testimonials[current].id} /* Add key to force animation restart on change if desired, or handle inside */
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "24px",
                            padding: "3rem",
                            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.15)",
                        }}
                    >
                        {/* Rating */}
                        <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "2rem" }}>
                            {[...Array(testimonials[current].rating)].map((_, i) => (
                                <Star
                                    key={i}
                                    style={{ width: 24, height: 24, fill: "#D4A853", color: "#D4A853" }}
                                />
                            ))}
                        </div>

                        {/* Content */}
                        <p
                            style={{
                                fontSize: "1.4rem",
                                color: "#7A7A7A",
                                textAlign: "center",
                                fontStyle: "italic",
                                lineHeight: 1.6,
                                marginBottom: "2rem",
                            }}
                        >
                            &ldquo;{testimonials[current].content}&rdquo;
                        </p>

                        {/* Author */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: "50%", overflow: "hidden", position: "relative",
                                backgroundColor: !testimonials[current].author_image_url ? "#E8A87C" : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#FFF", fontWeight: "bold", fontSize: "1.2rem"
                            }}>
                                {testimonials[current].author_image_url ? (
                                    <Image
                                        src={testimonials[current].author_image_url!}
                                        alt={testimonials[current].author_name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    testimonials[current].author_name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .substring(0, 2)
                                        .toUpperCase()
                                )}
                            </div>
                            <div style={{ textAlign: "left" }}>
                                <p style={{ fontWeight: 600, color: "#222222" }}>{testimonials[current].author_name}</p>
                                <p style={{ fontSize: "0.9rem", color: "#7A7A7A" }}>{testimonials[current].author_location}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Navigation */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "1.5rem",
                            marginTop: "2.5rem",
                        }}
                    >
                        <button
                            onClick={prev}
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                border: "1px solid #ddd",
                                backgroundColor: "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                            }}
                        >
                            <ChevronLeft style={{ width: 20, height: 20, color: "#222222" }} />
                        </button>

                        {/* Dots */}
                        <div style={{ display: "flex", gap: "8px" }}>
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrent(index)}
                                    style={{
                                        width: index === current ? "32px" : "12px",
                                        height: "12px",
                                        borderRadius: "6px",
                                        border: "none",
                                        backgroundColor: index === current ? "#E8A87C" : "#ddd",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                    }}
                                />
                            ))}
                        </div>

                        <button
                            onClick={next}
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                border: "1px solid #ddd",
                                backgroundColor: "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                            }}
                        >
                            <ChevronRight style={{ width: 20, height: 20, color: "#222222" }} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
