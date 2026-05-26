import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import UsersTable from "./UsersTable";
import type { Profile } from "@/types";

export default async function UsersPage() {
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
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-accent shrink-0" />
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Gestion des Utilisateurs
                    </h1>
                </div>
                <p className="text-gray-500 text-sm max-w-2xl">
                    Visualisez les comptes inscrits sur la plateforme et modifiez leurs rôles pour attribuer des accès de Manager, Développeur ou Staff.
                </p>
            </div>

            {/* Interactive Users Table */}
            <UsersTable initialUsers={users} currentUserId={currentUser?.id} />
        </div>
    );
}
