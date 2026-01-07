"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
    variant?: "default" | "light" | "dark";
    isScrolled?: boolean;
    className?: string;
}

interface BrandingData {
    logo?: string;
    logo_light?: string;
    logo_dark?: string;
}

export default function Logo({ variant = "default", isScrolled = false, className }: LogoProps) {
    const [branding, setBranding] = useState<BrandingData | null>(null);

    useEffect(() => {
        // Fetch branding data from API
        fetch("/api/cms/branding")
            .then(res => res.json())
            .then(data => setBranding(data))
            .catch(err => console.error("Error fetching branding:", err));
    }, []);

    // Determine which logo to use based on variant and scroll state
    const getLogoUrl = () => {
        if (!branding) return null;

        if (variant === "light") return branding.logo_light || branding.logo;
        if (variant === "dark") return branding.logo_dark || branding.logo;

        // Default: use dark logo when scrolled (white bg), light logo when not scrolled (transparent bg)
        if (isScrolled) {
            return branding.logo_dark || branding.logo;
        }
        return branding.logo_light || branding.logo;
    };

    const logoUrl = getLogoUrl();

    return (
        <Link
            href="/"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
            }}
            className={className}
        >
            {logoUrl ? (
                <Image
                    src={logoUrl}
                    alt="Latino Coucou Beach"
                    width={150}
                    height={50}
                    style={{
                        objectFit: "contain",
                        height: "auto",
                        maxHeight: "50px",
                    }}
                    priority
                />
            ) : (
                // Fallback while loading or if no logo set
                <>
                    <span style={{ fontSize: "2rem" }}>🌴</span>
                    <span
                        style={{
                            fontSize: "1.4rem",
                            fontWeight: 600,
                            color: isScrolled ? "#222222" : "#ffffff",
                            transition: "color 0.3s ease",
                        }}
                    >
                        Latino Coucou
                    </span>
                </>
            )}
        </Link>
    );
}
