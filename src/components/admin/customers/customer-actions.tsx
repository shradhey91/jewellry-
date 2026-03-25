
'use client';

import React from 'react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, ShieldOff, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { banUserAction, unbanUserAction } from '@/app/admin/customers/actions';
import type { User } from '@/lib/types';
import { CustomerDialog } from './customer-dialog';

export function CustomerActions({ customer }: { customer: User }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAction = (action: 'ban' | 'unban') => {
    startTransition(async () => {
        try {
            if (action === 'ban') {
                const result = await banUserAction(customer.id);
                toast({ title: result.success ? 'User Banned' : 'Error', description: result.message, variant: result.success ? 'default' : 'destructive' });
            } else if (action === 'unban') {
                const result = await unbanUserAction(customer.id);
                toast({ title: result.success ? 'User Unbanned' : 'Error', description: result.message, variant: result.success ? 'default' : 'destructive' });
            }
            router.refresh();
        } catch (error) {
             toast({ title: 'Action Failed', description: (error as Error).message, variant: 'destructive' });
        }
    });
  };

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <CustomerDialog customer={customer}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <UserCheck className="mr-2 h-4 w-4" />
              Edit Customer
            </DropdownMenuItem>
          </CustomerDialog>
          <DropdownMenuSeparator />
          {customer.status !== 'banned' ? (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleAction('ban')}
            >
              <ShieldOff className="mr-2 h-4 w-4" />
              Ban Customer
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleAction('unban')}>
              <UserCheck className="mr-2 h-4 w-4" />
              Unban Customer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
