"use client";

import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Layers,
    Type,
    Image,
    Images,
    Palette,
    UtensilsCrossed,
    Calendar,
    MessageSquare,
    ArrowRight,
    Settings,
    Instagram,
    Sparkles,
    CreditCard
} from "lucide-react";
import { getDashboardStats } from "@/app/actions/cms";

interface CMSModule {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    color: string;
    stats?: { label: string; value: string | number };
}

const initialCmsModules: CMSModule[] = [
    {
        id: "sections",
        title: "Sections",
        description: "Activer/désactiver et réorganiser les sections du site",
        icon: Layers,
        href: "/admin/cms/sections",
        color: "#3B82F6",
        stats: { label: "Sections actives", value: "-" },
    },
    {
        id: "content",
        title: "Contenu",
        description: "Modifier les textes et contenus de chaque section",
        icon: Type,
        href: "/admin/cms/content",
        color: "#10B981",
        stats: { label: "Champs", value: "-" },
    },
    {
        id: "media",
        title: "Médias",
        description: "Gérer les images et fichiers uploadés",
        icon: Image,
        href: "/admin/cms/media",
        color: "#F59E0B",
        stats: { label: "Fichiers", value: "-" },
    },
    {
        id: "gallery",
        title: "Galerie",
        description: "Organiser les albums et photos du site",
        icon: Images,
        href: "/admin/cms/gallery",
        color: "#8B5CF6",
        stats: { label: "Albums", value: "-" },
    },
    {
        id: "reels",
        title: "Reels",
        description: "Gérer les vidéos Instagram de la section 'Moments'",
        icon: Instagram,
        href: "/admin/cms/reels",
        color: "#E1306C",
        stats: { label: "Vidéos", value: "-" },
    },
    {
        id: "branding",
        title: "Branding",
        description: "Logo, favicon et images réseaux sociaux",
        icon: Palette,
        href: "/admin/cms/branding",
        color: "#EC4899",
    },
    {
        id: "menu",
        title: "Carte Restaurant",
        description: "Gérer les plats et boissons",
        icon: UtensilsCrossed,
        href: "/admin/cms/menu",
        color: "#E8A87C",
        stats: { label: "Plats", value: "-" },
    },
    {
        id: "events",
        title: "Événements",
        description: "Ajouter et modifier les événements",
        icon: Calendar,
        href: "/admin/cms/events",
        color: "#43B0A8",
        stats: { label: "À venir", value: "-" },
    },
    {
        id: "services",
        title: "Services",
        description: "Gérer les services et prestations",
        icon: Sparkles,
        href: "/admin/cms/services",
        color: "#F59E0B",
        stats: { label: "Services", value: "-" },
    },
    {
        id: "packages",
        title: "Pack & Forfaits",
        description: "Gérer les offres packagées du club",
        icon: CreditCard,
        href: "/admin/cms/packages",
        color: "#8B5CF6",
        stats: { label: "Offres", value: "-" },
    },
    {
        id: "testimonials",
        title: "Avis Clients",
        description: "Gérer les témoignages affichés",
        icon: MessageSquare,
        href: "/admin/cms/testimonials",
        color: "#6366F1",
        stats: { label: "Avis", value: "-" },
    },
];

