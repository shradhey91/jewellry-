
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddReviewForm } from "./add-review-form";

interface AddReviewDialogProps {
  productId: string;
  children: React.ReactNode;
}

export function AddReviewDialog({ productId, children }: AddReviewDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Review</DialogTitle>
          <DialogDescription>
            Create a customer review for this product. It will be immediately visible on the store.
          </DialogDescription>
        </DialogHeader>
        <AddReviewForm 
            productId={productId}
            onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
