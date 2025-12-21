"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { ItemCard } from "@/components/ui/item-card";
import { Loader2 } from "lucide-react";

export default function RewardsPage() {
    const supabase = supabaseBrowser();

    const { data: items, isLoading } = useQuery({
        queryKey: ["items-rewards"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("items")
                .select("*")
                .gt("reward_amount", 0)
                .eq("status", "OPEN")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Reward Items</h1>
                <p className="text-muted-foreground">
                    Items with rewards offered for their return.
                </p>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : items && items.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((item) => (
                        <ItemCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            description={item.description || null}
                            location={item.location || null}
                            imageUrl={item.image_url}
                            date={item.date_incident || item.created_at}
                            type={item.type}
                            category={item.category}
                            reward_amount={item.reward_amount}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
                    <p className="text-lg font-medium text-muted-foreground">
                        No active rewards found
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Check back later!
                    </p>
                </div>
            )}
        </div>
    );
}
