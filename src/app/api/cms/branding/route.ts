import { NextResponse } from "next/server";
import { getCMSBranding } from "@/lib/cms";

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
    try {
        const branding = await getCMSBranding();
        return NextResponse.json(branding);
    } catch (error) {
        console.error("Error fetching branding:", error);
        return NextResponse.json({}, { status: 500 });
    }
}
