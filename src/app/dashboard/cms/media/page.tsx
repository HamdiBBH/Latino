"use client";

import { useState, useRef, useEffect } from "react";
import {
    Image as ImageIcon,
    ArrowLeft,
    Upload,
    Trash2,
    Search,
    Grid,
    List,
    Check,
    X,
    Folder,
    Download,
    Copy,
    Eye,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Sparkles
} from "lucide-react";
import { getMedia, uploadMedia, deleteMedia } from "@/app/actions/cms";
import { convertToWebP, formatFileSize, analyzeImageWithAI, renameFile } from "@/lib/imageUtils";

interface MediaFile {
    id: string;
    filename: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    url: string;
    thumbnail_url: string;
    folder: string;
    created_at: string;
}

interface UploadingFile {
    id: string;
    name: string;
    originalSize: number;
    convertedSize?: number;
    status: "converting" | "analyzing" | "uploading" | "success" | "error";
    progress: number;
    error?: string;
    seoName?: string;
}

const folders = [
    { name: "all", label: "Tous" },
    { name: "hero", label: "Hero" },
    { name: "about", label: "À propos" },
    { name: "experience", label: "Expérience" },
    { name: "gallery", label: "Galerie" },
    { name: "events", label: "Événements" },
    { name: "menu", label: "Menu" },
    { name: "branding", label: "Branding" },
    { name: "general", label: "Général" },
];

