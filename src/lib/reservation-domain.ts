import type { ReservationConfig } from "@/app/actions/settings";
import { CHILD_PRICE } from "@/lib/config";

export const MAX_RESERVATION_GUESTS = 15;

export type ReservablePackage = {
  name: string;
  price: string | number | null;
  capacity_max?: number | null;
};

export function normalizePhone(phone: string) {
  return phone.replace(/[\s()-]/g, "");
}

export function isValidReservationPhone(phone: string) {
  return /^\+?\d{8,15}$/.test(normalizePhone(phone));
}

export function parsePackagePrice(price: string | number | null) {
  if (typeof price === "number") return price;
  const match = price?.match(/[\d.]+/);
  return match ? Number.parseFloat(match[0]) : 0;
}

export function calculateReservationPrice(packagePrice: string | number | null, adults: number, children4to12: number) {
  return Math.round(adults * parsePackagePrice(packagePrice) + children4to12 * CHILD_PRICE);
}

export function getReservationGuestCount(adults: number, children4to12: number, childrenUnder4: number) {
  return adults + children4to12 + childrenUnder4;
}

export function isPackageAllowedForReservation(
  packageName: string,
  adults: number,
  children: number,
  selectedDate: string,
  config: ReservationConfig
) {
  const [year] = selectedDate.split("-").map(Number);
  const [startMonth, startDay] = config.restrictionStart.split("-").map(Number);
  const [endMonth, endDay] = config.restrictionEnd.split("-").map(Number);
  const date = new Date(`${selectedDate}T00:00:00`);
  const restrictionStart = new Date(year, startMonth - 1, startDay);
  const restrictionEnd = new Date(year, endMonth - 1, endDay);

  if (date < restrictionStart || date > restrictionEnd) return true;

  const name = packageName.toLowerCase();
  if (name.includes("parasol")) return adults <= config.rules.parasolMaxAdults;
  if (name.includes("cabane") && !name.includes("vip")) {
    return adults >= config.rules.cabaneMinAdults || (adults === 2 && children >= 2);
  }
  if (name.includes("paillote")) return adults >= config.rules.pailloteMinAdults;
  if (name.includes("vip")) return adults >= config.rules.vipMinAdults;
  return true;
}
