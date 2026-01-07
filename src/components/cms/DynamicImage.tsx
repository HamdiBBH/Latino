import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { DynamicImageProps } from "@/types";

/**
 * DynamicImage Component
 * Fetches images from Supabase Storage
 * Used for CMS-editable images throughout the site
 */
export async function DynamicImage({
    bucket,
    path,
    alt,
    className = "",
    fill = false,
    width,
    height,
    priority = false,
}: DynamicImageProps) {
    try {
        const supabase = await createClient();

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);

        if (!data?.publicUrl) {
            console.warn(`Image not found: ${bucket}/${path}`);
            return null;
        }

        if (fill) {
            return (
                <Image
                    src={data.publicUrl}
                    alt={alt}
                    fill
                    className={className}
                    priority={priority}
                    sizes="100vw"
                />
            );
        }

        return (
            <Image
                src={data.publicUrl}
                alt={alt}
                width={width || 800}
                height={height || 600}
                className={className}
                priority={priority}
            />
        );
    } catch (error) {
        console.error(`Error fetching image: ${bucket}/${path}`, error);
        return null;
    }
}

/**
 * Get public URL for a storage image (for use in src attributes)
 */
export async function getImageUrl(bucket: string, path: string): Promise<string | null> {
    try {
        const supabase = await createClient();
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data?.publicUrl || null;
    } catch {
        return null;
    }
}

/**
 * Static image for client components (when URL is pre-fetched)
 */
export function StaticImage({
    src,
    alt,
    className = "",
    fill = false,
    width,
    height,
    priority = false,
}: {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    priority?: boolean;
}) {
    if (fill) {
        return (
            <Image
                src={src}
                alt={alt}
                fill
                className={className}
                priority={priority}
                sizes="100vw"
            />
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={width || 800}
            height={height || 600}
            className={className}
            priority={priority}
        />
    );
}
