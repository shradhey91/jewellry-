
'use client';

import React from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LayoutDashboard, User as UserIcon, LogOut } from 'lucide-react';
import { useUser } from '@/auth/hooks/use-user';
import { signOutAction } from '@/auth/actions';

export function UserMenu() {
  const { user, isLoading } = useUser();

  if (isLoading) {
      return <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />;
  }
  
  const getInitials = (name: string) => {
      const parts = name.split(' ');
      if (parts.length > 1) {
          return `${parts[0][0]}${parts[parts.length - 1][0]}`;
      }
      return name.substring(0, 2);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {user ? getInitials(user.name) : <UserIcon className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {user ? (
            <>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email || user.phone_number}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                 <DropdownMenuItem asChild>
                    <Link href="/account">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={signOutAction}>
                    <DropdownMenuItem asChild>
                        <button type="submit" className="w-full">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign Out</span>
                        </button>
                    </DropdownMenuItem>
                </form>
            </>
        ) : (
            <DropdownMenuItem asChild>
                <Link href="/auth/login">
                    <span>Sign In</span>
                </Link>
            </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
