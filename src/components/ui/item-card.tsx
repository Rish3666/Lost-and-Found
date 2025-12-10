import { MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

interface ItemCardProps {
    id: string;
    title: string;
    location: string | null;
    description: string | null;
    imageUrl: string | null;
    date: string | null;
    type: "LOST" | "FOUND";
    category: string;
}

export function ItemCard({
    id,
    title,
    location,
    description,
    imageUrl,
    date,
    type,
    category,
}: ItemCardProps) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl bg-muted">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        No Image
                    </div>
                )}
                <div className="absolute top-2 right-2 rounded-full bg-background/80 px-2 py-1 text-xs font-semibold backdrop-blur">
                    {type}
                </div>
            </div>
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{category}</span>
                    {date && <span className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString()}</span>}
                </div>
                <h3 className="text-base font-semibold line-clamp-1">{title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="line-clamp-1">{location || "Unknown location"}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {description || "No description provided."}
                </p>
            </div>
            <div className="mt-auto flex gap-2">
                <Button asChild variant="secondary" className="w-full">
                    <Link href={`/items/${id}`}>View</Link>
                </Button>
            </div>
        </div>
    );
}
