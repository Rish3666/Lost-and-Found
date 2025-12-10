"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { claimItem } from "./actions";
import { Loader2 } from "lucide-react";

export function ClaimButton({ itemId, isLoggedIn }: { itemId: string, isLoggedIn: boolean }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleClaim = async () => {
        if (!isLoggedIn) {
            window.location.href = "/login";
            return;
        }

        if (!confirm("Are you sure you want to claim this item?")) return;

        setLoading(true);
        const result = await claimItem(itemId);
        setLoading(false);
        setMessage(result.message);
    };

    return (
        <div className="flex flex-col gap-2 w-full sm:w-auto">
            <Button onClick={handleClaim} disabled={loading || !!message} size="lg" className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {message ? "Claim Submitted" : "Claim This Item"}
            </Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
    );
}
