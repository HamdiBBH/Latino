"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    Video,
    Plus,
    Trash2,
    Eye,
    X,
    MessageCircle,
    Copy,
    ExternalLink,
    Instagram,
    ImageIcon,
    Pencil
} from "lucide-react";
import { getReels, createReel, deleteReel, updateReel, getMedia } from "@/app/actions/cms";

interface Reel {
    id: string;
    embed_id: string;
    label: string;
    views: string;
    thumbnail_url?: string;
    display_order: number;
    is_active: boolean;
}

export default function ReelsManagerPage() {
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewReelModal, setShowNewReelModal] = useState(false);

    // Form State
    const [newItemUrl, setNewItemUrl] = useState("");
    const [newItemLabel, setNewItemLabel] = useState("");
    const [newItemViews, setNewItemViews] = useState("1.5K");
    const [newItemThumbnail, setNewItemThumbnail] = useState("");
    const [extractedId, setExtractedId] = useState("");
    const [creating, setCreating] = useState(false);

    // Media picker state
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);

    useEffect(() => {
        loadReels();
    }, []);

    useEffect(() => {
        if (showMediaPicker) {
            loadMedia();
        }
    }, [showMediaPicker]);

    const loadMedia = async () => {
        const data = await getMedia();
        // Filter to only images
        setMediaFiles(data.filter((f: any) => f.mime_type?.startsWith('image/')));
    };

    // Auto-extract ID when URL changes
    useEffect(() => {
        if (!newItemUrl) {
            setExtractedId("");
            return;
        }

        // Try to find /reel/ID/ or /p/ID/ pattern (common for reels shared as posts)
        // Handles optional query params and trailing slashes
        const urlMatch = newItemUrl.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);

        if (urlMatch && urlMatch[1]) {
            setExtractedId(urlMatch[1]);
        } else if (newItemUrl.length < 20 && !newItemUrl.includes("/")) {
            // Probably just pasted the ID directly
            setExtractedId(newItemUrl);
        } else {
            setExtractedId("");
        }
    }, [newItemUrl]);

    const loadReels = async () => {
        setLoading(true);
        const data = await getReels();
        setReels(data as Reel[]);
        setLoading(false);
    };

    const handleCreateReel = async () => {
        if (!extractedId || !newItemLabel) return;

        setCreating(true);
        const result = await createReel({
            embed_id: extractedId,
            label: newItemLabel,
            views: newItemViews,
            thumbnail_url: newItemThumbnail || null,
            display_order: reels.length, // Append to end
            is_active: true
        });

        if (result.success) {
            await loadReels();
            setNewItemUrl("");
            setNewItemLabel("");
            setNewItemViews("1.5K");
            setNewItemThumbnail("");
            setShowNewReelModal(false);
        } else {
            alert("Erreur lors de la création du reel");
        }
        setCreating(false);
    };

    const handleDeleteReel = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce reel ?")) return;
        await deleteReel(id);
        await loadReels();
    };

    const handleToggleActive = async (reel: Reel) => {
        await updateReel(reel.id, { is_active: !reel.is_active });
        // Optimistic update
        setReels(reels.map(r => r.id === reel.id ? { ...r, is_active: !r.is_active } : r));
    };

    // Edit state
    const [editingReel, setEditingReel] = useState<Reel | null>(null);
    const [editLabel, setEditLabel] = useState("");
    const [editViews, setEditViews] = useState("");
    const [editThumbnail, setEditThumbnail] = useState("");
    const [updating, setUpdating] = useState(false);

    const handleEditReel = (reel: Reel) => {
        setEditingReel(reel);
        setEditLabel(reel.label);
        setEditViews(reel.views);
        setEditThumbnail(reel.thumbnail_url || "");
    };

    const handleUpdateReel = async () => {
        if (!editingReel) return;

        setUpdating(true);
        const result = await updateReel(editingReel.id, {
            label: editLabel,
            views: editViews,
            thumbnail_url: editThumbnail || null
        });

        if (result.success) {
            await loadReels();
            setEditingReel(null);
        } else {
            alert("Erreur lors de la mise à jour");
        }
        setUpdating(false);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Instagram className="w-8 h-8 text-pink-600" />
                        Gestion des Reels
                    </h1>
                    <p className="text-gray-500 mt-2">Gérez les vidéos affichées dans la section "Moments en vidéo"</p>
                </div>
                <button
                    onClick={() => setShowNewReelModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter un Reel
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {reels.map((reel) => (
                        <div key={reel.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${!reel.is_active ? 'opacity-60' : ''}`}>
                            {/* Header / Preview simulation */}
                            <div className="aspect-[9/16] bg-gray-100 relative group">
                                <iframe
                                    src={`https://www.instagram.com/reel/${reel.embed_id}/embed/`}
                                    className="w-full h-full pointer-events-none"
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                ></iframe>

                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                    <a
                                        href={`https://www.instagram.com/reel/${reel.embed_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white rounded-full hover:scale-110 transition-transform"
                                        title="Voir sur Instagram"
                                    >
                                        <ExternalLink className="w-5 h-5 text-gray-900" />
                                    </a>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900 truncate flex-1" title={reel.label}>{reel.label}</h3>
                                    <button
                                        onClick={() => handleToggleActive(reel)}
                                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${reel.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {reel.is_active ? 'Actif' : 'Inactif'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <Eye className="w-4 h-4" />
                                    <span>{reel.views} vues</span>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t">
                                    <span className="text-xs text-mono text-gray-400">ID: {reel.embed_id}</span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEditReel(reel)}
                                            className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                                            title="Modifier"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReel(reel.id)}
                                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {reels.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed text-gray-500">
                            Aucun reel configuré pour le moment.
                        </div>
                    )}
                </div>
            )}

            {/* Modal Creation */}
            {showNewReelModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl p-6"
                        style={{
                            width: '100%',
                            maxWidth: '500px'
                        }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Ajouter un Reel</h2>
                            <button onClick={() => setShowNewReelModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lien Instagram ou ID
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newItemUrl}
                                        onChange={(e) => setNewItemUrl(e.target.value)}
                                        placeholder="https://www.instagram.com/reel/C-pI5r..."
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none pr-10"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Copy className="w-4 h-4" />
                                    </div>
                                </div>
                                {extractedId && (
                                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                                        <Video className="w-3 h-3" />
                                        ID détecté : {extractedId}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Titre / Label
                                </label>
                                <input
                                    type="text"
                                    value={newItemLabel}
                                    onChange={(e) => setNewItemLabel(e.target.value)}
                                    placeholder="Ex: Soirée Blanche"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de vues (affiché)
                                </label>
                                <input
                                    type="text"
                                    value={newItemViews}
                                    onChange={(e) => setNewItemViews(e.target.value)}
                                    placeholder="Ex: 12.5K"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                />
                            </div>

                            {/* Thumbnail Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Miniature personnalisée
                                </label>
                                <div className="flex items-center gap-3">
                                    {newItemThumbnail ? (
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                                            <Image
                                                src={newItemThumbnail}
                                                alt="Miniature"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setNewItemThumbnail("")}
                                                className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-gray-300">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaPicker(true)}
                                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                                    >
                                        {newItemThumbnail ? "Changer" : "Choisir une image"}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-gray-400">Optionnel • Image depuis la médiathèque</p>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setShowNewReelModal(false)}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateReel}
                                disabled={!extractedId || !newItemLabel || creating}
                                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                            >
                                {creating ? "Ajout..." : "Ajouter"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl p-6"
                        style={{ width: '100%', maxWidth: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Choisir une miniature</h3>
                            <button onClick={() => setShowMediaPicker(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-4 gap-3">
                                {mediaFiles.map((file) => (
                                    <button
                                        key={file.id}
                                        onClick={() => {
                                            if (editingReel) {
                                                setEditThumbnail(file.url);
                                            } else {
                                                setNewItemThumbnail(file.url);
                                            }
                                            setShowMediaPicker(false);
                                        }}
                                        className="aspect-square relative rounded-lg overflow-hidden border-2 border-transparent hover:border-black transition-colors"
                                    >
                                        <Image
                                            src={file.url}
                                            alt={file.filename}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                            {mediaFiles.length === 0 && (
                                <p className="text-center py-8 text-gray-400">Aucune image disponible</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Modal */}
            {editingReel && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl p-6"
                        style={{ width: '100%', maxWidth: '500px' }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Modifier le Reel</h2>
                            <button onClick={() => setEditingReel(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-500">ID Instagram : </span>
                                <span className="font-mono text-sm">{editingReel.embed_id}</span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Titre / Label
                                </label>
                                <input
                                    type="text"
                                    value={editLabel}
                                    onChange={(e) => setEditLabel(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de vues (affiché)
                                </label>
                                <input
                                    type="text"
                                    value={editViews}
                                    onChange={(e) => setEditViews(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                />
                            </div>

                            {/* Thumbnail Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Miniature personnalisée
                                </label>
                                <div className="flex items-center gap-3">
                                    {editThumbnail ? (
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                                            <Image
                                                src={editThumbnail}
                                                alt="Miniature"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setEditThumbnail("")}
                                                className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-gray-300">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaPicker(true)}
                                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                                    >
                                        {editThumbnail ? "Changer" : "Choisir une image"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setEditingReel(null)}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleUpdateReel}
                                disabled={updating}
                                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
                            >
                                {updating ? "Enregistrement..." : "Enregistrer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
