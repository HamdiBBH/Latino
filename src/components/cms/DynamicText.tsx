import { createClient } from "@/lib/supabase/server";
import type { DynamicTextProps, SiteContent } from "@/types";

// Cache for content to reduce database calls
const contentCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

/**
 * DynamicText Component
 * Fetches text content from Supabase site_content table by key
 * Used for CMS-editable text throughout the site
 */
export async function DynamicText({
    contentKey,
    fallback = "",
    className = "",
    as: Component = "span",
}: DynamicTextProps) {
    // Check cache first
    const cached = contentCache.get(contentKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return <Component className={className}>{cached.value}</Component>;
    }

    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("site_content")
            .select("value")
            .eq("key", contentKey)
            .single();

        if (error || !data) {
            console.warn(`Content not found for key: ${contentKey}`);
            return <Component className={className}>{fallback}</Component>;
        }

        const content = data as SiteContent;
        const text = content.value?.text || fallback;

        // Update cache
        contentCache.set(contentKey, { value: text, timestamp: Date.now() });

        return <Component className={className}>{text}</Component>;
    } catch (error) {
        console.error(`Error fetching content for key: ${contentKey}`, error);
        return <Component className={className}>{fallback}</Component>;
    }
}

/**
 * Get multiple content items at once (for performance)
 */
export async function getContentBatch(keys: string[]): Promise<Record<string, string>> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("site_content")
            .select("key, value")
            .in("key", keys);

        if (error || !data) {
            console.warn("Failed to fetch content batch");
            return {};
        }

        const result: Record<string, string> = {};
        data.forEach((item: { key: string; value: { text: string } }) => {
            result[item.key] = item.value?.text || "";
        });

        return result;
    } catch (error) {
        console.error("Error fetching content batch", error);
        return {};
    }
}

/**
 * Client-side text display component (for when content is pre-fetched)
 */
export function StaticText({
    children,
    className = "",
    as: Component = "span",
}: {
    children: React.ReactNode;
    className?: string;
    as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";
}) {
    return <Component className={className}>{children}</Component>;
}
