import { seedMenuItems } from "@/app/actions/seedMenu";
import { NextResponse } from "next/server";

// Temporary endpoint to seed menu items
// DELETE THIS FILE AFTER SEEDING

export async function GET() {
    const result = await seedMenuItems();
    return NextResponse.json(result);
}
