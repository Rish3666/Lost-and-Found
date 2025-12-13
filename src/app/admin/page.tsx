"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Loader2, Check, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
            alert("Claim updated successfully");
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to update claim");
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
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <div className="mb-8 border-b pb-4">
                <h1 className="flex items-center gap-2 text-3xl font-bold">
                    <ShieldAlert className="h-8 w-8 text-primary" />
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground">Manage pending claims and oversee platform activity.</p>
            </div>

            <div>
                <h2 className="mb-4 text-xl font-semibold">Pending Claims ({claims?.length || 0})</h2>

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

                                    <div className="flex flex-col gap-2 justify-center">
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
            </div>
        </div>
    );
}
