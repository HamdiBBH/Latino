'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `
Rôle
Tu es une IA experte en copywriting marketing, UX writing et SEO local spécialisée dans les restaurants, beach clubs et lieux festifs premium.

🎯 Objectif
Réécrire l’ensemble des contenus textuels du CMS Latino Coucou Beach, section par section, afin de :
- maximiser l’impact commercial
- renforcer l’attractivité émotionnelle
- améliorer le SEO local et thématique
- rester fidèle à l’identité beach club chic & festif

🧩 Règles générales (obligatoires)
- Ton : chaleureux, solaire, premium décontracté
- Textes courts, lisibles, orientés conversion
- Français naturel, fluide
- SEO intégré sans sur-optimisation
- Pas de phrases génériques
- Respect strict de la fonction de chaque champ
- Aucun emoji dans les textes CMS
`;


export async function rewriteContent(currentContent: string, fieldLabel: string, sectionName: string) {
    if (!process.env.OPENROUTER_API_KEY) {
        return { success: false, error: "Clé API OpenRouter manquante" };
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `
            Contexte : Section "${sectionName}", Champ "${fieldLabel}".
            Texte actuel : "${currentContent}"
            
            Instruction : Réécris ce texte pour le rendre plus attractif tout en respectant les contraintes. Renvoie UNIQUEMENT le texte réécrit, sans guillemets ni explications.
          `
                }
            ],
            temperature: 0.7,
        });

        const rewrittenText = response.choices[0]?.message?.content?.trim();

        if (!rewrittenText) {
            return { success: false, error: "Pas de réponse de l'IA" };
        }

        return { success: true, content: rewrittenText };
    } catch (error) {
        console.error("AI Rewrite Error:", error);
        return { success: false, error: "Erreur lors de la génération" };
    }
}

export async function rewriteSection(sectionName: string, fields: { id: string, label: string, content: string }[]) {
    if (!process.env.OPENROUTER_API_KEY) {
        return { success: false, error: "Clé API OpenRouter manquante" };
    }

    try {
        const fieldsContext = fields.map(f => `${f.id} (${f.label}): "${f.content}"`).join("\n");

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `
            Contexte : Réécriture complète de la section "${sectionName}".
            
            Champs à réécrire :
            ${fieldsContext}
            
            Instruction : 
            Réécris le contenu de chaque champ pour créer une cohérence globale dans la section.
            Renvoie UNIQUEMENT un objet JSON valide où les clés sont les ID des champs et les valeurs sont les nouveaux textes.
            Exemple format : { "1": "Nouveau titre", "2": "Nouveau sous-titre" }
            Ne change pas le sens général, mais améliore le style, le marketing et le SEO.
            `
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            return { success: false, error: "Pas de réponse de l'IA" };
        }

        const rewrittenFields = JSON.parse(content);
        return { success: true, content: rewrittenFields };

    } catch (error) {
        console.error("AI Section Rewrite Error:", error);
        return { success: false, error: "Erreur lors de la génération" };
    }
}

export async function generateDishImage(dishName: string) {
    if (!process.env.OPENROUTER_API_KEY) {
        console.error("DEBUG: OPENROUTER_API_KEY is missing from process.env");
        return { success: false, error: "Clé API OpenRouter manquante" };
    }
    console.log("DEBUG: API Key present, length:", process.env.OPENROUTER_API_KEY.length);

    // 1. Generate with GPT-5 Image (Multimodal)
    try {
        console.log("Attempting generation with openai/gpt-5-image for:", dishName);
        const response = await openai.chat.completions.create({
            model: "openai/gpt-5-image",
            messages: [
                {
                    role: "system",
                    content: "You are a professional culinary photographer. Generate an ultra-realistic, appetizing photo of the requested dish. Return ONLY the image URL or the image content."
                },
                {
                    role: "user",
                    content: `Photo of: "${dishName}".
Style: Michelin-star plating, soft natural lighting, shallow depth of field.
Composition: Centered on a rustic wooden or neutral marble table.
Constraints: No text, no hands, high resolution.`
                }
            ],
        });

        const content = response.choices[0]?.message?.content;
        console.log("GPT-5 Image Response Content:", content);

        // Extract URL from markdown or raw text
        const urlMatch = content?.match(/https?:\/\/[^\s)"]+/);
        const imageUrl = urlMatch ? urlMatch[0] : null;

        if (imageUrl) {
            const imageRes = await fetch(imageUrl);
            if (imageRes.ok) {
                const arrayBuffer = await imageRes.arrayBuffer();
                const imageBase64 = Buffer.from(arrayBuffer).toString('base64');
                return { success: true, b64_json: imageBase64 };
            }
        }

        return { success: false, error: "L'IA n'a pas renvoyé d'image valide." };

    } catch (error) {
        console.error("GPT-5 Image Generation Error:", error);
        return { success: false, error: "Erreur lors de la génération avec GPT-5" };
    }
}
