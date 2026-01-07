import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const pathname = request.nextUrl.pathname;

    // Skip auth if Supabase is not configured (development without database)
    if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith("http")) {
        // In dev mode without Supabase, allow all pages except admin
        if (pathname.startsWith("/admin")) {
            // Redirect to login page in dev mode
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Get user session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protect /admin routes
    if (pathname.startsWith("/admin")) {
        if (!user) {
            // Not logged in - redirect to login
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("redirect", pathname);
            return NextResponse.redirect(url);
        }

        // Get user role from profiles
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const userRole = profile?.role || "CLIENT";

        // Role-based route protection
        const routeRoles: Record<string, string[]> = {
            "/admin/site-editor": ["DEV", "ADMIN"],
            "/admin/kitchen": ["RESTAURANT", "ADMIN"],
            "/admin/orders": ["RESTAURANT", "MANAGER", "ADMIN"],
            "/admin/reservations": ["MANAGER", "ADMIN"],
            "/admin/users": ["ADMIN"],
            "/admin/settings": ["ADMIN"],
            "/admin": ["DEV", "CLIENT", "RESTAURANT", "MANAGER", "ADMIN"],
        };

        // Find the most specific matching route
        const matchingRoute = Object.keys(routeRoles)
            .filter((route) => pathname.startsWith(route))
            .sort((a, b) => b.length - a.length)[0];

        if (matchingRoute) {
            const allowedRoles = routeRoles[matchingRoute];
            if (!allowedRoles.includes(userRole)) {
                const url = request.nextUrl.clone();
                url.pathname = "/admin";
                return NextResponse.redirect(url);
            }
        }
    }

    // Redirect authenticated users away from login/register
    if ((pathname === "/login" || pathname === "/register") && user) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
