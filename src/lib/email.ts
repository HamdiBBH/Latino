"use server";

import nodemailer from "nodemailer";
import { RESTAURANT_INFO } from "@/lib/config";

// Email configuration
const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
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
                                📞 ${RESTAURANT_INFO.phone} | ✉️ ${RESTAURANT_INFO.email}
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

// Send reservation confirmation to guest
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
            Merci pour votre réservation ! 🎉
        </h2>
        <p style="color: #7A7A7A; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            Bonjour <strong>${data.guestName}</strong>,<br><br>
            Votre réservation a bien été enregistrée. Nous avons hâte de vous accueillir !
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
                    <td style="color: #222222; padding: 15px 0 0; font-weight: 600; font-size: 18px;">Total</td>
                    <td style="color: #E8A87C; font-weight: 600; text-align: right; font-size: 18px; padding: 15px 0 0;">${data.totalPrice} DT</td>
                </tr>
            </table>
        </div>

        <div style="background-color: #E8F5E9; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p style="color: #2E7D32; margin: 0; font-size: 14px;">
                ⏰ <strong>Horaires :</strong> ${RESTAURANT_INFO.hours}<br>
                📍 <strong>Lieu :</strong> ${RESTAURANT_INFO.location}
            </p>
        </div>

        <p style="color: #7A7A7A; font-size: 14px; line-height: 1.6;">
            Pour toute question, contactez-nous au <a href="tel:${RESTAURANT_INFO.phone}" style="color: #E8A87C;">${RESTAURANT_INFO.phone}</a>
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
        return { success: false, error: "Failed to send email" };
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

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reservations" 
           style="display: inline-block; background-color: #222222; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 100px; font-weight: 600; margin-top: 20px;">
            Voir dans le Dashboard →
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
