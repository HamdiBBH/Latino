import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "./AdminLayoutClient";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user profile with role
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const userInfo = {
        id: user.id,
        email: user.email || "",
        fullName: profile?.full_name || "Utilisateur",
        role: profile?.role || "CLIENT",
        avatarUrl: profile?.avatar_url,
    };

    return <AdminLayoutClient user={userInfo}>{children}</AdminLayoutClient>;
}
