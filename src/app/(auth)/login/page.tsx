"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/admin";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            router.push(redirectTo);
            router.refresh();
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%", maxWidth: "420px" }}
        >
            {/* Logo */}
            <Link
                href="/"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    textDecoration: "none",
                    marginBottom: "2rem",
                }}
            >
                <span style={{ fontSize: "2.5rem" }}>🌴</span>
                <span style={{ fontSize: "1.5rem", fontWeight: 600, color: "#222222" }}>
                    Latino Coucou <span style={{ color: "#E8A87C" }}>Beach</span>
                </span>
            </Link>

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
                        Connexion
                    </h1>
                    <p style={{ color: "#7A7A7A" }}>Accédez à votre espace personnel</p>
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: "1rem" }}>
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                    {/* Forgot Password */}
                    <div style={{ textAlign: "right", marginBottom: "2rem" }}>
                        <Link href="/forgot-password" style={{ fontSize: "0.9rem", color: "#E8A87C", textDecoration: "none" }}>
                            Mot de passe oublié ?
                        </Link>
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
                        <LogIn style={{ width: 20, height: 20 }} />
                        {isLoading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                {/* Register Link */}
                <div
                    style={{
                        marginTop: "2rem",
                        paddingTop: "2rem",
                        borderTop: "1px solid #eee",
                        textAlign: "center",
                    }}
                >
                    <p style={{ color: "#7A7A7A" }}>
                        Pas encore de compte ?{" "}
                        <Link href="/register" style={{ color: "#E8A87C", fontWeight: 500, textDecoration: "none" }}>
                            Créer un compte
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
    );
}

export default function LoginPage() {
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
            <Suspense
                fallback={
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "420px",
                            height: "400px",
                            backgroundColor: "#FFFFFF",
                            borderRadius: "24px",
                        }}
                    />
                }
            >
                <LoginForm />
            </Suspense>
        </div>
    );
}
