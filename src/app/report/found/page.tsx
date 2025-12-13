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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ImageUpload } from "@/components/form/image-upload";

const formSchema = z.object({
    title: z.string().min(2, "Item name is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.enum(["ELECTRONICS", "CLOTHING", "ID_CARDS", "KEYS", "OTHER"]),
    location_found: z.string().min(2, "Location is required"),
    date_found: z.string().optional(),
    handover_method: z.enum(["will_drop_off", "contact_me"]),
    image_url: z.string().optional(),
});

export default function ReportFoundPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const supabase = supabaseBrowser();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            category: "OTHER",
            location_found: "",
            handover_method: "will_drop_off",
            image_url: "",
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

            const { error } = await supabase.from("items").insert({
                title: values.title,
                description: values.description,
                category: values.category,
                location: values.location_found,
                custody_location: values.handover_method === "will_drop_off" ? "admin_center" : "finder_kept",
                handover_method: values.handover_method,
                date_incident: values.date_found ? new Date(values.date_found).toISOString() : new Date().toISOString(),
                type: "FOUND",
                status: "OPEN",
                image_url: values.image_url,
                user_id: user.id,
            });

            if (error) throw error;

            router.push("/dashboard");
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("Failed to submit report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Report Found Item</h1>
                <p className="text-muted-foreground">
                    Thank you for helping return a lost item!
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
                                <FormLabel>Item Name / Brief Description</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Set of Keys" {...field} />
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
                            name="date_found"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date Found</FormLabel>
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
                        name="location_found"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location Found</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Cafeteria Table 3" {...field} />
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
                                        placeholder="Describe condition and where it was left..."
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
                        name="handover_method"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Handover Decision</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="will_drop_off" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                I will drop it at the Admin Center
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="contact_me" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                I will keep it and wait for contact
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
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
