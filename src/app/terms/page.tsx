import React from "react";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export const metadata = {
    title: "Conditions Générales d'Utilisation | Latino Coucou Beach",
    description: "Conditions générales d'utilisation du site et de réservation de Latino Coucou Beach.",
};

export default function TermsOfUsePage() {
    return (
        <main className="min-h-screen" style={{ width: "100%", maxWidth: "100vw", overflowX: "hidden", backgroundColor: "#F9FAFB" }}>
            <Navbar />

            {/* Content Container */}
            <div style={{ padding: "8rem 1.5rem 6rem", maxWidth: "800px", margin: "0 auto", fontFamily: "var(--font-outfit), sans-serif" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#111827", marginBottom: "1.5rem", textAlign: "left" }}>
                    Conditions Générales d'Utilisation (CGU)
                </h1>
                
                <p style={{ color: "#6B7280", fontSize: "0.875rem", marginBottom: "2.5rem" }}>
                    Dernière mise à jour : 24 mai 2026
                </p>

                <section style={{ display: "flex", flexDirection: "column", gap: "2rem", color: "#374151", lineHeight: "1.6" }}>
                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            1. Objet et Acceptation des Conditions
                        </h2>
                        <p>
                            Le présent document définit les conditions générales d'utilisation du site de <strong>Latino Coucou Beach</strong> et de son système de réservation en ligne. L'accès et l'utilisation de ce site impliquent l'acceptation pleine et entière des présentes conditions par l'utilisateur.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            2. Service de Réservation d'Emplacements
                        </h2>
                        <p style={{ marginBottom: "0.75rem" }}>
                            Notre service permet aux utilisateurs de réserver des forfaits d'installations à la plage (cabanes, paillotes, parasols) pour la journée complète.
                        </p>
                        <p style={{ marginBottom: "0.75rem" }}>
                            Toute demande de réservation en ligne est initialement soumise à un statut "en attente" (pending). Le gestionnaire opérationnel du club examine et confirme la réservation sous réserve de disponibilité et du respect des règles du club (comme le nombre de personnes minimum requis par forfait).
                        </p>
                        <p>
                            Une fois confirmée, la réservation garantit l'emplacement pour la date sélectionnée. Le règlement s'effectue sur place lors de votre arrivée au club.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            3. Politique d'Annulation et de Modification
                        </h2>
                        <p style={{ marginBottom: "0.75rem" }}>
                            Nous prions nos clients de nous avertir au moins 24 heures à l'avance pour toute annulation ou modification de leur réservation d'emplacement.
                        </p>
                        <p>
                            En cas de mauvaises prévisions météorologiques ou de conditions de navigation défavorables empêchant la traversée en mer en toute sécurité, le club se réserve le droit d'annuler les réservations et proposera une date alternative ou une annulation sans frais.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            4. Comptes Utilisateurs et Authentification
                        </h2>
                        <p style={{ marginBottom: "0.75rem" }}>
                            Pour faciliter le suivi de vos réservations et cumuler des points de fidélité, vous pouvez vous inscrire en créant un compte client. Les identifiants de connexion et de profil doivent être exacts.
                        </p>
                        <p>
                            En utilisant la fonctionnalité de connexion via Google, vous acceptez les règles d'utilisation de la plateforme. Vous êtes responsable du maintien de la sécurité de votre accès.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            5. Propriété Intellectuelle
                        </h2>
                        <p>
                            Tous les éléments présents sur ce site (textes, logos, images, icônes, animations, structure générale) sont la propriété exclusive de Latino Coucou Beach. Toute reproduction, distribution ou exploitation non autorisée de ces contenus est strictement interdite.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            6. Responsabilité
                        </h2>
                        <p>
                            Latino Coucou Beach s'efforce de maintenir des informations à jour et exactes sur le site. Toutefois, le club ne saurait être tenu responsable d'éventuelles interruptions temporaires de service, de pannes techniques du réseau internet ou d'erreurs d'affichage.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
                            7. Modification des CGU
                        </h2>
                        <p>
                            Le club se réserve le droit d'ajuster ou de modifier à tout moment les présentes conditions générales d'utilisation pour les adapter aux évolutions réglementaires ou de service. Les modifications prennent effet dès leur publication en ligne.
                        </p>
                    </div>
                </section>
            </div>

            <Footer />
            <WhatsAppButton />
        </main>
    );
}
