import Link from "next/link";
import { AlertCircle, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const recentItems = [
  { title: "Blue Backpack", location: "Engineering Quad", note: "Contains laptop stickers" },
  { title: "Student ID Card", location: "Main Library", note: "Name: Alex V." },
  { title: "AirPods Case", location: "Cafeteria", note: "No earbuds inside" },
  { title: "Black Hoodie", location: "Gym lockers", note: "Small logo on sleeve" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_#e2e8f033_0,_transparent_35%),radial-gradient(circle_at_20%_60%,_#0b2f6d11_0,_transparent_25%),radial-gradient(circle_at_80%_30%,_#f5c24222_0,_transparent_28%)]" />
      <main className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-20 pt-12 sm:px-10 lg:pt-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm ring-1 ring-primary/20">
              Campus portal
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Trusted by students
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                Lost something on campus?
              </h1>
              <p className="max-w-2xl text-lg text-slate-700">
                The official student portal to report and track lost items.
                Search recent finds or file a report in minutes.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/items">I Lost Something</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/report">I Found Something</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
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

          <div className="space-y-4 rounded-3xl bg-white/95 p-6 shadow-xl ring-1 ring-slate-200 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Recently found on campus
                </p>
                <p className="text-sm text-slate-600">
                  Items awaiting pickup or claim verification.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {recentItems.map((item) => (
                <div
                  key={item.title + item.location}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm"
                >
                  <div className="aspect-[3/2] w-full rounded-xl bg-gradient-to-br from-slate-200 to-slate-100" />
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-primary" />
                      {item.location}
                    </div>
                    <p className="text-sm text-slate-600">{item.note}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="secondary" className="w-full">
                      <Link href="/items">View</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/report">Claim</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-200 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Campus guidance
              </p>
              <h2 className="text-xl font-semibold text-slate-900">
                How to get your item back faster
              </h2>
              <p className="text-sm text-slate-600">
                Use clear descriptions, add where you last saw it, and bring a
                photo ID when claiming.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="secondary">
                <Link href="/items">Browse items</Link>
              </Button>
              <Button asChild>
                <Link href="/report">Report an item</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
