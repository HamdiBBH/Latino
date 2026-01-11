/**
 * Configuration du restaurant Latino Coucou Beach
 * 
 * Ce fichier contient les constantes de configuration du restaurant
 * qui sont utilisées à travers toute l'application.
 */

// ============================================
// DATES D'OUVERTURE
// ============================================

/**
 * Le restaurant ouvre du 1er juin au 30 septembre de chaque année
 */
export const OPENING_MONTH_START = 6;  // Juin (1-indexed)
export const OPENING_DAY_START = 1;
export const OPENING_MONTH_END = 9;    // Septembre (1-indexed)
export const OPENING_DAY_END = 30;

/**
 * Vérifie si une date est dans la période d'ouverture
 */
export function isWithinOpeningSeason(date: Date): boolean {
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();

    // Before June 1st
    if (month < OPENING_MONTH_START) return false;
    if (month === OPENING_MONTH_START && day < OPENING_DAY_START) return false;

    // After September 30th
    if (month > OPENING_MONTH_END) return false;
    if (month === OPENING_MONTH_END && day > OPENING_DAY_END) return false;

    return true;
}

/**
 * Retourne la prochaine date d'ouverture à partir d'aujourd'hui
 */
export function getNextOpeningDate(): Date {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Opening date this year
    const openingThisYear = new Date(currentYear, OPENING_MONTH_START - 1, OPENING_DAY_START);

    // If we haven't reached the opening yet this year
    if (today < openingThisYear) {
        return openingThisYear;
    }

    // Check if we're within the season
    const closingThisYear = new Date(currentYear, OPENING_MONTH_END - 1, OPENING_DAY_END);
    if (today <= closingThisYear) {
        return today; // Already open
    }

    // Next year's opening
    return new Date(currentYear + 1, OPENING_MONTH_START - 1, OPENING_DAY_START);
}

/**
 * Retourne la date de fermeture de la saison en cours
 */
export function getClosingDate(year?: number): Date {
    const y = year || new Date().getFullYear();
    return new Date(y, OPENING_MONTH_END - 1, OPENING_DAY_END);
}

/**
 * Retourne le statut d'ouverture actuel
 */
export function getOpeningStatus(): { isOpen: boolean; message: string; daysUntilOpen?: number; daysUntilClose?: number } {
    const today = new Date();

    if (isWithinOpeningSeason(today)) {
        const closingDate = getClosingDate();
        const daysUntilClose = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
            isOpen: true,
            message: `Ouvert jusqu'au 30 septembre`,
            daysUntilClose,
        };
    }

    const nextOpening = getNextOpeningDate();
    const daysUntilOpen = Math.ceil((nextOpening.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
        isOpen: false,
        message: `Réouverture le 1er juin ${nextOpening.getFullYear()}`,
        daysUntilOpen,
    };
}

// ============================================
// OFFRES SPÉCIALES PAR JOUR DE LA SEMAINE
// ============================================

export interface SpecialOffer {
    type: "discount" | "free_children";
    value: string;
    description: string;
}

/**
 * Offres spéciales par jour de la semaine
 * 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
 */
export const WEEKLY_OFFERS: Record<number, SpecialOffer> = {
    3: { type: "free_children", value: "2", description: "2 enfants gratuits" }, // Mercredi
    5: { type: "discount", value: "-20%", description: "-20% sur votre réservation" }, // Vendredi
};

// ============================================
// TARIFICATION
// ============================================

/**
 * Prix par enfant (4-12 ans) - fixe pour tous les forfaits
 */
export const CHILD_PRICE = 45; // DT

/**
 * Les enfants de moins de 4 ans sont gratuits
 */
export const FREE_AGE_LIMIT = 4;

// ============================================
// CAPACITÉ
// ============================================

/**
 * Capacité maximale journalière du restaurant
 */
export const MAX_DAILY_CAPACITY = 50;

// ============================================
// CONTACT & LOCALISATION
// ============================================

export const RESTAURANT_INFO = {
    name: "Latino Coucou Beach",
    location: "Coucou Beach, Ghar El Melh",
    country: "Tunisie",
    phone: "+216 50 607 072",
    email: "contact@latinocoucoubeach.com",
    currency: "DT",
    currencySymbol: "DT",
    coordinates: {
        lat: 37.14232000325309,
        lng: 10.21041432304559,
    },
    googleMapsUrl: "https://www.google.com/maps?q=37.14232000325309,10.21041432304559",
    hours: "9h - 19h",
    season: "1er Juin - 30 Septembre",
};
