import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendReservationConfirmationEmail } from "@/lib/email";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const testTarget = searchParams.get("to");

    const logs: string[] = [];
    const log = (msg: string) => {
        console.log(`[DEBUG-EMAIL] ${msg}`);
        logs.push(msg);
    };

    try {
        // Step 1: Check SMTP vars
        log("Step 1: Checking env vars...");
        const smtpVars = {
            SMTP_HOST: !!process.env.SMTP_HOST,
            SMTP_PORT: !!process.env.SMTP_PORT,
            SMTP_USER: !!process.env.SMTP_USER,
            SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
        };
        log(`SMTP vars: ${JSON.stringify(smtpVars)}`);

        // Step 2: Create supabase client (same as the server action does)
        log("Step 2: Creating Supabase client...");
        const supabase = await createClient();

        // Step 3: Get auth user
        log("Step 3: Getting authenticated user...");
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        log(`Auth user: ${user ? user.email : "NOT LOGGED IN"}, error: ${authErr?.message || "none"}`);

        // Step 4: Fetch any recent reservation
        log("Step 4: Fetching most recent reservation...");
        const { data: reservations, error: resErr } = await supabase
            .from("reservations")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);

        log(`Reservations query error: ${resErr?.message || "none"}`);
        log(`Reservations found: ${reservations?.length || 0}`);

        if (reservations && reservations.length > 0) {
            const latest = reservations[0];
            log(`Latest reservation: id=${latest.id}, guest=${latest.guest_name}, email=${latest.guest_email}, status=${latest.status}, package_id=${latest.package_id}`);

            // Step 5: Fetch beach_installations
            log("Step 5: Fetching beach installation for package...");
            if (latest.package_id) {
                const { data: installation, error: instErr } = await supabase
                    .from("beach_installations")
                    .select("id, title, description, price")
                    .eq("id", latest.package_id)
                    .single();

                log(`Installation query error: ${instErr?.message || "none"}`);
                log(`Installation found: ${installation ? `${installation.title} (${installation.price} DT)` : "NOT FOUND"}`);
            } else {
                log("No package_id on reservation, skipping installation lookup");
            }

            // Step 6: Try sending email
            const targetEmail = testTarget || latest.guest_email;
            log(`Step 6: Attempting to send confirmation email to: ${targetEmail}`);

            const emailResult = await sendReservationConfirmationEmail({
                guestName: latest.guest_name || "Test Guest",
                guestEmail: targetEmail,
                date: latest.reservation_date,
                packageName: "Test Package",
                adults: latest.adults_count || latest.guest_count || 2,
                children: latest.children_4_12_count || 0,
                totalPrice: latest.estimated_price || 100,
                reservationId: latest.id,
            });

            log(`Email result: ${JSON.stringify(emailResult)}`);
        } else {
            log("No reservations found in DB! Testing direct email send...");

            const targetEmail = testTarget || process.env.MANAGER_EMAIL || "test@test.com";
            log(`Sending test email to: ${targetEmail}`);

            const emailResult = await sendReservationConfirmationEmail({
                guestName: "Test Guest",
                guestEmail: targetEmail,
                date: new Date().toISOString(),
                packageName: "Test Package",
                adults: 2,
                children: 0,
                totalPrice: 100,
            });

            log(`Email result: ${JSON.stringify(emailResult)}`);
        }

        return NextResponse.json({ logs });
    } catch (err: unknown) {
        log(`FATAL ERROR: ${err instanceof Error ? err.message : String(err)}`);
        log(`Stack: ${err instanceof Error ? err.stack : "N/A"}`);
        return NextResponse.json({ logs, fatalError: true });
    }
}
