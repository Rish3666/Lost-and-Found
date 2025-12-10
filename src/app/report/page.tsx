"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitItem } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud, MapPin, Calendar, Type, FileText } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function ReportPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(event.currentTarget);
        if (imageUrl) {
            formData.append("imageUrl", imageUrl);
        }

        const result = await submitItem(null, formData);

        if (result.success) {
            setMessage({ type: "success", text: result.message });
            setTimeout(() => router.push("/items"), 2000);
        } else {
            setMessage({ type: "error", text: result.message });
            setLoading(false);
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const supabase = supabaseBrowser();

        // Assuming 'items' bucket exists. If not, this will fail.
        // In a real app, you'd handle bucket existence or use a public bucket.
        const { error: uploadError } = await supabase.storage.from('items').upload(filePath, file);

        if (uploadError) {
            console.error(uploadError);
            alert('Error uploading image');
            setUploading(false);
            return;
        }

        const { data } = supabase.storage.from('items').getPublicUrl(filePath);
        setImageUrl(data.publicUrl);
        setUploading(false);
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">Report an Item</h1>
                <p className="text-muted-foreground">
                    Fill in the details below to help students locate their lost items.
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {message && (
                        <div
                            className={`rounded-md p-3 text-sm ${message.type === "success"
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                    : "bg-destructive/10 text-destructive"
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">What is it?</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <input
                                    type="radio"
                                    name="type"
                                    value="LOST"
                                    id="type-lost"
                                    className="peer sr-only"
                                    required
                                />
                                <label
                                    htmlFor="type-lost"
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-checked:border-primary peer-checked:text-primary"
                                >
                                    <span className="text-lg font-semibold">I Lost Something</span>
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type="radio"
                                    name="type"
                                    value="FOUND"
                                    id="type-found"
                                    className="peer sr-only"
                                    required
                                />
                                <label
                                    htmlFor="type-found"
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-checked:border-primary peer-checked:text-primary"
                                >
                                    <span className="text-lg font-semibold">I Found Something</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">Title</label>
                            <div className="relative">
                                <Type className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input name="title" id="title" placeholder="Blue North Face Backpack" className="pl-9" required />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium">Category</label>
                                <select
                                    name="category"
                                    id="category"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    <option value="ELECTRONICS">Electronics</option>
                                    <option value="CLOTHING">Clothing</option>
                                    <option value="ID_CARDS">ID Cards</option>
                                    <option value="KEYS">Keys</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="date" className="text-sm font-medium">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input name="date" id="date" type="date" className="pl-9" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="location" className="text-sm font-medium">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input name="location" id="location" placeholder="Engineering Building, Room 101" className="pl-9" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">Description</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <textarea
                                    name="description"
                                    id="description"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Any additional details to identify the item..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Image (Optional)</label>
                            <div className="flex items-center gap-4">
                                <div className={`relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:bg-muted/50 ${uploading ? 'opacity-50' : ''}`}>
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Uploaded" className="h-full w-full object-cover rounded-lg" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                                            <UploadCloud className="h-6 w-6" />
                                            <span>Upload</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={uploading} />
                                </div>
                                {uploading && <p className="text-sm text-muted-foreground animate-pulse">Uploading...</p>}
                                {imageUrl && <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl(null)}>Remove</Button>}
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || uploading}>
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Submit Report
                    </Button>
                </form>
            </div>
        </div>
    );
}
