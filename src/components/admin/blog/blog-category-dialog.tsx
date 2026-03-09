
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
import { BlogCategoryForm } from "./blog-category-form";
import type { BlogCategory } from '@/lib/types';

interface CategoryDialogProps {
  category?: BlogCategory;
  children: React.ReactNode;
}

export function CategoryDialog({ category, children }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {category ? `Update the details for ${category.name}.` : `Add a new category for your blog posts.`}
          </DialogDescription>
        </DialogHeader>
        <BlogCategoryForm 
            category={category} 
            onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
