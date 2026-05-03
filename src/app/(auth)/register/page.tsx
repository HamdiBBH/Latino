"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, UserPlus, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

const inputStyle = {
    width: "100%",
    padding: "12px 12px 12px 48px",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "12px",
    outline: "none",
    transition: "border-color 0.3s ease",
};

const labelStyle = {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#222222",
    marginBottom: "8px",
};

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            setIsLoading(false);
            return;
        }

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                    },
                },
            });

            if (error) {
                setError(error.message);
                return;
            }

            setSuccess(true);
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#F9F5F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1.5rem",
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        width: "100%",
                        maxWidth: "400px",
                        backgroundColor: "#FFFFFF",
                        borderRadius: "24px",
                        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.15)",
                        padding: "3rem",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            backgroundColor: "#E8F5E9",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1.5rem",
                        }}
                    >
                        <span style={{ fontSize: "2rem" }}>✉️</span>
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222222", marginBottom: "1rem" }}>
                        Vérifiez votre email
                    </h2>
                    <p style={{ color: "#7A7A7A", marginBottom: "2rem" }}>
                        Un email de confirmation a été envoyé à{" "}
                        <strong>{formData.email}</strong>. Cliquez sur le lien pour activer votre compte.
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "15px 30px",
                            fontSize: "1rem",
                            fontWeight: 600,
                            borderRadius: "100px",
                            backgroundColor: "#222222",
                            color: "#FFFFFF",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Retour à la connexion
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#F9F5F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem 1.5rem",
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: "100%", maxWidth: "420px" }}
            >
                {/* Logo */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
                    <Logo variant="dark" />
                </div>

                {/* Card */}
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "24px",
                        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.15)",
                        padding: "2.5rem",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222222", marginBottom: "0.5rem" }}>
                            Créer un compte
                        </h1>
                        <p style={{ color: "#7A7A7A" }}>Rejoignez notre club de plage</p>
                    </div>

                    {error && (
                        <div
                            style={{
                                marginBottom: "1.5rem",
                                padding: "1rem",
                                backgroundColor: "#FEE2E2",
                                border: "1px solid #FECACA",
                                borderRadius: "12px",
                                color: "#B91C1C",
                                fontSize: "0.9rem",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Full Name */}
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={labelStyle}>Nom complet</label>
                            <div style={{ position: "relative" }}>
                                <User
                                    style={{
                                        position: "absolute",
                                        left: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: 20,
                                        height: 20,
                                        color: "#9CA3AF",
                                    }}
                                />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Jean Dupont"
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={labelStyle}>Email</label>
                            <div style={{ position: "relative" }}>
                                <Mail
                                    style={{
                                        position: "absolute",
                                        left: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: 20,
                                        height: 20,
                                        color: "#9CA3AF",
                                    }}
                                />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="votre@email.com"
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={labelStyle}>Téléphone (optionnel)</label>
                            <div style={{ position: "relative" }}>
                                <Phone
                                    style={{
                                        position: "absolute",
                                        left: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: 20,
                                        height: 20,
                                        color: "#9CA3AF",
                                    }}
                                />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+216 00 000 000"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={labelStyle}>Mot de passe</label>
                            <div style={{ position: "relative" }}>
                                <Lock
                                    style={{
                                        position: "absolute",
                                        left: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: 20,
                                        height: 20,
                                        color: "#9CA3AF",
                                    }}
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    style={{ ...inputStyle, paddingRight: "48px" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#9CA3AF",
                                    }}
                                >
                                    {showPassword ? <EyeOff style={{ width: 20, height: 20 }} /> : <Eye style={{ width: 20, height: 20 }} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: "2rem" }}>
                            <label style={labelStyle}>Confirmer le mot de passe</label>
                            <div style={{ position: "relative" }}>
                                <Lock
                                    style={{
                                        position: "absolute",
                                        left: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: 20,
                                        height: 20,
                                        color: "#9CA3AF",
                                    }}
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                padding: "15px 30px",
                                fontSize: "1rem",
                                fontWeight: 600,
                                borderRadius: "100px",
                                backgroundColor: "#222222",
                                color: "#FFFFFF",
                                border: "none",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                opacity: isLoading ? 0.7 : 1,
                            }}
                        >
                            <UserPlus style={{ width: 20, height: 20 }} />
                            {isLoading ? "Création..." : "Créer mon compte"}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div
                        style={{
                            marginTop: "2rem",
                            paddingTop: "2rem",
                            borderTop: "1px solid #eee",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ color: "#7A7A7A" }}>
                            Déjà un compte ?{" "}
                            <Link href="/login" style={{ color: "#E8A87C", fontWeight: 500, textDecoration: "none" }}>
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to site */}
                <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
                    <Link href="/" style={{ color: "#7A7A7A", textDecoration: "none" }}>
                        ← Retour au site
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
