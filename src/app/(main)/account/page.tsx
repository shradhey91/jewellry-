
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { User, ShoppingBag, BookUser, CreditCard } from 'lucide-react';
import type { Order, User as UserType } from '@/lib/types';

import { getAccountDetails, getMyOrders } from './actions';
import { ProfileForm } from './profile-form';
import { OrderHistory } from './order-history';
import { AddressBook } from './address-book';

function AccountSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-80" />
            </div>
            <div className="flex gap-4 border-b">
                 <Skeleton className="h-10 w-24" />
                 <Skeleton className="h-10 w-24" />
                 <Skeleton className="h-10 w-24" />
                 <Skeleton className="h-10 w-24" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function AccountPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccountData = useCallback(async () => {
    setIsLoading(true);
    const [userDetails, userOrders] = await Promise.all([
      getAccountDetails(),
      getMyOrders()
    ]);
    setUser(userDetails);
    setOrders(userOrders);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  if (isLoading) {
    return (
        <div className="container mx-auto py-12">
            <div className="max-w-4xl mx-auto">
                <AccountSkeleton />
            </div>
        </div>
    )
  }

  if (!user) {
    return (
        <div className="container mx-auto py-12">
            <div className="max-w-2xl mx-auto">
                <Card>
                <CardHeader className="text-center">
                    <CardTitle>Account Not Found</CardTitle>
                    <CardDescription>
                    We couldn't load the guest account details. Please try again later.
                    </CardDescription>
                </CardHeader>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline tracking-tight">My Account</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}!</p>
        </div>
        <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="orders"><ShoppingBag className="mr-2 h-4 w-4"/>Your Orders</TabsTrigger>
                <TabsTrigger value="security"><User className="mr-2 h-4 w-4"/>Login & Security</TabsTrigger>
                <TabsTrigger value="addresses"><BookUser className="mr-2 h-4 w-4"/>Your Addresses</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-6">
                <OrderHistory orders={orders} />
            </TabsContent>
            <TabsContent value="security" className="mt-6">
                <ProfileForm user={user} />
            </TabsContent>
            <TabsContent value="addresses" className="mt-6">
                <AddressBook user={user} />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
