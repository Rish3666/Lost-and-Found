"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
    value: string | null;
    onChange: (url: string | null) => void;
    bucketName?: string;
}

export function ImageUpload({
    value,
    onChange,
    bucketName = "items",
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = e.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            onChange(data.publicUrl);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    if (value) {
        return (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                <img
                    src={value}
                    alt="Upload"
                    className="h-full w-full object-cover"
                />
                <Button
                    onClick={() => onChange(null)}
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6"
                    type="button"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex w-full items-center justify-center">
            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:bg-muted">
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                </div>
                <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onUpload}
                    disabled={uploading}
                />
            </label>
        </div>
    );
}
