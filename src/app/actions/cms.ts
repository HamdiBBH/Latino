"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateDishImage } from "./ai";

export async function generateAndSaveMenuImage(dishName: string) {
    const supabase = await createClient();

    // 1. Generate Image
    const genResult = await generateDishImage(dishName);
    if (!genResult.success || !genResult.b64_json) {
        return { success: false, error: genResult.error || "Échec génération" };
    }

    // 2. Convert base64 to Buffer/Blob
    const buffer = Buffer.from(genResult.b64_json, 'base64');

    // 3. Generate filename
    const timestamp = Date.now();
    const sanitizedName = dishName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase().substring(0, 30);
    const filename = `menu/ai-${sanitizedName}-${timestamp}.png`;

    // 4. Upload to Supabase
    const { error: uploadError } = await supabase.storage
        .from("cms-media")
        .upload(filename, buffer, {
            contentType: "image/png",
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        console.error("Upload Error:", uploadError);
        return { success: false, error: uploadError.message };
    }

    // 5. Get Public URL
    const { data: urlData } = supabase.storage.from("cms-media").getPublicUrl(filename);

    // 6. Insert into site_media
    const { data: mediaData, error: dbError } = await supabase
        .from("site_media")
        .insert({
            filename: filename.split("/").pop(),
            original_name: `AI-GEN: ${dishName}`,
            mime_type: "image/png",
            size_bytes: buffer.length,
            url: urlData.publicUrl,
            thumbnail_url: urlData.publicUrl,
            folder: "menu",
            alt_text: `Photo générée par IA de ${dishName}`,
        })
        .select()
        .single();

    if (dbError) {
        return { success: false, error: dbError.message };
    }

    revalidatePath("/admin/cms/menu");
    return { success: true, data: mediaData };
}

// ... rest of the file ...

// ============================================
// SECTIONS
// ============================================

export async function getSections() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("site_sections")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching sections:", error);
        return [];
    }
    return data;
}

export async function updateSectionOrder(sections: { id: string; display_order: number }[]) {
    const supabase = await createClient();

    for (const section of sections) {
        const { error } = await supabase
            .from("site_sections")
            .update({ display_order: section.display_order })
            .eq("id", section.id);

        if (error) {
            console.error("Error updating section order:", error);
            return { success: false, error: error.message };
        }
    }

    revalidatePath("/admin/cms/sections");
    return { success: true };
}

