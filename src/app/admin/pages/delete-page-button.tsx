'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deletePageData } from './actions';
import type { Page } from './page';

interface DeletePageButtonProps {
  page: Page;
}

export function DeletePageButton({ page }: DeletePageButtonProps) {
  const { toast } = useToast();
  
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${page.title}"? This action cannot be undone.`)) {
      return;
    }
    
    const result = await deletePageData(page.id);
    
    toast({
      title: result.success ? 'Success' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
  };
  
  return (
    <DropdownMenuItem 
      onSelect={(e) => {
        e.preventDefault();
        handleDelete();
      }}
      className="text-destructive flex items-center"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      <span>Delete</span>
    </DropdownMenuItem>
  );
}
