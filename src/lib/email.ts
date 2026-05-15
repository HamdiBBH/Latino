"use server";

import "server-only";
import nodemailer from "nodemailer";
import { RESTAURANT_INFO } from "@/lib/config";

const RESTAURANT_PHONES = [RESTAURANT_INFO.phone, RESTAURANT_INFO.secondaryPhone];
const formatTelHref = (phone: string) => phone.replace(/\s/g, "");
const restaurantPhonesDisplay = RESTAURANT_PHONES.join(" / ");
const restaurantPhonesLinks = RESTAURANT_PHONES
    .map((phone) => `<a href="tel:${formatTelHref(phone)}" style="color: #E8A87C;">${phone}</a>`)
    .join(" ou ");

const getEmailErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return "Failed to send email";
};

// Email configuration
const getTransporter = () => {
    const port = parseInt(process.env.SMTP_PORT || "465");
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: port,
        // Si le port est 465, secure doit être true. Sinon, STARTTLS (false)
        secure: process.env.SMTP_SECURE === "true" || port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
};

// Email templates
const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${RESTAURANT_INFO.name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F9F5F0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #222222 0%, #41B3A3 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 600;">
                                🌴 ${RESTAURANT_INFO.name}
                            </h1>
                            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">
                                ${RESTAURANT_INFO.location}, ${RESTAURANT_INFO.country}
                            </p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #F9F5F0; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
                            <p style="margin: 0 0 10px; color: #7A7A7A; font-size: 14px;">
                                📞 ${restaurantPhonesDisplay} | ✉️ ${RESTAURANT_INFO.email}
                            </p>
                            <p style="margin: 0; color: #7A7A7A; font-size: 12px;">
                                Ouvert ${RESTAURANT_INFO.hours} | Saison: ${RESTAURANT_INFO.season}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

interface ReservationEmailData {
    guestName: string;
    guestEmail: string;
    date: string;
    packageName: string;
    adults: number;
    children: number;
    totalPrice: number;
    reservationId?: string;
}

// Send reservation request acknowledgment to guest
export async function sendReservationRequestEmail(data: ReservationEmailData) {
    const transporter = getTransporter();

    const formattedDate = new Date(data.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const content = `
        <h2 style="color: #222222; margin: 0 0 20px; font-size: 24px;">
            Demande de réservation reçue 🌴
        </h2>
        <p style="color: #7A7A7A; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            Bonjour <strong>${data.guestName}</strong>,<br><br>
            Votre demande de réservation a bien été enregistrée. Elle est actuellement <strong>en attente de validation</strong> par notre équipe. Vous recevrez un email de confirmation définitive très prochainement !
        </p>
        
        <div style="background-color: #F9F5F0; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #E8A87C; margin: 0 0 15px; font-size: 18px;">📋 Récapitulatif de la demande</h3>
            <table style="width: 100%; font-size: 15px;">
                <tr>
                    <td style="color: #7A7A7A; padding: 8px 0;">Date</td>
                    <td style="color: #222222; font-weight: 500; text-align: right;">${formattedDate}</td>
                </tr>
                <tr>
                    <td style="color: #7A7A7A; padding: 8px 0;">Forfait</td>
                    <td style="color: #222222; font-weight: 500; text-align: right;">${data.packageName}</td>
                </tr>
                <tr>
                    <td style="color: #7A7A7A; padding: 8px 0;">Adultes</td>
                    <td style="color: #222222; font-weight: 500; text-align: right;">${data.adults}</td>
                </tr>
                ${data.children > 0 ? `
                <tr>
                    <td style="color: #7A7A7A; padding: 8px 0;">Enfants (4-12 ans)</td>
                    <td style="color: #222222; font-weight: 500; text-align: right;">${data.children}</td>
                </tr>
                ` : ""}
                <tr style="border-top: 1px solid #ddd;">
                    <td style="color: #222222; padding: 15px 0 0; font-weight: 600; font-size: 18px;">Prix estimé</td>
                    <td style="color: #E8A87C; font-weight: 600; text-align: right; font-size: 18px; padding: 15px 0 0;">${data.totalPrice} DT</td>
                </tr>
            </table>
        </div>

        <p style="color: #7A7A7A; font-size: 14px; line-height: 1.6;">
            Pour toute question, contactez-nous au ${restaurantPhonesLinks}
        </p>
    `;

    try {
        await transporter.sendMail({
            from: `"${RESTAURANT_INFO.name}" <${process.env.SMTP_USER}>`,
            to: data.guestEmail,
            subject: `⏳ Demande de réservation reçue - ${formattedDate}`,
            html: getBaseTemplate(content),
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending request acknowledgment email:", error);
        return { success: false, error: getEmailErrorMessage(error) };
    }
}

// Send true reservation confirmation to guest (used when manager validates)
export async function sendReservationConfirmationEmail(data: ReservationEmailData) {
    const transporter = getTransporter();

    const formattedDate = new Date(data.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const content = `
        <h2 style="color: #222222; margin: 0 0 20px; font-size: 24px;">
            Bonne nouvelle ! Réservation confirmée 🎉
        </h2>
        <p style="color: #7A7A7A; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            Bonjour <strong>${data.guestName}</strong>,<br><br>
            Excellente nouvelle ! Votre réservation au Latino Coucou Beach a été <strong>validée</strong> par notre équipe. Nous avons hâte de vous accueillir pour une journée mémorable !<br><br>
            <strong>Important : notre équipe vous contactera par téléphone afin de confirmer votre réservation. Si nous ne parvenons pas à vous joindre, celle-ci pourra malheureusement être annulée.</strong>
        </p>
        
        <div style="background-color: #F9F5F0; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #E8A87C; margin: 0 0 15px; font-size: 18px;">📋 Récapitulatif</h3>
            <table style="width: 100%; font-size: 15px;">
                <tr>
                    <td style="color: #7A7A7A; padding: 8px 0;">Date</td>
                    <td style="color: #222222; font-weight: 500; text-align: right;">${formattedDate}</td>
                </tr>
                <tr>
                    <td style="color: #7A7A7A; padding: 8px 0;">Forfait</td>
                    <td style="color: #222222; font-weight: 500; text-align: right;">${data.packageName}</td>
                </tr>
                <tr>
                    <td style="color: #7A7A7A; padding: 8px 0;">Adultes</td>
                    <td style="color: #222222; font-weight: 500; text-align: right;">${data.adults}</td>
                </tr>
                ${data.children > 0 ? `
                <tr>
                    <td style="color: #7A7A7A; padding: 8px 0;">Enfants (4-12 ans)</td>
                    <td style="color: #222222; font-weight: 500; text-align: right;">${data.children}</td>
                </tr>
                ` : ""}
                <tr style="border-top: 1px solid #ddd;">
                    <td style="color: #222222; padding: 15px 0 0; font-weight: 600; font-size: 18px;">Total à régler sur place</td>
                    <td style="color: #E8A87C; font-weight: 600; text-align: right; font-size: 18px; padding: 15px 0 0;">${data.totalPrice} DT</td>
                </tr>
            </table>
        </div>

        <div style="background-color: #E8F5E9; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p style="color: #2E7D32; margin: 0; font-size: 14px;">
                ⏰ <strong>Horaires :</strong> ${RESTAURANT_INFO.hours}<br>
                📍 <strong>Lieu :</strong> <a href="${RESTAURANT_INFO.googleMapsUrl}" style="color: #2E7D32;">${RESTAURANT_INFO.location}</a>
            </p>
        </div>

        <p style="color: #7A7A7A; font-size: 14px; line-height: 1.6;">
            Pour toute question, contactez-nous au ${restaurantPhonesLinks}
        </p>
    `;

    try {
        await transporter.sendMail({
            from: `"${RESTAURANT_INFO.name}" <${process.env.SMTP_USER}>`,
            to: data.guestEmail,
            subject: `✅ Réservation confirmée - ${formattedDate}`,
            html: getBaseTemplate(content),
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending confirmation email:", error);
        return { success: false, error: getEmailErrorMessage(error) };
    }
}

// Send notification to manager for new reservation
export async function sendManagerNotificationEmail(data: ReservationEmailData) {
    const transporter = getTransporter();
    const managerEmail = process.env.MANAGER_EMAIL || RESTAURANT_INFO.email;

    const formattedDate = new Date(data.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const content = `
        <h2 style="color: #222222; margin: 0 0 20px; font-size: 24px;">
            🔔 Nouvelle Réservation
        </h2>
        
        <div style="background-color: #FFF3E0; border-left: 4px solid #E8A87C; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #222222; font-size: 16px;">
                <strong>${data.guestName}</strong> a effectué une réservation pour le <strong>${formattedDate}</strong>
            </p>
        </div>

        <table style="width: 100%; font-size: 15px; margin: 20px 0;">
            <tr>
                <td style="color: #7A7A7A; padding: 10px 0; border-bottom: 1px solid #eee;">Forfait</td>
                <td style="color: #222222; font-weight: 500; text-align: right; border-bottom: 1px solid #eee;">${data.packageName}</td>
            </tr>
            <tr>
                <td style="color: #7A7A7A; padding: 10px 0; border-bottom: 1px solid #eee;">Personnes</td>
                <td style="color: #222222; font-weight: 500; text-align: right; border-bottom: 1px solid #eee;">${data.adults} adultes${data.children > 0 ? ` + ${data.children} enfants` : ""}</td>
            </tr>
            <tr>
                <td style="color: #7A7A7A; padding: 10px 0; border-bottom: 1px solid #eee;">Email</td>
                <td style="color: #222222; text-align: right; border-bottom: 1px solid #eee;">
                    <a href="mailto:${data.guestEmail}" style="color: #E8A87C;">${data.guestEmail}</a>
                </td>
            </tr>
            <tr>
                <td style="color: #7A7A7A; padding: 10px 0;">Montant</td>
                <td style="color: #E8A87C; font-weight: 600; text-align: right; font-size: 18px;">${data.totalPrice} DT</td>
            </tr>
        </table>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reservations?id=${data.reservationId}" 
           style="display: inline-block; background-color: #222222; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 100px; font-weight: 600; margin-top: 20px;">
            Valider la réservation →
        </a>
    `;

    try {
        await transporter.sendMail({
            from: `"${RESTAURANT_INFO.name}" <${process.env.SMTP_USER}>`,
            to: managerEmail,
            subject: `🔔 Nouvelle réservation - ${data.guestName} (${formattedDate})`,
            html: getBaseTemplate(content),
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending manager notification:", error);
        return { success: false, error: "Failed to send email" };
    }
}

// Send reminder email (J-1)
export async function sendReminderEmail(data: ReservationEmailData) {
    const transporter = getTransporter();

    const content = `
        <h2 style="color: #222222; margin: 0 0 20px; font-size: 24px;">
            ⏰ Rappel : C'est demain ! 🌴
        </h2>
        <p style="color: #7A7A7A; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            Bonjour <strong>${data.guestName}</strong>,<br><br>
            Nous vous rappelons que votre journée au ${RESTAURANT_INFO.name} est prévue pour <strong>demain</strong> !
        </p>
        
        <div style="background-color: #E3F2FD; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1976D2; margin: 0 0 15px; font-size: 18px;">📌 À retenir</h3>
            <ul style="color: #222222; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0;">
                <li>Forfait : <strong>${data.packageName}</strong></li>
                <li>Horaires : <strong>${RESTAURANT_INFO.hours}</strong></li>
                <li>Lieu : <strong>${RESTAURANT_INFO.location}</strong></li>
            </ul>
        </div>

        <p style="color: #7A7A7A; font-size: 14px; line-height: 1.6;">
            N'oubliez pas votre maillot de bain, crème solaire et bonne humeur ! 🏖️<br><br>
            À très bientôt !
        </p>
    `;

    try {
        await transporter.sendMail({
            from: `"${RESTAURANT_INFO.name}" <${process.env.SMTP_USER}>`,
            to: data.guestEmail,
            subject: `⏰ Rappel : Votre journée au ${RESTAURANT_INFO.name} c'est demain !`,
            html: getBaseTemplate(content),
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending reminder email:", error);
        return { success: false, error: "Failed to send email" };
    }
}

// Send reservation rejection/cancellation to guest
export async function sendReservationRejectionEmail(data: ReservationEmailData) {
    const transporter = getTransporter();

    const formattedDate = new Date(data.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const content = `
        <h2 style="color: #222222; margin: 0 0 20px; font-size: 24px;">
            Mise à jour de votre réservation
        </h2>
        <p style="color: #7A7A7A; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            Bonjour <strong>${data.guestName}</strong>,<br><br>
            Nous sommes au regret de vous informer que nous ne pouvons malheureusement pas valider votre demande de réservation pour le <strong>${formattedDate}</strong> (${data.packageName}).
        </p>
        
        <div style="background-color: #FEF2F2; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p style="color: #B91C1C; margin: 0; font-size: 15px; line-height: 1.6;">
                En raison d'une forte affluence ou d'un manque de disponibilité pour l'installation demandée à cette date, votre réservation a dû être refusée.<br><br>
                Nous vous invitons à réessayer pour une autre date ou à nous contacter pour trouver une alternative.
            </p>
        </div>

        <p style="color: #7A7A7A; font-size: 14px; line-height: 1.6;">
            Nous espérons avoir l'occasion de vous accueillir très bientôt.<br><br>
            Pour toute question, contactez-nous au ${restaurantPhonesLinks}
        </p>
    `;

    try {
        await transporter.sendMail({
            from: `"${RESTAURANT_INFO.name}" <${process.env.SMTP_USER}>`,
            to: data.guestEmail,
            subject: `❌ Mise à jour de votre demande de réservation - ${formattedDate}`,
            html: getBaseTemplate(content),
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending rejection email:", error);
        return { success: false, error: "Failed to send email" };
    }
}

// Send reservation modification details to guest
export async function sendReservationModificationEmail(data: ReservationEmailData) {
    const transporter = getTransporter();

    const formattedDate = new Date(data.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const content = `
        <h2 style="color: #222222; margin: 0 0 20px; font-size: 24px;">
            Détails de votre réservation mis à jour
        </h2>
        <p style="color: #7A7A7A; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            Bonjour <strong>${data.guestName}</strong>,<br><br>
            Suite à votre demande, nous vous confirmons que votre réservation a bien été modifiée. Voici les nouveaux détails :
        </p>

        <div style="background-color: #F9F5F0; border-radius: 12px; padding: 25px; margin: 0 0 25px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; color: #7A7A7A;">Date</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; color: #222; text-align: right; font-weight: 600;">${formattedDate}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; color: #7A7A7A;">Forfait</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; color: #222; text-align: right; font-weight: 600;">${data.packageName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; color: #7A7A7A;">Adultes</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; color: #222; text-align: right; font-weight: 600;">${data.adults}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; color: #7A7A7A;">Enfants (4-12 ans)</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; color: #222; text-align: right; font-weight: 600;">${data.children}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0 0; color: #222; font-weight: 600;">Nouveau Total Estimé</td>
                    <td style="padding: 12px 0 0; color: #E8A87C; text-align: right; font-weight: 700; font-size: 18px;">${data.totalPrice} DT</td>
                </tr>
            </table>
        </div>

        <p style="color: #7A7A7A; font-size: 14px; line-height: 1.6;">
            Nous avons hâte de vous recevoir !<br><br>
            Pour toute autre question, contactez-nous au ${restaurantPhonesLinks}
        </p>
    `;

    try {
        await transporter.sendMail({
            from: `"${RESTAURANT_INFO.name}" <${process.env.SMTP_USER}>`,
            to: data.guestEmail,
            subject: `✏️ Modification de votre réservation - ${formattedDate}`,
            html: getBaseTemplate(content),
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending modification email:", error);
        return { success: false, error: "Failed to send email" };
    }
}

// Send newsletter welcome email with discount code
export async function sendNewsletterWelcomeEmail(email: string, discountCode: string) {
    const transporter = getTransporter();

    const content = `
        <h2 style="color: #222222; margin: 0 0 20px; font-size: 24px;">
            Bienvenue au Latino Coucou Beach ! 🌴
        </h2>
        <p style="color: #7A7A7A; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            Merci de vous être inscrit(e) à notre newsletter ! Vous ferez désormais partie des premiers informés de nos événements exclusifs, de nos offres spéciales et des actualités de notre beach club.
        </p>
        
        <div style="background-color: #F9F5F0; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; border: 2px dashed #E8A87C;">
            <h3 style="color: #E8A87C; margin: 0 0 10px; font-size: 18px;">Votre cadeau de bienvenue 🎁</h3>
            <p style="color: #222222; font-size: 15px; margin: 0 0 15px;">Profitez de <strong>-10%</strong> sur votre prochaine réservation (Valable une seule fois).</p>
            <div style="background-color: #FFFFFF; padding: 15px 20px; display: inline-block; border-radius: 8px; font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #222222; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                ${discountCode}
            </div>
            <p style="color: #7A7A7A; font-size: 13px; margin: 15px 0 0;">Présentez ce code lors de votre arrivée au beach club.</p>
        </div>

        <p style="color: #7A7A7A; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
            Au plaisir de vous accueillir très vite sur le sable fin de Ghar El Melh.<br>
            <strong>L'équipe du Latino Coucou Beach</strong>
        </p>
    `;

    try {
        await transporter.sendMail({
            from: `"${RESTAURANT_INFO.name}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Bienvenue ! Voici votre code promo de -10% 🎉",
            html: getBaseTemplate(content),
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending newsletter welcome email:", error);
        return { success: false, error: "Failed to send email" };
    }
}

// Send notification to manager for new newsletter subscriber
export async function sendManagerNewsletterNotification(newSubscriberEmail: string) {
    const transporter = getTransporter();
    const managerEmail = process.env.MANAGER_EMAIL || RESTAURANT_INFO.email;

    const content = `
        <h2 style="color: #222222; margin: 0 0 20px; font-size: 24px;">
            📬 Nouvel abonné à la Newsletter !
        </h2>
        <p style="color: #7A7A7A; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            Un nouvel utilisateur s'est inscrit à la newsletter du Latino Coucou Beach.
        </p>
        <div style="background-color: #F9F5F0; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p style="color: #222222; font-size: 16px; margin: 0;">
                <strong>Email :</strong> <a href="mailto:${newSubscriberEmail}" style="color: #E8A87C;">${newSubscriberEmail}</a>
            </p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"${RESTAURANT_INFO.name}" <${process.env.SMTP_USER}>`,
            to: managerEmail,
            subject: "📬 Nouvel abonné à la Newsletter",
            html: getBaseTemplate(content),
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending manager newsletter notification:", error);
        return { success: false, error: "Failed to send email" };
    }
}