export default function MediaManagerPage() {
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [selectedFolder, setSelectedFolder] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [previewImage, setPreviewImage] = useState<MediaFile | null>(null);
    const [useAINaming, setUseAINaming] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadMedia();
    }, [selectedFolder]);

    const loadMedia = async () => {
        setLoading(true);
        const data = await getMedia(selectedFolder);
        setMedia(data as MediaFile[]);
        setLoading(false);
    };

    const filteredMedia = media.filter(m => {
        const matchesSearch = m.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.original_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const toggleSelect = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        await uploadFiles(files);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        await uploadFiles(files);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const uploadFiles = async (files: File[]) => {
        if (files.length === 0) return;

        const folder = selectedFolder === "all" ? "general" : selectedFolder;

        // Initialize uploading state for each file
        const initialUploadState: UploadingFile[] = files.map((file, index) => ({
            id: `upload-${Date.now()}-${index}`,
            name: file.name,
            originalSize: file.size,
            status: "converting" as const,
            progress: 0,
        }));

        setUploadingFiles(prev => [...prev, ...initialUploadState]);

        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const uploadId = initialUploadState[i].id;

            try {
                // Step 1: Convert to WebP
                setUploadingFiles(prev => prev.map(f =>
                    f.id === uploadId ? { ...f, status: "converting" as const, progress: 20 } : f
                ));

                const convertedFile = await convertToWebP(file, 0.85, 2000, 2000);

                let finalFile = convertedFile;
                let altText = "";

                // Step 2: Analyze with AI for SEO naming (if enabled)
                if (useAINaming) {
                    setUploadingFiles(prev => prev.map(f =>
                        f.id === uploadId ? {
                            ...f,
                            status: "analyzing" as const,
                            progress: 40,
                            convertedSize: convertedFile.size,
                        } : f
                    ));

                    try {
                        const aiResult = await analyzeImageWithAI(convertedFile, folder);
                        const seoFilename = aiResult.filename;
                        finalFile = renameFile(convertedFile, seoFilename);
                        altText = aiResult.altText || "";

                        setUploadingFiles(prev => prev.map(f =>
                            f.id === uploadId ? {
                                ...f,
                                status: "uploading" as const,
                                progress: 70,
                                name: finalFile.name,
                                seoName: seoFilename,
                            } : f
                        ));
                    } catch (aiError) {
                        console.warn("AI naming failed (likely quota exceeded), utilizing fallback:", aiError);
                        // Continue with original converted file name
                        setUploadingFiles(prev => prev.map(f =>
                            f.id === uploadId ? {
                                ...f,
                                status: "uploading" as const,
                                progress: 70,
                                convertedSize: convertedFile.size,
                                name: convertedFile.name,
                            } : f
                        ));
                    }
                } else {
                    // Skip AI - just update progress
                    setUploadingFiles(prev => prev.map(f =>
                        f.id === uploadId ? {
                            ...f,
                            status: "uploading" as const,
                            progress: 60,
                            convertedSize: convertedFile.size,
                            name: convertedFile.name,
                        } : f
                    ));
                }

                // Step 3: Upload to Supabase
                const formData = new FormData();
                formData.append("file", finalFile);
                formData.append("folder", folder);
                formData.append("altText", altText);

                const result = await uploadMedia(formData);

                if (result.success) {
                    setUploadingFiles(prev => prev.map(f =>
                        f.id === uploadId ? { ...f, status: "success" as const, progress: 100 } : f
                    ));
                } else {
                    setUploadingFiles(prev => prev.map(f =>
                        f.id === uploadId ? { ...f, status: "error" as const, error: result.error } : f
                    ));
                }
            } catch (error) {
                setUploadingFiles(prev => prev.map(f =>
                    f.id === uploadId ? { ...f, status: "error" as const, error: String(error) } : f
                ));
            }
        }

        // Reload media after all uploads
        await loadMedia();

        // Clear completed uploads after 5 seconds
        setTimeout(() => {
            setUploadingFiles(prev => prev.filter(f => f.status !== "success"));
        }, 5000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce fichier ?")) return;

        const result = await deleteMedia(id);

        if (result.success) {
            setMedia(media.filter(m => m.id !== id));
            setSelectedItems(selectedItems.filter(i => i !== id));
        } else {
            alert("Erreur: " + result.error);
        }
    };

    const deleteSelected = async () => {
        if (!confirm(`Supprimer ${selectedItems.length} fichier(s) ?`)) return;

        for (const id of selectedItems) {
            await deleteMedia(id);
        }

        await loadMedia();
        setSelectedItems([]);
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        alert("URL copiée !");
    };

    const clearUploadingFile = (id: string) => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id));
    };

    const totalSize = media.reduce((acc, m) => acc + (m.size_bytes || 0), 0);
    const isUploading = uploadingFiles.some(f => f.status === "converting" || f.status === "analyzing" || f.status === "uploading");

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <a href="/dashboard/cms" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7A7A7A", textDecoration: "none", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                        Retour au Dashboard
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <ImageIcon style={{ width: 32, height: 32, color: "#F59E0B" }} />
                        <div>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>Médiathèque</h1>
                            <p style={{ color: "#7A7A7A" }}>{media.length} fichiers • {formatFileSize(totalSize)} utilisés</p>
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    {selectedItems.length > 0 && (
                        <button
                            onClick={deleteSelected}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "12px 20px",
                                backgroundColor: "#FEE2E2",
                                color: "#DC2626",
                                border: "none",
                                borderRadius: "100px",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <Trash2 style={{ width: 18, height: 18 }} />
                            Supprimer ({selectedItems.length})
                        </button>
                    )}
                    {/* AI Toggle */}
                    <button
                        onClick={() => setUseAINaming(!useAINaming)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 20px",
                            backgroundColor: useAINaming ? "#FEF3C7" : "#F3F4F6",
                            color: useAINaming ? "#92400E" : "#6B7280",
                            border: useAINaming ? "1px solid #FCD34D" : "1px solid #E5E7EB",
                            borderRadius: "100px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        title={useAINaming ? "Nommage IA activé" : "Nommage IA désactivé"}
                    >
                        <Sparkles style={{ width: 18, height: 18 }} />
                        IA {useAINaming ? "ON" : "OFF"}
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 24px",
                            backgroundColor: "#222222",
                            color: "#FFF",
                            border: "none",
                            borderRadius: "100px",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            cursor: isUploading ? "not-allowed" : "pointer",
                            opacity: isUploading ? 0.7 : 1,
                        }}
                    >
                        <Upload style={{ width: 18, height: 18 }} />
                        Uploader
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                    />
                </div>
            </div>

            {/* Upload Progress Panel */}
            {uploadingFiles.length > 0 && (
                <div
                    style={{
                        backgroundColor: "#FFF",
                        borderRadius: "16px",
                        border: "1px solid #E5E7EB",
                        marginBottom: "1.5rem",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontWeight: 600, color: "#222", fontSize: "0.875rem" }}>
                            Upload en cours ({uploadingFiles.filter(f => f.status === "converting" || f.status === "analyzing" || f.status === "uploading").length}/{uploadingFiles.length})
                        </h3>
                        <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                            Conversion WebP{useAINaming ? " + Nommage SEO IA" : ""}
                        </span>
                    </div>
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {uploadingFiles.map(file => (
                            <div
                                key={file.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px 1.5rem",
                                    borderBottom: "1px solid #F9FAFB",
                                }}
                            >
                                {/* Status Icon */}
                                <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {file.status === "converting" && (
                                        <div style={{ position: "relative" }}>
                                            <Loader2 style={{ width: 24, height: 24, color: "#8B5CF6", animation: "spin 1s linear infinite" }} />
                                        </div>
                                    )}
                                    {file.status === "analyzing" && (
                                        <Sparkles style={{ width: 24, height: 24, color: "#F59E0B", animation: "pulse 1s ease-in-out infinite" }} />
                                    )}
                                    {file.status === "uploading" && (
                                        <Loader2 style={{ width: 24, height: 24, color: "#3B82F6", animation: "spin 1s linear infinite" }} />
                                    )}
                                    {file.status === "success" && (
                                        <CheckCircle2 style={{ width: 24, height: 24, color: "#10B981" }} />
                                    )}
                                    {file.status === "error" && (
                                        <AlertCircle style={{ width: 24, height: 24, color: "#EF4444" }} />
                                    )}
                                </div>

                                {/* File Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {file.seoName ? `${file.seoName}.webp` : file.name}
                                    </p>
                                    <p style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                                        {file.status === "converting" && "Conversion en WebP..."}
                                        {file.status === "analyzing" && (
                                            <span style={{ color: "#F59E0B" }}>
                                                ✨ Analyse IA pour nom SEO...
                                            </span>
                                        )}
                                        {file.status === "uploading" && "Upload en cours..."}
                                        {file.status === "success" && (
                                            <>
                                                ✓ Terminé
                                                {file.convertedSize && file.originalSize !== file.convertedSize && (
                                                    <span style={{ color: "#10B981", marginLeft: "8px" }}>
                                                        ({formatFileSize(file.originalSize)} → {formatFileSize(file.convertedSize)})
                                                    </span>
                                                )}
                                            </>
                                        )}
                                        {file.status === "error" && <span style={{ color: "#EF4444" }}>{file.error}</span>}
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ width: "100px" }}>
                                    <div style={{ height: "4px", backgroundColor: "#F3F4F6", borderRadius: "2px", overflow: "hidden" }}>
                                        <div
                                            style={{
                                                height: "100%",
                                                width: `${file.progress}%`,
                                                backgroundColor: file.status === "error" ? "#EF4444" : file.status === "success" ? "#10B981" : "#F59E0B",
                                                transition: "width 0.3s ease",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Close button for completed/error */}
                                {(file.status === "success" || file.status === "error") && (
                                    <button
                                        onClick={() => clearUploadingFile(file.id)}
                                        style={{ padding: "4px", border: "none", backgroundColor: "transparent", cursor: "pointer" }}
                                    >
                                        <X style={{ width: 16, height: 16, color: "#9CA3AF" }} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "1.5rem" }}>
                {/* Sidebar - Folders */}
                <div
                    style={{
                        backgroundColor: "#FFF",
                        borderRadius: "16px",
                        border: "1px solid #E5E7EB",
                        padding: "1rem",
                        height: "fit-content",
                    }}
                >
                    <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.75rem", padding: "0 0.5rem" }}>
                        Dossiers
                    </h3>
                    {folders.map(folder => (
                        <button
                            key={folder.name}
                            onClick={() => setSelectedFolder(folder.name)}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 12px",
                                backgroundColor: selectedFolder === folder.name ? "#FEF3C7" : "transparent",
                                border: "none",
                                borderRadius: "10px",
                                cursor: "pointer",
                                marginBottom: "4px",
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Folder style={{ width: 18, height: 18, color: selectedFolder === folder.name ? "#F59E0B" : "#9CA3AF" }} />
                                <span style={{ fontSize: "0.875rem", fontWeight: selectedFolder === folder.name ? 600 : 400, color: "#222" }}>
                                    {folder.label}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div>
                    {/* Toolbar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
                        <div style={{ position: "relative", flex: "1", maxWidth: "300px" }}>
                            <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "#9CA3AF" }} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px 10px 40px",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "10px",
                                    fontSize: "0.875rem",
                                    outline: "none",
                                }}
                            />
                        </div>
                        <div style={{ display: "flex", backgroundColor: "#F3F4F6", borderRadius: "10px", padding: "4px" }}>
                            <button
                                onClick={() => setViewMode("grid")}
                                style={{
                                    padding: "8px 12px",
                                    backgroundColor: viewMode === "grid" ? "#FFF" : "transparent",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                }}
                            >
                                <Grid style={{ width: 18, height: 18, color: viewMode === "grid" ? "#222" : "#9CA3AF" }} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                style={{
                                    padding: "8px 12px",
                                    backgroundColor: viewMode === "list" ? "#FFF" : "transparent",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                }}
                            >
                                <List style={{ width: 18, height: 18, color: viewMode === "list" ? "#222" : "#9CA3AF" }} />
                            </button>
                        </div>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            border: `2px dashed ${isDragging ? "#F59E0B" : "#E5E7EB"}`,
                            borderRadius: "16px",
                            padding: isDragging ? "3rem" : "1.5rem",
                            textAlign: "center",
                            backgroundColor: isDragging ? "#FEF3C7" : "#FAFAFA",
                            marginBottom: "1.5rem",
                            transition: "all 0.2s ease",
                        }}
                    >
                        <Upload style={{ width: 32, height: 32, color: isDragging ? "#F59E0B" : "#9CA3AF", margin: "0 auto 0.75rem" }} />
                        <p style={{ color: isDragging ? "#92400E" : "#6B7280", fontSize: "0.875rem" }}>
                            {isDragging ? "Déposez vos fichiers ici" : "Glissez-déposez des images ici (conversion automatique en WebP)"}
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem" }}>
                            <Loader2 style={{ width: 32, height: 32, color: "#F59E0B", animation: "spin 1s linear infinite" }} />
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "#F9FAFB", borderRadius: "16px" }}>
                            <ImageIcon style={{ width: 48, height: 48, color: "#D1D5DB", margin: "0 auto 1rem" }} />
                            <h3 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Aucun média</h3>
                            <p style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>Uploadez des images pour commencer</p>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                            {filteredMedia.map(file => (
                                <div
                                    key={file.id}
                                    style={{
                                        position: "relative",
                                        backgroundColor: "#FFF",
                                        borderRadius: "12px",
                                        border: `2px solid ${selectedItems.includes(file.id) ? "#F59E0B" : "#E5E7EB"}`,
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                    onClick={() => toggleSelect(file.id)}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "8px",
                                            left: "8px",
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "6px",
                                            backgroundColor: selectedItems.includes(file.id) ? "#F59E0B" : "rgba(255,255,255,0.9)",
                                            border: selectedItems.includes(file.id) ? "none" : "1px solid #D1D5DB",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            zIndex: 10,
                                        }}
                                    >
                                        {selectedItems.includes(file.id) && <Check style={{ width: 14, height: 14, color: "#FFF" }} />}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setPreviewImage(file); }}
                                        style={{
                                            position: "absolute",
                                            top: "8px",
                                            right: "8px",
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "8px",
                                            backgroundColor: "rgba(255,255,255,0.9)",
                                            border: "none",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            zIndex: 10,
                                        }}
                                    >
                                        <Eye style={{ width: 14, height: 14, color: "#374151" }} />
                                    </button>
                                    {/* WebP indicator */}
                                    {file.mime_type === "image/webp" && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                bottom: "50px",
                                                right: "8px",
                                                backgroundColor: "#10B981",
                                                color: "#FFF",
                                                padding: "2px 6px",
                                                borderRadius: "4px",
                                                fontSize: "0.625rem",
                                                fontWeight: 600,
                                                zIndex: 10,
                                            }}
                                        >
                                            WebP
                                        </div>
                                    )}
                                    <div style={{ aspectRatio: "1", overflow: "hidden", backgroundColor: "#F3F4F6" }}>
                                        <img src={file.url || file.thumbnail_url} alt={file.filename} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                    <div style={{ padding: "10px" }}>
                                        <p style={{ fontSize: "0.75rem", fontWeight: 500, color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {file.original_name || file.filename}
                                        </p>
                                        <p style={{ fontSize: "0.625rem", color: "#9CA3AF" }}>
                                            {formatFileSize(file.size_bytes)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ backgroundColor: "#FFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                            {filteredMedia.map((file, index) => (
                                <div
                                    key={file.id}
                                    onClick={() => toggleSelect(file.id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                        padding: "12px 16px",
                                        borderBottom: index < filteredMedia.length - 1 ? "1px solid #F3F4F6" : "none",
                                        cursor: "pointer",
                                        backgroundColor: selectedItems.includes(file.id) ? "#FEF3C7" : "#FFF",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "4px",
                                            backgroundColor: selectedItems.includes(file.id) ? "#F59E0B" : "#FFF",
                                            border: selectedItems.includes(file.id) ? "none" : "1px solid #D1D5DB",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {selectedItems.includes(file.id) && <Check style={{ width: 12, height: 12, color: "#FFF" }} />}
                                    </div>
                                    <img src={file.url || file.thumbnail_url} alt={file.filename} style={{ width: 48, height: 48, borderRadius: "8px", objectFit: "cover" }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#222" }}>{file.original_name || file.filename}</p>
                                        <p style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{file.folder}</p>
                                    </div>
                                    {file.mime_type === "image/webp" && (
                                        <span style={{ backgroundColor: "#DCFCE7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontSize: "0.625rem", fontWeight: 600 }}>
                                            WebP
                                        </span>
                                    )}
                                    <p style={{ fontSize: "0.75rem", color: "#6B7280" }}>{formatFileSize(file.size_bytes)}</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setPreviewImage(file); }}
                                        style={{ padding: "8px", border: "none", backgroundColor: "transparent", cursor: "pointer" }}
                                    >
                                        <Eye style={{ width: 18, height: 18, color: "#9CA3AF" }} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                                        style={{ padding: "8px", border: "none", backgroundColor: "transparent", cursor: "pointer" }}
                                    >
                                        <Trash2 style={{ width: 18, height: 18, color: "#EF4444" }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        padding: "2rem",
                    }}
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        style={{
                            backgroundColor: "#FFF",
                            borderRadius: "16px",
                            maxWidth: "900px",
                            maxHeight: "90vh",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: "1px solid #E5E7EB" }}>
                            <h3 style={{ fontWeight: 600, color: "#222" }}>{previewImage.original_name || previewImage.filename}</h3>
                            <button onClick={() => setPreviewImage(null)} style={{ padding: "8px", border: "none", backgroundColor: "#F3F4F6", borderRadius: "8px", cursor: "pointer" }}>
                                <X style={{ width: 20, height: 20, color: "#374151" }} />
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", backgroundColor: "#F9FAFB" }}>
                            <img src={previewImage.url} alt={previewImage.filename} style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: "8px" }} />
                        </div>
                        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                                {formatFileSize(previewImage.size_bytes)} • {previewImage.mime_type}
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    onClick={() => copyUrl(previewImage.url)}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 16px", backgroundColor: "#F3F4F6", border: "none", borderRadius: "8px", fontSize: "0.875rem", cursor: "pointer" }}
                                >
                                    <Copy style={{ width: 16, height: 16 }} />
                                    Copier l&apos;URL
                                </button>
                                <a
                                    href={previewImage.url}
                                    download
                                    target="_blank"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 16px", backgroundColor: "#222", color: "#FFF", border: "none", borderRadius: "8px", fontSize: "0.875rem", textDecoration: "none" }}
                                >
                                    <Download style={{ width: 16, height: 16 }} />
                                    Télécharger
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
}
