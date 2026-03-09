'use client';

import { useCart } from '@/hooks/use-cart.tsx';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, Truck, Sparkles } from 'lucide-react';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function OrderSummary() {
  const { cartItems, cartSubtotal, cartTotal, discount, discountAmount } = useCart();

  return (
    <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="space-y-3 md:space-y-4 p-0">
             {cartItems.map(item => (
                <div key={item.product_id + item.variant_id} className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product_name}</p>
                        <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm md:text-base flex-shrink-0">{formatCurrency(item.price_snapshot.total * item.quantity)}</p>
                </div>
             ))}
            <Separator className="my-3 md:my-4" />
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs md:text-sm">Subtotal</span>
                <span className="font-medium text-sm md:text-base">{formatCurrency(cartSubtotal)}</span>
            </div>
            {discount && (
                <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                    <span className="text-muted-foreground flex items-center gap-1 text-xs md:text-sm">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden xs:inline">Discount ({discount.code})</span>
                        <span className="xs:hidden">{discount.code}</span>
                    </span>
                    <span className="font-semibold text-sm md:text-base">-{formatCurrency(discountAmount)}</span>
                </div>
            )}
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs md:text-sm">Shipping</span>
                <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 text-sm md:text-base">
                    <Truck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    FREE
                </span>
            </div>
            <Separator className="my-3 md:my-4" />
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 md:p-4 -mx-2 md:-mx-4">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-sm md:text-lg">Order Total</span>
                    <span className="font-bold text-xl md:text-2xl text-primary">{formatCurrency(cartTotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 md:mt-2 text-center">
                    🎉 Amazing! You're about to make a great purchase!
                </p>
            </div>
        </CardContent>
    </Card>
  );
}
