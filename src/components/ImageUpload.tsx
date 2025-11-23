import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "@/lib/api"; // Import local API

interface ImageUploadProps {
    onImageUploaded: (url: string) => void;
    currentImage?: string;
}

export const ImageUpload = ({ onImageUploaded, currentImage }: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const { toast } = useToast();

    const handleFileUpload = async (file: File) => {
        try {
            setUploading(true);

            // Use the local API upload method
            // Expects the backend to return { url: "http://..." }
            const data = await api.upload('/upload', file);

            setPreview(data.url);
            onImageUploaded(data.url);

            toast({
                title: "Image uploaded",
                description: "Product image uploaded successfully",
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "Upload failed",
                description: error.message || "Failed to upload image",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileUpload(file);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors"
        >
            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded object-contain"
                        onError={(e) => {
                            // Fallback if local image fails to load
                            (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Image+Error";
                        }}
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                            setPreview(null);
                            onImageUploaded("");
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <label className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                        {uploading ? "Uploading..." : "Drop image here or click to upload"}
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleChange}
                        disabled={uploading}
                    />
                </label>
            )}
        </div>
    );
};