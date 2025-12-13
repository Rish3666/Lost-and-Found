"use client";

import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon } from "lucide-react";

export function UserNav({ user }: { user: User }) {
    return (
        <div className="flex items-center gap-4">
            <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                    My Activity
                </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline-block">{user.email}</span>
            </div>
            <form action={signOut}>
                <Button variant="ghost" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </Button>
            </form>
        </div>
    );
}
