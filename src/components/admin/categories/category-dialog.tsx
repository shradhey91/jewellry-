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
import { CategoryForm } from "./category-form";
import type { Category } from '@/lib/types';

interface CategoryDialogProps {
  category?: Category;
  categories: Category[];
  children: React.ReactNode;
}

export function CategoryDialog({ category, categories, children }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {category ? `Update the details for ${category.name}.` : `Add a new category to your store.`}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm 
            category={category}
            categories={categories} 
            onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
