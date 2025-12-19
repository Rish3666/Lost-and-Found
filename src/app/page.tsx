import Link from "next/link";
import { AlertCircle, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await supabaseServer();
  const { data: recentItems } = await supabase
    .from("items")
    .select("id, title, location, description, image_url")
    .eq("type", "FOUND")
    .eq("status", "OPEN")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_#e2e8f011_0,_transparent_35%),radial-gradient(circle_at_20%_60%,_#0b2f6d08_0,_transparent_25%),radial-gradient(circle_at_80%_30%,_#f5c2420a_0,_transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,_#0f172a33_0,_transparent_35%),radial-gradient(circle_at_20%_60%,_#1f293733_0,_transparent_25%),radial-gradient(circle_at_80%_30%,_#0b2f6d33_0,_transparent_30%)]" />
      <main className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-20 pt-12 sm:gap-16 sm:px-10 lg:pt-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-card/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm ring-1 ring-primary/20">
              Campus portal
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Trusted by students
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Lost something on campus?
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                The official student portal to report and track lost items.
                Search recent finds or file a report in minutes.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/report/lost">Report Lost Item</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur hover:bg-background/80">
                <Link href="/report/found">Report Found Item</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-card/90 p-4 shadow-sm ring-1 ring-border backdrop-blur sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Search className="h-4 w-4 text-primary" />
                Search the inventory
              </div>
              <div className="flex flex-1 items-center gap-3">
                <Input
                  placeholder="Search for keys, id card, backpack..."
                  aria-label="Search lost and found items"
                />
                <Button asChild variant="secondary" className="shrink-0">
                  <Link href="/items">Search</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl bg-card/95 p-6 shadow-xl ring-1 ring-border backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Recently found on campus
                </p>
                <p className="text-sm text-muted-foreground">
                  Items awaiting pickup or claim verification.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {recentItems && recentItems.length > 0 ? (
                recentItems.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/60 p-4 shadow-sm"
                  >
                    <div className="aspect-[3/2] w-full overflow-hidden rounded-xl bg-gradient-to-br from-muted to-card">
                      {item.image_url && <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold lines-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="secondary" className="w-full">
                        <Link href={`/items/${item.id}`}>View</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href={`/items/${item.id}`}>Claim</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-muted-foreground">
                  No recent items found.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-card/90 p-6 shadow-sm ring-1 ring-border backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Campus guidance
              </p>
              <h2 className="text-xl font-semibold">
                How to get your item back faster
              </h2>
              <p className="text-sm text-muted-foreground">
                Use clear descriptions, add where you last saw it, and bring a
                photo ID when claiming.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="secondary">
                <Link href="/items">Browse items</Link>
              </Button>
              <Button asChild>
                <Link href="/report/found">Report Found</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
