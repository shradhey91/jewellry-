"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PurityForm } from "./purity-form";
import type { Purity } from '@/lib/types';

interface PurityDialogProps {
  metalId: string;
  purity?: Purity;
  children: React.ReactNode;
}

export function PurityDialog({ metalId, purity, children }: PurityDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{purity ? 'Edit Purity' : 'Add New Purity'}</DialogTitle>
          <DialogDescription>
            {purity ? `Update the details for ${purity.label}.` : `Add a new purity for this metal.`}
          </DialogDescription>
        </DialogHeader>
        <PurityForm 
            metalId={metalId} 
            purity={purity} 
            onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
