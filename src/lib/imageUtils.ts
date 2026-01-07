/**
 * Image utilities for CMS
 * Handles image conversion to WebP format
 */

/**
 * Convert an image file to WebP format using Canvas API
 * @param file - The original image file
 * @param quality - WebP quality (0-1), default 0.85
 * @param maxWidth - Maximum width to resize to (optional)
 * @param maxHeight - Maximum height to resize to (optional)
 * @returns Promise<File> - The converted WebP file
 */
export async function convertToWebP(
    file: File,
    quality: number = 0.85,
    maxWidth?: number,
    maxHeight?: number
): Promise<File> {
    return new Promise((resolve, reject) => {
        // Skip if already WebP
        if (file.type === "image/webp") {
            resolve(file);
            return;
        }

        // Skip non-image files
        if (!file.type.startsWith("image/")) {
            resolve(file);
            return;
        }

        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            reject(new Error("Canvas context not available"));
            return;
        }

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Resize if needed
            if (maxWidth && width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (maxHeight && height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to WebP blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Failed to convert image"));
                        return;
                    }

                    // Create new file with .webp extension
                    const originalName = file.name.replace(/\.[^/.]+$/, "");
                    const webpFile = new File([blob], `${originalName}.webp`, {
                        type: "image/webp",
                        lastModified: Date.now(),
                    });

                    resolve(webpFile);
                },
                "image/webp",
                quality
            );
        };

        img.onerror = () => {
            reject(new Error("Failed to load image"));
        };

        // Load image from file
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Process multiple files for upload
 * Converts images to WebP and provides progress callback
 */
export async function processFilesForUpload(
    files: File[],
    onProgress?: (current: number, total: number, fileName: string) => void
): Promise<File[]> {
    const processedFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        onProgress?.(i + 1, files.length, file.name);

        try {
            // Convert to WebP with max dimensions for web
            const processedFile = await convertToWebP(file, 0.85, 2000, 2000);
            processedFiles.push(processedFile);
        } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
            // Keep original file if conversion fails
            processedFiles.push(file);
        }
    }

    return processedFiles;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export interface AIImageAnalysis {
    filename: string;
    altText: string;
    originalName: string;
}

/**
 * Analyze image with AI to generate SEO-friendly filename and alt text
 * @param file - The image file to analyze
 * @param folder - The folder context (e.g., "gallery", "events")
 * @returns Promise<AIImageAnalysis> - The AI-generated filename and alt text
 */
export async function analyzeImageWithAI(
    file: File,
    folder: string = "general"
): Promise<AIImageAnalysis> {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/ai/analyze-image", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("AI Analysis Error Response:", errorData);
            throw new Error(errorData.details || errorData.error || "AI analysis failed");
        }

        const data = await response.json();
        return data as AIImageAnalysis;

    } catch (error) {
        console.error("Error analyzing image with AI:", error);
        // Fallback to basic naming
        const baseName = file.name
            .replace(/\.[^/.]+$/, "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .substring(0, 30);

        return {
            filename: `${folder}-${baseName}-${Date.now()}`,
            altText: "Image du Latino Coucou Beach",
            originalName: file.name,
        };
    }
}

/**
 * Rename a File object with a new filename
 */
export function renameFile(file: File, newName: string): File {
    const extension = file.type === "image/webp" ? ".webp" :
        file.name.match(/\.[^/.]+$/)?.[0] || ".webp";
    const fullName = newName.endsWith(extension) ? newName : `${newName}${extension}`;

    return new File([file], fullName, {
        type: file.type,
        lastModified: file.lastModified,
    });
}
