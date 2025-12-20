"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ItemDetailPage() {
    const { id } = useParams();
    const supabase = supabaseBrowser();
    const router = useRouter();
    const [claimLoading, setClaimLoading] = useState(false);
    const [proof, setProof] = useState("");
    const [claimOpen, setClaimOpen] = useState(false);

    const { data: item, isLoading } = useQuery({
        queryKey: ["item", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("items")
                .select("*, profiles:user_id(full_name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
    });

    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data } = await supabase.auth.getUser();
            return data.user;
        },
    });

    const handleClaim = async () => {
        if (!user) {
            router.push("/login");
            return;
        }
        try {
            setClaimLoading(true);
            const { error } = await supabase.from("claims").insert({
                item_id: id,
                claimant_id: user.id,
                status: "PENDING",
                proof_description: proof,
            });

            if (error) throw error;

            setClaimOpen(false);
            alert("Claim submitted successfully!");
            // Usually we would invalidate queries or redirect
        } catch (error) {
            console.error("Error submitting claim:", error);
            alert("Failed to submit claim.");
        } finally {
            setClaimLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading item details...</div>;
    }

    if (!item) {
        return <div className="p-8 text-center">Item not found.</div>;
    }

    const isOwner = user?.id === item.user_id;

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <Link
                href="/items"
                className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Items
            </Link>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
                    {item.image_url ? (
                        <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    ) : (
                        <div className="flex h-96 w-full items-center justify-center text-muted-foreground">
                            No Image Available
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <div className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${item.type === 'LOST' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {item.type}
                        </div>
                        <h1 className="mt-4 text-3xl font-bold">{item.title}</h1>
                        <div className="mt-2 text-lg text-muted-foreground">
                            Category: {item.category}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border">
                        <div className="flex items-start gap-3">
                            <MapPin className="mt-1 h-5 w-5 text-primary" />
                            <div>
                                <p className="font-semibold">Location</p>
                                <p className="text-muted-foreground">{item.location || item.last_seen_location}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="mt-1 h-5 w-5 text-primary" />
                            <div>
                                <p className="font-semibold">Date</p>
                                <p className="text-muted-foreground">
                                    {new Date(item.date_incident || item.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <User className="mt-1 h-5 w-5 text-primary" />
                            <div>
                                <p className="font-semibold">Reported By</p>
                                <p className="text-muted-foreground">
                                    {item.profiles?.full_name || "Anonymous User"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-2 text-xl font-semibold">Description</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                    </div>

                    {!isOwner && item.status === "OPEN" && (
                        <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="w-full text-lg">
                                    {item.type === "FOUND" ? "Claim This Item" : "I Found This Item"}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Submit Claim</DialogTitle>
                                    <DialogDescription>
                                        Provide details to verify that you {item.type === "FOUND" ? "own this item" : "found this item"}.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Textarea
                                        placeholder="Describe unique features or where you lost/found it..."
                                        value={proof}
                                        onChange={(e) => setProof(e.target.value)}
                                    />
                                    <Button onClick={handleClaim} disabled={claimLoading} className="w-full">
                                        {claimLoading ? "Submitting..." : "Submit Claim"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    {isOwner && (
                        <Link href="/dashboard" className="w-full">
                            <Button variant="outline" className="w-full">
                                Manage This Item
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
