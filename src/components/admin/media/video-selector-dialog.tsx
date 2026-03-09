
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video } from 'lucide-react';
import { getUploadedMedia, MediaFile } from '@/lib/server/actions/media';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoSelectorDialogProps {
  onSelect: (url: string) => void;
}

export function VideoSelectorDialog({ onSelect }: VideoSelectorDialogProps) {
  const [open, setOpen] = useState(false);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      getUploadedMedia().then(allMedia => {
        setVideos(allMedia.filter(m => m.type === 'video'));
        setIsLoading(false);
      });
    }
  }, [open]);

  const handleSelect = (url: string) => {
    onSelect(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Choose from Library</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Select a Video</DialogTitle>
          <DialogDescription>
            Choose a video from your media library.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-video w-full" />)
            ) : videos.length > 0 ? videos.map(video => (
                <button
                    key={video.url}
                    className="relative group aspect-video rounded-lg overflow-hidden border focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={() => handleSelect(video.url)}
                >
                    <video src={video.url} className="h-full w-full object-cover" muted loop playsInline />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-semibold">Select</p>
                    </div>
                </button>
            )) : (
                <div className="col-span-full text-center py-16">
                    <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No Videos in Library</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Upload videos in the Media Library tab.</p>
                </div>
            )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

    