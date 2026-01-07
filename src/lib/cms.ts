"use server";

import { createClient } from "@/lib/supabase/server";

export interface CMSBranding {
    logo?: string;
    logo_light?: string;
    logo_dark?: string;
    favicon?: string;
    og_image?: string;
}

export interface CMSSection {
    id: string;
    name: string;
    label: string;
    is_active: boolean;
    display_order: number;
}

export interface CMSContent {
    [key: string]: string;
}

/**
 * Get all branding assets
 */
export async function getCMSBranding(): Promise<CMSBranding> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("site_branding")
        .select("asset_type, site_media(url)");

    if (error) {
        console.error("Error fetching branding:", error);
        return {};
    }

    const branding: CMSBranding = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?.forEach((item: any) => {
        const mediaUrl = item.site_media?.url;
        if (mediaUrl) {
            branding[item.asset_type as keyof CMSBranding] = mediaUrl;
        }
    });

    return branding;
}

/**
 * Get all active sections
 */
export async function getCMSSections(): Promise<CMSSection[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("site_sections")
        .select("id, name, label, is_active, display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching sections:", error);
        return [];
    }

    return data || [];
}

/**
 * Get content for a specific section
 */
export async function getCMSSectionContent(sectionName: string): Promise<CMSContent> {
    const supabase = await createClient();

    const { data: section } = await supabase
        .from("site_sections")
        .select("id")
        .eq("name", sectionName)
        .single();

    if (!section) return {};

    const { data, error } = await supabase
        .from("site_content")
        .select("field_name, content")
        .eq("section_id", section.id);

    if (error) {
        console.error("Error fetching content:", error);
        return {};
    }

    const content: CMSContent = {};
    data?.forEach((item: { field_name: string; content: string }) => {
        content[item.field_name] = item.content;
    });

    return content;
}

/**
 * Get testimonials
 */
export async function getCMSTestimonials() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching testimonials:", error);
        return [];
    }

    return data || [];
}

/**
 * Get events
 */
export async function getCMSEvents() {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(6);

    if (error) {
        console.error("Error fetching events:", error);
        return [];
    }

    return data || [];
}

/**
 * Get menu items
 */
export async function getCMSMenuItems(category?: string) {
    const supabase = await createClient();

    let query = supabase
        .from("menu_items")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (category) {
        query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching menu items:", error);
        return [];
    }

    return data || [];
}

/**
 * Get gallery albums with images
 */
export async function getCMSGallery() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("gallery_albums")
        .select(`
            id, name, slug,
            gallery_images (
                id, caption, is_featured,
                site_media (url, filename)
            )
        `)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Error fetching gallery:", error);
        return [];
    }

    return data || [];
}
