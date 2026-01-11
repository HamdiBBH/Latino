"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AvailabilityCalendar } from "@/components/reservation/AvailabilityCalendar";
import {
    Umbrella,
    Calendar,
    Clock,
    Users,
    ArrowLeft,
    ArrowRight,
    Check,
    Phone,
    Mail,
    User,
    MessageSquare,
    Sparkles,
    CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Package {
    id: string;
    name: string;
    price: string;
    description: string | null;
    image_url: string | null;
    capacity_min: number;
    capacity_max: number;
    features: string[];
}

// Loading fallback component
function ReservationLoading() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F9F5F0" }}>
            <p>Chargement...</p>
        </div>
    );
}

// Main reservation page wrapped with Suspense
export default function ReservationPage() {
    return (
        <Suspense fallback={<ReservationLoading />}>
            <ReservationContent />
        </Suspense>
    );
}

function ReservationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [packages, setPackages] = useState<Package[]>([]);

    // Form state
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [selectedDate, setSelectedDate] = useState(searchParams.get("date") || "");
    const [adults, setAdults] = useState(parseInt(searchParams.get("adults") || "2"));
    const [children4to12, setChildren4to12] = useState(parseInt(searchParams.get("children") || "0"));
    const [childrenUnder4, setChildrenUnder4] = useState(0);
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [specialRequest, setSpecialRequest] = useState("");

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("packages")
            .select("*")
            .eq("is_active", true)
            .order("display_order");

        if (data) {
            setPackages(data);
            // Pre-select from URL params
            const typeParam = searchParams.get("type");
            const dateParam = searchParams.get("date");
            const timeParam = searchParams.get("time");
            const adultsParam = searchParams.get("adults");

            if (typeParam) {
                const found = data.find((p) => p.id === typeParam);
                if (found) {
                    setSelectedPackage(found);

                    // If all params are provided from BookingBar, skip to step 4 (contact info)
                    if (dateParam && adultsParam) {
                        setStep(4);
                    }
                }
            }
        }
        setLoading(false);
    };

    const parsePrice = (priceStr: string): number => {
        const match = priceStr?.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    };

    const calculatePrice = () => {
        if (!selectedPackage) return 0;
        const adultPrice = parsePrice(selectedPackage.price);
        const childPrice = 45; // Prix enfant fixe (4-12 ans)
        // Children under 4 are free

        // Réservation toujours à la journée complète
        const adultsTotal = adults * adultPrice;
        const childrenTotal = children4to12 * childPrice;
        // childrenUnder4 = 0 (gratuit)

        return Math.round(adultsTotal + childrenTotal);
    };

    const totalGuests = adults + children4to12 + childrenUnder4;

    const canProceed = () => {
        switch (step) {
            case 1: return selectedPackage !== null;
            case 2: return selectedDate !== "";
            case 3: return adults >= 1 && totalGuests <= (selectedPackage?.capacity_max || 10);
            case 4: return guestName.trim() !== "" && guestEmail.trim() !== "" && guestPhone.trim() !== "";
            default: return true;
        }
    };

    const buildSpecialRequest = () => {
        const parts = [];
        parts.push(`Adultes: ${adults}, Enfants 4-12: ${children4to12}, Bébés: ${childrenUnder4}`);
        if (specialRequest.trim()) {
            parts.push(specialRequest.trim());
        }
        return parts.join(". ");
    };

    const handleSubmit = async () => {
        if (!selectedPackage) return;

        setSubmitting(true);
        const supabase = createClient();

        const { data, error } = await supabase
            .from("reservations")
            .insert({
                package_id: selectedPackage.id,
                guest_name: guestName,
                guest_email: guestEmail,
                guest_phone: guestPhone,
                reservation_date: selectedDate,
                time_slot: "full_day",
                guest_count: totalGuests,
                special_request: buildSpecialRequest(),
                estimated_price: calculatePrice(),
                status: "pending",
            })
            .select()
            .single();

        setSubmitting(false);

        if (error) {
            console.error("Reservation insert error:", error);
            alert("Erreur lors de l'envoi: " + error.message);
            return;
        }

        if (!data || !data.id) {
            console.error("No data returned from insert:", data);
            alert("Erreur: La réservation n'a pas pu être créée. Vérifiez que la table 'reservations' existe dans Supabase.");
            return;
        }

        router.push(`/reservation/confirmation/${data.id}`);
    };

    const today = new Date().toISOString().split("T")[0];

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F9F5F0" }}>
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F9F5F0" }}>
            {/* Header */}
            <header style={{
                backgroundColor: "#FFFFFF",
                padding: "1rem 2rem",
                borderBottom: "1px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
                    <ArrowLeft style={{ width: 20, height: 20, color: "#7A7A7A" }} />
                    <span style={{ color: "#7A7A7A" }}>Retour au site</span>
                </Link>
                <span style={{ fontWeight: 600, color: "#222" }}>🌴 Latino Coucou Beach</span>
                <div style={{ width: 100 }} />
            </header>

            {/* Progress Bar */}
            <div style={{ backgroundColor: "#FFFFFF", padding: "1.5rem 2rem" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} style={{ display: "flex", alignItems: "center" }}>
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        backgroundColor: s <= step ? "#E8A87C" : "#E5E7EB",
                                        color: s <= step ? "#FFF" : "#7A7A7A",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 600,
                                    }}
                                >
                                    {s < step ? <Check style={{ width: 20, height: 20 }} /> : s}
                                </div>
                                {s < 5 && (
                                    <div
                                        style={{
                                            width: "80px",
                                            height: "4px",
                                            backgroundColor: s < step ? "#E8A87C" : "#E5E7EB",
                                            marginLeft: "8px",
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                        <span style={{ fontSize: "0.75rem", color: step >= 1 ? "#E8A87C" : "#7A7A7A" }}>Forfait</span>
                        <span style={{ fontSize: "0.75rem", color: step >= 2 ? "#E8A87C" : "#7A7A7A" }}>Date</span>
                        <span style={{ fontSize: "0.75rem", color: step >= 3 ? "#E8A87C" : "#7A7A7A" }}>Personnes</span>
                        <span style={{ fontSize: "0.75rem", color: step >= 4 ? "#E8A87C" : "#7A7A7A" }}>Contact</span>
                        <span style={{ fontSize: "0.75rem", color: step >= 5 ? "#E8A87C" : "#7A7A7A" }}>Récap</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
                {/* Step 1: Package */}
                {step === 1 && (
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#222", marginBottom: "0.5rem" }}>
                            Choisissez votre forfait
                        </h1>
                        <p style={{ color: "#7A7A7A", marginBottom: "2rem" }}>
                            Sélectionnez le forfait qui vous convient
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    onClick={() => setSelectedPackage(pkg)}
                                    style={{
                                        backgroundColor: "#FFF",
                                        borderRadius: "16px",
                                        overflow: "hidden",
                                        border: selectedPackage?.id === pkg.id ? "3px solid #E8A87C" : "1px solid #E5E7EB",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        boxShadow: selectedPackage?.id === pkg.id ? "0 8px 30px rgba(232,168,124,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    <div style={{ height: "160px", backgroundColor: "#E8A87C20", position: "relative" }}>
                                        {pkg.image_url ? (
                                            <Image src={pkg.image_url} alt={pkg.name} fill style={{ objectFit: "cover" }} />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <Umbrella style={{ width: 48, height: 48, color: "#E8A87C" }} />
                                            </div>
                                        )}
                                        {selectedPackage?.id === pkg.id && (
                                            <div style={{
                                                position: "absolute", top: 12, right: 12, width: 32, height: 32,
                                                backgroundColor: "#E8A87C", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                <Check style={{ width: 18, height: 18, color: "#FFF" }} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: "1.25rem" }}>
                                        <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222", marginBottom: "0.5rem" }}>{pkg.name}</h3>
                                        <p style={{ fontSize: "0.875rem", color: "#7A7A7A", marginBottom: "1rem" }}>{pkg.description || ""}</p>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>
                                                <Users style={{ width: 14, height: 14, display: "inline", marginRight: 4 }} />
                                                {pkg.capacity_min || 1}-{pkg.capacity_max || 10} pers.
                                            </span>
                                            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#E8A87C" }}>
                                                {pkg.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Date & Time */}
                {step === 2 && (
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#222", marginBottom: "0.5rem" }}>
                            Choisissez votre date
                        </h1>
                        <p style={{ color: "#7A7A7A", marginBottom: "2rem" }}>
                            Sélectionnez la date et le créneau horaire
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem" }}>
                            <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", fontWeight: 600 }}>
                                    <Calendar style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                    Sélectionnez une date
                                </label>
                                <AvailabilityCalendar
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                    packageId={selectedPackage?.id}
                                />
                            </div>
                            <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", fontWeight: 600 }}>
                                    <Sparkles style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                    Votre forfait
                                </label>

                                {selectedPackage && (
                                    <div style={{ backgroundColor: "#F9F5F0", padding: "1.25rem", borderRadius: "12px", marginBottom: "1rem" }}>
                                        <h4 style={{ fontWeight: 600, color: "#222", marginBottom: "0.5rem" }}>
                                            {selectedPackage.name}
                                        </h4>
                                        <p style={{ fontSize: "0.875rem", color: "#7A7A7A", marginBottom: "0.75rem" }}>
                                            {selectedPackage.description}
                                        </p>
                                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#E8A87C" }}>
                                            {selectedPackage.price}
                                            <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#7A7A7A" }}> /adulte</span>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7A7A7A" }}>
                                        <Check style={{ width: 16, height: 16, color: "#22C55E" }} />
                                        Journée complète (9h - 19h)
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7A7A7A" }}>
                                        <Check style={{ width: 16, height: 16, color: "#22C55E" }} />
                                        Enfants 4-12 ans : 45 DT
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7A7A7A" }}>
                                        <Check style={{ width: 16, height: 16, color: "#22C55E" }} />
                                        Bébés &lt; 4 ans : Gratuit
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7A7A7A" }}>
                                        <Check style={{ width: 16, height: 16, color: "#22C55E" }} />
                                        Traversée en bateau incluse
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Guests */}
                {step === 3 && (
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#222", marginBottom: "0.5rem" }}>
                            Nombre de personnes
                        </h1>
                        <p style={{ color: "#7A7A7A", marginBottom: "2rem" }}>
                            Capacité max: {selectedPackage?.capacity_max || 10} personnes
                        </p>
                        <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                            {/* Adults */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 0", borderBottom: "1px solid #E5E7EB" }}>
                                <div>
                                    <p style={{ fontWeight: 600, color: "#222", fontSize: "1.1rem" }}>Adultes</p>
                                    <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>13 ans et plus</p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <button
                                        onClick={() => setAdults(Math.max(1, adults - 1))}
                                        style={{
                                            width: 44, height: 44, borderRadius: "50%", border: "2px solid #E5E7EB",
                                            backgroundColor: "#FFF", fontSize: "1.25rem", cursor: "pointer"
                                        }}
                                    >
                                        -
                                    </button>
                                    <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222", minWidth: "40px", textAlign: "center" }}>
                                        {adults}
                                    </span>
                                    <button
                                        onClick={() => setAdults(Math.min((selectedPackage?.capacity_max || 10) - children4to12 - childrenUnder4, adults + 1))}
                                        style={{
                                            width: 44, height: 44, borderRadius: "50%", border: "2px solid #E8A87C",
                                            backgroundColor: "#E8A87C", color: "#FFF", fontSize: "1.25rem", cursor: "pointer"
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Children 4-12 */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 0", borderBottom: "1px solid #E5E7EB" }}>
                                <div>
                                    <p style={{ fontWeight: 600, color: "#222", fontSize: "1.1rem" }}>Enfants</p>
                                    <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>4 - 12 ans</p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <button
                                        onClick={() => setChildren4to12(Math.max(0, children4to12 - 1))}
                                        style={{
                                            width: 44, height: 44, borderRadius: "50%", border: "2px solid #E5E7EB",
                                            backgroundColor: "#FFF", fontSize: "1.25rem", cursor: "pointer"
                                        }}
                                    >
                                        -
                                    </button>
                                    <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222", minWidth: "40px", textAlign: "center" }}>
                                        {children4to12}
                                    </span>
                                    <button
                                        onClick={() => setChildren4to12(Math.min((selectedPackage?.capacity_max || 10) - adults - childrenUnder4, children4to12 + 1))}
                                        style={{
                                            width: 44, height: 44, borderRadius: "50%", border: "2px solid #E8A87C",
                                            backgroundColor: "#E8A87C", color: "#FFF", fontSize: "1.25rem", cursor: "pointer"
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Children under 4 */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 0" }}>
                                <div>
                                    <p style={{ fontWeight: 600, color: "#222", fontSize: "1.1rem" }}>Bébés</p>
                                    <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>Moins de 4 ans (gratuit)</p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <button
                                        onClick={() => setChildrenUnder4(Math.max(0, childrenUnder4 - 1))}
                                        style={{
                                            width: 44, height: 44, borderRadius: "50%", border: "2px solid #E5E7EB",
                                            backgroundColor: "#FFF", fontSize: "1.25rem", cursor: "pointer"
                                        }}
                                    >
                                        -
                                    </button>
                                    <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222", minWidth: "40px", textAlign: "center" }}>
                                        {childrenUnder4}
                                    </span>
                                    <button
                                        onClick={() => setChildrenUnder4(Math.min((selectedPackage?.capacity_max || 10) - adults - children4to12, childrenUnder4 + 1))}
                                        style={{
                                            width: 44, height: 44, borderRadius: "50%", border: "2px solid #E8A87C",
                                            backgroundColor: "#E8A87C", color: "#FFF", fontSize: "1.25rem", cursor: "pointer"
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Total */}
                            <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#F9F5F0", borderRadius: "12px", textAlign: "center" }}>
                                <span style={{ fontSize: "1rem", color: "#7A7A7A" }}>Total: </span>
                                <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#222" }}>{totalGuests} personne{totalGuests > 1 ? "s" : ""}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Contact */}
                {step === 4 && (
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#222", marginBottom: "0.5rem" }}>
                            Vos coordonnées
                        </h1>
                        <p style={{ color: "#7A7A7A", marginBottom: "2rem" }}>
                            Pour vous contacter et confirmer votre réservation
                        </p>
                        <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem", fontWeight: 500 }}>
                                        <User style={{ width: 18, height: 18, color: "#7A7A7A" }} /> Nom complet *
                                    </label>
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="Mohamed Ben Ali"
                                        style={{ width: "100%", padding: "1rem", border: "2px solid #E5E7EB", borderRadius: "12px", fontSize: "1rem" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem", fontWeight: 500 }}>
                                        <Mail style={{ width: 18, height: 18, color: "#7A7A7A" }} /> Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        placeholder="email@exemple.tn"
                                        style={{ width: "100%", padding: "1rem", border: "2px solid #E5E7EB", borderRadius: "12px", fontSize: "1rem" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem", fontWeight: 500 }}>
                                        <Phone style={{ width: 18, height: 18, color: "#7A7A7A" }} /> Téléphone *
                                    </label>
                                    <input
                                        type="tel"
                                        value={guestPhone}
                                        onChange={(e) => setGuestPhone(e.target.value)}
                                        placeholder="+216 XX XXX XXX"
                                        style={{ width: "100%", padding: "1rem", border: "2px solid #E5E7EB", borderRadius: "12px", fontSize: "1rem" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Summary */}
                {step === 5 && (
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#222", marginBottom: "0.5rem" }}>
                            Récapitulatif
                        </h1>
                        <p style={{ color: "#7A7A7A", marginBottom: "2rem" }}>
                            Vérifiez les détails de votre réservation
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                            <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#222", marginBottom: "1.5rem" }}>Détails</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#7A7A7A" }}>Forfait</span>
                                        <span style={{ fontWeight: 600 }}>{selectedPackage?.name}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#7A7A7A" }}>Date</span>
                                        <span style={{ fontWeight: 600 }}>{new Date(selectedDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#7A7A7A" }}>Personnes</span>
                                        <span style={{ fontWeight: 600 }}>{adults} adulte{adults > 1 ? "s" : ""}{children4to12 > 0 ? `, ${children4to12} enfant${children4to12 > 1 ? "s" : ""}` : ""}{childrenUnder4 > 0 ? `, ${childrenUnder4} bébé${childrenUnder4 > 1 ? "s" : ""}` : ""}</span>
                                    </div>
                                    <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "1rem", marginTop: "0.5rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontWeight: 600 }}>Montant estimé</span>
                                            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#E8A87C" }}>{calculatePrice()} DT</span>
                                        </div>
                                        <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginTop: "4px" }}>À payer sur place</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "16px", border: "1px solid #E5E7EB", marginBottom: "1.5rem" }}>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#222", marginBottom: "1rem" }}>Contact</h3>
                                    <p style={{ fontWeight: 500 }}>{guestName}</p>
                                    <p style={{ color: "#7A7A7A" }}>{guestEmail}</p>
                                    <p style={{ color: "#7A7A7A" }}>{guestPhone}</p>
                                </div>
                                <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem", fontWeight: 500 }}>
                                        <MessageSquare style={{ width: 18, height: 18, color: "#7A7A7A" }} /> Demande spéciale (optionnel)
                                    </label>
                                    <textarea
                                        value={specialRequest}
                                        onChange={(e) => setSpecialRequest(e.target.value)}
                                        placeholder="Anniversaire, décoration spéciale, restrictions alimentaires..."
                                        rows={3}
                                        style={{ width: "100%", padding: "1rem", border: "2px solid #E5E7EB", borderRadius: "12px", fontSize: "0.9rem", resize: "none" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Extras info */}
                        <div style={{
                            marginTop: "2rem", padding: "1.5rem", backgroundColor: "#E8A87C10",
                            borderRadius: "12px", border: "1px solid #E8A87C30", display: "flex", alignItems: "center", gap: "12px"
                        }}>
                            <Sparkles style={{ width: 24, height: 24, color: "#E8A87C" }} />
                            <div>
                                <p style={{ fontWeight: 600, color: "#222" }}>Options supplémentaires disponibles</p>
                                <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>
                                    Gâteau personnalisé, décoration anniversaire, menu VIP... Mentionnez vos souhaits dans la demande spéciale.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3rem" }}>
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px", padding: "1rem 2rem",
                                backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "12px", cursor: "pointer", fontWeight: 500
                            }}
                        >
                            <ArrowLeft style={{ width: 18, height: 18 }} /> Retour
                        </button>
                    ) : (
                        <div />
                    )}
                    {step < 5 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px", padding: "1rem 2rem",
                                backgroundColor: canProceed() ? "#E8A87C" : "#E5E7EB",
                                color: canProceed() ? "#FFF" : "#999",
                                border: "none", borderRadius: "12px", cursor: canProceed() ? "pointer" : "not-allowed", fontWeight: 600
                            }}
                        >
                            Continuer <ArrowRight style={{ width: 18, height: 18 }} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px", padding: "1rem 2.5rem",
                                backgroundColor: "#22C55E", color: "#FFF",
                                border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 600, fontSize: "1rem"
                            }}
                        >
                            <CheckCircle2 style={{ width: 20, height: 20 }} />
                            {submitting ? "Envoi en cours..." : "Confirmer ma demande"}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}
