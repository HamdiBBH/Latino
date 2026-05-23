import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const port = parseInt(process.env.SMTP_PORT || "465");
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

console.log("Testing SMTP connection...");

try {
    const verified = await transporter.verify();
    console.log("✅ SMTP connection verified:", verified);
} catch (err) {
    console.error("❌ SMTP connection FAILED:", err.message);
    process.exit(1);
}

try {
    const info = await transporter.sendMail({
        from: `"Latino Coucou Beach" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        subject: "🧪 Test Email - " + new Date().toLocaleString("fr-FR"),
        html: "<h1>Test</h1><p>Si vous recevez cet email, SMTP fonctionne correctement.</p>",
    });
    console.log("✅ Email sent! MessageId:", info.messageId);
    console.log("   Response:", info.response);
} catch (err) {
    console.error("❌ Email send FAILED:", err.message);
    console.error("   Full error:", err);
}
