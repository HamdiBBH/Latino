"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import { AvailabilityCalendar } from "@/components/reservation/AvailabilityCalendar";
import { getReservationConfig, ReservationConfig } from "@/app/actions/settings";
import { submitReservationRequest } from "@/app/actions/booking";
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
    Gift,
    UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
    calculateReservationPrice,
    getReservationGuestCount,
    isPackageAllowedForReservation,
    isValidReservationPhone,
    MAX_RESERVATION_GUESTS,
} from "@/lib/reservation-domain";
import PhoneInput from "react-phone-number-input";

interface Package {
    id: string;
    title: string;
    price: number;
    description: string | null;
    image_url: string | null;
    capacity_min?: number;
    capacity_max?: number;
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
    const [config, setConfig] = useState<ReservationConfig | null>(null);

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
        Promise.all([loadPackages(), loadConfig(), loadUserProfile()]);
    }, []);

    const loadUserProfile = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Set email from auth
        if (user.email && !guestEmail) {
            setGuestEmail(user.email);
        }

        // Fetch profile for name and phone
        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", user.id)
            .single();

        if (profile) {
            if (profile.full_name && !guestName) setGuestName(profile.full_name);
            if (profile.phone && !guestPhone) setGuestPhone(profile.phone);
        }
    };

    const loadConfig = async () => {
        const data = await getReservationConfig();
        setConfig(data);
    };

    const loadPackages = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("beach_installations")
            .select("*")
            .eq("is_active", true)
            .order("sort_order");

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

    const calculatePrice = () => {
        if (!selectedPackage) return 0;
        return calculateReservationPrice(selectedPackage.price, adults, children4to12);
    };

    const totalGuests = getReservationGuestCount(adults, children4to12, childrenUnder4);
    const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    const isValidPhone = isValidReservationPhone;

    const canProceed = () => {
        switch (step) {
            case 1: return adults >= 1;
            case 2: return selectedDate !== "";
            case 3: 
                return selectedPackage !== null 
                    && totalGuests <= (selectedPackage?.capacity_max || MAX_RESERVATION_GUESTS)
                    && getFilteredPackages().some(pkg => pkg.id === selectedPackage.id);
            case 4:
                return guestName.trim().length >= 2
                    && isValidEmail(guestEmail)
                    && isValidPhone(guestPhone);
            default: return true;
        }
    };

    const isRestrictedPeriod = () => {
        if (!selectedDate || !config) return false;
        
        const date = new Date(selectedDate);
        const y = date.getFullYear();
        
        const [rStartMonth, rStartDay] = config.restrictionStart.split("-").map(Number);
        const [rEndMonth, rEndDay] = config.restrictionEnd.split("-").map(Number);
        
        const start = new Date(y, rStartMonth - 1, rStartDay);
        const end = new Date(y, rEndMonth - 1, rEndDay);
        
        return date >= start && date <= end;
    };

    const getFilteredPackages = () => {
        if (!config || packages.length === 0) return [];
        
        // Toujours filtrer par capacité maximale
        let available = packages.filter(pkg => totalGuests <= (pkg.capacity_max || MAX_RESERVATION_GUESTS));

        if (isRestrictedPeriod()) {
            available = available.filter(pkg => {
                return isPackageAllowedForReservation(pkg.title, adults, children4to12 + childrenUnder4, selectedDate, config);
            });
        }
        return available;
    };

    const handleSubmit = async () => {
        if (!selectedPackage) return;
        if (!guestName.trim() || !isValidEmail(guestEmail) || !isValidPhone(guestPhone)) {
            alert("Merci de renseigner un nom, un email valide et un numéro de téléphone valide.");
            return;
        }

        setSubmitting(true);
        const result = await submitReservationRequest({
            packageId: selectedPackage.id,
            selectedDate,
            adults,
            children4to12,
            childrenUnder4,
            guestName: guestName.trim(),
            guestEmail: guestEmail.trim().toLowerCase(),
            guestPhone,
            specialRequest: specialRequest.trim(),
        });
        setSubmitting(false);

        if (!result.success) {
            alert(result.error);
            return;
        }

        const { reservation } = result;

        sessionStorage.setItem(`reservation:${reservation.id}`, JSON.stringify(reservation));

        router.push(`/reservation/confirmation/${reservation.id}`);
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
                padding: "1rem clamp(1rem, 4vw, 2rem)",
                borderBottom: "1px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
            }}>
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                        <ArrowLeft style={{ width: 20, height: 20, color: "#7A7A7A" }} />
                        <span style={{ color: "#7A7A7A", fontSize: "0.9rem" }}>Retour</span>
                    </Link>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Logo variant="dark" />
                </div>
                <div style={{ flex: 1 }} />
            </header>

            {/* Progress Bar */}
            <div style={{ backgroundColor: "#FFFFFF", padding: "1.5rem clamp(1rem, 4vw, 2rem)", overflow: "hidden" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
                    {/* Background Progress Line */}
                    <div
                        style={{
                            position: "absolute",
                            top: "20px",
                            left: "10%",
                            right: "10%",
                            height: "4px",
                            backgroundColor: "#E5E7EB",
                            zIndex: 1,
                            transform: "translateY(-50%)",
                        }}
                    />

                    {/* Active Progress Line */}
                    <div
                        style={{
                            position: "absolute",
                            top: "20px",
                            left: "10%",
                            width: `${(step - 1) * 20}%`,
                            height: "4px",
                            backgroundColor: "#E8A87C",
                            zIndex: 2,
                            transform: "translateY(-50%)",
                            transition: "width 0.3s ease",
                        }}
                    />

                    <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 3 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
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
                                        flexShrink: 0,
                                        border: "4px solid #FFFFFF",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    {s < step ? <Check style={{ width: 20, height: 20 }} /> : s}
                                </div>
                                <span
                                    style={{
                                        fontSize: "0.75rem",
                                        color: step >= s ? "#E8A87C" : "#7A7A7A",
                                        marginTop: "8px",
                                        textAlign: "center",
                                        fontWeight: step === s ? 600 : 400,
                                    }}
                                >
                                    {s === 1 && "Personnes"}
                                    {s === 2 && "Date"}
                                    {s === 3 && "Forfait"}
                                    {s === 4 && "Contact"}
                                    {s === 5 && "Récap"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main style={{ maxWidth: "900px", margin: "0 auto", padding: "clamp(1.5rem, 5vw, 2rem) clamp(1.5rem, 5vw, 2rem) 140px" }}>
                {/* Step 3: Package */}
                {step === 3 && (
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#222", marginBottom: "0.5rem" }}>
                            Choisissez votre forfait
                        </h1>
                        <p style={{ color: "#7A7A7A", marginBottom: "2rem" }}>
                            Sélectionnez le forfait qui vous convient
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "2rem" }}>
                            {/* Colonne gauche : liste déroulante ou grille des forfaits */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem", height: "fit-content" }}>
                            {getFilteredPackages().length === 0 ? (
                                <div style={{ backgroundColor: "#FEE2E2", padding: "1.5rem", borderRadius: "12px", border: "1px solid #EF4444", color: "#B91C1C", gridColumn: "1 / -1" }}>
                                    <p style={{ fontWeight: 600 }}>Oups !</p>
                                    <p>Aucune installation n'est disponible pour la date sélectionnée et pour {totalGuests} personnes.</p>
                                </div>
                            ) : (
                                getFilteredPackages().map((pkg) => (
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
                                            <Image src={pkg.image_url} alt={pkg.title} fill style={{ objectFit: "cover" }} />
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
                                        <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#222", marginBottom: "0.5rem" }}>{pkg.title}</h3>
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
                                ))
                            )}
                            </div>
                            
                            {/* Colonne droite : panel dynamic "Votre forfait" */}
                            <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "16px", border: "1px solid #E5E7EB", height: "fit-content" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", fontWeight: 600 }}>
                                    <Umbrella style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                    Votre forfait
                                </label>

                                {selectedPackage ? (
                                    <div style={{ backgroundColor: "#F9F5F0", padding: "1.25rem", borderRadius: "12px", marginBottom: "1rem" }}>
                                        <h4 style={{ fontWeight: 600, color: "#222", marginBottom: "0.5rem" }}>
                                            {selectedPackage.title}
                                        </h4>
                                        <p style={{ fontSize: "0.875rem", color: "#7A7A7A", marginBottom: "0.75rem" }}>
                                            {selectedPackage.description}
                                        </p>
                                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#E8A87C" }}>
                                            {selectedPackage.price}
                                            <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#7A7A7A" }}> /adulte</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: "#7A7A7A", fontSize: "0.875rem", marginBottom: "1rem" }}>
                                        Sélectionnez une installation pour voir le détail de l'offre.
                                    </p>
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
                                        Bébés &lt; 4 ans : Gratuit (sans consommation)
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7A7A7A" }}>
                                        <Check style={{ width: 16, height: 16, color: "#22C55E" }} />
                                        Traversée en bateau incluse
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7A7A7A" }}>
                                        <Check style={{ width: 16, height: 16, color: "#22C55E" }} />
                                        Parking privé gratuit
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7A7A7A" }}>
                                        <Check style={{ width: 16, height: 16, color: "#22C55E" }} />
                                        Déjeuner inclus
                                    </div>
                                </div>
                            </div>
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
                        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                            <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", fontWeight: 600 }}>
                                    <Calendar style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                    Sélectionnez une date
                                </label>
                                {config ? (
                                    <AvailabilityCalendar
                                        selectedDate={selectedDate}
                                        onDateSelect={setSelectedDate}
                                        packageId={selectedPackage?.id}
                                        config={config}
                                    />
                                ) : (
                                    <div style={{ padding: "2rem", textAlign: "center", color: "#7A7A7A" }}>
                                        Chargement du calendrier...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1: Guests */}
                {step === 1 && (
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#222", marginBottom: "0.5rem" }}>
                            Nombre de personnes
                        </h1>
                        <p style={{ color: "#7A7A7A", marginBottom: "2rem" }}>
                            Les installations disponibles dépendront de la taille de votre groupe
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
                                        onClick={() => setAdults(Math.min(MAX_RESERVATION_GUESTS - children4to12 - childrenUnder4, adults + 1))}
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
                                        onClick={() => setChildren4to12(Math.min(MAX_RESERVATION_GUESTS - adults - childrenUnder4, children4to12 + 1))}
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
                                    <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>Moins de 4 ans (gratuit sans consommation)</p>
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
                                        onClick={() => setChildrenUnder4(Math.min(MAX_RESERVATION_GUESTS - adults - children4to12, childrenUnder4 + 1))}
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
                                        <User style={{ width: 18, height: 18, color: "#7A7A7A" }} /> Nom complet
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
                                        <Mail style={{ width: 18, height: 18, color: "#7A7A7A" }} /> Email
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
                                    <div className="phone-input-wrapper">
                                        <PhoneInput
                                            international
                                            defaultCountry="TN"
                                            value={guestPhone}
                                            onChange={(val) => setGuestPhone(val || "")}
                                            countrySelectProps={{ unicodeFlags: true }}
                                        />
                                    </div>
                                    {guestPhone.trim() !== "" && !isValidPhone(guestPhone) && (
                                        <p style={{ color: "#EF4444", fontSize: "0.875rem", marginTop: "4px" }}>
                                            Numéro de téléphone invalide.
                                        </p>
                                    )}
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
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "2rem" }}>
                            <div style={{ backgroundColor: "#FFF", padding: "2rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#222", marginBottom: "1.5rem" }}>Détails</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#7A7A7A" }}>Forfait</span>
                                        <span style={{ fontWeight: 600 }}>{selectedPackage?.title}</span>
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

                        {/* ===== Member Promo Card ===== */}
                        <div style={{
                            marginTop: "1.5rem",
                            borderRadius: "16px",
                            overflow: "hidden",
                            background: "linear-gradient(135deg, #0A1628 0%, #0F2040 100%)",
                            border: "1px solid rgba(232,168,124,0.2)",
                            display: "flex",
                            alignItems: "stretch",
                        }}>
                            {/* Color accent bar */}
                            <div style={{
                                width: "6px",
                                background: "linear-gradient(180deg, #E8A87C, #D4905A)",
                                flexShrink: 0,
                            }} />
                            <div style={{
                                padding: "1.5rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1.25rem",
                                flex: 1,
                                flexWrap: "wrap",
                            }}>
                                {/* Icon */}
                                <div style={{
                                    width: 52, height: 52, borderRadius: "14px",
                                    background: "linear-gradient(135deg, #E8A87C, #D4905A)",
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                    boxShadow: "0 6px 20px rgba(232,168,124,0.3)",
                                }}>
                                    <Gift style={{ width: 26, height: 26, color: "#fff" }} />
                                </div>
                                {/* Text */}
                                <div style={{ flex: 1, minWidth: "180px" }}>
                                    <p style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", margin: "0 0 4px" }}>
                                        🌴 Rejoignez la famille Latino Coucou Beach !
                                    </p>
                                    <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>
                                        Créez votre compte et profitez de réductions exclusives sur tous nos forfaits, ainsi que d&apos;un accès prioritaire à nos événements.
                                    </p>
                                </div>
                                {/* CTA */}
                                <Link
                                    href="/register"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "12px 22px",
                                        borderRadius: "10px",
                                        background: "linear-gradient(135deg, #E8A87C, #D4905A)",
                                        color: "#FFFFFF",
                                        fontSize: "0.875rem",
                                        fontWeight: 700,
                                        textDecoration: "none",
                                        flexShrink: 0,
                                        boxShadow: "0 4px 14px rgba(232,168,124,0.35)",
                                        letterSpacing: "0.2px",
                                    }}
                                >
                                    <UserPlus style={{ width: 16, height: 16 }} />
                                    Créer mon compte
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sticky Navigation */}
                <div style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                    padding: "1rem clamp(1rem, 5vw, 2rem)",
                    paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
                    zIndex: 100,
                    boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.04)"
                }}>
                    <div style={{
                        maxWidth: "900px",
                        margin: "0 auto",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
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
                </div>
            </main>
        </div>
    );
}
