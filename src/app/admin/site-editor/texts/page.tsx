"use client";

import { useState, useEffect } from "react";
import { FileText, Save, RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ContentItem {
    id: string;
    key: string;
    value: { text: string; type: string };
    section: string;
}

// Mock data - will be replaced with Supabase fetch
const mockContent: ContentItem[] = [
    { id: "1", key: "hero_title_light", value: { text: "Bienvenue au", type: "heading" }, section: "hero" },
    { id: "2", key: "hero_title_bold", value: { text: "Latino Coucou Beach.", type: "heading" }, section: "hero" },
    { id: "3", key: "hero_subtitle", value: { text: "L'expérience beach club ultime sous le soleil méditerranéen", type: "paragraph" }, section: "hero" },
    { id: "4", key: "about_tag", value: { text: "Notre Histoire", type: "label" }, section: "about" },
    { id: "5", key: "about_title_light", value: { text: "Un paradis", type: "heading" }, section: "about" },
    { id: "6", key: "about_title_bold", value: { text: "au bord de l'eau", type: "heading" }, section: "about" },
    { id: "7", key: "services_tag", value: { text: "Ce que nous offrons", type: "label" }, section: "services" },
    { id: "8", key: "services_title", value: { text: "Nos Services", type: "heading" }, section: "services" },
];

const sections = ["Tous", "hero", "about", "services", "packages", "events", "contact"];

export default function TextsEditorPage() {
    const [content, setContent] = useState<ContentItem[]>(mockContent);
    const [filteredContent, setFilteredContent] = useState<ContentItem[]>(mockContent);
    const [activeSection, setActiveSection] = useState("Tous");
    const [searchQuery, setSearchQuery] = useState("");
    const [editedItems, setEditedItems] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    // Filter content
    useEffect(() => {
        let filtered = content;

        if (activeSection !== "Tous") {
            filtered = filtered.filter((item) => item.section === activeSection);
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (item) =>
                    item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.value.text.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredContent(filtered);
    }, [content, activeSection, searchQuery]);

    const handleTextChange = (id: string, newText: string) => {
        setContent((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, value: { ...item.value, text: newText } }
                    : item
            )
        );
        setEditedItems((prev) => new Set(prev).add(id));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Save to Supabase via Server Action
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setEditedItems(new Set());
        setIsSaving(false);
        alert("Modifications enregistrées !");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
                        <FileText className="w-7 h-7 text-accent" />
                        Éditeur de Textes
                    </h1>
                    <p className="text-text mt-1">
                        Modifiez les textes affichés sur le site
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        isLoading={isSaving}
                        disabled={editedItems.size === 0}
                    >
                        <Save className="w-4 h-4" />
                        Sauvegarder ({editedItems.size})
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un texte..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200",
                                "focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                            )}
                        />
                    </div>

                    {/* Section Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {sections.map((section) => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    activeSection === section
                                        ? "bg-accent text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {section === "Tous" ? section : section.charAt(0).toUpperCase() + section.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {filteredContent.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                "p-4 transition-colors",
                                editedItems.has(item.id) && "bg-accent/5"
                            )}
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="sm:w-48 shrink-0">
                                    <p className="text-sm font-mono text-gray-500">{item.key}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                            {item.section}
                                        </span>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                                            {item.value.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    {item.value.type === "paragraph" ? (
                                        <textarea
                                            value={item.value.text}
                                            onChange={(e) => handleTextChange(item.id, e.target.value)}
                                            rows={3}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-lg border border-gray-200",
                                                "focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none",
                                                "resize-none"
                                            )}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={item.value.text}
                                            onChange={(e) => handleTextChange(item.id, e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-lg border border-gray-200",
                                                "focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                            )}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredContent.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Aucun contenu trouvé</p>
                    </div>
                )}
            </div>
        </div>
    );
}
