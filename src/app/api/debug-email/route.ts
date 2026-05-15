import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
    // 1. Check env vars
    const envCheck = {
        SMTP_HOST: process.env.SMTP_HOST ? "✅ set" : "❌ MISSING",
        SMTP_PORT: process.env.SMTP_PORT ? "✅ set" : "❌ MISSING",
        SMTP_SECURE: process.env.SMTP_SECURE ? "✅ set" : "❌ MISSING",
        SMTP_USER: process.env.SMTP_USER ? `✅ ${process.env.SMTP_USER}` : "❌ MISSING",
        SMTP_PASSWORD: process.env.SMTP_PASSWORD ? `✅ (${process.env.SMTP_PASSWORD.length} chars)` : "❌ MISSING",
        MANAGER_EMAIL: process.env.MANAGER_EMAIL ? `✅ ${process.env.MANAGER_EMAIL}` : "❌ MISSING",
    };

    const allSet = Object.values(envCheck).every(v => v.startsWith("✅"));

    if (!allSet) {
        return NextResponse.json({
            status: "FAIL",
            message: "Variables d'environnement SMTP manquantes sur Vercel!",
            envCheck,
            fix: "Allez dans Vercel > Project Settings > Environment Variables et ajoutez les variables manquantes.",
        });
    }

    // 2. Test SMTP connection
    let smtpStatus = "unknown";
    let smtpError = null;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: process.env.SMTP_SECURE === "true" || parseInt(process.env.SMTP_PORT || "465") === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        await transporter.verify();
        smtpStatus = "✅ Connection OK";
    } catch (err: unknown) {
        smtpStatus = "❌ Connection FAILED";
        smtpError = err instanceof Error ? err.message : String(err);
    }

    // 3. Try sending a test email
    let sendStatus = "skipped";
    let sendError = null;

    if (smtpStatus.startsWith("✅")) {
        try {
            const info = await transporter.sendMail({
                from: `"Latino Coucou Beach" <${process.env.SMTP_USER}>`,
                to: process.env.MANAGER_EMAIL || process.env.SMTP_USER,
                subject: `🧪 Test Diagnostic Email - ${new Date().toLocaleString("fr-FR")}`,
                html: `<h2>Diagnostic Email</h2><p>Cet email a été envoyé depuis la route <code>/api/debug-email</code> en production.</p><p>Timestamp: ${new Date().toISOString()}</p>`,
            });
            sendStatus = `✅ Sent! MessageId: ${info.messageId}`;
        } catch (err: unknown) {
            sendStatus = "❌ Send FAILED";
            sendError = err instanceof Error ? err.message : String(err);
        }
    }

    return NextResponse.json({
        status: smtpStatus.startsWith("✅") && sendStatus.startsWith("✅") ? "OK" : "FAIL",
        envCheck,
        smtpStatus,
        smtpError,
        sendStatus,
        sendError,
        timestamp: new Date().toISOString(),
    });
}
