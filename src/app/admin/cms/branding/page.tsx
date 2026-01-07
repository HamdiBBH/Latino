"use client";

import { useState, useRef, useEffect } from "react";
import {
    Palette,
    ArrowLeft,
    Upload,
    Check,
    Image,
    Globe,
    Sun,
    Moon,
    Bookmark,
    Save,
    Loader2
} from "lucide-react";
import { getBranding, updateBranding, uploadMedia } from "@/app/actions/cms";
import { convertToWebP } from "@/lib/imageUtils";

interface BrandingAsset {
    id: string;
    asset_type: "logo" | "logo_light" | "logo_dark" | "favicon" | "og_image";
    media_id: string | null;
    site_media: {
        url: string;
        filename: string;
    } | null;
}

const assetConfig: Record<string, { label: string; description: string; icon: React.ElementType; recommendedSize: string; bgColor: string }> = {
    logo: { label: "Logo Principal", description: "Logo principal utilisé dans la navigation et le footer", icon: Image, recommendedSize: "200×60 px", bgColor: "#F9FAFB" },
    logo_light: { label: "Logo Clair", description: "Version claire du logo pour fonds sombres", icon: Sun, recommendedSize: "200×60 px", bgColor: "#1F2937" },
    logo_dark: { label: "Logo Sombre", description: "Version sombre du logo pour fonds clairs", icon: Moon, recommendedSize: "200×60 px", bgColor: "#F9FAFB" },
    favicon: { label: "Favicon", description: "Icône affichée dans l'onglet du navigateur", icon: Bookmark, recommendedSize: "32×32 px (ou .ico)", bgColor: "#F9FAFB" },
    og_image: { label: "Image OG (Réseaux Sociaux)", description: "Image de prévisualisation lors du partage sur les réseaux sociaux", icon: Globe, recommendedSize: "1200×630 px", bgColor: "#F9FAFB" },
};

