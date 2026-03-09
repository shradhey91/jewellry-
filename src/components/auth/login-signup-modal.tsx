
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PhoneAuthForm } from '@/auth/components/phone-auth-form';
import { Heart } from 'lucide-react';

interface LoginSignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}

export function LoginSignupModal({ open, onOpenChange, title, description }: LoginSignupModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
           <div className="relative inline-block mb-4">
                <Heart className="h-16 w-16 text-primary/30" />
            </div>
          <DialogTitle className="text-2xl font-bold font-headline">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <PhoneAuthForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
