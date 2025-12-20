import Link from "next/link";
import { ShieldCheck, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { supabaseServer } from "@/lib/supabase/server";
import { UserNav } from "@/components/layout/user-nav";
import { NotificationBell } from "@/components/notifications/notification-bell";



export const Navbar = async () => {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-6 sm:px-10 relative">
        <Link
          href="/"
          className="group flex items-center gap-3 text-lg font-semibold text-foreground transition-all duration-300 hover:scale-[1.02]"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20 shadow-[0_0_15px_-3px_rgba(var(--brand-primary),0.3)] transition-all duration-500 group-hover:shadow-[0_0_20px_-2px_rgba(var(--brand-primary),0.5)] group-hover:rotate-3">
            <ShieldCheck className="h-5 w-5 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
          </span>
          <span className="hidden md:flex flex-col gap-0 leading-none">
            <span className="text-sm font-bold tracking-tight text-foreground/90">Campus</span>
            <span className="text-xs font-medium text-foreground/60 tracking-wider uppercase">Lost & Found</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/report/lost", label: "Report Lost" },
            { href: "/report/found", label: "Report Found" },
            { href: "/items", label: "Browse Items" },
            { href: "/dashboard", label: "Dashboard" }
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative group px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
            >
              {link.label}
              <span className="absolute bottom-1 right-4 h-0.5 w-0 bg-primary/80 transition-all duration-300 ease-out group-hover:w-[calc(100%-32px)] group-hover:right-auto group-hover:left-4 rounded-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 pl-6 border-l border-white/10 ml-2">
          <ThemeToggle />
          {user && <NotificationBell />}
          {user ? (
            <UserNav user={user} />
          ) : (
            <Button asChild variant="default" className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
              <Link href="/login">Login</Link>
            </Button>
          )}
          {/* Mobile Menu Trigger (Placeholder for future implementation if needed) */}
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-foreground/70 hover:bg-white/10 hover:text-primary transition-colors">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-l border-white/10 bg-background/95 backdrop-blur-2xl">
              <SheetHeader className="border-b border-white/5 pb-6 mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <span className="font-bold text-foreground">Menu</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2">
                {[
                  { href: "/report/lost", label: "Report Lost Item" },
                  { href: "/report/found", label: "Report Found Item" },
                  { href: "/items", label: "Browse ALL Items" },
                  { href: "/dashboard", label: "My Dashboard" }
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-foreground/80 hover:text-primary transition-all duration-300 group ring-1 ring-transparent hover:ring-white/5"
                  >
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
                {!user && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <Button asChild className="w-full rounded-xl shadow-lg shadow-primary/20" size="lg">
                      <Link href="/login">Log In / Sign Up</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

