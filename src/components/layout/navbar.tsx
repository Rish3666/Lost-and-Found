import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span>Campus Lost &amp; Found</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="secondary">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

