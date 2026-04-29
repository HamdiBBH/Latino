import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  const checks = {
    env: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    database: false,
  };

  if (checks.env) {
    try {
      const supabase = createPublicClient();
      const { error } = await supabase
        .from("site_sections")
        .select("id", { count: "exact", head: true })
        .limit(1);

      checks.database = !error;
    } catch (error) {
      console.error("Health database check failed:", error);
    }
  }

  const healthy = checks.env && checks.database;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
