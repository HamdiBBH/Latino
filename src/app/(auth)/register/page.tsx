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
            const appUrl = (typeof window !== "undefined" ? window.location.origin : null) || process.env.NEXT_PUBLIC_APP_URL || "https://latinocoucoubeach.com";
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${appUrl}/auth/callback`,
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

            if (data?.session) {
                router.push("/dashboard");
                router.refresh();
            } else {
                setSuccess(true);
            }
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

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                 const supabase = createClient();
                                 const { error } = await supabase.auth.signInWithOAuth({
                                     provider: 'google',
                                     options: {
                                         redirectTo: `${typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "https://latinocoucoubeach.com")}/auth/callback`,
                                     },
                                 });
                                if (error) throw error;
                            } catch (err) {
                                setError("Erreur lors de la connexion avec Google.");
                            }
                        }}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "12px",
                            padding: "14px 20px",
                            backgroundColor: "#FFF",
                            color: "#222",
                            border: "1px solid #E5E7EB",
                            borderRadius: "12px",
                            fontSize: "1rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                            marginBottom: "1.5rem"
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#FFF")}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continuer avec Google
                    </button>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
                        <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E7EB" }}></div>
                        <span style={{ padding: "0 16px", color: "#9CA3AF", fontSize: "0.875rem", fontWeight: 500 }}>Ou bien avec votre email</span>
                        <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E7EB" }}></div>
                    </div>

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
