"use client";

import { useState, useEffect } from "react";
import { X, Download, Share, PlusSquare } from "lucide-react";
import Image from "next/image";

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // 1. Check if already running in standalone mode (installed app)
        const isStandalone = 
            window.matchMedia("(display-mode: standalone)").matches || 
            (window.navigator as any).standalone || 
            document.referrer.includes("android-app://");

        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // 2. Check if dismissed in localStorage
        const isDismissed = localStorage.getItem("pwa_install_dismissed");
        if (isDismissed) return;

        // 3. Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const iosDetect = /iphone|ipad|ipod/.test(userAgent) && !/crios|fxios|opt|opios/.test(userAgent); // Safari iOS
        setIsIOS(iosDetect);

        // 4. Listen for beforeinstallprompt event (Android & Desktop)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Delay presentation to let page load first
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // For iOS, since it doesn't support beforeinstallprompt, we show a guided prompt after 4 seconds
        if (iosDetect) {
            setTimeout(() => {
                setShowPrompt(true);
            }, 4000);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleDismiss = () => {
        localStorage.setItem("pwa_install_dismissed", "true");
        setShowPrompt(false);
        setShowIOSInstructions(false);
    };

    const handleInstallClick = async () => {
        if (isIOS) {
            // Show instructions modal
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <>
            {/* Custom PWA Floating Installation Banner */}
            <div
                style={{
                    position: "fixed",
                    bottom: "80px", // sits above bottom navigation on mobile
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "calc(100% - 24px)",
                    maxWidth: "480px",
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    borderRadius: "20px",
                    padding: "16px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    animation: "pwa-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    fontFamily: "var(--font-outfit), sans-serif",
                }}
            >
                {/* App Logo */}
                <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0, borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <Image
                        src="/icon-192.png"
                        alt="Latino Beach Club Logo"
                        fill
                        sizes="48px"
                        style={{ objectFit: "cover" }}
                    />
                </div>

                {/* Text Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>
                        Latino Coucou Beach
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#4B5563", lineHeight: "1.3" }}>
                        Installez l'application pour un accès rapide & hors ligne 🌴
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                        onClick={handleInstallClick}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 14px",
                            background: "linear-gradient(135deg, #E8A87C 0%, #F97316 100%)",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "50px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(249, 115, 22, 0.2)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <Download style={{ width: 14, height: 14 }} />
                        Installer
                    </button>
                    
                    <button
                        onClick={handleDismiss}
                        style={{
                            background: "rgba(0, 0, 0, 0.05)",
                            border: "none",
                            borderRadius: "50%",
                            padding: "6px",
                            cursor: "pointer",
                            color: "#4B5563",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s",
                        }}
                        aria-label="Fermer"
                    >
                        <X style={{ width: 16, height: 16 }} />
                    </button>
                </div>
            </div>

            {/* iOS Installation Guide Modal */}
            {showIOSInstructions && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowIOSInstructions(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            backdropFilter: "blur(4px)",
                            zIndex: 10000,
                            animation: "pwa-fade-in 0.2s ease-out",
                        }}
                    />

                    {/* Instructions Content Sheet */}
                    <div
                        style={{
                            position: "fixed",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: "#FFFFFF",
                            borderRadius: "24px 24px 0 0",
                            padding: "24px 20px 40px",
                            boxShadow: "0 -10px 40px rgba(0,0,0,0.3)",
                            zIndex: 10001,
                            fontFamily: "var(--font-outfit), sans-serif",
                            animation: "pwa-ios-sheet-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                    >
                        {/* Drag handle for layout decoration */}
                        <div style={{ width: "36px", height: "4px", backgroundColor: "#D1D5DB", borderRadius: "2px", margin: "0 auto 16px" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>
                                Installer sur iOS
                            </h3>
                            <button
                                onClick={() => setShowIOSInstructions(false)}
                                style={{ background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", padding: "6px", cursor: "pointer", color: "#111827" }}
                            >
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Step 1 */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                                <div style={{
                                    width: "28px", height: "28px", backgroundColor: "rgba(232, 168, 124, 0.2)", color: "#F97316",
                                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0
                                }}>
                                    1
                                </div>
                                <p style={{ margin: 0, fontSize: "0.95rem", color: "#374151", lineHeight: "1.4" }}>
                                    Appuyez sur le bouton de partage <span style={{ display: "inline-flex", padding: "4px", backgroundColor: "#F3F4F6", borderRadius: "6px", margin: "0 2px" }}><Share style={{ width: 16, height: 16, color: "#007AFF" }} /></span> en bas de votre écran Safari.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                                <div style={{
                                    width: "28px", height: "28px", backgroundColor: "rgba(232, 168, 124, 0.2)", color: "#F97316",
                                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0
                                }}>
                                    2
                                </div>
                                <p style={{ margin: 0, fontSize: "0.95rem", color: "#374151", lineHeight: "1.4" }}>
                                    Faites défiler vers le bas et sélectionnez <strong style={{ color: "#111827" }}>Sur l'écran d'accueil</strong> <span style={{ display: "inline-flex", padding: "4px", backgroundColor: "#F3F4F6", borderRadius: "6px", margin: "0 2px" }}><PlusSquare style={{ width: 16, height: 16 }} /></span>.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                                <div style={{
                                    width: "28px", height: "28px", backgroundColor: "rgba(232, 168, 124, 0.2)", color: "#F97316",
                                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0
                                }}>
                                    3
                                </div>
                                <p style={{ margin: 0, fontSize: "0.95rem", color: "#374151", lineHeight: "1.4" }}>
                                    Appuyez sur <strong style={{ color: "#007AFF" }}>Ajouter</strong> dans le coin supérieur droit pour finaliser l'installation.
                                </p>
                            </div>
                        </div>

                        {/* CTA Footer */}
                        <button
                            onClick={handleDismiss}
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "24px",
                                backgroundColor: "#F3F4F6",
                                color: "#374151",
                                border: "none",
                                borderRadius: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                fontSize: "0.9rem",
                            }}
                        >
                            J'ai compris
                        </button>
                    </div>
                </>
            )}

            {/* CSS Animation Keyframes */}
            <style jsx global>{`
                @keyframes pwa-slide-up {
                    from { opacity: 0; transform: translate(-50%, 40px); }
                    to   { opacity: 1; transform: translate(-50%, 0); }
                }
                @keyframes pwa-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes pwa-ios-sheet-up {
                    from { transform: translateY(100%); }
                    to   { transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
