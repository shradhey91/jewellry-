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
import { TaxClassForm } from "./tax-class-form";
import type { TaxClass } from '@/lib/types';

interface TaxClassDialogProps {
  taxClass?: TaxClass;
  children: React.ReactNode;
}

export function TaxClassDialog({ taxClass, children }: TaxClassDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{taxClass ? 'Edit Tax Class' : 'Add New Tax Class'}</DialogTitle>
          <DialogDescription>
            {taxClass ? `Update the details for ${taxClass.name}.` : `Add a new tax class for your store.`}
          </DialogDescription>
        </DialogHeader>
        <TaxClassForm 
            taxClass={taxClass} 
            onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
