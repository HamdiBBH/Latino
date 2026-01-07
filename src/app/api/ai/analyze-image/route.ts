import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Analyze an image and generate SEO-friendly filename and alt text
 * Uses OpenRouter with Qwen VL Plus model
 */
export async function POST(request: NextRequest) {
    try {
        // Check if API key is configured
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error("OPENROUTER_API_KEY is not configured");
            return NextResponse.json(
                { error: "API key not configured", fallback: true },
                { status: 500 }
            );
        }

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: apiKey,
            defaultHeaders: {
                "HTTP-Referer": "https://latino-coucou-beach.vercel.app", // Optional: Your site URL
                "X-Title": "Latino Coucou Beach", // Optional: Your site name
            }
        });

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folder = (formData.get("folder") as string) || "general";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log(`Analyzing image: ${file.name} (${file.size} bytes) with Qwen/OpenRouter`);

        // Convert file to base64 data URL
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const mimeType = file.type;
        const dataUrl = `data:${mimeType};base64,${base64}`;

        const prompt = `Tu es un expert SEO e-commerce pour "Latino Coucou Beach". Renomme cette image pour maximiser sa visibilité sur Google Images.
Règles STRICTES :
1. Identifie les 3 éléments principaux visibles (ex: objet, meuble, décor).
2. Identifie les couleurs dominantes ou l'ambiance.
3. Le nom doit suivre ce format exact : [objet-principal]-[détail]-[couleur]-[contexte-latino-coucou-beach]
4. PAS de métaphores, PAS de noms inventés, PAS de poésie. SOIS FACTUEL.
5. Tout en minuscules, sans accents, espaces remplacés par des tirets.

Exemple pour une image de scooter bleu sur le sable : "scooter-vespa-bleu-cabine-telephonique-rose-plage-latino-coucou-beach"

Réponds UNIQUEMENT avec ce JSON exact :
{"filename": "le-nom-genere-ici", "altText": "Une phrase descriptive complète incluant les objets et couleurs identifiés."}`;

        let text = "";

        try {
            const completion = await openai.chat.completions.create({
                model: "qwen/qwen-vl-plus",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: dataUrl
                                }
                            }
                        ]
                    }
                ],
            });

            text = completion.choices[0].message.content || "";
            console.log("OpenRouter response:", text);

        } catch (apiError: any) {
            console.error("OpenRouter API Error Full Object:", JSON.stringify(apiError, null, 2));
            throw new Error(`OpenRouter API failed: ${apiError.message}`);
        }

        // Parse the JSON response
        let parsed;
        try {
            // Clean the response (remove any markdown formatting if present)
            const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            parsed = JSON.parse(cleanedText);
        } catch (parseError) {
            // Fallback if parsing fails
            console.error("Failed to parse OpenRouter response:", text, parseError);
            parsed = {
                filename: generateFallbackName(file.name, folder),
                altText: "Image du Latino Coucou Beach",
            };
        }

        // Ensure filename is properly formatted
        const seoFilename = sanitizeFilename(parsed.filename);

        console.log(`Generated SEO filename: ${seoFilename}`);

        return NextResponse.json({
            filename: seoFilename,
            altText: parsed.altText,
            originalName: file.name,
        });

    } catch (error) {
        console.error("Error analyzing image:", error);
        return NextResponse.json(
            { error: "Failed to analyze image", details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * Sanitize filename for SEO
 */
function sanitizeFilename(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
        .substring(0, 50); // Limit length
}

/**
 * Generate fallback filename if AI fails
 */
function generateFallbackName(originalName: string, folder: string): string {
    const timestamp = Date.now();
    const baseName = originalName
        .replace(/\.[^/.]+$/, "") // Remove extension
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 30);

    return `${folder}-${baseName}-${timestamp}`;
}
