import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  folder?: string;
  className?: string;
  aspectRatio?: "square" | "banner" | "auto";
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  folder = "uploads",
  className,
  aspectRatio = "auto",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = multiple
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : value
    ? [value as string]
    : [];

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Generate unique filename
        const ext = file.name.split(".").pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from("images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        if (multiple) {
          onChange([...images, ...uploadedUrls]);
        } else {
          onChange(uploadedUrls[0]);
        }
        toast.success(
          `${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""} uploaded`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    // Extract file path from URL
    const urlParts = urlToRemove.split("/storage/v1/object/public/images/");
    if (urlParts.length === 2) {
      const filePath = urlParts[1];
      await supabase.storage.from("images").remove([filePath]);
    }

    if (multiple) {
      onChange(images.filter((url) => url !== urlToRemove));
    } else {
      onChange("");
    }
  };

  const aspectClass = {
    square: "aspect-square",
    banner: "aspect-[3/1]",
    auto: "aspect-video",
  }[aspectRatio];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Image Grid/Preview */}
      {images.length > 0 && (
        <div
          className={cn(
            "grid gap-3",
            multiple ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1"
          )}
        >
          {images.map((url, index) => (
            <div
              key={url}
              className={cn(
                "relative group rounded-lg overflow-hidden border bg-muted",
                aspectClass
              )}
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemove(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {(multiple || images.length === 0) && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors",
            isUploading && "pointer-events-none opacity-50"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