export default function CMSDashboardPage() {
    const [modules, setModules] = useState<CMSModule[]>(initialCmsModules);
    const [quickStats, setQuickStats] = useState([
        { label: "Sections actives", value: "-", color: "#3B82F6" },
        { label: "Images uploadées", value: "-", color: "#F59E0B" },
        { label: "Plats au menu", value: "-", color: "#E8A87C" },
        { label: "Événements", value: "-", color: "#43B0A8" },
    ]);

    useEffect(() => {
        const loadStats = async () => {
            const stats = await getDashboardStats();

            // Update Modules
            setModules(prev => prev.map(m => {
                if (m.id === "sections") return { ...m, stats: { ...m.stats!, value: stats.sections } };
                if (m.id === "media") return { ...m, stats: { ...m.stats!, value: stats.media } };
                if (m.id === "gallery") return { ...m, stats: { ...m.stats!, value: stats.gallery } };
                if (m.id === "reels") return { ...m, stats: { ...m.stats!, value: stats.reels } };
                if (m.id === "menu") return { ...m, stats: { ...m.stats!, value: stats.menu } };
                if (m.id === "events") return { ...m, stats: { ...m.stats!, value: stats.events } };
                if (m.id === "services") return { ...m, stats: { ...m.stats!, value: stats.services } };
                if (m.id === "packages") return { ...m, stats: { ...m.stats!, value: stats.packages } };
                if (m.id === "testimonials") return { ...m, stats: { ...m.stats!, value: stats.testimonials } };
                return m;
            }));

            // Update Quick Stats
            setQuickStats([
                { label: "Sections actives", value: stats.sections.toString(), color: "#3B82F6" },
                { label: "Images uploadées", value: stats.media.toString(), color: "#F59E0B" },
                { label: "Plats au menu", value: stats.menu.toString(), color: "#E8A87C" },
                { label: "Événements", value: stats.events.toString(), color: "#43B0A8" },
            ]);
        };
        loadStats();
    }, []);

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                    <LayoutDashboard style={{ width: 32, height: 32, color: "#E8A87C" }} />
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                        CMS Dashboard
                    </h1>
                </div>
                <p style={{ color: "#7A7A7A" }}>
                    Gérez entièrement le contenu de votre site sans toucher au code
                </p>
            </div>

            {/* Quick Stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginBottom: "2rem",
                }}
            >
                {quickStats.map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            backgroundColor: "#FFF",
                            padding: "1.5rem",
                            borderRadius: "16px",
                            border: "1px solid #E5E7EB",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                        }}
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                backgroundColor: `${stat.color}20`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: stat.color }}>
                                {stat.value}
                            </span>
                        </div>
                        <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Modules Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "1.5rem",
                }}
            >
                {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                        <a
                            key={module.id}
                            href={module.href}
                            style={{
                                backgroundColor: "#FFF",
                                borderRadius: "20px",
                                padding: "1.5rem",
                                border: "1px solid #E5E7EB",
                                textDecoration: "none",
                                display: "block",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = module.color;
                                e.currentTarget.style.boxShadow = `0 8px 30px ${module.color}20`;
                                e.currentTarget.style.transform = "translateY(-4px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "#E5E7EB";
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                <div
                                    style={{
                                        width: "56px",
                                        height: "56px",
                                        borderRadius: "16px",
                                        backgroundColor: `${module.color}15`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Icon style={{ width: 28, height: 28, color: module.color }} />
                                </div>
                                <ArrowRight style={{ width: 20, height: 20, color: "#9CA3AF" }} />
                            </div>
                            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#222222", marginBottom: "0.5rem" }}>
                                {module.title}
                            </h3>
                            <p style={{ fontSize: "0.875rem", color: "#7A7A7A", marginBottom: "1rem", lineHeight: 1.5 }}>
                                {module.description}
                            </p>
                            {module.stats && (
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "6px 12px",
                                        backgroundColor: "#F3F4F6",
                                        borderRadius: "100px",
                                        fontSize: "0.75rem",
                                        color: "#6B7280",
                                    }}
                                >
                                    <span style={{ fontWeight: 600, color: module.color }}>{module.stats.value}</span>
                                    <span>{module.stats.label}</span>
                                </div>
                            )}
                        </a>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div
                style={{
                    marginTop: "2rem",
                    padding: "1.5rem",
                    backgroundColor: "#F9F5F0",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                }}
            >
                <div>
                    <h4 style={{ fontWeight: 600, color: "#222222", marginBottom: "4px" }}>
                        Actions rapides
                    </h4>
                    <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>
                        Accédez directement aux fonctions les plus utilisées
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 20px",
                            backgroundColor: "#222222",
                            color: "#FFF",
                            border: "none",
                            borderRadius: "100px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        <Image style={{ width: 16, height: 16 }} />
                        Uploader une image
                    </button>
                    <button
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 20px",
                            backgroundColor: "transparent",
                            color: "#222222",
                            border: "1px solid #222222",
                            borderRadius: "100px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        <Calendar style={{ width: 16, height: 16 }} />
                        Créer un événement
                    </button>
                    <button
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 20px",
                            backgroundColor: "transparent",
                            color: "#43B0A8",
                            border: "2px solid #43B0A8",
                            borderRadius: "100px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        <Settings style={{ width: 16, height: 16 }} />
                        Paramètres
                    </button>
                </div>
            </div>
        </div>
    );
}
