import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes safely
 * Combines clsx for conditional classes with tailwind-merge for conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to French locale
 */
export function formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

/**
 * Format time for display (HH:mm)
 */
export function formatTime(time: string): string {
    return time.slice(0, 5);
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currency: string = 'DT'): string {
    return `${amount.toFixed(2)} ${currency}`;
}
