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
import { CustomerForm } from "./customer-form";
import type { Customer } from '@/lib/types';

interface CustomerDialogProps {
  customer?: Customer;
  children: React.ReactNode;
}

export function CustomerDialog({ customer, children }: CustomerDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {customer ? `Update details for ${customer.name}.` : `Add a new customer to your records.`}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
            customer={customer}
            onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
