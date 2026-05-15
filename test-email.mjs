import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "Latinocoucou.contact@gmail.com",
        pass: "iivowtjocursxolk",
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
        from: '"Latino Coucou Beach" <Latinocoucou.contact@gmail.com>',
        to: "Latinocoucou.contact@gmail.com",
        subject: "🧪 Test Email - " + new Date().toLocaleString("fr-FR"),
        html: "<h1>Test</h1><p>Si vous recevez cet email, SMTP fonctionne correctement.</p>",
    });
    console.log("✅ Email sent! MessageId:", info.messageId);
    console.log("   Response:", info.response);
} catch (err) {
    console.error("❌ Email send FAILED:", err.message);
    console.error("   Full error:", err);
}
