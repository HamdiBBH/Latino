"use client";

import { useState } from "react";
import { Camera, ChevronLeft, Calendar, Share2, Download, Heart, X, ChevronRight, Instagram, Facebook, ZoomIn } from "lucide-react";
import Link from "next/link";

// Mock photos data
const visitPhotos = [
    {
        date: "15 août 2024",
        photos: [
            { id: "1", url: "🏖️", type: "zone", caption: "Votre cabane VIP1" },
            { id: "2", url: "🌅", type: "sunset", caption: "Coucher de soleil" },
            { id: "3", url: "🍹", type: "moment", caption: "Happy Hour" },
            { id: "4", url: "🍽️", type: "food", caption: "Déjeuner" },
        ],
    },
    {
        date: "5 août 2024",
        photos: [
            { id: "5", url: "🏝️", type: "zone", caption: "Vue panoramique" },
            { id: "6", url: "🌊", type: "moment", caption: "Baignade" },
            { id: "7", url: "🍉", type: "food", caption: "Fruits frais" },
        ],
    },
    {
        date: "28 juillet 2024",
        photos: [
            { id: "8", url: "⛱️", type: "zone", caption: "Parasole P3" },
            { id: "9", url: "🎉", type: "moment", caption: "Entre amis" },
            { id: "10", url: "🍸", type: "food", caption: "Cocktails" },
            { id: "11", url: "🌴", type: "moment", caption: "Détente" },
            { id: "12", url: "🌅", type: "sunset", caption: "Golden hour" },
        ],
    },
];

// Flatten all photos for grid view
const allPhotos = visitPhotos.flatMap((visit) =>
    visit.photos.map((photo) => ({ ...photo, visitDate: visit.date }))
);

