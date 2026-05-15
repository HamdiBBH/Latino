"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, cleanupRateLimitBuckets } from "@/lib/rate-limit";
import { getReservationConfig } from "@/app/actions/settings";
import { sendManagerNotificationEmail, sendReservationRequestEmail } from "@/lib/email";
import {
  calculateReservationPrice,
  getReservationGuestCount,
  isPackageAllowedForReservation,
  isValidReservationPhone,
  MAX_RESERVATION_GUESTS,
  normalizePhone,
} from "@/lib/reservation-domain";

const reservationSchema = z.object({
  packageId: z.string().uuid(),
  selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(MAX_RESERVATION_GUESTS),
  children4to12: z.number().int().min(0).max(MAX_RESERVATION_GUESTS),
  childrenUnder4: z.number().int().min(0).max(MAX_RESERVATION_GUESTS),
  guestName: z.string().trim().min(2).max(120),
  guestEmail: z.string().trim().email().max(255),
  guestPhone: z.string().trim().min(8).max(30),
  specialRequest: z.string().trim().max(500).optional(),
});

type ReservationPayload = z.infer<typeof reservationSchema>;

type PackageRow = {
  id: string;
  name: string;
  price: string | number | null;
  description: string | null;
  capacity_max: number | null;
};

async function getClientIp() {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

async function checkDurableRateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: string,
  limit: number,
  windowSeconds: number
) {
  const { data, error } = await supabase.rpc("check_public_rate_limit", {
    rate_key: key,
    max_requests: limit,
    window_seconds: windowSeconds,
  });

  if (!error && Array.isArray(data) && data[0]) {
    return { allowed: Boolean(data[0].allowed) };
  }

  console.warn("Durable rate limit unavailable, using local fallback:", error?.message);
  const fallback = checkRateLimit(key, { limit, windowMs: windowSeconds * 1000 });
  return { allowed: fallback.allowed };
}

export async function submitReservationRequest(payload: ReservationPayload) {
  try {
    cleanupRateLimitBuckets();

    const parsed = reservationSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false as const, error: "Les informations de réservation sont invalides." };
    }

    const data = parsed.data;
    const phone = normalizePhone(data.guestPhone);
    if (!isValidReservationPhone(phone)) {
      return { success: false as const, error: "Le numéro de téléphone est invalide." };
    }

    const totalGuests = getReservationGuestCount(data.adults, data.children4to12, data.childrenUnder4);
    if (totalGuests < 1 || totalGuests > MAX_RESERVATION_GUESTS) {
      return { success: false as const, error: "Le nombre de personnes est invalide." };
    }

    const today = new Date().toISOString().split("T")[0];
    if (data.selectedDate < today) {
      return { success: false as const, error: "La date sélectionnée n'est plus disponible." };
    }

    const supabase = await createClient();
    const ip = await getClientIp();
    const ipLimit = await checkDurableRateLimit(supabase, `reservation:ip:${ip}`, 5, 60 * 60);
    const identityLimit = await checkDurableRateLimit(
      supabase,
      `reservation:identity:${data.guestEmail.toLowerCase()}:${phone}`,
      3,
      60 * 60
    );

    if (!ipLimit.allowed || !identityLimit.allowed) {
      return {
        success: false as const,
        error: "Trop de demandes ont été envoyées. Merci de réessayer un peu plus tard.",
      };
    }

    const { data: packageRow, error: packageError } = await supabase
      .from("beach_installations")
      .select("id, title, price, description")
      .eq("id", data.packageId)
      .eq("is_active", true)
      .single();

    if (packageError || !packageRow) {
      return { success: false as const, error: "Le forfait sélectionné n'est plus disponible." };
    }

    if (totalGuests > MAX_RESERVATION_GUESTS) {
      return { success: false as const, error: "Ce forfait ne peut pas accueillir autant de personnes." };
    }

    const config = await getReservationConfig();
    if (!isPackageAllowedForReservation(packageRow.title, data.adults, data.children4to12 + data.childrenUnder4, data.selectedDate, config)) {
      return { success: false as const, error: "Ce forfait n'est pas disponible pour cette période." };
    }

    const estimatedPrice = calculateReservationPrice(packageRow.price, data.adults, data.children4to12);
    const specialRequestParts = [
      `Adultes: ${data.adults}, Enfants 4-12: ${data.children4to12}, Bébés: ${data.childrenUnder4}`,
    ];
    if (data.specialRequest) specialRequestParts.push(data.specialRequest);

    const reservationId = randomUUID();
    const reservation = {
      id: reservationId,
      package_id: packageRow.id,
      guest_name: data.guestName,
      guest_email: data.guestEmail.toLowerCase(),
      guest_phone: phone,
      reservation_date: data.selectedDate,
      time_slot: "full_day",
      guest_count: totalGuests,
      special_request: specialRequestParts.join(". "),
      estimated_price: estimatedPrice,
      status: "pending",
    };

    const { error } = await supabase.from("reservations").insert(reservation);
    if (error) {
      console.error("Reservation insert error:", error);
      return { success: false as const, error: "Erreur lors de l'envoi de la réservation." };
    }

    const emailData = {
      guestName: reservation.guest_name,
      guestEmail: reservation.guest_email,
      date: reservation.reservation_date,
      packageName: packageRow.title,
      adults: data.adults,
      children: data.children4to12 + data.childrenUnder4,
      totalPrice: estimatedPrice,
      reservationId,
    };

    const emailResults = await Promise.allSettled([
      sendReservationRequestEmail(emailData),
      sendManagerNotificationEmail(emailData),
    ]);

    emailResults.forEach((result) => {
      if (result.status === "rejected") console.error("Reservation email error:", result.reason);
    });

    revalidatePath("/dashboard/reservations");

    return {
      success: true as const,
      reservation: {
        ...reservation,
        packages: {
          name: packageRow.title,
          description: packageRow.description || "",
        },
      },
    };
  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return { success: false as const, error: "Exception in server action: " + (err?.message || String(err)) };
  }
}
