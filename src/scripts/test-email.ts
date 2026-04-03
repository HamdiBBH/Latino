import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Charger les variables depuis .env.local
dotenv.config({ path: '.env.local' });

async function testEmail() {
    console.log("🔄 Test de la configuration email...");
    console.log("Host:", process.env.SMTP_HOST);
    console.log("Port:", process.env.SMTP_PORT);
    console.log("User:", process.env.SMTP_USER);
    console.log("Destinataire:", process.env.MANAGER_EMAIL);

    if (!process.env.SMTP_PASSWORD || process.env.SMTP_PASSWORD === 'votre_mot_de_passe_application_ici') {
        console.error("❌ Erreur: Le mot de passe SMTP n'a pas été configuré dans .env.local");
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        console.log("⏳ Envoi de l'e-mail en cours...");
        const info = await transporter.sendMail({
            from: `"Test Latino Coucou Beach" <${process.env.SMTP_USER}>`,
            to: process.env.MANAGER_EMAIL || process.env.SMTP_USER,
            subject: "✅ Test de configuration E-mail - Latino Coucou Beach",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #41B3A3;">Succès ! 🎉</h2>
                    <p>La configuration SMTP de votre application <strong>Latino Coucou Beach</strong> fonctionne parfaitement.</p>
                    <p>Vous êtes maintenant prêt à recevoir les notifications de réservations à cette adresse.</p>
                </div>
            `,
        });
        console.log("✅ E-mail envoyé avec succès !");
        console.log("ID du message:", info.messageId);
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi de l'e-mail:", error);
    }
}

testEmail();