export default function MemoriesPage() {
    const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");
    const [selectedPhoto, setSelectedPhoto] = useState<typeof allPhotos[0] | null>(null);
    const [likedPhotos, setLikedPhotos] = useState<string[]>(["1", "2"]);

    const toggleLike = (photoId: string) => {
        setLikedPhotos((prev) =>
            prev.includes(photoId)
                ? prev.filter((id) => id !== photoId)
                : [...prev, photoId]
        );
    };

    return (
        <div style={{ maxWidth: "100%" }}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <Link
                    href="/dashboard"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#6B7280",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        marginBottom: "0.5rem",
                    }}
                >
                    <ChevronLeft style={{ width: 16, height: 16 }} />
                    Retour
                </Link>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Camera style={{ width: 32, height: 32, color: "#EC4899" }} />
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222", margin: 0 }}>
                            Mes Souvenirs
                        </h1>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#F3F4F6", borderRadius: "10px", padding: "4px" }}>
                        <button
                            onClick={() => setViewMode("timeline")}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: viewMode === "timeline" ? "#FFF" : "transparent",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                color: viewMode === "timeline" ? "#222" : "#6B7280",
                                cursor: "pointer",
                                boxShadow: viewMode === "timeline" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                            }}
                        >
                            Timeline
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: viewMode === "grid" ? "#FFF" : "transparent",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                color: viewMode === "grid" ? "#222" : "#6B7280",
                                cursor: "pointer",
                                boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                            }}
                        >
                            Grille
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Banner */}
            <div
                style={{
                    background: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)",
                    borderRadius: "16px",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    display: "flex",
                    justifyContent: "space-around",
                    color: "#FFF",
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{allPhotos.length}</p>
                    <p style={{ fontSize: "0.7rem", opacity: 0.9, margin: 0 }}>Photos</p>
                </div>
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{visitPhotos.length}</p>
                    <p style={{ fontSize: "0.7rem", opacity: 0.9, margin: 0 }}>Visites</p>
                </div>
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{likedPhotos.length}</p>
                    <p style={{ fontSize: "0.7rem", opacity: 0.9, margin: 0 }}>Favoris</p>
                </div>
            </div>

            {/* Upload CTA */}
            <div
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "16px",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    border: "2px dashed #E5E7EB",
                    textAlign: "center",
                }}
            >
                <Camera style={{ width: 32, height: 32, color: "#9CA3AF", margin: "0 auto 8px" }} />
                <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222", margin: "0 0 4px 0" }}>
                    Ajoutez vos propres photos
                </p>
                <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: "0 0 12px 0" }}>
                    Scannez le QR code sur votre zone pour photos géolocalisées
                </p>
                <button
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#EC4899",
                        color: "#FFF",
                        border: "none",
                        borderRadius: "100px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    📷 Scanner le QR
                </button>
            </div>

            {/* Timeline View */}
            {viewMode === "timeline" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {visitPhotos.map((visit) => (
                        <div key={visit.date}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                <Calendar style={{ width: 16, height: 16, color: "#6B7280" }} />
                                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#222" }}>{visit.date}</span>
                                <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>• {visit.photos.length} photos</span>
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    gap: "10px",
                                }}
                            >
                                {visit.photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        onClick={() => setSelectedPhoto({ ...photo, visitDate: visit.date })}
                                        style={{
                                            aspectRatio: "1",
                                            backgroundColor: "#FEF3E2",
                                            borderRadius: "14px",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <span style={{ fontSize: "3rem" }}>{photo.url}</span>
                                        <p style={{ fontSize: "0.7rem", color: "#6B7280", marginTop: "8px" }}>{photo.caption}</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLike(photo.id);
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: "8px",
                                                right: "8px",
                                                width: "28px",
                                                height: "28px",
                                                backgroundColor: "rgba(255,255,255,0.9)",
                                                border: "none",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Heart
                                                style={{
                                                    width: 14,
                                                    height: 14,
                                                    color: likedPhotos.includes(photo.id) ? "#EF4444" : "#9CA3AF",
                                                    fill: likedPhotos.includes(photo.id) ? "#EF4444" : "none",
                                                }}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "8px",
                    }}
                >
                    {allPhotos.map((photo) => (
                        <div
                            key={photo.id}
                            onClick={() => setSelectedPhoto(photo)}
                            style={{
                                aspectRatio: "1",
                                backgroundColor: "#FEF3E2",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                position: "relative",
                            }}
                        >
                            <span style={{ fontSize: "2rem" }}>{photo.url}</span>
                            {likedPhotos.includes(photo.id) && (
                                <Heart
                                    style={{
                                        position: "absolute",
                                        top: "6px",
                                        right: "6px",
                                        width: 12,
                                        height: 12,
                                        color: "#EF4444",
                                        fill: "#EF4444",
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Photo Modal */}
            {selectedPhoto && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.9)",
                        zIndex: 100,
                        display: "flex",
                        flexDirection: "column",
                    }}
                    onClick={() => setSelectedPhoto(null)}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "1rem",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ color: "#FFF" }}>
                            <p style={{ fontWeight: 600, margin: 0 }}>{selectedPhoto.caption}</p>
                            <p style={{ fontSize: "0.75rem", opacity: 0.7, margin: "2px 0 0 0" }}>{selectedPhoto.visitDate}</p>
                        </div>
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            style={{
                                padding: "8px",
                                backgroundColor: "rgba(255,255,255,0.1)",
                                border: "none",
                                borderRadius: "50%",
                                cursor: "pointer",
                            }}
                        >
                            <X style={{ width: 20, height: 20, color: "#FFF" }} />
                        </button>
                    </div>

                    {/* Photo */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                width: "80%",
                                maxWidth: "400px",
                                aspectRatio: "1",
                                backgroundColor: "#FEF3E2",
                                borderRadius: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span style={{ fontSize: "8rem" }}>{selectedPhoto.url}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "20px",
                            padding: "1.5rem",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => toggleLike(selectedPhoto.id)}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "4px",
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#FFF",
                            }}
                        >
                            <Heart
                                style={{
                                    width: 24,
                                    height: 24,
                                    color: likedPhotos.includes(selectedPhoto.id) ? "#EF4444" : "#FFF",
                                    fill: likedPhotos.includes(selectedPhoto.id) ? "#EF4444" : "none",
                                }}
                            />
                            <span style={{ fontSize: "0.7rem" }}>Favori</span>
                        </button>
                        <button
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "4px",
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#FFF",
                            }}
                        >
                            <Download style={{ width: 24, height: 24 }} />
                            <span style={{ fontSize: "0.7rem" }}>Télécharger</span>
                        </button>
                        <button
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "4px",
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#FFF",
                            }}
                        >
                            <Instagram style={{ width: 24, height: 24 }} />
                            <span style={{ fontSize: "0.7rem" }}>Instagram</span>
                        </button>
                        <button
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "4px",
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#FFF",
                            }}
                        >
                            <Facebook style={{ width: 24, height: 24 }} />
                            <span style={{ fontSize: "0.7rem" }}>Facebook</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
