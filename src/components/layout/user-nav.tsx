"use client";

import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function UserNav({ user }: { user: User }) {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
            const { data } = await supabaseBrowser()
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            if (data?.role === 'admin') setIsAdmin(true);
        };
        checkRole();
    }, [user.id]);

    return (
        <div className="flex items-center gap-4">
            {isAdmin && (
                <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Admin
                    </Button>
                </Link>
            )}
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
