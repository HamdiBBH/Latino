"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    CheckCircle2,
    Clock,
    Calendar,
    Users,
    MapPin,
    Mail,
    Phone,
    ArrowRight,
    Sparkles,
    Home,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Reservation {
    id: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    reservation_date: string;
    time_slot: string;
    guest_count: number;
    special_request: string | null;
    estimated_price: number;
    status: string;
    packages: {
        name: string;
        description: string;
    };
}

const timeSlotLabels: Record<string, string> = {
    full_day: "Journée complète (9h-19h)",
    morning: "Matin (9h-14h)",
    afternoon: "Après-midi (14h-19h)",
};

export default function ConfirmationPage() {
    const params = useParams();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReservation();
    }, []);

    const loadReservation = async () => {
        const supabase = createClient();

        // First, get the reservation without join
        const { data: resData, error: resError } = await supabase
            .from("reservations")
            .select("*")
            .eq("id", params.id)
            .single();

        console.log("Confirmation page - Reservation ID:", params.id);
        console.log("Confirmation page - Reservation Data:", resData);
        console.log("Confirmation page - Reservation Error:", resError);

        if (resData) {
            // Then get the package info separately
            let packageData = { name: "Forfait", description: "" };

            if (resData.package_id) {
                const { data: pkgData } = await supabase
                    .from("packages")
                    .select("name, description")
                    .eq("id", resData.package_id)
                    .single();

                if (pkgData) {
                    packageData = pkgData;
                }
            }

            setReservation({
                ...resData,
                packages: packageData
            } as Reservation);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F9F5F0" }}>
                <p>Chargement...</p>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F9F5F0" }}>
                <div style={{ textAlign: "center" }}>
                    <p style={{ marginBottom: "1rem" }}>Réservation non trouvée</p>
                    <Link href="/" style={{ color: "#E8A87C" }}>Retour à l'accueil</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F9F5F0" }}>
            {/* Success Header */}
            <div style={{
                backgroundColor: "#22C55E",
                padding: "4rem 2rem",
                textAlign: "center",
                color: "#FFFFFF",
            }}>
                <div style={{
                    width: 80, height: 80, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem"
                }}>
                    <CheckCircle2 style={{ width: 48, height: 48 }} />
                </div>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Demande envoyée avec succès !
                </h1>
                <p style={{ opacity: 0.9, maxWidth: "500px", margin: "0 auto" }}>
                    Votre demande de réservation a bien été reçue. Notre équipe vous contactera sous 24h pour confirmer votre réservation.
                </p>
            </div>

            {/* Content */}
            <main style={{ maxWidth: "700px", margin: "-2rem auto 0", padding: "0 1rem 3rem" }}>
                {/* Status Card */}
                <div style={{
                    backgroundColor: "#FFF", borderRadius: "16px", padding: "1.5rem",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)", marginBottom: "1.5rem",
                    display: "flex", alignItems: "center", gap: "1rem"
                }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: "50%", backgroundColor: "#FEF3C7",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <Clock style={{ width: 24, height: 24, color: "#F59E0B" }} />
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, color: "#222" }}>En attente de confirmation</p>
                        <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>
                            Un email de confirmation vous sera envoyé une fois la réservation validée.
                        </p>
                    </div>
                </div>

                {/* Reservation Details */}
                <div style={{
                    backgroundColor: "#FFF", borderRadius: "16px", padding: "2rem",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "1.5rem"
                }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222", marginBottom: "1.5rem" }}>
                        Détails de votre réservation
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <MapPin style={{ width: 20, height: 20, color: "#E8A87C" }} />
                            <div>
                                <p style={{ fontWeight: 600, color: "#222" }}>{reservation.packages.name}</p>
                                <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{reservation.packages.description}</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <Calendar style={{ width: 20, height: 20, color: "#E8A87C" }} />
                            <div>
                                <p style={{ fontWeight: 600, color: "#222" }}>
                                    {new Date(reservation.reservation_date).toLocaleDateString("fr-FR", {
                                        weekday: "long", day: "numeric", month: "long", year: "numeric"
                                    })}
                                </p>
                                <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{timeSlotLabels[reservation.time_slot]}</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <Users style={{ width: 20, height: 20, color: "#E8A87C" }} />
                            <p style={{ fontWeight: 600, color: "#222" }}>{reservation.guest_count} personne{reservation.guest_count > 1 ? "s" : ""}</p>
                        </div>

                        {reservation.special_request && (
                            <div style={{
                                backgroundColor: "#F9F5F0", padding: "1rem", borderRadius: "12px",
                                marginTop: "0.5rem"
                            }}>
                                <p style={{ fontSize: "0.875rem", color: "#7A7A7A", marginBottom: "4px" }}>Demande spéciale :</p>
                                <p style={{ color: "#222" }}>{reservation.special_request}</p>
                            </div>
                        )}

                        <div style={{
                            borderTop: "1px solid #E5E7EB", paddingTop: "1.25rem", marginTop: "0.5rem",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <span style={{ fontWeight: 600, color: "#222" }}>Montant estimé</span>
                            <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#E8A87C" }}>
                                    {reservation.estimated_price}DT
                                </span>
                                <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>À payer sur place</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div style={{
                    backgroundColor: "#FFF", borderRadius: "16px", padding: "1.5rem",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "1.5rem"
                }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#222", marginBottom: "1rem" }}>
                        Confirmation envoyée à
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Mail style={{ width: 16, height: 16, color: "#7A7A7A" }} />
                            <span style={{ color: "#222" }}>{reservation.guest_email}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Phone style={{ width: 16, height: 16, color: "#7A7A7A" }} />
                            <span style={{ color: "#222" }}>{reservation.guest_phone}</span>
                        </div>
                    </div>
                </div>

                {/* Account CTA */}
                <div style={{
                    backgroundColor: "#E8A87C15", border: "1px solid #E8A87C30",
                    borderRadius: "16px", padding: "2rem", textAlign: "center", marginBottom: "2rem"
                }}>
                    <Sparkles style={{ width: 32, height: 32, color: "#E8A87C", margin: "0 auto 1rem" }} />
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#222", marginBottom: "0.5rem" }}>
                        Créez votre compte et gagnez 50 points !
                    </h3>
                    <p style={{ color: "#7A7A7A", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                        Suivez votre réservation en temps réel, accédez à vos souvenirs et bénéficiez d'offres exclusives.
                    </p>
                    <Link
                        href={`/register?email=${encodeURIComponent(reservation.guest_email)}&name=${encodeURIComponent(reservation.guest_name)}`}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "1rem 2rem", backgroundColor: "#E8A87C", color: "#FFF",
                            borderRadius: "12px", textDecoration: "none", fontWeight: 600
                        }}
                    >
                        Créer mon compte <ArrowRight style={{ width: 18, height: 18 }} />
                    </Link>
                </div>

                {/* Back to Home */}
                <div style={{ textAlign: "center" }}>
                    <Link
                        href="/"
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            color: "#7A7A7A", textDecoration: "none"
                        }}
                    >
                        <Home style={{ width: 18, height: 18 }} />
                        Retour à l'accueil
                    </Link>
                </div>
            </main>
        </div>
    );
}
