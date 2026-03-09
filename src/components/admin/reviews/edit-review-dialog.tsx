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
import { EditReviewForm } from "./edit-review-form";
import { ProductReview } from '@/lib/types';

interface EditReviewDialogProps {
  review: ProductReview;
  children: React.ReactNode;
}

export function EditReviewDialog({ review, children }: EditReviewDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
          <DialogDescription>
            Update the details for this customer review.
          </DialogDescription>
        </DialogHeader>
        <EditReviewForm 
            review={review}
            onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
