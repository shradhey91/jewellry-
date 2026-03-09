

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { getOrderById } from '@/lib/server/api';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Truck } from 'lucide-react';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getOrderById(id).then(fetchedOrder => {
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        }
        setIsLoading(false);
      });
    } else {
        setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return <div className="container py-24 text-center">Loading your order confirmation...</div>;
  }

  if (!order) {
    return notFound();
  }
  
  const subtotal = order.items.reduce((acc, item) => acc + item.price_snapshot.total * item.quantity, 0);
  const discountAmount = order.discount?.amount || 0;
  const total = subtotal - discountAmount;

  return (
    <div className="bg-secondary/40 min-h-screen py-16 md:py-24">
        <div className="container max-w-4xl mx-auto">
            <Card className="shadow-2xl">
                <CardHeader className="text-center bg-background rounded-t-lg p-8">
                    <div className="mx-auto w-fit bg-green-100 text-green-700 rounded-full p-3">
                       <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Order #{order.id}</p>
                    <CardTitle className="text-3xl font-bold font-headline">Thank you for your order, {order.shippingAddress.name}!</CardTitle>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Your order has been placed successfully. A confirmation email has been sent to your inbox with the details of your purchase.
                    </p>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div>
                        <h3 className="font-semibold mb-4">Order Summary</h3>
                        <ul role="list" className="divide-y divide-border">
                            {order.items.map(item => (
                                <li key={item.product_id + item.variant_id} className="flex py-4">
                                    <div className="flex-shrink-0">
                                        <Image src={item.product_image} alt={item.product_name} width={80} height={80} className="h-20 w-20 rounded-md object-cover" />
                                    </div>
                                    <div className="ml-4 flex flex-1 flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-foreground">
                                                <h3>{item.product_name}</h3>
                                                <p className="ml-4">{formatCurrency(item.price_snapshot.total * item.quantity)}</p>
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground">{item.variant_label}</p>
                                            {item.gift_message && (
                                                <p className="mt-2 text-xs text-muted-foreground border-l-2 pl-2 italic">
                                                    <strong>Gift Message:</strong> "{item.gift_message}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-1 items-end justify-between text-sm">
                                            <p className="text-muted-foreground">Qty {item.quantity}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold mb-4">Shipping Address</h3>
                            <address className="not-italic text-muted-foreground">
                                {order.shippingAddress.name}<br />
                                {order.shippingAddress.address}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                                {order.shippingAddress.country}
                            </address>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-4">Payment Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    {order.discount && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount ({order.discount.code})</span>
                                            <span>-{formatCurrency(order.discount.amount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>FREE</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>
                             {order.shipping_carrier && order.tracking_number && (
                                <div>
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-primary"/>
                                        Shipment Tracking
                                    </h3>
                                    <div className="text-sm text-muted-foreground space-y-1 rounded-md border p-4">
                                        <p><strong>Carrier:</strong> {order.shipping_carrier}</p>
                                        <p><strong>Tracking #:</strong> {order.tracking_number}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-8">
                    <Button asChild className="w-full" size="lg">
                        <Link href="/shop">Continue Shopping</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
