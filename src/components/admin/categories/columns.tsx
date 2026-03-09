
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CategoryDialog } from "./category-dialog";
import { CategoryDeleteDialog } from "./category-delete-dialog";
import * as LucideIcons from "lucide-react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: string; className: string }) => {
  const LucideIcon = LucideIcons[name as IconName];
  if (!LucideIcon) {
    return <ImageIcon className={className} />;
  }
  return <LucideIcon className={className} />;
};


const getCategoryDepth = (categoryId: string | null, allCategories: Category[]): number => {
    if (!categoryId) return 0;
    const category = allCategories.find(c => c.id === categoryId);
    if (!category || !category.parent_id) return 0;
    return 1 + getCategoryDepth(category.parent_id, allCategories);
}

export const columns = (allCategories: Category[]): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
        const category = row.original;
        const depth = getCategoryDepth(category.id, allCategories);
        return (
            <div style={{ paddingLeft: `${depth * 1.5}rem` }} className="flex items-center gap-3 font-medium">
                {depth > 0 && <span className="text-muted-foreground text-lg"> &#9492;&#9472; </span>}
                {category.icon ? (
                    <Icon name={category.icon} className={cn("h-5 w-5", depth > 0 ? "text-muted-foreground" : "text-primary")} />
                ) : (
                    <div className="w-5 h-5" /> 
                )}
                <span>{category.name}</span>
            </div>
        )
    }
  },
  {
    accessorKey: "parent_id",
    header: "Parent",
    cell: ({ row }) => {
        const parentId = row.getValue("parent_id");
        if (!parentId) return <span className="text-muted-foreground/70">&mdash;</span>;
        const parent = allCategories.find(c => c.id === parentId);
        return parent ? parent.name : <span className="text-muted-foreground/70">Unknown</span>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <CategoryDialog category={category} categories={allCategories}>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit
                </DropdownMenuItem>
              </CategoryDialog>
              <DropdownMenuItem asChild>
                <Link href={`/category/${category.id}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on site
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <CategoryDeleteDialog category={category}>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  Delete
                </DropdownMenuItem>
              </CategoryDeleteDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
