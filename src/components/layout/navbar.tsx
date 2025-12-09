import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/30 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span>Campus Lost &amp; Found</span>
        </Link>
        <Button asChild variant="secondary">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </header>
  );
};

