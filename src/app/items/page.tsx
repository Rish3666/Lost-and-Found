"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MapPin, Search } from "lucide-react";

export default function ItemsPage() {
    const supabase = supabaseBrowser();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>("ALL");
    const [itemType, setItemType] = useState<string>("ALL");

    const { data: items, isLoading } = useQuery({
        queryKey: ["items", search, category, itemType],
        queryFn: async () => {
            let query = supabase.from("items").select("*").eq("status", "OPEN").order("created_at", { ascending: false });

            if (search) {
                query = query.ilike("title", `%${search}%`);
            }

            if (category !== "ALL") {
                query = query.eq("category", category);
            }

            if (itemType !== "ALL") {
                query = query.eq("type", itemType);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Browse Items</h1>
                    <p className="text-muted-foreground">Find lost items or see what's been found.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/report/lost">I Lost Something</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/report/found">I Found Something</Link>
                    </Button>
                </div>
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-[1fr_200px_200px]">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search items..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Categories</SelectItem>
                        <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                        <SelectItem value="CLOTHING">Clothing</SelectItem>
                        <SelectItem value="ID_CARDS">ID Cards</SelectItem>
                        <SelectItem value="KEYS">Keys</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={itemType} onValueChange={setItemType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="LOST">Lost</SelectItem>
                        <SelectItem value="FOUND">Found</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
                    ))}
                </div>
            ) : items?.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No items found matching your filters.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items?.map((item) => (
                        <Link key={item.id} href={`/items/${item.id}`}>
                            <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
                                <div className="aspect-video w-full overflow-hidden bg-muted">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.type === 'LOST' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                            {item.type}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="mt-2 text-lg font-semibold group-hover:text-primary line-clamp-1">{item.title}</h3>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{item.location || item.last_seen_location || "Unknown location"}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
