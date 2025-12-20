"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function ProfileOnboarding() {
    const supabase = supabaseBrowser();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

    // Fetch user and profile
    const { data: profile, isLoading } = useQuery({
        queryKey: ["current-profile"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single();

            return { user, data };
        },
        retry: false
    });

    const updateProfile = useMutation({
        mutationFn: async (newName: string) => {
            if (!profile?.user) return;

            const { error } = await supabase
                .from("profiles")
                .update({ full_name: newName })
                .eq("id", profile.user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["current-profile"] });
            router.refresh();
        },
        onError: (err) => {
            alert("Failed to update profile: " + err.message);
        }
    });

    const isMissingName = !isLoading && profile?.user && !profile.data?.full_name;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await updateProfile.mutateAsync(name);
        setLoading(false);
    };

    if (isLoading || !isMissingName) return null;

    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Welcome! What should we call you?</DialogTitle>
                    <DialogDescription>
                        Please enter your full name to continue using the platform.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={2}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || name.length < 2}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save & Continue
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
