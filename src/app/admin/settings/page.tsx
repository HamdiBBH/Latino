import { Settings, Bell, Globe, Palette, Shield, Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                    <Settings style={{ width: 32, height: 32, color: "#E8A87C" }} />
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                        Paramètres
                    </h1>
                </div>
                <p style={{ color: "#7A7A7A" }}>
                    Configurez les paramètres généraux de l&apos;application
                </p>
            </div>

            {/* Settings Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* General Settings */}
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                        padding: "1.5rem",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <Globe style={{ width: 24, height: 24, color: "#E8A87C" }} />
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222222" }}>
                            Paramètres généraux
                        </h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontWeight: 500, color: "#222222", marginBottom: "0.5rem" }}>
                                Nom du site
                            </label>
                            <input
                                type="text"
                                defaultValue="Latino Coucou Beach"
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                    fontSize: "1rem",
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontWeight: 500, color: "#222222", marginBottom: "0.5rem" }}>
                                Email de contact
                            </label>
                            <input
                                type="email"
                                defaultValue="contact@latinocoucoubeach.com"
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                    fontSize: "1rem",
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontWeight: 500, color: "#222222", marginBottom: "0.5rem" }}>
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                defaultValue="+33 6 00 00 00 00"
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                    fontSize: "1rem",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                        padding: "1.5rem",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <Bell style={{ width: 24, height: 24, color: "#E8A87C" }} />
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222222" }}>
                            Notifications
                        </h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {[
                            { label: "Notifications email pour nouvelles réservations", checked: true },
                            { label: "Notifications email pour nouvelles commandes", checked: true },
                            { label: "Notifications push", checked: false },
                            { label: "Résumé quotidien par email", checked: true },
                        ].map((item, index) => (
                            <label
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px",
                                    backgroundColor: "#F9FAFB",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    defaultChecked={item.checked}
                                    style={{ width: 18, height: 18, cursor: "pointer" }}
                                />
                                <span style={{ color: "#222222" }}>{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Theme */}
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                        padding: "1.5rem",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <Palette style={{ width: 24, height: 24, color: "#E8A87C" }} />
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222222" }}>
                            Thème du back-office
                        </h2>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        {[
                            { name: "Sombre", color: "#111827", active: true },
                            { name: "Clair", color: "#FFFFFF", active: false },
                            { name: "Accent", color: "#E8A87C", active: false },
                        ].map((theme) => (
                            <button
                                key={theme.name}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "1rem",
                                    border: theme.active ? "2px solid #E8A87C" : "1px solid #E5E7EB",
                                    borderRadius: "12px",
                                    backgroundColor: "transparent",
                                    cursor: "pointer",
                                }}
                            >
                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        backgroundColor: theme.color,
                                        borderRadius: "8px",
                                        border: "1px solid #E5E7EB",
                                    }}
                                />
                                <span style={{ fontSize: "0.875rem", color: "#222222" }}>{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                        padding: "1.5rem",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <Shield style={{ width: 24, height: 24, color: "#E8A87C" }} />
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222222" }}>
                            Sécurité
                        </h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <button
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "transparent",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px",
                                fontSize: "1rem",
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            Changer le mot de passe
                        </button>
                        <button
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "transparent",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px",
                                fontSize: "1rem",
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            Activer l&apos;authentification à deux facteurs
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "16px 32px",
                        backgroundColor: "#E8A87C",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "100px",
                        fontSize: "1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        alignSelf: "flex-start",
                    }}
                >
                    <Save style={{ width: 20, height: 20 }} />
                    Enregistrer les modifications
                </button>
            </div>
        </div>
    );
}
