"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Testimonial {
    id: string;
    author_name: string;
    author_location: string;
    content: string;
    rating: number;
    author_image_url?: string;
}

const defaultTestimonials: Testimonial[] = [
    {
        id: "1",
        author_name: "Sami Ben Amor",
        author_location: "Tunis, Tunisie",
        content: "Un endroit magique ! L'ambiance, la nourriture, le service... tout était parfait. Le coucher de soleil depuis leur terrasse est à couper le souffle. On reviendra !",
        rating: 5,
        author_image_url: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        id: "2",
        author_name: "Fatma Trabelsi",
        author_location: "Sousse, Tunisie",
        content: "Nous avons célébré notre anniversaire de mariage ici. Le personnel a été aux petits soins, et l'espace VIP était sublime. Une expérience inoubliable !",
        rating: 5,
        author_image_url: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        id: "3",
        author_name: "Karim Hamdi",
        author_location: "Sfax, Tunisie",
        content: "Les meilleurs cocktails de la côte ! L'ambiance est festive sans être trop bruyante. Le DJ était excellent. L'endroit parfait pour profiter de l'été.",
        rating: 5,
        author_image_url: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    {
        id: "4",
        author_name: "Amira Chaabane",
        author_location: "Monastir, Tunisie",
        content: "Un véritable paradis ! La plage est magnifique, l'eau cristalline et le service impeccable. Je recommande vivement le déjeuner poisson frais.",
        rating: 5,
        author_image_url: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
        id: "5",
        author_name: "Mohamed Jebali",
        author_location: "Bizerte, Tunisie",
        content: "L'endroit parfait pour se détendre en famille. Les enfants ont adoré la traversée en bateau et la plage était très propre. On reviendra absolument !",
        rating: 5,
        author_image_url: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    {
        id: "6",
        author_name: "Nour Mahjoub",
        author_location: "Nabeul, Tunisie",
        content: "Superbe découverte ! L'île de Kuriat est un joyau caché. Le restaurant propose des plats savoureux et le service est digne de 5 étoiles.",
        rating: 5,
        author_image_url: "https://randomuser.me/api/portraits/women/26.jpg",
    },
];

export function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
    const [loading, setLoading] = useState(true);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        try {
            const supabase = createClient();
            const { data } = await supabase
                .from("testimonials")
                .select("*, site_media(url)")
                .eq("is_active", true)
                .order("display_order", { ascending: true });

            // Only use DB data if we have at least 6 testimonials with proper data
            if (data && data.length >= 6) {
                const formatted = data.map((t: any) => ({
                    id: t.id,
                    author_name: t.author_name,
                    author_location: t.author_location,
                    content: t.content,
                    rating: t.rating,
                    author_image_url: t.site_media?.url || null
                }));
                setTestimonials(formatted);
            }
            // Otherwise keep the default Tunisian testimonials
        } catch (error) {
            console.error("Error loading testimonials:", error);
        }
        setLoading(false);
    };


    return (
        <section
            id="testimonials"
            ref={ref}
            style={{
                position: "relative",
                padding: "7rem 0",
                overflow: "hidden",
                backgroundColor: "#0A0A0A",
            }}
        >
            {/* Video Background */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                }}
            >
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 0.3,
                    }}
                >
                    <source src="https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4" type="video/mp4" />
                </video>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(180deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.9) 100%)",
                    }}
                />
            </div>

            <div className="container" style={{ position: "relative", zIndex: 10 }}>
                {/* Header: 2 columns */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "3rem",
                        marginBottom: "4rem",
                        alignItems: "center",
                    }}
                >
                    {/* Left: Title */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <h2
                            style={{
                                fontSize: "3rem",
                                lineHeight: 1.2,
                                color: "#FFFFFF",
                            }}
                        >
                            <span style={{ fontWeight: 300 }}>Adorés par les </span>
                            <span style={{ fontWeight: 300, color: "#E8A87C" }}>Voyageurs,</span>
                            <br />
                            <span style={{ fontWeight: 600, color: "#41B3A3" }}>Recommandés</span>
                            <br />
                            <span style={{ fontWeight: 300 }}>Partout</span>
                        </h2>
                    </motion.div>

                    {/* Right: Description */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <p
                            style={{
                                color: "rgba(255, 255, 255, 0.7)",
                                fontSize: "1.1rem",
                                lineHeight: 1.7,
                                marginBottom: "1.5rem",
                            }}
                        >
                            Découvrez ce que nos clients disent de leur expérience au Latino Coucou Beach.
                            Une plage paradisiaque, un service exceptionnel et des souvenirs inoubliables.
                        </p>
                        <Link
                            href="/reservation"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                color: "#E8A87C",
                                fontWeight: 500,
                                textDecoration: "none",
                                fontSize: "1rem",
                            }}
                        >
                            Réserver maintenant
                            <ArrowRight style={{ width: 18, height: 18 }} />
                        </Link>
                    </motion.div>
                </div>

                {/* Testimonial Cards - Staggered Layout */}
                <div className="testimonials-masonry">
                    {/* Left Column - 2 cards */}
                    <div className="testimonials-column">
                        {[testimonials[0], testimonials[3]].map((testimonial, index) => (
                            <motion.div
                                key={testimonial.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                                className="testimonial-card"
                            >
                                <p className="testimonial-content">{testimonial.content}</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">
                                        {testimonial.author_image_url ? (
                                            <Image
                                                src={testimonial.author_image_url}
                                                alt={testimonial.author_name}
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                        ) : (
                                            testimonial.author_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="author-name">{testimonial.author_name}</p>
                                        <p className="author-location">{testimonial.author_location}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Center Column - 3 cards */}
                    <div className="testimonials-column testimonials-column-center">
                        {[testimonials[1], testimonials[4], testimonials[5]].map((testimonial, index) => (
                            <motion.div
                                key={testimonial.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
                                className="testimonial-card"
                            >
                                <p className="testimonial-content">{testimonial.content}</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">
                                        {testimonial.author_image_url ? (
                                            <Image
                                                src={testimonial.author_image_url}
                                                alt={testimonial.author_name}
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                        ) : (
                                            testimonial.author_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="author-name">{testimonial.author_name}</p>
                                        <p className="author-location">{testimonial.author_location}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Column - 2 cards */}
                    <div className="testimonials-column">
                        {[testimonials[2], testimonials.length > 6 ? testimonials[6] : testimonials[0]].slice(0, 2).map((testimonial, index) => (
                            <motion.div
                                key={`right-${testimonial.id}-${index}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                                className="testimonial-card"
                            >
                                <p className="testimonial-content">{testimonial.content}</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">
                                        {testimonial.author_image_url ? (
                                            <Image
                                                src={testimonial.author_image_url}
                                                alt={testimonial.author_name}
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                        ) : (
                                            testimonial.author_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="author-name">{testimonial.author_name}</p>
                                        <p className="author-location">{testimonial.author_location}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom fade gradient overlay */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "200px",
                        background: "linear-gradient(to bottom, transparent 0%, rgba(10, 10, 10, 0.8) 50%, #0A0A0A 100%)",
                        pointerEvents: "none",
                        zIndex: 5,
                    }}
                />
            </div>

            {/* Styles */}
            <style jsx global>{`
                .testimonials-masonry {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 1.5rem;
                    align-items: start;
                }
                .testimonials-column {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .testimonials-column-center {
                    margin-top: -2rem;
                }
                .testimonial-card {
                    background: rgba(30, 30, 30, 0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    padding: 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .testimonial-content {
                    color: rgba(255, 255, 255, 0.75);
                    font-size: 0.92rem;
                    line-height: 1.65;
                    margin: 0 0 1.25rem 0;
                    font-style: italic;
                }
                .testimonial-author {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .testimonial-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    overflow: hidden;
                    position: relative;
                    background: #E8A87C;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #FFF;
                    font-weight: bold;
                    font-size: 0.85rem;
                    flex-shrink: 0;
                }
                .author-name {
                    font-weight: 600;
                    color: #FFFFFF;
                    font-size: 0.95rem;
                    margin: 0;
                }
                .author-location {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.45);
                    margin: 0;
                }
                @media (max-width: 1024px) {
                    .testimonials-masonry {
                        grid-template-columns: 1fr 1fr;
                    }
                    .testimonials-column:nth-child(3) {
                        display: none;
                    }
                    .testimonials-column-center {
                        margin-top: 0;
                    }
                }
                @media (max-width: 640px) {
                    .testimonials-masonry {
                        grid-template-columns: 1fr;
                    }
                    .testimonials-column:nth-child(2),
                    .testimonials-column:nth-child(3) {
                        display: none;
                    }
                }
            `}</style>
        </section>
    );
}
