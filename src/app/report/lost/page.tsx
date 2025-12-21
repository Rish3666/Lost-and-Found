"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/form/image-upload";

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.enum(["ELECTRONICS", "CLOTHING", "ID_CARDS", "KEYS", "OTHER"]),
    last_seen_location: z.string().min(2, "Location is required"),
    date_incident: z.string().optional(),
    contact_info: z.string().optional(),
    image_url: z.string().optional(),
    reward_amount: z.number().min(0).optional(),
});

export default function ReportLostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const supabase = supabaseBrowser();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            category: "OTHER",
            last_seen_location: "",
            image_url: "",
            contact_info: "",
            date_incident: "",
            reward_amount: undefined,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            // Append contact info to description if provided
            const finalDescription = values.contact_info
                ? `${values.description}\n\nContact Info: ${values.contact_info}`
                : values.description;

            const { error } = await supabase.from("items").insert({
                title: values.title,
                description: finalDescription,
                category: values.category,
                location: values.last_seen_location,
                date_incident: values.date_incident ? new Date(values.date_incident).toISOString() : new Date().toISOString(),
                type: "LOST",
                status: "OPEN",
                image_url: values.image_url,
                user_id: user.id,
                reward_amount: values.reward_amount,
            });

            if (error) throw error;

            router.push("/dashboard");
        } catch (error) {
            console.error("Error submitting report:", JSON.stringify(error, null, 2));
            alert(`Failed to submit report: ${(error as any).message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Report Lost Item</h1>
                <p className="text-muted-foreground">
                    Provide details to help others find your item.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
                    <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item Image</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        value={field.value || null}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Blue Backpack" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                                            <SelectItem value="CLOTHING">Clothing</SelectItem>
                                            <SelectItem value="ID_CARDS">ID Cards</SelectItem>
                                            <SelectItem value="KEYS">Keys</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date_incident"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date Lost</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="reward_amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reward Amount (₹) - Optional</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 500"
                                        {...field}
                                        onChange={(e) => {
                                            const val = e.target.valueAsNumber;
                                            field.onChange(isNaN(val) ? undefined : val);
                                        }}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="last_seen_location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Seen Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Library, 2nd Floor" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe distinguishing features..."
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="contact_info"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Info (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email or Phone (publicly visible)" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Report"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
