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
import { DiscountForm } from "./discount-form";
import type { Discount } from '@/lib/types';

interface DiscountDialogProps {
  discount?: Discount;
  children: React.ReactNode;
}

export function DiscountDialog({ discount, children }: DiscountDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{discount ? 'Edit Discount' : 'Add New Discount'}</DialogTitle>
          <DialogDescription>
            {discount ? `Update the details for the ${discount.code} coupon.` : `Create a new discount code for your store.`}
          </DialogDescription>
        </DialogHeader>
        <DiscountForm 
            discount={discount} 
            onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
