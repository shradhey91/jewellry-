
import type { PriceBreakup } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PriceDisplayProps {
  priceBreakup: PriceBreakup;
  finalPrice: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function PriceDisplay({ priceBreakup, finalPrice }: PriceDisplayProps) {
  return (
    <div className="space-y-2 text-sm">
        <div className="flex justify-between">
            <span className="text-muted-foreground">Metal Value</span>
            <span>{formatCurrency(priceBreakup.metal_value)}</span>
        </div>
        <div className="flex justify-between">
            <span className="text-muted-foreground">Making Charges</span>
            <span>{formatCurrency(priceBreakup.making_charge)}</span>
        </div>
        <div className="flex justify-between">
            <span className="text-muted-foreground">GST</span>
            <span>{formatCurrency(priceBreakup.gst)}</span>
        </div>
        <Separator className="my-2 bg-border/50" />
        <div className="flex justify-between font-bold text-base">
            <span>Total Price</span>
            <span className="text-primary">{formatCurrency(finalPrice)}</span>
        </div>
        {Math.round(priceBreakup.total) !== Math.round(finalPrice) && (
            <p className="text-xs text-muted-foreground text-center pt-1">
                Special price applied. Calculated price was {formatCurrency(priceBreakup.total)}.
            </p>
        )}
    </div>
  );
}
