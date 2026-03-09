
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
import { deletePurityAction } from "@/app/admin/pricing/actions";
import type { Purity } from "@/lib/types";

interface PurityDeleteDialogProps {
  purity: Purity;
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

export function PurityDeleteDialog({
  purity,
  children,
}: PurityDeleteDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = useState({ message: "" });

  useEffect(() => {
    if (state.message) {
      toast({
        title: "Purity Deletion",
        description: state.message,
      });
      if (state.message.includes("success")) {
        router.refresh();
      }
    }
  }, [state, toast, router]);

  const formAction = async (formData: FormData) => {
    const result = await deletePurityAction(formData);
    setState(result);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the purity
            <strong className="mx-1">{purity.label}</strong>
            from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <form action={formAction} className="flex gap-2">
            <input type="hidden" name="id" value={purity.id} />
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <DeleteButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
