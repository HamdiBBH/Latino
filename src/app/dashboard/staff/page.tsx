import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StaffList from "./StaffList";
import type { Profile } from "@/types";

export default async function StaffPage() {
    const supabase = await createClient();

    // Fetch current user
    const {
        data: { user: currentUser },
    } = await supabase.auth.getUser();

    // Fetch all profiles
    const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    const users: Profile[] = (profiles as Profile[]) || [];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                    <Users style={{ width: 32, height: 32, color: "#E8A87C" }} />
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                        Équipe RH
                    </h1>
                </div>
                <p style={{ color: "#7A7A7A" }}>
                    Gérez les comptes de l&apos;établissement, attribuez des rôles de Manager et de Développeur, et contrôlez les accès.
                </p>
            </div>

            {/* Dynamic Staff and User list */}
            <StaffList initialUsers={users} currentUserId={currentUser?.id} />
        </div>
    );
}
