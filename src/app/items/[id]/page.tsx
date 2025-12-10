import { supabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Tag, Info, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaimButton } from "./claim-button";

export default async function ItemPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await supabaseServer();

    const { data: item, error } = await supabase
        .from("items")
        .select(`
        *,
        profiles:user_id (
            full_name,
            role
        )
    `)
        .eq("id", id)
        .single();

    if (error || !item) {
        notFound();
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Helper to format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Unknown Date";
        return new Date(dateString).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <Button variant="ghost" asChild className="mb-6 pl-0 hover:pl-0 hover:bg-transparent">
                <Link href="/items" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Browse
                </Link>
            </Button>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                {/* Left Column: Image */}
                <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                alt={item.title}
                                className="h-full w-full object-cover aspect-[4/3]"
                            />
                        ) : (
                            <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <Info className="h-10 w-10 opacity-50" />
                                    <span>No existing image</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="flex flex-col gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide
                        ${item.type === 'LOST'
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                    : 'bg-green-500/10 text-green-600 dark:text-green-400'
                                }
                    `}>
                                {item.type}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Reported on {formatDate(item.created_at)}
                            </span>
                        </div>
                        <h1 className="mt-4 text-4xl font-bold leading-tight">{item.title}</h1>
                    </div>

                    <div className="grid gap-4 rounded-xl bg-card/50 p-6 ring-1 ring-border">
                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Location</p>
                                <p className="font-semibold">{item.location || "N/A"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Date of Incident</p>
                                <p className="font-semibold">{formatDate(item.date_incident)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Category</p>
                                <p className="font-semibold capitalize">{item.category}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {item.description || "No description provided."}
                        </p>
                    </div>

                    {/* User Info (Reporter) */}
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Reported by</p>
                            <p className="text-sm text-muted-foreground">
                                {/* 
                          Note: In a real app we might obscure this name or only show first name 
                          unless it's a found item and we want to facilitate contact.
                        */}
                                {(item.profiles as any)?.full_name || "Anonymous User"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-6">
                        {item.type === 'FOUND' && item.status === 'OPEN' ? (
                            <ClaimButton itemId={item.id} isLoggedIn={!!user} />
                        ) : (
                            <Button disabled variant="secondary" size="lg" className="w-full sm:w-auto">
                                {item.status === 'CLAIMED' ? 'Item Claimed' : 'Cannot be claimed'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
