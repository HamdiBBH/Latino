"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Ship, Users, Star, Award } from "lucide-react";

interface StatItem {
    icon: React.ComponentType<{ style?: React.CSSProperties }>;
    value: string;
    label: string;
}

const stats: StatItem[] = [
    { icon: Ship, value: "500+", label: "Traversées réalisées" },
    { icon: Users, value: "10k+", label: "Clients satisfaits" },
    { icon: Star, value: "4.9/5", label: "Note moyenne" },
    { icon: Award, value: "5+", label: "Années d'expérience" },
];

export function StatsBar() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [counts, setCounts] = useState<number[]>(stats.map(() => 0));

    useEffect(() => {
        if (!isInView) return;

        // Animate counters
        const targets = [500, 10000, 4.9, 5];
        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;

        let step = 0;
        const interval = setInterval(() => {
            step++;
            setCounts(
                targets.map((target, i) =>
                    i === 2
                        ? parseFloat((target * Math.min(step / steps, 1)).toFixed(1))
                        : Math.floor(target * Math.min(step / steps, 1))
                )
            );
            if (step >= steps) clearInterval(interval);
        }, stepDuration);

        return () => clearInterval(interval);
    }, [isInView]);

    const formatValue = (index: number) => {
        if (index === 0) return `${counts[0]}+`;
        if (index === 1) return `${(counts[1] / 1000).toFixed(0)}k+`;
        if (index === 2) return `${counts[2]}/5`;
        return `${counts[3]}+`;
    };

    return (
        <div
            ref={ref}
            className="statsbar-container"
            style={{
                position: "relative",
                zIndex: 20,
                marginTop: "-60px",
                marginBottom: "-60px",
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="statsbar-grid"
                style={{
                    maxWidth: "1000px",
                    margin: "0 auto",
                    background: "#FFFFFF",
                    borderRadius: "20px",
                    boxShadow: "0 10px 60px rgba(0, 0, 0, 0.15)",
                }}
            >
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="statsbar-item"
                        >
                            <div className="statsbar-icon-wrapper">
                                <Icon style={{ width: "var(--statsbar-icon-size)", height: "var(--statsbar-icon-size)", color: "#FFFFFF" }} />
                            </div>
                            <div className="statsbar-text">
                                <p className="statsbar-value">
                                    {formatValue(index)}
                                </p>
                                <p className="statsbar-label">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );
}
