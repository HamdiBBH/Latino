"use server";

import { createClient } from "@/lib/supabase/server";
import { getLoyaltyTier, getLoyaltyDiscount } from "@/lib/loyalty-utils";

// ============================================
// CUSTOMER OPERATIONS
// ============================================

export interface Customer {
    id: string;
    email: string;
    phone?: string;
    name?: string;
    visit_count: number;
    total_spent: number;
    loyalty_points: number;
    birthday?: string;
    notes?: string;
    first_visit_date?: string;
    last_visit_date?: string;
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
    const supabase = await createClient();

    const { data } = await supabase
        .from("customers")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

    return data;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
    const supabase = await createClient();

    const { data } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

    return data;
}

export async function getTopCustomers(limit: number = 10) {
    const supabase = await createClient();

    const { data } = await supabase
        .from("customers")
        .select("*")
        .order("visit_count", { ascending: false })
        .limit(limit);

    return data || [];
}

export async function createOrUpdateCustomer(
    email: string,
    name: string,
    phone?: string,
    amount?: number
): Promise<{ customer: Customer | null; isNew: boolean }> {
    const supabase = await createClient();

    // Check if customer exists
    const existing = await getCustomerByEmail(email);

    if (existing) {
        // Update existing customer
        const { data } = await supabase
            .from("customers")
            .update({
                visit_count: existing.visit_count + 1,
                total_spent: existing.total_spent + (amount || 0),
                loyalty_points: existing.loyalty_points + Math.floor((amount || 0) / 10),
                last_visit_date: new Date().toISOString().split("T")[0],
                name: name || existing.name,
                phone: phone || existing.phone,
            })
            .eq("id", existing.id)
            .select()
            .single();

        return { customer: data, isNew: false };
    } else {
        // Create new customer
        const { data } = await supabase
            .from("customers")
            .insert({
                email: email.toLowerCase(),
                name,
                phone,
                visit_count: 1,
                total_spent: amount || 0,
                loyalty_points: Math.floor((amount || 0) / 10),
                first_visit_date: new Date().toISOString().split("T")[0],
                last_visit_date: new Date().toISOString().split("T")[0],
            })
            .select()
            .single();

        return { customer: data, isNew: true };
    }
}

export async function updateCustomerBirthday(
    customerId: string,
    birthday: string
): Promise<{ success: boolean }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("customers")
        .update({ birthday })
        .eq("id", customerId);

    return { success: !error };
}

export async function addCustomerNote(
    customerId: string,
    note: string
): Promise<{ success: boolean }> {
    const supabase = await createClient();

    const { data: customer } = await supabase
        .from("customers")
        .select("notes")
        .eq("id", customerId)
        .single();

    const existingNotes = customer?.notes || "";
    const newNote = `[${new Date().toLocaleDateString("fr-FR")}] ${note}`;
    const updatedNotes = existingNotes ? `${newNote}\n${existingNotes}` : newNote;

    const { error } = await supabase
        .from("customers")
        .update({ notes: updatedNotes })
        .eq("id", customerId);

    return { success: !error };
}

// ============================================
// SPECIAL OFFERS
// ============================================

export interface SpecialOffer {
    type: "birthday" | "loyalty" | "returning";
    discount: number;
    message: string;
}

export async function getCustomerOffers(email: string): Promise<SpecialOffer[]> {
    const customer = await getCustomerByEmail(email);
    const offers: SpecialOffer[] = [];

    if (!customer) {
        return offers;
    }

    const tier = getLoyaltyTier(customer.visit_count);

    // Loyalty discount
    const discount = getLoyaltyDiscount(tier);
    if (discount > 0) {
        offers.push({
            type: "loyalty",
            discount,
            message: `Client ${tier.toUpperCase()} : -${discount}%`
        });
    }

    // Birthday offer
    if (customer.birthday) {
        const today = new Date();
        const birthday = new Date(customer.birthday);
        const isBirthdayMonth = today.getMonth() === birthday.getMonth();
        const isBirthdayWeek =
            isBirthdayMonth &&
            Math.abs(today.getDate() - birthday.getDate()) <= 3;

        if (isBirthdayWeek) {
            offers.push({
                type: "birthday",
                discount: 15,
                message: "🎂 Joyeux anniversaire ! -15% offert"
            });
        }
    }

    // Returning customer (hasn't visited in 2+ months)
    if (customer.last_visit_date) {
        const lastVisit = new Date(customer.last_visit_date);
        const daysSinceLastVisit = Math.floor(
            (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastVisit >= 60) {
            offers.push({
                type: "returning",
                discount: 10,
                message: "👋 Content de vous revoir ! -10% de bienvenue"
            });
        }
    }

    return offers;
}

// ============================================
// STATS
// ============================================

export async function getLoyaltyStats() {
    const supabase = await createClient();

    const { data: customers } = await supabase
        .from("customers")
        .select("visit_count, total_spent, loyalty_points");

    if (!customers) return null;

    const tierCounts = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    let totalPoints = 0;
    let totalSpent = 0;
    let repeatCustomers = 0;

    customers.forEach(c => {
        const tier = getLoyaltyTier(c.visit_count);
        tierCounts[tier]++;
        totalPoints += c.loyalty_points;
        totalSpent += c.total_spent;
        if (c.visit_count > 1) repeatCustomers++;
    });

    return {
        totalCustomers: customers.length,
        repeatCustomers,
        repeatRate: customers.length > 0 ? Math.round((repeatCustomers / customers.length) * 100) : 0,
        tierCounts,
        totalPoints,
        totalSpent,
    };
}