export default function BrandingManagerPage() {
    const [assets, setAssets] = useState<BrandingAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<"converting" | "uploading" | null>(null);
    const [saved, setSaved] = useState(false);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        loadBranding();
    }, []);

    const loadBranding = async () => {
        setLoading(true);
        const data = await getBranding();
        setAssets(data as BrandingAsset[]);
        setLoading(false);
    };

    const handleFileUpload = async (assetType: string, file: File) => {
        setUploading(assetType);

        try {
            // Step 1: Convert to WebP (except favicon which should stay as .ico)
            setUploadStatus("converting");
            let processedFile = file;
            if (assetType !== "favicon") {
                processedFile = await convertToWebP(file, 0.9, 2000, 2000);
            }

            // Step 2: Upload to Supabase
            setUploadStatus("uploading");
            const formData = new FormData();
            formData.append("file", processedFile);
            formData.append("folder", "branding");

            const uploadResult = await uploadMedia(formData);

            if (uploadResult.success && uploadResult.data) {
                // Update branding asset with new media
                const updateResult = await updateBranding(assetType, uploadResult.data.id);

                if (updateResult.success) {
                    // Update local state
                    setAssets(assets.map(a =>
                        a.asset_type === assetType
                            ? { ...a, media_id: uploadResult.data.id, site_media: { url: uploadResult.data.url, filename: uploadResult.data.filename } }
                            : a
                    ));
                    setSaved(true);
                    setTimeout(() => setSaved(false), 3000);
                } else {
                    alert("Erreur lors de la mise à jour: " + updateResult.error);
                }
            } else {
                alert("Erreur lors de l'upload: " + uploadResult.error);
            }
        } catch (error) {
            alert("Erreur: " + String(error));
        }

        setUploading(null);
        setUploadStatus(null);
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
                <Loader2 style={{ width: 32, height: 32, color: "#EC4899", animation: "spin 1s linear infinite" }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <a href="/admin/cms" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7A7A7A", textDecoration: "none", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                        Retour au Dashboard
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Palette style={{ width: 32, height: 32, color: "#EC4899" }} />
                        <div>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>Branding</h1>
                            <p style={{ color: "#7A7A7A" }}>Gérez les logos, favicon et images pour les réseaux sociaux</p>
                        </div>
                    </div>
                </div>
                {saved && (
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        backgroundColor: "#10B981",
                        color: "#FFF",
                        border: "none",
                        borderRadius: "100px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                    }}>
                        <Check style={{ width: 18, height: 18 }} />
                        Enregistré !
                    </div>
                )}
            </div>

            {/* Assets Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
                {assets.map(asset => {
                    const config = assetConfig[asset.asset_type];
                    if (!config) return null;

                    const IconComponent = config.icon;
                    const isUploading = uploading === asset.asset_type;

                    return (
                        <div
                            key={asset.id}
                            style={{
                                backgroundColor: "#FFF",
                                borderRadius: "20px",
                                border: "1px solid #E5E7EB",
                                overflow: "hidden",
                            }}
                        >
                            {/* Preview Area */}
                            <div
                                style={{
                                    height: asset.asset_type === "og_image" ? "180px" : "120px",
                                    backgroundColor: config.bgColor,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "1.5rem",
                                    borderBottom: "1px solid #E5E7EB",
                                    position: "relative",
                                }}
                            >
                                {isUploading ? (
                                    <div style={{ textAlign: "center" }}>
                                        <Loader2 style={{ width: 32, height: 32, color: "#EC4899", animation: "spin 1s linear infinite", margin: "0 auto 8px" }} />
                                        <p style={{ fontSize: "0.75rem", color: "#EC4899", fontWeight: 500 }}>
                                            {uploadStatus === "converting" ? "Conversion WebP..." : "Upload en cours..."}
                                        </p>
                                    </div>
                                ) : asset.site_media?.url ? (
                                    <img
                                        src={asset.site_media.url}
                                        alt={config.label}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                ) : (
                                    <div style={{ textAlign: "center", color: "#9CA3AF" }}>
                                        <IconComponent style={{ width: 32, height: 32, margin: "0 auto 8px" }} />
                                        <p style={{ fontSize: "0.75rem" }}>Aucune image</p>
                                    </div>
                                )}
                            </div>

                            {/* Info & Actions */}
                            <div style={{ padding: "1.25rem" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "1rem" }}>
                                    <div
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "10px",
                                            backgroundColor: "#FCE7F3",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <IconComponent style={{ width: 20, height: 20, color: "#EC4899" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: 600, color: "#222", marginBottom: "4px" }}>{config.label}</h3>
                                        <p style={{ fontSize: "0.75rem", color: "#7A7A7A", lineHeight: 1.4 }}>{config.description}</p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.75rem", color: "#9CA3AF", backgroundColor: "#F3F4F6", padding: "4px 8px", borderRadius: "6px" }}>
                                        {config.recommendedSize}
                                    </span>
                                    <label
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            padding: "8px 16px",
                                            backgroundColor: isUploading ? "#E5E7EB" : "#F3F4F6",
                                            color: "#374151",
                                            border: "none",
                                            borderRadius: "100px",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                            cursor: isUploading ? "not-allowed" : "pointer",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        <Upload style={{ width: 16, height: 16 }} />
                                        {asset.site_media?.url ? "Remplacer" : "Uploader"}
                                        <input
                                            ref={el => { fileInputRefs.current[asset.asset_type] = el; }}
                                            type="file"
                                            accept="image/*"
                                            disabled={isUploading}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(asset.asset_type, file);
                                            }}
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tips Section */}
            <div
                style={{
                    marginTop: "2rem",
                    padding: "1.5rem",
                    backgroundColor: "#FDF4FF",
                    borderRadius: "16px",
                    border: "1px solid #F5D0FE",
                }}
            >
                <h4 style={{ fontWeight: 600, color: "#86198F", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Palette style={{ width: 18, height: 18 }} />
                    Conseils pour le Branding
                </h4>
                <ul style={{ color: "#A21CAF", fontSize: "0.875rem", lineHeight: 1.8, paddingLeft: "1.25rem" }}>
                    <li><strong>Logo transparent :</strong> Utilisez un fichier PNG avec fond transparent pour une meilleure intégration.</li>
                    <li><strong>Favicon :</strong> Préférez un format .ico ou un PNG carré de 32×32 ou 512×512 pixels.</li>
                    <li><strong>Image OG :</strong> Créez une image attrayante de 1200×630 px avec le nom et le logo de l&apos;établissement.</li>
                    <li><strong>Versions clair/sombre :</strong> Préparez des variantes pour assurer la lisibilité sur tous les fonds.</li>
                </ul>
            </div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
