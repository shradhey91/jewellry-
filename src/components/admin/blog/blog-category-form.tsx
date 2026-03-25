
"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveCategory, CategoryFormState } from "@/app/admin/blog/[slug]/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import type { BlogCategory } from "@/lib/types";

interface BlogCategoryFormProps {
  category?: BlogCategory;
  onSuccess?: () => void;
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (isNew ? "Adding..." : "Saving...") : (isNew ? "Add Category" : "Save Changes")}
    </Button>
  );
}

export function BlogCategoryForm({ category, onSuccess }: BlogCategoryFormProps) {
  const isNew = !category;
  const initialState: CategoryFormState = { message: "", errors: {} };
  const [state, formAction] = useFormState(saveCategory, initialState);
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors ? "Error" : "Success",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
      if (!state.errors) {
        if (isNew) {
          setName("");
          setSlug("");
        }
        onSuccess?.();
      }
    }
  }, [state, toast, isNew, onSuccess]);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setName(newName);
      if (!category) { // Only auto-generate slug for new categories
          setSlug(newName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
      }
  }

  return (
    <form action={formAction} className="space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
            id="name" 
            name="name" 
            placeholder="e.g., Company News" 
            value={name}
            onChange={handleNameChange}
        />
        {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input 
            id="slug" 
            name="slug" 
            placeholder="e.g., company-news"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
        />
        {state.errors?.slug && <p className="text-sm text-destructive">{state.errors.slug[0]}</p>}
      </div>
      <SubmitButton isNew={isNew} />
    </form>
  );
}
