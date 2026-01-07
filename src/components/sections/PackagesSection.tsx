"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { getPackages } from "@/app/actions/cms";

// We'll keep the packageFeatures static for the description section as they are part of the layout text,
// or we could fetch them if they were in the DB, but they look like static benefits.
// However, the USER request said "Migrate Existing Hardcoded Data", referring mainly to the packages list.
import { Car, Ship, Fish, Umbrella } from "lucide-react";

interface Package {
    id: string;
    name: string;
    price: string;
    features: string[];
    is_popular: boolean;
}

const packageFeatures = [
    { icon: Car, label: "Parking sécurisées" },
    { icon: Ship, label: "Traversée en bateau (Zodiac)" },
    { icon: Fish, label: "Déjeuner complet poisson" },
    { icon: Umbrella, label: "Cabane & Paillote en mer & Parasole pour la journée" },
];

export function PackagesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPackages = async () => {
            const data = await getPackages();
            // Parse features if they are strings (defensive)
            const parsed = data.map((p: any) => ({
                ...p,
                features: Array.isArray(p.features) ? p.features : []
            }));
            setPackages(parsed);
            setLoading(false);
        };
        loadPackages();
    }, []);

    const getCardStyle = (isPopular: boolean, index: number) => {
        // Use index/style mapping similar to original or based on is_popular
        if (isPopular) {
            return {
                background: "linear-gradient(135deg, #D4A853, #B8922D)",
                color: "#FFFFFF",
            };
        }
        // Alternate colors or default
        if (index === 2) {
            return {
                backgroundColor: "#F5D4C1",
                color: "#222222",
            };
        }
        return {
            backgroundColor: "#FFFFFF",
            color: "#222222",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        };
    };

    if (loading) {
        return (
            <section style={{ padding: "7rem 0", backgroundColor: "#F9F5F0" }}>
                <div className="container" style={{ textAlign: "center" }}>
                    <p>Chargement des forfaits...</p>
                </div>
            </section>
        );
    }

    console.log("Client Packages Render:", packages); // Debug

    return (
        <section
            id="packages"
            ref={ref}
            style={{
                padding: "7rem 0",
                backgroundColor: "#F9F5F0",
            }}
        >
            <div className="container">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                        gap: "4rem",
                        alignItems: "start",
                    }}
                >
                    {/* Left Side - Pricing Cards */}
                    <motion.div
                        initial={{ opacity: 1, x: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
                    >
                        {packages.length === 0 && (
                            <div style={{ textAlign: "center", padding: "2rem", backgroundColor: "#FEF2F2", borderRadius: "12px", color: "#DC2626" }}>
                                <p>Aucun forfait trouvé.</p>
                            </div>
                        )}
                        {packages.map((pkg, index) => (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 1, y: 0 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0 }}
                                style={{
                                    borderRadius: "24px",
                                    padding: "1.5rem",
                                    ...getCardStyle(pkg.is_popular, index),
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "baseline", marginBottom: "1rem" }}>
                                    <span style={{ fontSize: "3rem", fontWeight: 700 }}>{pkg.price}</span>
                                    {/* DB stores price as string including currency sometimes, or we assume it is included.
                                        In original hardcoded: price: "70", currency: "DT".
                                        In DB migration: price: "70 DT".
                                    */}
                                </div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>
                                    {pkg.name}
                                </h3>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    {pkg.features.map((feature: any, i) => (
                                        <li
                                            key={i}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            <Check
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    flexShrink: 0,
                                                    color: pkg.is_popular ? "#FFFFFF" : "#E8A87C",
                                                }}
                                            />
                                            <span style={{ opacity: 0.9 }}>
                                                {typeof feature === "object" && feature !== null ? feature.text : feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Right Side - Description */}
                    <motion.div
                        initial={{ opacity: 1, x: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
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
                            Nos packages & forfaits
                        </span>
                        <h2
                            style={{
                                fontSize: "3rem",
                                color: "#222222",
                                marginBottom: "1.5rem",
                                lineHeight: 1.2,
                            }}
                        >
                            <span style={{ display: "block", fontWeight: 200 }}>VIVEZ UNE</span>
                            <span style={{ display: "block", fontWeight: 500, color: "#E8A87C" }}>
                                EXPÉRIENCE UNIQUE
                            </span>
                        </h2>
                        <p
                            style={{
                                fontSize: "1.1rem",
                                color: "#7A7A7A",
                                marginBottom: "2rem",
                                lineHeight: 1.6,
                            }}
                        >
                            Situé sur la plage Coucou (accessible uniquement par bateau depuis notre
                            parking Privé), le restaurant Latino Coucou Beach implanté sur le sable fin
                            d&apos;une plage vierge bien loin de tout encombrement et pour un
                            dépaysement total vous propose un forfait complet qui comporte :
                        </p>

                        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2.5rem 0" }}>
                            {packageFeatures.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li
                                        key={item.label}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            color: "#444444",
                                            marginBottom: "1rem",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                backgroundColor: "rgba(232, 168, 124, 0.2)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Icon style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                        </div>
                                        <span>{item.label}</span>
                                    </li>
                                );
                            })}
                        </ul>

                        <button
                            onClick={() => document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" })}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "22px 40px",
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                borderRadius: "100px",
                                backgroundColor: "#222222",
                                color: "#FFFFFF",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                            }}
                        >
                            Réserver maintenant
                            <ArrowRight style={{ width: 20, height: 20 }} />
                        </button>
                    </motion.div>
                </div>
            </div>
        </section >
    );
}
