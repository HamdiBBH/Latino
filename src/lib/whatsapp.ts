"use server";

import { RESTAURANT_INFO } from "@/lib/config";

/**
 * WhatsApp Business API Integration
 * 
 * Pour activer cette fonctionnalité, vous devez :
 * 1. Créer un compte Meta Business : https://business.facebook.com
 * 2. Activer WhatsApp Business API : https://developers.facebook.com/docs/whatsapp
 * 3. Obtenir un numéro WhatsApp Business vérifié
 * 4. Configurer les webhooks pour les réponses
 * 5. Ajouter les variables d'environnement ci-dessous
 * 
 * Variables d'environnement requises :
 * - WHATSAPP_PHONE_ID : ID du numéro de téléphone WhatsApp
 * - WHATSAPP_ACCESS_TOKEN : Token d'accès permanent
 * - WHATSAPP_BUSINESS_ID : ID du compte Business
 */

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

interface WhatsAppConfig {
    phoneId: string;
    accessToken: string;
}

function getConfig(): WhatsAppConfig | null {
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneId || !accessToken) {
        console.log("WhatsApp not configured - missing env variables");
        return null;
    }

    return { phoneId, accessToken };
}

// ============================================
// MESSAGE TEMPLATES
// ============================================

interface ReservationData {
    guestName: string;
    guestPhone: string;
    date: string;
    packageName: string;
    guestCount: number;
    estimatedPrice: number;
    reservationId?: string;
}

/**
 * Format phone number for WhatsApp API (must be in E.164 format)
 * Example: +21612345678
 */
function formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, "");

    // Add Tunisia country code if not present
    if (!cleaned.startsWith("216")) {
        cleaned = "216" + cleaned;
    }

    return cleaned;
}

/**
 * Send a text message via WhatsApp
 */
async function sendWhatsAppMessage(
    to: string,
    message: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
    const config = getConfig();

    if (!config) {
        return { success: false, error: "WhatsApp not configured" };
    }

    try {
        const response = await fetch(
            `${WHATSAPP_API_URL}/${config.phoneId}/messages`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: formatPhoneNumber(to),
                    type: "text",
                    text: { body: message }
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("WhatsApp API error:", data);
            return { success: false, error: data.error?.message || "Unknown error" };
        }

        return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
        console.error("WhatsApp send error:", error);
        return { success: false, error: String(error) };
    }
}

// ============================================
// RESERVATION NOTIFICATIONS
// ============================================

/**
 * Send confirmation message when reservation is confirmed
 */
export async function sendReservationConfirmation(data: ReservationData) {
    const message = `🌴 *Latino Coucou Beach*

Bonjour ${data.guestName} ! 👋

Votre réservation est *confirmée* ✅

📅 *Date* : ${new Date(data.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
🏖️ *Forfait* : ${data.packageName}
👥 *Personnes* : ${data.guestCount}
💰 *Montant estimé* : ${data.estimatedPrice} DT

📍 Lieu : Île de Kuriat
⛵ N'oubliez pas votre maillot et crème solaire !

À très bientôt ! 🌊
L'équipe Latino Coucou Beach`;

    return sendWhatsAppMessage(data.guestPhone, message);
}

/**
 * Send reminder message J-1
 */
export async function sendReservationReminder(data: ReservationData) {
    const message = `🌅 *Rappel - Latino Coucou Beach*

Bonjour ${data.guestName} ! 

C'est demain ! 🎉

📅 ${new Date(data.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
👥 ${data.guestCount} personne${data.guestCount > 1 ? "s" : ""}

*À prévoir :*
✅ Maillot de bain
✅ Crème solaire
✅ Chapeau/lunettes
✅ Serviette

📞 En cas de question : ${RESTAURANT_INFO.phone} / ${RESTAURANT_INFO.secondaryPhone}

À demain ! 🏝️`;

    return sendWhatsAppMessage(data.guestPhone, message);
}

/**
 * Send new reservation notification to manager
 */
export async function notifyManagerNewReservation(
    data: ReservationData,
    managerPhone?: string
) {
    const phone = managerPhone || process.env.WHATSAPP_MANAGER_PHONE || RESTAURANT_INFO.phone;
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://latinocoucoubeach.com";
    const manageLink = data.reservationId 
        ? `${appUrl}/dashboard/reservations?id=${data.reservationId}`
        : `${appUrl}/dashboard/reservations`;

    const message = `📬 *Nouvelle réservation !*

👤 *Client* : ${data.guestName}
📅 *Date* : ${new Date(data.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
🏖️ *Forfait* : ${data.packageName}
👥 *Personnes* : ${data.guestCount}
💰 *Montant* : ${data.estimatedPrice} DT

🔗 *Gérer la réservation :*
${manageLink}`;

    return sendWhatsAppMessage(phone, message);
}

/**
 * Send decline notification with reason
 */
export async function sendReservationDeclined(
    data: ReservationData,
    reason: string
) {
    const message = `Latino Coucou Beach

Bonjour ${data.guestName},

Nous sommes désolés, votre demande de réservation pour le ${new Date(data.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} n'a pas pu être confirmée.

${reason ? `Raison : ${reason}` : ""}

N'hésitez pas à réserver une autre date sur notre site.

Cordialement,
L'équipe Latino Coucou Beach`;

    return sendWhatsAppMessage(data.guestPhone, message);
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Send reminders to all reservations for tomorrow
 */
export async function sendBulkReminders(
    reservations: ReservationData[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = { sent: 0, failed: 0, errors: [] as string[] };

    for (const reservation of reservations) {
        const result = await sendReservationReminder(reservation);
        if (result.success) {
            results.sent++;
        } else {
            results.failed++;
            results.errors.push(`${reservation.guestName}: ${result.error}`);
        }

        // Small delay between messages to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return results;
}
