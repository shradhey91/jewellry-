"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2, Video } from 'lucide-react';
import { getUploadedMedia, MediaFile } from '@/lib/server/actions/media';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

interface MediaSelectorDialogProps {
  children: React.ReactNode;
  onImageSelect: (url: string, hint: string) => void;
}

export function ImageSearchDialog({ children, onImageSelect }: MediaSelectorDialogProps) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if(open) {
        setIsLoading(true);
        getUploadedMedia().then(allMedia => {
            setMedia(allMedia);
            setIsLoading(false);
        });
    }
  }, [open]);


  const handleSelect = (file: MediaFile) => {
    onImageSelect(file.url, file.name);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select from Media Library</DialogTitle>
          <DialogDescription>Choose an existing image or video from your library.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)
            ) : media.length > 0 ? media.map((item) => (
                <button
                    key={item.url}
                    className="relative aspect-square group rounded-md overflow-hidden border focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={() => handleSelect(item)}
                >
                    {item.type === 'video' ? (
                        <video src={item.url} className="h-full w-full object-cover" muted loop playsInline />
                    ) : (
                         <Image
                            src={item.url}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-semibold">Select</p>
                    </div>
                     {item.type === 'video' && (
                        <div className="absolute top-2 left-2 bg-background/80 text-foreground rounded-full p-1 shadow">
                            <Video className="h-3 w-3" />
                        </div>
                    )}
                </button>
            )) : (
                 <div className="col-span-full text-center py-16 text-muted-foreground">
                    <p>No media found in your library.</p>
                </div>
            )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
