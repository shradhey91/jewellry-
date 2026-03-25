
"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
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
import { useToast } from "@/hooks/use-toast";
import { deleteCategoryAction } from "@/app/admin/categories/actions";
import type { Category } from "@/lib/types";

interface CategoryDeleteDialogProps {
  category: Category;
  children: React.ReactNode;
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}

export function CategoryDeleteDialog({ category, children }: CategoryDeleteDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useFormState(deleteCategoryAction.bind(null, category.id), { message: "" });

  useEffect(() => {
    if (state.message) {
      const isSuccess = state.message.includes("success");
      toast({
        title: "Category Deletion",
        description: state.message,
        variant: isSuccess ? "default" : "destructive",
      });
      if (isSuccess) {
        router.refresh();
      }
    }
  }, [state, toast, router]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              <strong className="mx-1">{category.name}</strong>. If this category
              has sub-categories or is assigned to products, deletion will fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <DeleteButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
