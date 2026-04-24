"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, ChevronLeft, Calendar, Share2, Download, Heart, X, UploadCloud, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { getUserMemories, uploadMemory, toggleFavorite, deleteMemory, ClientMemory } from "@/app/actions/memories";

export default function MemoriesPage() {
    const [viewMode, setViewMode] = useState<"all" | "favorites">("all");
    const [selectedPhoto, setSelectedPhoto] = useState<ClientMemory | null>(null);
    const [memories, setMemories] = useState<ClientMemory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        setIsLoading(true);
        try {
            const data = await getUserMemories();
            setMemories(data);
        } catch (error) {
            console.error("Failed to load memories", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        // Optional: Can add prompt for caption here
        
        try {
            const result = await uploadMemory(formData);
            if (result.success && result.data) {
                setMemories((prev) => [result.data, ...prev]);
            } else {
                alert(result.error || "Erreur lors de l'upload");
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Erreur lors de l'upload");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleToggleFavorite = async (photo: ClientMemory) => {
        // Optimistic update
        setMemories((prev) =>
            prev.map((m) => (m.id === photo.id ? { ...m, is_favorite: !m.is_favorite } : m))
        );
        if (selectedPhoto?.id === photo.id) {
            setSelectedPhoto({ ...selectedPhoto, is_favorite: !selectedPhoto.is_favorite });
        }

        const result = await toggleFavorite(photo.id, photo.is_favorite);
        if (!result.success) {
            // Revert on failure
            setMemories((prev) =>
                prev.map((m) => (m.id === photo.id ? { ...m, is_favorite: photo.is_favorite } : m))
            );
            if (selectedPhoto?.id === photo.id) {
                setSelectedPhoto({ ...selectedPhoto, is_favorite: photo.is_favorite });
            }
            alert(result.error || "Erreur");
        }
    };

    const handleDelete = async (photo: ClientMemory) => {
        if (!confirm("Voulez-vous vraiment supprimer cette photo ?")) return;

        // Optimistic update
        setMemories((prev) => prev.filter((m) => m.id !== photo.id));
        if (selectedPhoto?.id === photo.id) {
            setSelectedPhoto(null);
        }

        const result = await deleteMemory(photo.id);
        if (!result.success) {
            // Revert on failure
            fetchMemories();
            alert(result.error || "Erreur lors de la suppression");
        }
    };

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = filename || 'souvenir.jpg';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed", error);
            // Fallback
            window.open(url, '_blank');
        }
    };

    const handleShare = async (photo: ClientMemory) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mon souvenir au Latino Coucou Beach',
                    text: photo.caption || 'Un super moment au Latino Coucou Beach !',
                    url: photo.image_url,
                });
            } catch (error) {
                console.log("Share failed or was cancelled", error);
            }
        } else {
            // Fallback for desktop or non-supported browsers
            navigator.clipboard.writeText(photo.image_url);
            alert("Lien de l'image copié dans le presse-papier !");
        }
    };

    const filteredMemories = viewMode === "favorites" 
        ? memories.filter(m => m.is_favorite)
        : memories;

    // Group by month/year for better display if needed, but simple grid for now
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        });
    };

    return (
        <div style={{ maxWidth: "100%" }}>
            {/* Custom Styles for Polaroid */}
            <style jsx>{`
                .polaroid-card {
                    background: white;
                    padding: 10px 10px 30px 10px;
                    border-radius: 4px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
                    transition: transform 0.3s ease, box-shadow 0.3s ease, z-index 0.3s ease;
                    cursor: pointer;
                    position: relative;
                    z-index: 1;
                }
                .polaroid-card:hover {
                    transform: scale(1.05) rotate(0deg) !important;
                    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
                    z-index: 10;
                }
                .polaroid-img-container {
                    width: 100%;
                    aspect-ratio: 1;
                    background-color: #f3f4f6;
                    overflow: hidden;
                    position: relative;
                }
                .polaroid-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .polaroid-caption {
                    font-family: 'Indie Flower', 'Comic Sans MS', cursive, sans-serif;
                    text-align: center;
                    margin-top: 12px;
                    color: #4b5563;
                    font-size: 0.9rem;
                    min-height: 20px;
                }
            `}</style>

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
                            onClick={() => setViewMode("all")}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: viewMode === "all" ? "#FFF" : "transparent",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                color: viewMode === "all" ? "#222" : "#6B7280",
                                cursor: "pointer",
                                boxShadow: viewMode === "all" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                            }}
                        >
                            Toutes
                        </button>
                        <button
                            onClick={() => setViewMode("favorites")}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: viewMode === "favorites" ? "#FFF" : "transparent",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                color: viewMode === "favorites" ? "#222" : "#6B7280",
                                cursor: "pointer",
                                boxShadow: viewMode === "favorites" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                            }}
                        >
                            Favoris
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
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{memories.length}</p>
                    <p style={{ fontSize: "0.7rem", opacity: 0.9, margin: 0 }}>Photos</p>
                </div>
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                        {new Set(memories.map(m => m.created_at.split('T')[0])).size}
                    </p>
                    <p style={{ fontSize: "0.7rem", opacity: 0.9, margin: 0 }}>Jours</p>
                </div>
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                        {memories.filter(m => m.is_favorite).length}
                    </p>
                    <p style={{ fontSize: "0.7rem", opacity: 0.9, margin: 0 }}>Favoris</p>
                </div>
            </div>

            {/* Upload CTA (Drag & Drop area) */}
            <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                    backgroundColor: "#FFF",
                    borderRadius: "16px",
                    padding: "2rem 1rem",
                    marginBottom: "1.5rem",
                    border: "2px dashed #EC4899",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                }}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = '#FDF2F8'; }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = '#FFF'; }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.backgroundColor = '#FFF';
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        if (fileInputRef.current) {
                            fileInputRef.current.files = e.dataTransfer.files;
                            const event = new Event('change', { bubbles: true });
                            fileInputRef.current.dispatchEvent(event);
                        }
                    }
                }}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: "none" }} 
                    accept="image/*"
                    onChange={handleUpload}
                />
                
                {isUploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Loader2 style={{ width: 32, height: 32, color: "#EC4899", margin: "0 auto 8px", animation: "spin 1s linear infinite" }} />
                        <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222" }}>Envoi en cours...</p>
                    </div>
                ) : (
                    <>
                        <UploadCloud style={{ width: 36, height: 36, color: "#EC4899", margin: "0 auto 12px" }} />
                        <p style={{ fontSize: "1rem", fontWeight: 600, color: "#222", margin: "0 0 4px 0" }}>
                            Ajoutez vos propres photos
                        </p>
                        <p style={{ fontSize: "0.8rem", color: "#6B7280", margin: "0 0 16px 0" }}>
                            Cliquez ou glissez une image ici
                        </p>
                        <button
                            style={{
                                padding: "8px 24px",
                                backgroundColor: "#EC4899",
                                color: "#FFF",
                                border: "none",
                                borderRadius: "100px",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                pointerEvents: "none" // Let parent handle click
                            }}
                        >
                            Sélectionner
                        </button>
                    </>
                )}
            </div>

            {/* Grid View */}
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                    <Loader2 style={{ width: 32, height: 32, color: "#EC4899", animation: "spin 1s linear infinite" }} />
                </div>
            ) : filteredMemories.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#6B7280" }}>
                    <Camera style={{ width: 48, height: 48, margin: "0 auto 1rem", opacity: 0.3 }} />
                    <p style={{ fontSize: "1.1rem", fontWeight: 500, margin: "0 0 0.5rem 0" }}>Aucun souvenir trouvé</p>
                    <p style={{ fontSize: "0.875rem", margin: 0 }}>
                        {viewMode === "favorites" ? "Vous n'avez pas encore de favoris." : "Commencez par ajouter votre première photo !"}
                    </p>
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                        gap: "20px",
                        padding: "10px",
                    }}
                >
                    {filteredMemories.map((photo, i) => {
                        // Random tilt between -3deg and 3deg for polaroid effect
                        const rotation = (i % 5 === 0) ? -2 : (i % 3 === 0) ? 2 : (i % 2 === 0) ? -1 : 1;
                        
                        return (
                            <div
                                key={photo.id}
                                className="polaroid-card"
                                onClick={() => setSelectedPhoto(photo)}
                                style={{ transform: \`rotate(\${rotation}deg)\` }}
                            >
                                <div className="polaroid-img-container">
                                    <img src={photo.image_url} alt="Souvenir" className="polaroid-img" />
                                </div>
                                <div className="polaroid-caption">
                                    {photo.caption || formatDate(photo.created_at)}
                                </div>
                                
                                {photo.is_favorite && (
                                    <Heart
                                        style={{
                                            position: "absolute",
                                            top: "16px",
                                            right: "16px",
                                            width: 18,
                                            height: 18,
                                            color: "#EF4444",
                                            fill: "#EF4444",
                                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Photo Modal */}
            {selectedPhoto && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.95)",
                        zIndex: 100,
                        display: "flex",
                        flexDirection: "column",
                        animation: "fadeIn 0.2s ease-out"
                    }}
                    onClick={() => setSelectedPhoto(null)}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "1.5rem",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ color: "#FFF" }}>
                            <p style={{ fontWeight: 600, margin: 0, fontSize: "1.1rem" }}>
                                {selectedPhoto.caption || "Votre souvenir"}
                            </p>
                            <p style={{ fontSize: "0.85rem", opacity: 0.7, margin: "4px 0 0 0" }}>
                                {formatDate(selectedPhoto.created_at)}
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            style={{
                                padding: "10px",
                                backgroundColor: "rgba(255,255,255,0.1)",
                                border: "none",
                                borderRadius: "50%",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                        >
                            <X style={{ width: 24, height: 24, color: "#FFF" }} />
                        </button>
                    </div>

                    {/* Photo */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 1rem",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={selectedPhoto.image_url} 
                            alt="Souvenir agrandi" 
                            style={{ 
                                maxWidth: "100%", 
                                maxHeight: "100%", 
                                objectFit: "contain",
                                borderRadius: "8px",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                            }} 
                        />
                    </div>

                    {/* Actions */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "2rem",
                            padding: "2rem 1.5rem",
                            paddingBottom: "env(safe-area-inset-bottom, 2rem)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => handleToggleFavorite(selectedPhoto)}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "8px",
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#FFF",
                                transition: "transform 0.1s"
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = "scale(0.9)"}
                            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                        >
                            <Heart
                                style={{
                                    width: 28,
                                    height: 28,
                                    color: selectedPhoto.is_favorite ? "#EF4444" : "#FFF",
                                    fill: selectedPhoto.is_favorite ? "#EF4444" : "none",
                                    transition: "all 0.2s"
                                }}
                            />
                            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Favori</span>
                        </button>
                        
                        <button
                            onClick={() => handleDownload(selectedPhoto.image_url, `souvenir-${selectedPhoto.id}.jpg`)}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "8px",
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#FFF",
                            }}
                        >
                            <Download style={{ width: 28, height: 28 }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Télécharger</span>
                        </button>

                        <button
                            onClick={() => handleShare(selectedPhoto)}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "8px",
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#FFF",
                            }}
                        >
                            <Share2 style={{ width: 28, height: 28 }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Partager</span>
                        </button>

                        <button
                            onClick={() => handleDelete(selectedPhoto)}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "8px",
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#FCA5A5",
                            }}
                        >
                            <Trash2 style={{ width: 28, height: 28 }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Supprimer</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
