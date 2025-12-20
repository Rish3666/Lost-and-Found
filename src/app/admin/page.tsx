"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Loader2, Check, X, ShieldAlert, Trash2, Package, Users, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
    const supabase = supabaseBrowser();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    // Check admin status
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role !== "admin") {
                router.push("/"); // Redirect non-admins
            } else {
                setIsAdmin(true);
            }
        };
        checkAdmin();
    }, [router, supabase]);

    // --- QUERIES ---

    // 1. Stats
    const { data: stats, error: statsError } = useQuery({
        queryKey: ["admin-stats"],
        enabled: isAdmin === true,
        queryFn: async () => {
            const itemsCount = await supabase.from("items").select("*", { count: "exact", head: true }).eq("is_deleted", false);
            const deletedItemsCount = await supabase.from("items").select("*", { count: "exact", head: true }).eq("is_deleted", true);
            const usersCount = await supabase.from("profiles").select("*", { count: "exact", head: true });
            const claimsCount = await supabase.from("claims").select("*", { count: "exact", head: true }).eq("status", "PENDING");

            if (itemsCount.error) throw itemsCount.error; // Throw if main query fails

            return {
                items: itemsCount.count || 0,
                deletedItems: deletedItemsCount.count || 0,
                users: usersCount.count || 0,
                pendingClaims: claimsCount.count || 0
            };
        }
    });

    // 2. Pending Claims
    const { data: claims, isLoading: claimsLoading } = useQuery({
        queryKey: ["admin-claims"],
        enabled: isAdmin === true,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("claims")
                .select("*, items(*), profiles!claimant_id(full_name, email)")
                .eq("status", "PENDING")
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data;
        },
    });

    // 3. All Items (Active)
    const { data: allItems, isLoading: itemsLoading, error: itemsError } = useQuery({
        queryKey: ["admin-items"],
        enabled: isAdmin === true,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("items")
                .select("*, profiles(full_name)")
                .eq("is_deleted", false)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    // 4. Deleted Items
    const { data: deletedItems, isLoading: deletedItemsLoading } = useQuery({
        queryKey: ["admin-deleted-items"],
        enabled: isAdmin === true,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("items")
                .select("*, profiles(full_name)")
                .eq("is_deleted", true)
                .order("deleted_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    // --- MUTATIONS ---

    const updateClaim = useMutation({
        mutationFn: async ({ id, status, itemId }: { id: string; status: "APPROVED" | "REJECTED"; itemId: string }) => {
            // Update claim status
            const { error } = await supabase
                .from("claims")
                .update({ status })
                .eq("id", id);
            if (error) throw error;

            // If approved, update item status to CLAIMED
            if (status === "APPROVED") {
                await supabase.from("items").update({ status: "CLAIMED" }).eq("id", itemId);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            queryClient.invalidateQueries({ queryKey: ["admin-items"] });
            alert("Claim updated successfully");
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to update claim");
        }
    });

    const deleteItem = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("items")
                .update({ is_deleted: true, deleted_at: new Date().toISOString() })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-items"] });
            queryClient.invalidateQueries({ queryKey: ["admin-deleted-items"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
        onError: (error) => {
            alert("Failed to delete item: " + error.message);
        }
    });

    const restoreItem = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("items")
                .update({ is_deleted: false, deleted_at: null })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-items"] });
            queryClient.invalidateQueries({ queryKey: ["admin-deleted-items"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
        onError: (error) => {
            alert("Failed to restore item: " + error.message);
        }
    });

    if (isAdmin === null) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8 flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="flex items-center gap-2 text-3xl font-bold">
                        <ShieldAlert className="h-8 w-8 text-primary" />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">Manage platform activity and moderation.</p>
                </div>
                <div className="flex gap-2">
                    {/* Add extra header actions if needed */}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.items || 0}</div>
                        <p className="text-xs text-muted-foreground">Reported across platform</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deleted Items</CardTitle>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.deletedItems || 0}</div>
                        <p className="text-xs text-muted-foreground">Soft deleted items</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.users || 0}</div>
                        <p className="text-xs text-muted-foreground">Registered profiles</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pendingClaims || 0}</div>
                        <p className="text-xs text-muted-foreground">Requiring review</p>
                    </CardContent>
                </Card>
            </div>

            {statsError && (
                <div className="mb-8 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                    <p className="font-bold">Error loading stats:</p>
                    <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(statsError, null, 2)}</pre>
                </div>
            )}

            <Tabs defaultValue="claims" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="claims">Pending Claims</TabsTrigger>
                    <TabsTrigger value="items">All Items</TabsTrigger>
                    <TabsTrigger value="deleted">Deleted Items</TabsTrigger>
                </TabsList>

                {/* TAB: CLAIMS */}
                <TabsContent value="claims" className="space-y-4">
                    {claimsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}
                        </div>
                    ) : claims?.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                            No pending claims to review.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {claims?.map((claim) => (
                                <div key={claim.id} className="rounded-xl border bg-card p-6 shadow-sm">
                                    <div className="grid gap-6 md:grid-cols-[1fr_1fr_auto]">
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-primary">Item Details</h3>
                                            <div className="flex gap-4">
                                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                                                    {claim.items?.image_url ? (
                                                        <img src={claim.items.image_url} alt="Item" className="h-full w-full object-cover" />
                                                    ) : null}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{claim.items?.title}</p>
                                                    <p className="text-xs text-muted-foreground uppercase">{claim.items?.type}</p>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{claim.items?.description}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-primary">Claimant & Proof</h3>
                                            <p className="text-sm font-medium">{claim.profiles?.full_name} ({claim.profiles?.email})</p>
                                            <div className="rounded-md bg-muted/50 p-3 text-sm">
                                                <span className="font-semibold text-xs text-muted-foreground block mb-1">PROOF PROVIDED:</span>
                                                {claim.proof_description}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 w-full"
                                                size="sm"
                                                onClick={() => updateClaim.mutate({ id: claim.id, status: "APPROVED", itemId: claim.item_id })}
                                                disabled={updateClaim.isPending}
                                            >
                                                <Check className="mr-2 h-4 w-4" /> Approve
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => updateClaim.mutate({ id: claim.id, status: "REJECTED", itemId: claim.item_id })}
                                                disabled={updateClaim.isPending}
                                            >
                                                <X className="mr-2 h-4 w-4" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-muted-foreground">
                                        Claim ID: {claim.id} • Submitted: {new Date(claim.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* TAB: ALL ITEMS */}
                <TabsContent value="items">
                    <Card>
                        <CardHeader>
                            <CardTitle>Item Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {itemsError ? (
                                <div className="p-8 text-center text-red-400">
                                    <p>Error loading items:</p>
                                    <pre className="mt-2 text-xs">{itemsError.message}</pre>
                                </div>
                            ) : itemsLoading ? (
                                <div className="text-center py-8">Loading items...</div>
                            ) : (
                                <div className="space-y-4">
                                    {allItems?.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                                                    {item.image_url && <img src={item.image_url} className="h-full w-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{item.title}</p>
                                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                                        <Badge variant="outline">{item.type}</Badge>
                                                        <span>{item.status}</span>
                                                        <span>• {new Date(item.created_at).toLocaleDateString()}</span>
                                                        <span>• by {item.profiles?.full_name || "Unknown"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this item?")) deleteItem.mutate(item.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: DELETED ITEMS */}
                <TabsContent value="deleted">
                    <Card>
                        <CardHeader>
                            <CardTitle>Deleted Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {deletedItemsLoading ? (
                                <div className="text-center py-8">Loading deleted items...</div>
                            ) : deletedItems?.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    No deleted items found.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {deletedItems?.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between rounded-lg border p-4 bg-muted/20 opacity-75 hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 overflow-hidden rounded-md bg-muted grayscale">
                                                    {item.image_url && <img src={item.image_url} className="h-full w-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium line-through text-muted-foreground">{item.title}</p>
                                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                                        <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Deleted</Badge>
                                                        <span>Deleted on {item.deleted_at ? new Date(item.deleted_at).toLocaleDateString() : 'Unknown'}</span>
                                                        <span>• by {item.profiles?.full_name || "Unknown"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm("Restore this item?")) restoreItem.mutate(item.id);
                                                }}
                                                className="gap-2"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                Restore
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
