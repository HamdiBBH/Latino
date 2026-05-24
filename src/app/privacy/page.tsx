import React from "react";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export const metadata = {
    title: "Politique de Confidentialité | Latino Coucou Beach",
    description: "Règles de confidentialité et de gestion des données personnelles de Latino Coucou Beach.",
};

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen" style={{ width: "100%", maxWidth: "100vw", overflowX: "hidden", backgroundColor: "#F9FAFB" }}>
            <Navbar />

            {/* Content Container */}
            <div style={{ padding: "8rem 1.5rem 6rem", maxWidth: "800px", margin: "0 auto", fontFamily: "var(--font-outfit), sans-serif" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#111827", marginBottom: "1.5rem", textAlign: "left" }}>
                    Politique de Confidentialité
                </h1>
                
                <p style={{ color: "#6B7280", fontSize: "0.875rem", marginBottom: "2.5rem" }}>
                    Dernière mise à jour : 24 mai 2026
                </p>

                <section style={{ display: "flex", flexDirection: "column", gap: "2rem", color: "#374151", lineHeight: "1.6" }}>
                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            1. Introduction
                        </h2>
                        <p>
                            Chez <strong>Latino Coucou Beach</strong>, nous accordons une importance primordiale à la confidentialité et à la sécurité des données personnelles de nos utilisateurs. La présente politique décrit comment nous collectons, utilisons, conservons et protégeons vos données lorsque vous utilisez notre site web et nos services de réservation.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            2. Collecte des Données Personnelles
                        </h2>
                        <p style={{ marginBottom: "1rem" }}>
                            Nous collectons et traitons des informations personnelles uniquement pour fournir notre service de réservation et de fidélité. Les données collectées comprennent :
                        </p>
                        <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <li><strong>Identité</strong> : Nom complet (nom et prénom).</li>
                            <li><strong>Coordonnées</strong> : Adresse e-mail et numéro de téléphone mobile.</li>
                            <li><strong>Informations de réservation</strong> : Date, nombre de personnes, type d'emplacement (cabane, paillote, parasol) et demandes spécifiques.</li>
                            <li><strong>Compte utilisateur</strong> : Informations de connexion issues de l'authentification tierce (Google OAuth) si vous choisissez cette méthode.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            3. Utilisation de l'authentification Google (OAuth)
                        </h2>
                        <p style={{ marginBottom: "0.75rem" }}>
                            Si vous choisissez de vous inscrire ou de vous connecter via Google, nous accédons uniquement aux informations publiques de votre profil Google transmises de manière sécurisée (nom, adresse e-mail et avatar).
                        </p>
                        <p>
                            Ces données sont uniquement destinées à la création automatique de votre compte Latino Beach et ne sont pas partagées avec des tiers, ni utilisées à des fins publicitaires.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            4. Finalités du Traitement des Données
                        </h2>
                        <p style={{ marginBottom: "1rem" }}>
                            Vos informations sont utilisées pour :
                        </p>
                        <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <li>Gérer et confirmer vos réservations d'emplacements sur la plage.</li>
                            <li>Vous envoyer des notifications de confirmation ou de modification (par e-mail et notifications).</li>
                            <li>Gérer vos points de fidélité et vos avantages clients.</li>
                            <li>Assurer le support client et répondre à vos demandes de renseignements.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            5. Conservation et Sécurité des Données
                        </h2>
                        <p style={{ marginBottom: "0.75rem" }}>
                            Vos données sont hébergées de manière hautement sécurisée via Supabase. Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles rigoureuses (protocoles HTTPS, chiffrement, gestion stricte des droits d'accès RLS) pour éviter toute fuite ou accès non autorisé à vos données personnelles.
                        </p>
                        <p>
                            Les données personnelles relatives à vos réservations sont conservées pour la durée strictement nécessaire à la gestion de notre activité saisonnière et de votre programme fidélité.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            6. Vos Droits
                        </h2>
                        <p>
                            Conformément aux réglementations relatives à la protection des données personnelles (notamment la loi tunisienne sur la protection des données personnelles et les standards internationaux), vous disposez d'un droit d'accès, de rectification, de limitation de traitement et de suppression de vos données personnelles. Vous pouvez exercer ces droits en nous contactant directement par e-mail ou via votre espace client.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            7. Contact
                        </h2>
                        <p>
                            Pour toute question relative à notre Politique de Confidentialité ou pour formuler une demande concernant vos données, vous pouvez nous écrire à l'adresse e-mail de contact du club.
                        </p>
                    </div>
                </section>
            </div>

            <Footer />
            <WhatsAppButton />
        </main>
    );
}
