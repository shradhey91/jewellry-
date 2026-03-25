'use client';

import { useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { savePageData } from './actions';
import type { Page } from './page';

interface PageEditorDialogProps {
  page: Page;
  trigger: React.ReactNode;
}

export function PageEditorDialog({ page, trigger }: PageEditorDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [state, formAction] = useFormState(
    async (prevState: { success: boolean; message: string }, formData: FormData) => {
      const data = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        status: formData.get('status') === 'on' ? 'Published' as const : 'Draft' as const,
      };
      
      const result = await savePageData(page.id, data);
      
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      
      if (result.success) {
        setOpen(false);
      }

      return result;
    },
    { success: false, message: '' }
  );

  // Handle form submission
  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Page: {page.title}</DialogTitle>
          <DialogDescription>
            Make changes to your page settings here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input 
              id="title" 
              name="title" 
              defaultValue={page.title}
              placeholder="Enter page title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Page Content (Optional)</Label>
            <Textarea 
              id="content" 
              name="content" 
              defaultValue={page.content || ''}
              placeholder="Enter page content"
              rows={5}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="status" 
              name="status" 
              defaultChecked={page.status === 'Published'}
            />
            <Label htmlFor="status">Published</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
