"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    type: z.enum(["LOST", "FOUND"]),
    category: z.enum(["ELECTRONICS", "CLOTHING", "ID_CARDS", "KEYS", "OTHER"]),
    location: z.string().min(2),
    date: z.string().optional(),
    imageUrl: z.string().optional().nullable(),
});

export async function submitItem(prevState: any, formData: FormData) {
    const supabase = await supabaseServer();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "You must be logged in to report an item." };
    }

    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        type: formData.get("type"),
        category: formData.get("category"),
        location: formData.get("location"),
        date: formData.get("date"),
        imageUrl: formData.get("imageUrl"),
    };

    try {
        const validatedData = schema.parse(rawData);

        // Convert date to ISO string if present
        const dateIncident = validatedData.date
            ? new Date(validatedData.date).toISOString()
            : new Date().toISOString();

        const { error } = await supabase.from("items").insert({
            title: validatedData.title,
            description: validatedData.description,
            type: validatedData.type as "LOST" | "FOUND",
            category: validatedData.category as any,
            location: validatedData.location,
            date_incident: dateIncident,
            image_url: validatedData.imageUrl,
            status: "OPEN",
            user_id: user.id,
        });

        if (error) {
            console.error("Supabase error:", error);
            return { success: false, message: `Failed to submit item: ${error.message} (Code: ${error.code})` };
        }

        revalidatePath("/items");
        revalidatePath("/");

        // Return success to the client component to trigger redirect or success message
        return { success: true, message: "Item reported successfully!" };
    } catch (e) {
        if (e instanceof z.ZodError) {
            return { success: false, message: "Invalid data: " + e.issues[0].message };
        }
        return { success: false, message: "An unexpected error occurred." };
    }
}
