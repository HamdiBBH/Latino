"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, UserRound, Umbrella, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DatePickerDropdown } from "@/components/reservation/DatePickerDropdown";

interface Package {
    id: string;
    name: string;
    capacity_min: number;
    capacity_max: number;
}

export function BookingBar() {
    const router = useRouter();
    const [packages, setPackages] = useState<Package[]>([]);
    const [formData, setFormData] = useState({
        type: "",
        date: "",
        adults: "",
        children: "0",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("packages")
            .select("id, name, capacity_min, capacity_max")
            .eq("is_active", true)
            .order("display_order");
        if (data) setPackages(data);
    };

    const selectedPackage = packages.find(p => p.id === formData.type);
    const maxCapacity = selectedPackage?.capacity_max || 10;
    const minCapacity = selectedPackage?.capacity_min || 1;

    // Generate person options based on selected package capacity
    const adultOptions = [];
    for (let i = minCapacity; i <= maxCapacity; i++) {
        adultOptions.push(i);
    }

    const childrenOptions = [0, 1, 2, 3, 4, 5];

    const handleSubmit = () => {
        if (!formData.type || !formData.date || !formData.adults) {
            // Redirect to reservation page with whatever data we have
            const params = new URLSearchParams();
            if (formData.type) params.set("type", formData.type);
            if (formData.date) params.set("date", formData.date);
            if (formData.adults) params.set("adults", formData.adults);
            if (formData.children && formData.children !== "0") params.set("children", formData.children);
            router.push(`/reservation?${params.toString()}`);
            return;
        }

        setIsLoading(true);
        const params = new URLSearchParams();
        params.set("type", formData.type);
        params.set("date", formData.date);
        params.set("adults", formData.adults);
        if (formData.children && formData.children !== "0") params.set("children", formData.children);
        router.push(`/reservation?${params.toString()}`);
    };

    const isComplete = formData.type && formData.date && formData.adults;

    return (
        <div
            style={{
                position: "relative",
                zIndex: 50,
                marginTop: "-60px",
                marginBottom: "-60px",
                padding: "0 1.5rem",
                maxWidth: "1280px",
                marginLeft: "auto",
                marginRight: "auto",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "24px",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
                    overflow: "hidden",
                    flexWrap: "wrap",
                }}
            >
                {/* Forfait (Package) */}
                <div
                    style={{
                        flex: "1 1 200px",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "2rem",
                        borderRight: "1px solid #eee",
                    }}
                >
                    <div
                        style={{
                            width: "45px",
                            height: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#F9F5F0",
                            borderRadius: "50%",
                            color: "#222222",
                            flexShrink: 0,
                        }}
                    >
                        <Umbrella style={{ width: 18, height: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#222222",
                                marginBottom: "4px",
                            }}
                        >
                            Forfait
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value, adults: "" })}
                            style={{
                                width: "100%",
                                padding: 0,
                                fontSize: "0.9rem",
                                color: formData.type ? "#222" : "#7A7A7A",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                            }}
                        >
                            <option value="">Sélectionner</option>
                            {packages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Date */}
                <div
                    style={{
                        flex: "1 1 200px",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "2rem",
                        borderRight: "1px solid #eee",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            width: "45px",
                            height: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#F9F5F0",
                            borderRadius: "50%",
                            color: "#222222",
                            flexShrink: 0,
                        }}
                    >
                        <Calendar style={{ width: 18, height: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#222222",
                                marginBottom: "4px",
                            }}
                        >
                            Date
                        </label>
                        <div
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            style={{
                                width: "100%",
                                padding: 0,
                                fontSize: "0.9rem",
                                color: formData.date ? "#222" : "#7A7A7A",
                                cursor: "pointer",
                            }}
                        >
                            {formData.date
                                ? new Date(formData.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                                : "Sélectionner"}
                        </div>
                    </div>
                    {showDatePicker && (
                        <DatePickerDropdown
                            selectedDate={formData.date}
                            onDateSelect={(date) => setFormData({ ...formData, date })}
                            onClose={() => setShowDatePicker(false)}
                            packageId={formData.type}
                        />
                    )}
                </div>

                {/* Adultes */}
                <div
                    style={{
                        flex: "1 1 180px",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "2rem",
                        borderRight: "1px solid #eee",
                    }}
                >
                    <div
                        style={{
                            width: "45px",
                            height: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#F9F5F0",
                            borderRadius: "50%",
                            color: "#222222",
                            flexShrink: 0,
                        }}
                    >
                        <Users style={{ width: 18, height: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#222222",
                                marginBottom: "4px",
                            }}
                        >
                            Adultes
                        </label>
                        <select
                            value={formData.adults}
                            onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                            disabled={!formData.type}
                            style={{
                                width: "100%",
                                padding: 0,
                                fontSize: "0.9rem",
                                color: formData.adults ? "#222" : "#7A7A7A",
                                border: "none",
                                background: "transparent",
                                cursor: formData.type ? "pointer" : "not-allowed",
                                opacity: formData.type ? 1 : 0.5,
                            }}
                        >
                            <option value="">{formData.type ? "Choisir" : "—"}</option>
                            {adultOptions.map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Enfants */}
                <div
                    style={{
                        flex: "1 1 180px",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "2rem",
                    }}
                >
                    <div
                        style={{
                            width: "45px",
                            height: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#F9F5F0",
                            borderRadius: "50%",
                            color: "#222222",
                            flexShrink: 0,
                        }}
                    >
                        <UserRound style={{ width: 18, height: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#222222",
                                marginBottom: "4px",
                            }}
                        >
                            Enfants <span style={{ fontWeight: 400, fontSize: "0.75rem", color: "#7A7A7A" }}>(4-12 ans)</span>
                        </label>
                        <select
                            value={formData.children}
                            onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                            style={{
                                width: "100%",
                                padding: 0,
                                fontSize: "0.9rem",
                                color: "#222",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                            }}
                        >
                            {childrenOptions.map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "2rem 3rem",
                        backgroundColor: isComplete ? "#E8A87C" : "#222222",
                        color: "#FFFFFF",
                        fontSize: "1rem",
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.3s ease",
                    }}
                >
                    {isLoading ? "..." : "Réserver"}
                    {!isLoading && <ArrowRight style={{ width: 18, height: 18 }} />}
                </button>
            </div>
        </div>
    );
}

