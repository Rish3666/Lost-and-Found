import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

import { supabaseServer } from "@/lib/supabase/server";
import { UserNav } from "@/components/layout/user-nav";

export const Navbar = async () => {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-foreground md:mr-6"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="hidden md:inline-block">Campus Lost &amp; Found</span>
        </Link>
        <nav className="flex flex-1 items-center gap-4 text-sm font-medium xl:gap-6">
          <Link
            href="/report/lost"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Report Lost
          </Link>
          <Link
            href="/report/found"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Report Found
          </Link>
          <Link
            href="/items"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Browse Items
          </Link>
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserNav user={user} />
          ) : (
            <Button asChild variant="secondary">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

