import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=37.14232&longitude=10.21041&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=uv_index_max,sunset&timezone=Africa%2FTunis",
            { next: { revalidate: 900 } } // Cache 15 min
        );

        if (!res.ok) {
            return NextResponse.json({ error: "Weather API error" }, { status: 502 });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Weather proxy error:", error);
        return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
    }
}
