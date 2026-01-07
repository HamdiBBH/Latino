"use client";

import { useState, useEffect } from "react";
import {
    Images,
    ArrowLeft,
    Plus,
    Trash2,
    Star,
    Eye,
    X,
    FolderOpen,
    Loader2,
    Check
} from "lucide-react";
import { getAlbums, createAlbum, toggleAlbumActive, getGalleryImages, toggleImageFeatured, deleteGalleryImage, getMedia, addImagesToAlbum } from "@/app/actions/cms";

interface Album {
    id: string;
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    display_order: number;
    gallery_images: { count: number }[];
}

interface GalleryImage {
    id: string;
    album_id: string;
    caption: string;
    is_featured: boolean;
    display_order: number;
    site_media: {
        url: string;
        filename: string;
    } | null;
}

export default function GalleryManagerPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingImages, setLoadingImages] = useState(false);
    const [showNewAlbum, setShowNewAlbum] = useState(false);
    const [newAlbumName, setNewAlbumName] = useState("");
    const [creating, setCreating] = useState(false);

    // New state for adding images
    const [showAddImageModal, setShowAddImageModal] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
    const [addingImage, setAddingImage] = useState(false);

    useEffect(() => {
        loadAlbums();
    }, []);

    useEffect(() => {
        if (selectedAlbum) {
            loadImages(selectedAlbum.id);
        }
    }, [selectedAlbum]);

    useEffect(() => {
        if (showAddImageModal) {
            loadMedia();
        }
    }, [showAddImageModal]);

    const loadAlbums = async () => {
        setLoading(true);
        const data = await getAlbums();
        setAlbums(data as Album[]);
        setLoading(false);
    };

    const loadImages = async (albumId: string) => {
        setLoadingImages(true);
        const data = await getGalleryImages(albumId);
        setImages(data as GalleryImage[]);
        setLoadingImages(false);
    };

    const loadMedia = async () => {
        const data = await getMedia();
        setMediaFiles(data);
    };

    const handleCreateAlbum = async () => {
        if (!newAlbumName.trim()) return;

        setCreating(true);
        const slug = newAlbumName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const result = await createAlbum(newAlbumName, slug);

        if (result.success) {
            await loadAlbums();
            setNewAlbumName("");
            setShowNewAlbum(false);
        } else {
            alert("Erreur: " + result.error);
        }
        setCreating(false);
    };

    const handleToggleAlbumActive = async (album: Album) => {
        const result = await toggleAlbumActive(album.id, !album.is_active);
        if (result.success) {
            setAlbums(albums.map(a =>
                a.id === album.id ? { ...a, is_active: !a.is_active } : a
            ));
        } else {
            alert("Erreur: " + result.error);
        }
    };

    const handleToggleFeatured = async (image: GalleryImage) => {
        const result = await toggleImageFeatured(image.id, !image.is_featured);
        if (result.success) {
            setImages(images.map(img =>
                img.id === image.id ? { ...img, is_featured: !img.is_featured } : img
            ));
        }
    };

    const handleDeleteImage = async (id: string) => {
        if (!confirm("Supprimer cette image de l'album ?")) return;

        const result = await deleteGalleryImage(id);
        if (result.success) {
            setImages(images.filter(img => img.id !== id));
        } else {
            alert("Erreur: " + result.error);
        }
    };

    const handleAddImage = async () => {
        if (!selectedAlbum || selectedMediaIds.length === 0) return;

        setAddingImage(true);
        const result = await addImagesToAlbum(selectedAlbum.id, selectedMediaIds);

        if (result.success) {
            await loadImages(selectedAlbum.id);
            setShowAddImageModal(false);
            setSelectedMediaIds([]);
        } else {
            alert("Erreur: " + result.error);
        }
        setAddingImage(false);
    };

    const toggleMediaSelection = (id: string) => {
        setSelectedMediaIds(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const featuredCount = images.filter(img => img.is_featured).length;

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
                <Loader2 style={{ width: 32, height: 32, color: "#8B5CF6", animation: "spin 1s linear infinite" }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <a href="/admin/cms" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7A7A7A", textDecoration: "none", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                        Retour au Dashboard
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Images style={{ width: 32, height: 32, color: "#8B5CF6" }} />
                        <div>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>Galerie Photos</h1>
                            <p style={{ color: "#7A7A7A" }}>{albums.length} albums</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowNewAlbum(true)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        backgroundColor: "#8B5CF6",
                        color: "#FFF",
                        border: "none",
                        borderRadius: "100px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    <Plus style={{ width: 18, height: 18 }} />
                    Nouvel album
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selectedAlbum ? "300px 1fr" : "1fr", gap: "1.5rem" }}>
                {/* Albums List */}
                <div
                    style={{
                        backgroundColor: "#FFF",
                        borderRadius: "20px",
                        border: "1px solid #E5E7EB",
                        padding: "1rem",
                    }}
                >
                    <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "1rem", padding: "0 0.5rem" }}>
                        Albums
                    </h3>

                    {showNewAlbum && (
                        <div style={{ marginBottom: "1rem", padding: "12px", backgroundColor: "#F3F4F6", borderRadius: "12px" }}>
                            <input
                                type="text"
                                placeholder="Nom de l'album"
                                value={newAlbumName}
                                onChange={(e) => setNewAlbumName(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    marginBottom: "8px",
                                    outline: "none",
                                }}
                            />
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    onClick={handleCreateAlbum}
                                    disabled={creating}
                                    style={{
                                        flex: 1,
                                        padding: "8px",
                                        backgroundColor: "#8B5CF6",
                                        color: "#FFF",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                        cursor: creating ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {creating ? "Création..." : "Créer"}
                                </button>
                                <button
                                    onClick={() => { setShowNewAlbum(false); setNewAlbumName(""); }}
                                    style={{
                                        padding: "8px 12px",
                                        backgroundColor: "#FFF",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "8px",
                                        fontSize: "0.75rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    {albums.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "2rem", color: "#9CA3AF" }}>
                            <FolderOpen style={{ width: 32, height: 32, margin: "0 auto 0.5rem" }} />
                            <p style={{ fontSize: "0.875rem" }}>Aucun album</p>
                        </div>
                    ) : (
                        albums.map(album => (
                            <div
                                key={album.id}
                                onClick={() => setSelectedAlbum(album)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px",
                                    backgroundColor: selectedAlbum?.id === album.id ? "#EDE9FE" : "#FFF",
                                    borderRadius: "12px",
                                    marginBottom: "8px",
                                    cursor: "pointer",
                                    border: `2px solid ${selectedAlbum?.id === album.id ? "#8B5CF6" : "transparent"}`,
                                    opacity: album.is_active ? 1 : 0.6,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: "10px",
                                        backgroundColor: "#F3F4F6",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Images style={{ width: 24, height: 24, color: "#8B5CF6" }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <h4 style={{ fontWeight: 600, color: "#222", fontSize: "0.875rem" }}>{album.name}</h4>
                                        {!album.is_active && (
                                            <span style={{ fontSize: "0.625rem", padding: "2px 6px", backgroundColor: "#FEE2E2", color: "#DC2626", borderRadius: "4px" }}>
                                                Masqué
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>
                                        {album.gallery_images?.[0]?.count || 0} images
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleAlbumActive(album); }}
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "8px",
                                        border: "1px solid #E5E7EB",
                                        backgroundColor: "#FFF",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Eye style={{ width: 16, height: 16, color: album.is_active ? "#10B981" : "#9CA3AF" }} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Album Detail */}
                {selectedAlbum && (
                    <div
                        style={{
                            backgroundColor: "#FFF",
                            borderRadius: "20px",
                            border: "1px solid #E5E7EB",
                            padding: "1.5rem",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                            <div>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222", marginBottom: "4px" }}>
                                    {selectedAlbum.name}
                                </h2>
                                <p style={{ color: "#7A7A7A", fontSize: "0.875rem" }}>
                                    {images.length} images • {featuredCount} mises en avant
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    onClick={() => setShowAddImageModal(true)}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "10px 16px",
                                        backgroundColor: "#F3F4F6",
                                        color: "#374151",
                                        border: "none",
                                        borderRadius: "100px",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    <Plus style={{ width: 16, height: 16 }} />
                                    Ajouter des photos
                                </button>
                                <button
                                    onClick={() => setSelectedAlbum(null)}
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "10px",
                                        border: "1px solid #E5E7EB",
                                        backgroundColor: "#FFF",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                    }}
                                >
                                    <X style={{ width: 20, height: 20, color: "#6B7280" }} />
                                </button>
                            </div>
                        </div>

                        {loadingImages ? (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem" }}>
                                <Loader2 style={{ width: 32, height: 32, color: "#8B5CF6", animation: "spin 1s linear infinite" }} />
                            </div>
                        ) : images.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                                <FolderOpen style={{ width: 48, height: 48, color: "#D1D5DB", margin: "0 auto 1rem" }} />
                                <h3 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Album vide</h3>
                                <p style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>Ajoutez des images depuis la médiathèque</p>
                                <button
                                    onClick={() => setShowAddImageModal(true)}
                                    style={{
                                        marginTop: "1rem",
                                        padding: "10px 20px",
                                        backgroundColor: "#8B5CF6",
                                        color: "#FFF",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    Choisir des images
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                                {images.map(image => (
                                    <div
                                        key={image.id}
                                        style={{
                                            position: "relative",
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                            border: `2px solid ${image.is_featured ? "#8B5CF6" : "#E5E7EB"}`,
                                        }}
                                    >
                                        {image.is_featured && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "8px",
                                                    left: "8px",
                                                    backgroundColor: "#8B5CF6",
                                                    color: "#FFF",
                                                    padding: "4px 8px",
                                                    borderRadius: "6px",
                                                    fontSize: "0.625rem",
                                                    fontWeight: 600,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    zIndex: 10,
                                                }}
                                            >
                                                <Star style={{ width: 10, height: 10, fill: "#FFF" }} />
                                                Featured
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "8px",
                                                right: "8px",
                                                display: "flex",
                                                gap: "4px",
                                                zIndex: 10,
                                            }}
                                        >
                                            <button
                                                onClick={() => handleToggleFeatured(image)}
                                                style={{
                                                    width: "28px",
                                                    height: "28px",
                                                    borderRadius: "6px",
                                                    backgroundColor: "rgba(255,255,255,0.9)",
                                                    border: "none",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <Star style={{ width: 14, height: 14, color: image.is_featured ? "#8B5CF6" : "#9CA3AF", fill: image.is_featured ? "#8B5CF6" : "none" }} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteImage(image.id)}
                                                style={{
                                                    width: "28px",
                                                    height: "28px",
                                                    borderRadius: "6px",
                                                    backgroundColor: "rgba(255,255,255,0.9)",
                                                    border: "none",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <Trash2 style={{ width: 14, height: 14, color: "#EF4444" }} />
                                            </button>
                                        </div>

                                        <div style={{ aspectRatio: "4/3", backgroundColor: "#F3F4F6" }}>
                                            {image.site_media?.url ? (
                                                <img src={image.site_media.url} alt={image.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Images style={{ width: 32, height: 32, color: "#D1D5DB" }} />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ padding: "10px" }}>
                                            <p style={{ fontSize: "0.75rem", color: "#374151" }}>{image.caption || "Sans légende"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!selectedAlbum && albums.length > 0 && (
                    <div
                        style={{
                            backgroundColor: "#F9FAFB",
                            borderRadius: "20px",
                            border: "2px dashed #E5E7EB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4rem",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <Images style={{ width: 48, height: 48, color: "#D1D5DB", margin: "0 auto 1rem" }} />
                            <h3 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                                Sélectionnez un album
                            </h3>
                            <p style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>
                                Choisissez un album pour voir et gérer ses images
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Image Modal */}
            {showAddImageModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "#FFF", borderRadius: "16px", width: "90%", maxWidth: "800px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "1.5rem", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111" }}>Sélectionner une image</h3>
                            <button onClick={() => setShowAddImageModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                                <X style={{ width: 24, height: 24, color: "#6B7280" }} />
                            </button>
                        </div>

                        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
                                {mediaFiles.map(file => (
                                    <div
                                        key={file.id}
                                        onClick={() => toggleMediaSelection(file.id)}
                                        style={{
                                            aspectRatio: "1",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            border: selectedMediaIds.includes(file.id) ? "3px solid #8B5CF6" : "1px solid #E5E7EB",
                                            cursor: "pointer",
                                            position: "relative"
                                        }}
                                    >
                                        <img src={file.url} alt={file.filename} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        {selectedMediaIds.includes(file.id) && (
                                            <div style={{ position: "absolute", top: 4, right: 4, backgroundColor: "#8B5CF6", borderRadius: "50%", padding: 2 }}>
                                                <Check style={{ width: 14, height: 14, color: "#FFF" }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: "1.5rem", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                            <button
                                onClick={() => setShowAddImageModal(false)}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    border: "1px solid #D1D5DB",
                                    backgroundColor: "#FFF",
                                    cursor: "pointer"
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddImage}
                                disabled={selectedMediaIds.length === 0 || addingImage}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    backgroundColor: "#8B5CF6",
                                    color: "#FFF",
                                    border: "none",
                                    cursor: selectedMediaIds.length > 0 ? "pointer" : "not-allowed",
                                    opacity: selectedMediaIds.length > 0 ? 1 : 0.5
                                }}
                            >
                                {addingImage ? "Ajout..." : `Ajouter (${selectedMediaIds.length})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
