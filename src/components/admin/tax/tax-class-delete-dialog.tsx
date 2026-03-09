
"use client";

import { useState, useEffect } from "react";
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
import { deleteTaxClassAction } from "@/app/admin/tax-classes/actions";
import type { TaxClass } from "@/lib/types";

interface TaxClassDeleteDialogProps {
  taxClass: TaxClass;
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

export function TaxClassDeleteDialog({
  taxClass,
  children,
}: TaxClassDeleteDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = useState({
    message: "",
  });

  useEffect(() => {
    if (state.message) {
      const isSuccess = state.message.includes("success");
      toast({
        title: "Tax Class Deletion",
        description: state.message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess) {
        router.refresh();
      }
    }
  }, [state, toast, router]);

  const formAction = async (formData: FormData) => {
    const result = await deleteTaxClassAction(formData);
    setState(result);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the tax class
            <strong className="mx-1">{taxClass.name}</strong>. If this tax
            class is in use, deletion will fail.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <form action={formAction} className="flex gap-2">
            <input type="hidden" name="id" value={taxClass.id} />
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <DeleteButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
