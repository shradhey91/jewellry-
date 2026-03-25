
"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { saveCategoryAction, type CategoryFormState } from "@/app/admin/categories/actions";
import type { Category } from "@/lib/types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
  onSuccess: () => void;
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : isNew ? "Create Category" : "Save Changes"}
    </Button>
  );
}

export function CategoryForm({ category, categories, onSuccess }: CategoryFormProps) {
  const isNew = !category;
  const initialState: CategoryFormState = { message: "", errors: {} };
  const [state, setState] = useState<CategoryFormState>(initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({
          title: "Validation Error",
          description: state.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: state.message });
        onSuccess();
        router.refresh();
      }
    }
  }, [state, toast, onSuccess, router]);

  const otherCategories = categories.filter(c => c.id !== category?.id);

  const formAction = async (formData: FormData) => {
    const result = await saveCategoryAction(state, formData);
    setState(result);
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={category?.id || ""} />

      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={category?.name}
          placeholder="e.g., Rings"
        />
        {state.errors?.name && (
          <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="parent_id">Parent Category</Label>
        <Select name="parent_id" defaultValue={category?.parent_id ?? "null"}>
            <SelectTrigger><SelectValue placeholder="Select a parent" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="null">None (Top-level)</SelectItem>
                {otherCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="icon">Icon Name</Label>
        <Input
          id="icon"
          name="icon"
          type="text"
          defaultValue={category?.icon ?? ""}
          placeholder="e.g., Ring (from lucide-react)"
        />
         <p className="text-xs text-muted-foreground">
          Find icon names on the <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">lucide.dev</a> website.
        </p>
        {state.errors?.icon && (
          <p className="text-sm font-medium text-destructive">{state.errors.icon[0]}</p>
        )}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <SubmitButton isNew={isNew} />
      </DialogFooter>
    </form>
  );
}
