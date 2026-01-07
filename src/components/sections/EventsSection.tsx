"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Clock, Music, Utensils, Flame, ArrowRight } from "lucide-react";

const events = [
    {
        id: 1,
        title: "Sunset Latino Party",
        date: { day: "15", month: "Jan" },
        category: "Soirée",
        time: "18h00 - 02h00",
        detail: "DJ Carlos & Live Band",
        detailIcon: Music,
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    },
    {
        id: 2,
        title: "Sunday Beach Brunch",
        date: { day: "21", month: "Jan" },
        category: "Brunch",
        time: "11h00 - 16h00",
        detail: "Buffet illimité + Cocktails",
        detailIcon: Utensils,
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
    },
    {
        id: 3,
        title: "Full Moon Beach Party",
        date: { day: "28", month: "Jan" },
        category: "Party",
        time: "20h00 - 04h00",
        detail: "Fire show & International DJ",
        detailIcon: Flame,
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80",
    },
];

export function EventsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            id="events"
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
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        flexWrap: "wrap",
                        gap: "1.5rem",
                        marginBottom: "4rem",
                    }}
                >
                    <div>
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
                            Agenda
                        </span>
                        <h2
                            style={{
                                fontSize: "3.5rem",
                                color: "#222222",
                                lineHeight: 1.2,
                            }}
                        >
                            <span style={{ display: "block", fontWeight: 200, color: "#E8A87C" }}>Événements</span>
                            <span style={{ display: "block", fontWeight: 500, color: "#43B0A8" }}>À Venir</span>
                        </h2>
                    </div>
                    <button
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
                        Voir tout le calendrier
                        <ArrowRight style={{ width: 20, height: 20 }} />
                    </button>
                </motion.div>

                {/* Events Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "2rem",
                    }}
                >
                    {events.map((event, index) => {
                        const DetailIcon = event.detailIcon;
                        return (
                            <motion.article
                                key={event.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                style={{
                                    backgroundColor: "#F9F5F0",
                                    borderRadius: "24px",
                                    overflow: "hidden",
                                    transition: "box-shadow 0.3s ease",
                                }}
                            >
                                {/* Image */}
                                <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
                                    <Image
                                        src={event.image}
                                        alt={event.title}
                                        fill
                                        style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                                    />
                                    {/* Date Badge */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "1rem",
                                            left: "1rem",
                                            backgroundColor: "#FFFFFF",
                                            borderRadius: "12px",
                                            padding: "12px 16px",
                                            textAlign: "center",
                                            minWidth: "60px",
                                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: "block",
                                                fontSize: "1.5rem",
                                                fontWeight: 700,
                                                color: "#222222",
                                            }}
                                        >
                                            {event.date.day}
                                        </span>
                                        <span
                                            style={{
                                                display: "block",
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                color: "#E8A87C",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {event.date.month}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ padding: "1.5rem" }}>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            padding: "6px 12px",
                                            backgroundColor: "rgba(232, 168, 124, 0.2)",
                                            color: "#E8A87C",
                                            fontSize: "0.75rem",
                                            fontWeight: 500,
                                            borderRadius: "100px",
                                            marginBottom: "12px",
                                        }}
                                    >
                                        {event.category}
                                    </span>
                                    <h3
                                        style={{
                                            fontSize: "1.3rem",
                                            fontWeight: 600,
                                            color: "#222222",
                                            marginBottom: "12px",
                                        }}
                                    >
                                        {event.title}
                                    </h3>

                                    <div style={{ marginBottom: "1.5rem" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                fontSize: "0.9rem",
                                                color: "#7A7A7A",
                                                marginBottom: "6px",
                                            }}
                                        >
                                            <Clock style={{ width: 16, height: 16 }} />
                                            {event.time}
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                fontSize: "0.9rem",
                                                color: "#7A7A7A",
                                            }}
                                        >
                                            <DetailIcon style={{ width: 16, height: 16 }} />
                                            {event.detail}
                                        </div>
                                    </div>

                                    <button
                                        style={{
                                            width: "100%",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: "12px 24px",
                                            fontSize: "0.9rem",
                                            fontWeight: 600,
                                            borderRadius: "100px",
                                            backgroundColor: "#222222",
                                            color: "#FFFFFF",
                                            border: "none",
                                            cursor: "pointer",
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        Réserver
                                    </button>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
