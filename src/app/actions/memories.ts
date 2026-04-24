"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Type definition for what we expect from the DB
export type ClientMemory = {
    id: string;
    user_id: string;
    image_url: string;
    storage_path: string;
    caption: string | null;
    is_favorite: boolean;
    created_at: string;
};

export async function getUserMemories() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from("client_memories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching memories:", error);
        return [];
    }

    return data as ClientMemory[];
}

export async function uploadMemory(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Non autorisé" };
    }

    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;

    if (!file) {
        return { success: false, error: "Aucun fichier sélectionné" };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filename = `${user.id}/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user-memories")
        .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("user-memories").getPublicUrl(filename);

    // Insert into client_memories table
    const { data: memoryData, error: dbError } = await supabase
        .from("client_memories")
        .insert({
            user_id: user.id,
            image_url: urlData.publicUrl,
            storage_path: filename,
            caption: caption || null,
        })
        .select()
        .single();

    if (dbError) {
        console.error("Error saving memory record:", dbError);
        // Attempt to cleanup file if db insert fails
        await supabase.storage.from("user-memories").remove([filename]);
        return { success: false, error: dbError.message };
    }

    revalidatePath("/dashboard/memories");
    return { success: true, data: memoryData };
}

export async function toggleFavorite(memoryId: string, currentStatus: boolean) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Non autorisé" };
    }

    const { error } = await supabase
        .from("client_memories")
        .update({ is_favorite: !currentStatus })
        .eq("id", memoryId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error toggling favorite:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/memories");
    return { success: true, is_favorite: !currentStatus };
}

export async function deleteMemory(memoryId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Non autorisé" };
    }

    // Get the memory to find the storage path
    const { data: memory } = await supabase
        .from("client_memories")
        .select("storage_path")
        .eq("id", memoryId)
        .eq("user_id", user.id)
        .single();

    if (!memory) {
        return { success: false, error: "Mémoire introuvable" };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from("user-memories")
        .remove([memory.storage_path]);

    if (storageError) {
        console.error("Error deleting from storage:", storageError);
        // Continue to delete from DB anyway to avoid orphaned DB records
    }

    // Delete from database
    const { error: dbError } = await supabase
        .from("client_memories")
        .delete()
        .eq("id", memoryId)
        .eq("user_id", user.id);

    if (dbError) {
        console.error("Error deleting memory:", dbError);
        return { success: false, error: dbError.message };
    }

    revalidatePath("/dashboard/memories");
    return { success: true };
}
