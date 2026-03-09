
"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product, ProductMedia } from "@/lib/types";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageSearchDialog } from "./image-search-dialog";
import { useToast } from "@/hooks/use-toast.tsx";
import { Star, Trash2, Video, Upload, Loader2 } from "lucide-react";
import { uploadFileAction } from "@/lib/server/actions/media";

interface ProductImageManagerProps {
  product: Product;
  media: ProductMedia[];
  onMediaChange: (media: ProductMedia[]) => void;
  isNew?: boolean;
}

export function ProductImageManager({ product, media, onMediaChange, isNew }: ProductImageManagerProps) {
  const [newImageUrl, setNewImageUrl] = useState("");
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleSetPrimary = (mediaId: string) => {
    const updatedMedia = media.map(m => ({ ...m, is_primary: m.id === mediaId }));
    onMediaChange(updatedMedia);
  };

  const handleDelete = (mediaId: string) => {
    const updatedMedia = media.filter(m => m.id !== mediaId);
    if (updatedMedia.length > 0 && !updatedMedia.some(m => m.is_primary)) {
      updatedMedia[0].is_primary = true;
    }
    onMediaChange(updatedMedia);
  };

  const handleAddImage = (url?: string, hint?: string) => {
    const imageUrl = url || newImageUrl;
    if (!imageUrl) {
        toast({ title: "Image URL is required", variant: "destructive" });
        return;
    }
    const newMediaItem: ProductMedia = {
      id: `new-${Date.now()}`,
      product_id: product.id,
      url: imageUrl,
      hint: hint || 'Product image',
      sort_order: media.length,
      is_primary: media.length === 0,
      media_type: imageUrl.toLowerCase().endsWith('.mp4') || imageUrl.toLowerCase().endsWith('.webm') ? 'video' : 'image',
    };
    onMediaChange([...media, newMediaItem]);
    setNewImageUrl("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadFileAction(formData);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
    if (result.success && result.url) {
      handleAddImage(result.url, file.name);
    }
    e.target.value = "";
    setIsUploading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Gallery</CardTitle>
        <CardDescription>Manage your product images and videos. Changes are saved with the main product form.</CardDescription>
      </CardHeader>
      <CardContent>
        {media.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item) => (
              <div key={item.id} className="relative group aspect-square border rounded-lg overflow-hidden">
                {item.media_type === 'video' ? (
                     <video src={item.url} className="h-full w-full object-cover" muted loop playsInline />
                ) : (
                    <Image
                      src={item.url}
                      alt={item.hint}
                      fill
                      className="object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                   <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleSetPrimary(item.id)}
                    disabled={item.is_primary}
                  >
                    <Star className="mr-1 h-4 w-4" />
                    Primary
                  </Button>
                   <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
                {item.is_primary && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1 shadow">
                        <Star className="h-3 w-3" />
                    </div>
                )}
                 {item.media_type === 'video' && (
                    <div className="absolute top-1 left-1 bg-background/80 text-foreground rounded-full p-1 shadow">
                        <Video className="h-3 w-3" />
                    </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center text-muted-foreground py-8">No images yet. Add one below.</p>
        )}
        <div className="mt-6 border-t pt-6">
          <div className="flex flex-wrap gap-2">
            <Input
              type="text"
              placeholder="Paste image or video URL"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-grow min-w-[200px]"
            />
            <Button type="button" onClick={() => handleAddImage()}>Add from URL</Button>
            <Button asChild variant="outline" className="relative" disabled={isUploading}>
                <div>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload
                    <Input 
                        type="file" 
                        accept="image/*,video/mp4,video/webm"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                    />
                </div>
            </Button>
            <ImageSearchDialog onImageSelect={handleAddImage}>
              <Button type="button" variant="outline">Media Library</Button>
            </ImageSearchDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
