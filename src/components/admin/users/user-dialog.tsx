
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
import { UserForm } from "./user-form";
import type { User } from '@/lib/types';

interface UserDialogProps {
  user?: User;
  children: React.ReactNode;
}

export function UserDialog({ user, children }: UserDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Edit Admin' : 'Add New Admin'}</DialogTitle>
          <DialogDescription>
            {user ? `Update details for ${user.name}.` : `Add a new admin and assign a role.`}
          </DialogDescription>
        </DialogHeader>
        <UserForm 
            user={user}
            onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
