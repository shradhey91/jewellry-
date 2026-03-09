
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PriceBreakup } from "@/lib/types";
import { Gem, Ticket, Percent, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ReactNode } from "react";

interface PriceBreakupModalProps {
  priceBreakup: PriceBreakup;
  finalPrice: number;
  children: ReactNode;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function PriceBreakupModal({ priceBreakup, finalPrice, children }: PriceBreakupModalProps) {
  const isDiscounted = Math.round(priceBreakup.total) !== Math.round(finalPrice);
  const discountAmount = priceBreakup.total - finalPrice;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Price Breakup</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Gem className="h-5 w-5 text-primary"/>
              <div>
                <p className="font-semibold">Metal Value</p>
                <p className="text-xs text-muted-foreground">Price of gold/silver in your product.</p>
              </div>
            </div>
            <span className="font-medium">{formatCurrency(priceBreakup.metal_value)}</span>
          </div>

          {priceBreakup.diamond_value > 0 && (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary"/>
                <div>
                  <p className="font-semibold">Diamond Value</p>
                  <p className="text-xs text-muted-foreground">Total price of all diamonds.</p>
                </div>
              </div>
              <span className="font-medium">{formatCurrency(priceBreakup.diamond_value)}</span>
            </div>
          )}
          
          <div className="flex items-start justify-between">
             <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-primary"/>
              <div>
                <p className="font-semibold">Making Charges</p>
                <p className="text-xs text-muted-foreground">Cost of crafting the jewellery.</p>
              </div>
            </div>
            <span className="font-medium">{formatCurrency(priceBreakup.making_charge)}</span>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <Percent className="h-5 w-5 text-primary"/>
                <div>
                    <p className="font-semibold">GST</p>
                    <p className="text-xs text-muted-foreground">Goods and Services Tax.</p>
                </div>
            </div>
            <span className="font-medium">{formatCurrency(priceBreakup.gst)}</span>
          </div>
          <Separator />
          {isDiscounted && (
             <>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(priceBreakup.total)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                    <span className="font-semibold">Discount</span>
                    <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
                <Separator />
            </>
          )}
          <div className="flex justify-between font-bold text-base">
            <span>Total Price</span>
            <span className="text-foreground">{formatCurrency(finalPrice)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
