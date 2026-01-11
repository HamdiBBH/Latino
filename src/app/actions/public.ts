"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { BookingFormData, ContactFormData } from "@/types";

/**
 * Create a new reservation
 */
export async function createReservation(data: BookingFormData) {
    try {
        const supabase = await createClient();

        const { error } = await supabase.from("reservations").insert({
            guest_name: data.name,
            guest_email: data.email,
            guest_phone: data.phone,
            type: data.type,
            date: data.date,
            time: data.time,
            guests: data.guests,
            special_requests: data.special_requests,
            status: "pending",
        });

        if (error) throw error;

        revalidatePath("/dashboard/reservations");
        return { success: true, message: "Réservation créée avec succès !" };
    } catch (error) {
        console.error("Error creating reservation:", error);
        return { success: false, message: "Erreur lors de la création de la réservation." };
    }
}

/**
 * Update reservation status
 */
export async function updateReservationStatus(
    id: string,
    status: "pending" | "confirmed" | "cancelled" | "completed"
) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("reservations")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/dashboard/reservations");
        return { success: true };
    } catch (error) {
        console.error("Error updating reservation status:", error);
        return { success: false };
    }
}

/**
 * Submit contact form
 */
export async function submitContactForm(data: ContactFormData) {
    try {
        // TODO: Send email notification
        // For now, just log and return success
        console.log("Contact form submitted:", data);

        return {
            success: true,
            message: "Message envoyé avec succès ! Nous vous répondrons rapidement."
        };
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return {
            success: false,
            message: "Erreur lors de l'envoi du message."
        };
    }
}

/**
 * Subscribe to newsletter
 */
export async function subscribeNewsletter(email: string) {
    try {
        // TODO: Add to newsletter list (Mailchimp, Supabase, etc.)
        console.log("Newsletter subscription:", email);

        return {
            success: true,
            message: "Merci pour votre inscription !"
        };
    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        return {
            success: false,
            message: "Erreur lors de l'inscription."
        };
    }
}