export async function toggleSectionActive(id: string, isActive: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("site_sections")
        .update({ is_active: isActive })
        .eq("id", id);

    if (error) {
        console.error("Error toggling section:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/sections");
    return { success: true };
}

// ============================================
// CONTENT
// ============================================

export async function getContentBySection(sectionName: string) {
    const supabase = await createClient();

    const { data: section } = await supabase
        .from("site_sections")
        .select("id")
        .eq("name", sectionName)
        .single();

    if (!section) return [];

    const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("section_id", section.id);

    if (error) {
        console.error("Error fetching content:", error);
        return [];
    }
    return data;
}

export async function updateContent(id: string, content: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("site_content")
        .update({ content })
        .eq("id", id);

    if (error) {
        console.error("Error updating content:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/content");
    return { success: true };
}

export async function createContent(sectionId: string, fieldName: string, fieldType: string, content: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("site_content")
        .insert({ section_id: sectionId, field_name: fieldName, field_type: fieldType, content });

    if (error) {
        console.error("Error creating content:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/content");
    return { success: true };
}

// ============================================
// MEDIA
// ============================================

export async function getMedia(folder?: string) {
    const supabase = await createClient();

    let query = supabase.from("site_media").select("*").order("created_at", { ascending: false });

    if (folder && folder !== "all") {
        query = query.eq("folder", folder);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching media:", error);
        return [];
    }
    return data;
}

export async function uploadMedia(formData: FormData) {
    const supabase = await createClient();

    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "general";
    const altText = (formData.get("altText") as string) || "";

    if (!file) {
        return { success: false, error: "No file provided" };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filename = `${folder}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("cms-media")
        .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("cms-media").getPublicUrl(filename);

    // Get image dimensions (approximate for now)
    const isImage = file.type.startsWith("image/");

    // Insert into site_media table
    const { data: mediaData, error: dbError } = await supabase
        .from("site_media")
        .insert({
            filename: filename.split("/").pop(),
            original_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
            url: urlData.publicUrl,
            thumbnail_url: urlData.publicUrl,
            folder,
            alt_text: altText,
        })
        .select()
        .single();

    if (dbError) {
        console.error("Error saving media record:", dbError);
        return { success: false, error: dbError.message };
    }

    revalidatePath("/admin/cms/media");
    return { success: true, data: mediaData };
}

export async function deleteMedia(id: string) {
    const supabase = await createClient();

    // Get the media record first
    const { data: media } = await supabase
        .from("site_media")
        .select("*")
        .eq("id", id)
        .single();

    if (media) {
        // Delete from storage
        const filePath = `${media.folder}/${media.filename}`;
        await supabase.storage.from("cms-media").remove([filePath]);
    }

    // Delete from database
    const { error } = await supabase
        .from("site_media")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting media:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/media");
    return { success: true };
}

// ============================================
// GALLERY
// ============================================

export async function getAlbums() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("gallery_albums")
        .select("*, gallery_images(count)")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching albums:", error);
        return [];
    }
    return data;
}

export async function createAlbum(name: string, slug: string) {
    const supabase = await createClient();

    const { data: albums } = await supabase
        .from("gallery_albums")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);

    const nextOrder = albums && albums.length > 0 ? albums[0].display_order + 1 : 1;

    const { data, error } = await supabase
        .from("gallery_albums")
        .insert({ name, slug, display_order: nextOrder })
        .select()
        .single();

    if (error) {
        console.error("Error creating album:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/gallery");
    return { success: true, data };
}

export async function toggleAlbumActive(id: string, isActive: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("gallery_albums")
        .update({ is_active: isActive })
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/gallery");
    return { success: true };
}

export async function getGalleryImages(albumId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("gallery_images")
        .select("*, site_media(*)")
        .eq("album_id", albumId)
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching gallery images:", error);
        return [];
    }
    return data;
}

export async function getPublicGalleryImages() {
    const supabase = await createClient();

    // Fetch all gallery images with their media and album data
    const { data, error } = await supabase
        .from("gallery_images")
        .select("*, site_media(*), gallery_albums(*)")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching public gallery images:", error);
        return [];
    }

    // Filter to only active albums and map to frontend friendly format
    return data
        .filter((img: any) => img.gallery_albums?.is_active === true)
        .map((img: any) => ({
            id: img.id,
            src: img.site_media?.url || "",
            alt: img.site_media?.alt_text || img.caption || "Image sans description",
            caption: img.caption || "",
            size: img.is_featured ? "large" : "normal",
            category: img.gallery_albums?.name || "Général"
        }));
}

export async function addImagesToAlbum(albumId: string, mediaIds: string[]) {
    const supabase = await createClient();

    // Get current max display order
    const { data: images } = await supabase
        .from("gallery_images")
        .select("display_order")
        .eq("album_id", albumId)
        .order("display_order", { ascending: false })
        .limit(1);

    let nextOrder = images && images.length > 0 ? images[0].display_order + 1 : 1;

    // Prepare inserts
    const inserts = mediaIds.map((mediaId, index) => ({
        album_id: albumId,
        media_id: mediaId,
        display_order: nextOrder + index
    }));

    const { error } = await supabase
        .from("gallery_images")
        .insert(inserts);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/gallery");
    return { success: true };
}

export async function toggleImageFeatured(id: string, isFeatured: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("gallery_images")
        .update({ is_featured: isFeatured })
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/gallery");
    return { success: true };
}

export async function deleteGalleryImage(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/gallery");
    return { success: true };
}

// ============================================
// MENU
// ============================================

export async function getMenuItems(category?: string) {
    const supabase = await createClient();

    let query = supabase.from("menu_items")
        .select("*, site_media(*)") // Join with media
        .order("display_order", { ascending: true });

    if (category && category !== "all") {
        query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching menu items:", error);
        return [];
    }
    return data;
}

export async function createMenuItem(item: {
    category: string;
    name: string;
    description: string;
    price: number;
    tags?: string[];
    image_id?: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("menu_items")
        .insert(item);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/menu");
    return { success: true };
}

export async function updateMenuItem(id: string, updates: Record<string, unknown>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("menu_items")
        .update(updates)
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/menu");
    return { success: true };
}

export async function deleteMenuItem(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/menu");
    return { success: true };
}

// ============================================
// EVENTS
// ============================================

export async function getEvents() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

    if (error) {
        console.error("Error fetching events:", error);
        return [];
    }
    return data;
}

export async function createEvent(event: {
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    category: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("events")
        .insert(event);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/events");
    return { success: true };
}

export async function updateEvent(id: string, updates: Record<string, unknown>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/events");
    return { success: true };
}

export async function deleteEvent(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/events");
    return { success: true };
}

// ============================================
// TESTIMONIALS
// ============================================

export async function getTestimonials() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching testimonials:", error);
        return [];
    }
    return data;
}

export async function createTestimonial(testimonial: {
    author_name: string;
    author_location: string;
    content: string;
    rating: number;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("testimonials")
        .insert(testimonial);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/testimonials");
    return { success: true };
}

export async function updateTestimonial(id: string, updates: Record<string, unknown>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("testimonials")
        .update(updates)
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/testimonials");
    return { success: true };
}

export async function deleteTestimonial(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/testimonials");
    return { success: true };
}

// ============================================
// BRANDING
// ============================================

export async function getBranding() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("site_branding")
        .select("*, site_media(*)");

    if (error) {
        console.error("Error fetching branding:", error);
        return [];
    }
    return data;
}

export async function updateBranding(assetType: string, mediaId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("site_branding")
        .update({ media_id: mediaId })
        .eq("asset_type", assetType);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/branding");
    return { success: true };
}

// ============================================
// REELS
// ============================================

export async function getReels() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("instagram_reels")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching reels:", error);
        return [];
    }
    return data;
}

export async function getPublicReels() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("instagram_reels")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching public reels:", error);
        return [];
    }
    return data;
}

export async function createReel(data: any) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("instagram_reels")
        .insert(data);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/reels");
    revalidatePath("/");
    return { success: true };
}

export async function updateReel(id: string, data: any) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("instagram_reels")
        .update(data)
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/reels");
    revalidatePath("/");
    return { success: true };
}

export async function deleteReel(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("instagram_reels")
        .delete()
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/reels");
    revalidatePath("/");
    return { success: true };
}

// ============================================
// SERVICES (NEW)
// ============================================

export async function getServices() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching services:", error);
        return [];
    }
    console.log("DEBUG: Fetched services count:", data?.length);
    return data;
}

export async function createService(data: any) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("services")
        .insert(data);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/services");
    revalidatePath("/");
    return { success: true };
}

export async function updateService(id: string, data: any) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("services")
        .update(data)
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/services");
    revalidatePath("/");
    return { success: true };
}

export async function deleteService(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/services");
    revalidatePath("/");
    return { success: true };
}

// ============================================
// PACKAGES (NEW)
// ============================================

export async function getPackages() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching packages:", error);
        return [];
    }
    return data;
}

export async function createPackage(data: any) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("packages")
        .insert(data);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/packages");
    revalidatePath("/");
    return { success: true };
}

export async function updatePackage(id: string, data: any) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("packages")
        .update(data)
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/packages");
    revalidatePath("/");
    return { success: true };
}

export async function deletePackage(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("packages")
        .delete()
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/cms/packages");
    revalidatePath("/");
    return { success: true };
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
    const supabase = await createClient();

    const stats = {
        sections: 0,
        media: 0,
        gallery: 0,
        reels: 0,
        menu: 0,
        events: 0,
        services: 0,
        packages: 0,
        testimonials: 0
    };

    // Parallel requests for performance
    const results = await Promise.all([
        supabase.from("site_sections").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("site_media").select("*", { count: "exact", head: true }),
        supabase.from("gallery_albums").select("*", { count: "exact", head: true }),
        supabase.from("instagram_reels").select("*", { count: "exact", head: true }),
        supabase.from("menu_items").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("packages").select("*", { count: "exact", head: true }),
        supabase.from("testimonials").select("*", { count: "exact", head: true })
    ]);

    stats.sections = results[0].count || 0;
    stats.media = results[1].count || 0;
    stats.gallery = results[2].count || 0;
    stats.reels = results[3].count || 0;
    stats.menu = results[4].count || 0;
    stats.events = results[5].count || 0;
    stats.services = results[6].count || 0;
    stats.packages = results[7].count || 0;
    stats.testimonials = results[8].count || 0;

    return stats;
}


