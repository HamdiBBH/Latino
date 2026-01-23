"use server";

import { createMenuItem } from "@/app/actions/cms";

// Script to seed menu items from paper menu
// Run this once to populate the menu

const menuItems = [
    // Latino's Pasta
    { category: "plats", name: "Tagliatelle sauce Rosso aux crevettes", description: "Pâtes fraîches tagliatelle avec sauce tomate maison et crevettes", price: 35, tags: ["pasta", "fruits-de-mer"] },
    { category: "plats", name: "Spaghetti fruits de mer sauce rouge", description: "Spaghetti aux fruits de mer variés dans une sauce tomate épicée", price: 35, tags: ["pasta", "fruits-de-mer"] },
    { category: "plats", name: "Pâtes Pesto Pene aux crevettes", description: "Penne au pesto frais accompagnées de crevettes grillées", price: 35, tags: ["pasta", "fruits-de-mer"] },
    { category: "plats", name: "Pâtes sauce blanche Escalope", description: "Pâtes crémeuses servies avec escalope de poulet tendre", price: 35, tags: ["pasta", "viande"] },

    // Latino's Seafood
    { category: "plats", name: "Ojja fruits de mer", description: "Spécialité tunisienne aux œufs, tomates et fruits de mer frais", price: 25, tags: ["seafood", "specialite"] },
    { category: "plats", name: "Grande gargoulette Fruits de mer", description: "Généreuse portion de fruits de mer variés cuits à la gargoulette", price: 90, tags: ["seafood", "partage"] },
    { category: "plats", name: "Petite gargoulette Fruits de mer", description: "Portion individuelle de fruits de mer à la gargoulette", price: 60, tags: ["seafood"] },

    // Latino's Grill
    { category: "plats", name: "Grande grillade mixte fruits de mer", description: "Assortiment généreux de poissons et fruits de mer grillés", price: 90, tags: ["grill", "partage"] },
    { category: "plats", name: "Petite grillade mixte fruits de mer", description: "Portion individuelle de grillade mixte", price: 50, tags: ["grill"] },

    // Menu Standard (forfait)
    { category: "entrees", name: "Salade Verte", description: "Salade fraîche de saison - Entrée du Menu Standard", price: 0, tags: ["menu-standard", "entree"] },
    { category: "entrees", name: "Salade Mechouia", description: "Salade tunisienne traditionnelle grillée - Entrée du Menu Standard", price: 0, tags: ["menu-standard", "entree"] },
    { category: "plats", name: "Daurade grillée", description: "Daurade fraîche grillée - Plat principal du Menu Standard", price: 0, tags: ["menu-standard", "grill"] },
    { category: "plats", name: "Escalope grillée", description: "Escalope tendre grillée - Plat principal du Menu Standard", price: 0, tags: ["menu-standard", "viande"] },
    { category: "plats", name: "Cordon bleu", description: "Cordon bleu croustillant - Plat principal du Menu Standard", price: 0, tags: ["menu-standard", "viande"] },
    { category: "desserts", name: "Fruits du jour", description: "Sélection de fruits frais de saison - Dessert du Menu Standard", price: 0, tags: ["menu-standard", "dessert"] },
];

export async function seedMenuItems() {
    let successCount = 0;
    let errorCount = 0;

    for (const item of menuItems) {
        const result = await createMenuItem(item);
        if (result.success) {
            successCount++;
            console.log(`✓ Added: ${item.name}`);
        } else {
            errorCount++;
            console.error(`✗ Failed: ${item.name} - ${result.error}`);
        }
    }

    return { successCount, errorCount, total: menuItems.length };
}
