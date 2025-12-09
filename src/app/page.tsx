import { BadgeCheck, MapPin, Search, ShieldCheck, Upload } from "lucide-react";

const features = [
  {
    title: "Report in minutes",
    description:
      "Guided form for lost or found items with photos, location, and contact details.",
    icon: Upload,
  },
  {
    title: "Trust-first workflow",
    description:
      "SSO-ready auth, admin verification, and audit-friendly claim status history.",
    icon: ShieldCheck,
  },
  {
    title: "Smart discovery",
    description:
      "Search and filter by category, building, or date so items get back faster.",
    icon: Search,
  },
];

const quickStats = [
  { label: "Avg. claim review", value: "< 2 hrs" },
  { label: "Items returned", value: "94%" },
  { label: "Live categories", value: "6+" },
];

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur">
              <BadgeCheck className="h-4 w-4 text-primary" />
              Secure by design • Ready for campus
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                University Lost &amp; Found Portal
              </h1>
              <p className="max-w-2xl text-lg text-slate-700">
                Report, track, and claim items with confidence. Purpose-built
                for students, staff, and administrators to keep campus property
                moving to the right hands.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                Report lost item
              </button>
              <button className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-primary ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                View dashboard
              </button>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Privacy-first storage &amp; audit trail
                </p>
                <p className="text-sm text-slate-600">
                  Supabase-backed auth, row-level security, and admin approvals
                  for every claim.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-3xl bg-white/90 p-6 shadow-xl ring-1 ring-slate-200 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">Snapshot</p>
                <p className="text-lg font-semibold text-slate-900">
                  Campus inventory health
                </p>
              </div>
              <MapPin className="h-10 w-10 text-primary" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                >
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 rounded-2xl bg-gradient-to-br from-primary/90 to-slate-900 p-5 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <Upload className="h-10 w-10 text-accent" />
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Multi-step item intake
                  </p>
                  <p className="text-lg font-semibold">
                    Photos, location, and notes in one flow.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-sm text-white/70">Recent</p>
                  <p className="text-base font-semibold">
                    Laptop • Science Library
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-sm text-white/70">In verification</p>
                  <p className="text-base font-semibold">
                    ID card • Admin Center
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex h-full flex-col gap-4 rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
