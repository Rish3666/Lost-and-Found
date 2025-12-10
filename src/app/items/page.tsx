import { supabaseServer } from "@/lib/supabase/server";
import { ItemCard } from "@/components/ui/item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Browse Items - Campus Lost & Found",
    description: "Search and filter lost and found items.",
};

export default async function ItemsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const supabase = await supabaseServer();
    const params = await searchParams; // Next.js 15+ searchParams is a promise

    const query = (params.q as string) || "";
    const type = (params.type as string) || "all";
    const category = (params.category as string) || "all";

    let dbQuery = supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

    if (query) {
        dbQuery = dbQuery.ilike("title", `%${query}%`);
    }

    if (type !== "all") {
        dbQuery = dbQuery.eq("type", type.toUpperCase());
    }

    if (category !== "all") {
        dbQuery = dbQuery.eq("category", category);
    }

    const { data: items, error } = await dbQuery;

    if (error) {
        console.error("Error fetching items:", error);
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="mb-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Browse Items</h1>
                    <p className="text-muted-foreground">Search through reported lost and found items.</p>
                </div>

                {/* Search and Filter Form */}
                <form className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-2">
                        <label htmlFor="q" className="text-sm font-medium">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input name="q" placeholder="Search items..." defaultValue={query} className="pl-9" />
                        </div>
                    </div>
                    <div className="w-full sm:w-[150px] space-y-2">
                        <label htmlFor="type" className="text-sm font-medium">Type</label>
                        <select
                            name="type"
                            defaultValue={type}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="all">All Types</option>
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-[150px] space-y-2">
                        <label htmlFor="category" className="text-sm font-medium">Category</label>
                        <select
                            name="category"
                            defaultValue={category}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="all">All Categories</option>
                            <option value="ELECTRONICS">Electronics</option>
                            <option value="CLOTHING">Clothing</option>
                            <option value="ID_CARDS">ID Cards</option>
                            <option value="KEYS">Keys</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <Button type="submit">Filter</Button>
                    {/* Simple clear filter hack: Link to base URL */}
                    {(query || type !== "all" || category !== "all") && (
                        <Button variant="ghost" asChild>
                            <Link href="/items">Clear</Link>
                        </Button>
                    )}
                </form>
            </div>

            {!items || items.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/50 p-8 text-center">
                    <p className="text-lg font-medium">No items found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                    <Button asChild variant="link" className="mt-2">
                        <Link href="/report">Report an Item</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((item) => (
                        <ItemCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            location={item.location}
                            description={item.description}
                            imageUrl={item.image_url}
                            date={item.date_incident}
                            type={item.type == "LOST" || item.type == "FOUND" ? item.type : "LOST"} // Fallback
                            category={item.category}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
