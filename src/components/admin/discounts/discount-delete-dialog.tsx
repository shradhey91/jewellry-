"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import { deleteDiscountAction } from "@/app/admin/discounts/actions";
import type { Discount } from "@/lib/types";

interface DiscountDeleteDialogProps {
  discount: Discount;
  children: React.ReactNode;
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction asChild>
      <Button type="submit" variant="destructive" disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </Button>
    </AlertDialogAction>
  );
}

export function DiscountDeleteDialog({
  discount,
  children,
}: DiscountDeleteDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const formAction = async (formData: FormData) => {
    const result = await deleteDiscountAction(formData);
    toast({
      title: result.message.includes("success") ? "Success" : "Error",
      description: result.message,
      variant: result.message.includes("success") ? "default" : "destructive",
    });
    if (result.message.includes("success")) {
      router.refresh();
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild onClick={() => setOpen(true)}>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the discount code
            <strong className="mx-1">{discount.code}</strong>.
            {discount.usage_count > 0 && (
              <p className="mt-2 text-sm font-medium text-amber-600">
                Warning: This coupon has been used {discount.usage_count} times.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <form action={formAction} className="flex gap-2">
            <input type="hidden" name="id" value={discount.id} />
            <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
            <DeleteButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
