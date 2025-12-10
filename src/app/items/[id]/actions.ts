"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function claimItem(itemId: string) {
    const supabase = await supabaseServer();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "You must be logged in to claim an item." };
    }

    // Check if already claimed by this user
    const { data: existingClaim } = await supabase
        .from("claims")
        .select("id")
        .eq("item_id", itemId)
        .eq("claimant_id", user.id)
        .single();

    if (existingClaim) {
        return { success: false, message: "You have already submitted a claim for this item." };
    }

    const { error } = await supabase.from("claims").insert({
        item_id: itemId,
        claimant_id: user.id,
        status: "PENDING",
        proof_description: "Interested in claiming", // basic default
    });

    if (error) {
        console.error("Claim error:", error);
        return { success: false, message: "Failed to submit claim." };
    }

    revalidatePath(`/items/${itemId}`);
    return { success: true, message: "Claim submitted! The finder will be notified." };
}
