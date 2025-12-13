"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemCard } from "@/components/ui/item-card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const supabase = supabaseBrowser();

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data } = await supabase.auth.getUser();
            return data.user;
        },
    });

    const { data: myItems, isLoading: itemsLoading } = useQuery({
        queryKey: ["my-items", user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("items")
                .select("*")
                .eq("user_id", user!.id)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    const { data: myClaims, isLoading: claimsLoading } = useQuery({
        queryKey: ["my-claims", user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("claims")
                .select("*, items(*)")
                .eq("claimant_id", user!.id)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    if (userLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="mb-4 text-2xl font-bold">Please Log In</h1>
                <Button asChild>
                    <Link href="/login">Go to Login</Link>
                </Button>
            </div>
        );
    }

    const lostItems = myItems?.filter((item) => item.type === "LOST") || [];
    const foundItems = myItems?.filter((item) => item.type === "FOUND") || [];

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Dashboard</h1>
                    <p className="text-muted-foreground">Manage your reports and claims.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild size="sm">
                        <Link href="/report/lost">Report Lost</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/report/found">Report Found</Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="lost" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="lost">Lost Reports ({lostItems.length})</TabsTrigger>
                    <TabsTrigger value="found">Found Reports ({foundItems.length})</TabsTrigger>
                    <TabsTrigger value="claims">My Claims ({myClaims?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="lost" className="mt-6">
                    {itemsLoading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2].map(i => <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />)}
                        </div>
                    ) : lostItems.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            You haven't reported any lost items.
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {lostItems.map((item) => (
                                <ItemCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    location={item.location || item.last_seen_location}
                                    description={item.description}
                                    imageUrl={item.image_url}
                                    date={item.date_incident || item.created_at}
                                    type={item.type}
                                    category={item.category}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="found" className="mt-6">
                    {itemsLoading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2].map(i => <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />)}
                        </div>
                    ) : foundItems.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            You haven't reported any found items.
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {foundItems.map((item) => (
                                <ItemCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    location={item.location || item.last_seen_location}
                                    description={item.description}
                                    imageUrl={item.image_url}
                                    date={item.date_incident || item.created_at}
                                    type={item.type}
                                    category={item.category}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="claims" className="mt-6">
                    {claimsLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
                        </div>
                    ) : myClaims?.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            You haven't made any claims yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myClaims?.map((claim) => (
                                <div key={claim.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                                            {claim.items?.image_url ? (
                                                <img src={claim.items.image_url} alt={claim.items.title} className="h-full w-full object-cover" />
                                            ) : null}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{claim.items?.title || "Unknown Item"}</h3>
                                            <p className="text-sm text-muted-foreground">Claimed on {new Date(claim.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold
                            ${claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}
                         `}>
                                            {claim.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
