"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart.tsx";
import { useToast } from "@/hooks/use-toast.tsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CartItems } from "@/components/cart/cart-items";
import {
  ShieldCheck,
  Truck,
  Wallet,
  Loader2,
  Tag,
  X,
  Sparkles,
  Heart,
  Gift,
  Star,
  ShoppingBag,
  Check,
} from "lucide-react";
import { useUser } from "@/auth/hooks/use-user";
import { getDiscounts } from "@/lib/server/actions/discounts";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

interface DiscountInfo {
  id: string;
  code: string;
  type: "percentage" | "fixed_amount";
  value: number;
  min_purchase: number;
  description?: string;
}

function TrustBadges() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8">
      <div className="flex items-center gap-2 md:gap-3 bg-card px-3 md:px-5 py-3 md:py-4 rounded-xl shadow-md border border-border">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-xs md:text-sm truncate">
            Purity Guaranteed
          </p>
          <p className="text-xs text-muted-foreground truncate">
            on every online purchase
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3 bg-card px-3 md:px-5 py-3 md:py-4 rounded-xl shadow-md border border-border">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Truck className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-xs md:text-sm truncate">
            Secure Delivery
          </p>
          <p className="text-xs text-muted-foreground truncate">
            by our trusted partners
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3 bg-card px-3 md:px-5 py-3 md:py-4 rounded-xl shadow-md border border-border sm:col-span-2 md:col-span-1">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Wallet className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-xs md:text-sm truncate">
            Easy & Secure Payments
          </p>
          <p className="text-xs text-muted-foreground truncate">
            backed by TATA
          </p>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function CartPage() {
  const {
    cartSubtotal,
    cartCount,
    cartTotal,
    discount,
    discountAmount,
    applyDiscount,
    removeDiscount,
  } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<DiscountInfo[]>([]);
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useUser();

  // Fetch active coupons on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const allDiscounts = await getDiscounts();

        const now = new Date().getTime(); // use timestamp for consistency

        const activeCoupons = allDiscounts
          .filter((d) => {
            if (!d.is_active) return false;

            if (d.start_date && new Date(d.start_date).getTime() > now)
              return false;

            if (d.end_date && new Date(d.end_date).getTime() < now)
              return false;

            if (d.usage_limit !== null && d.usage_count >= d.usage_limit)
              return false;

            return true;
          })
          .map((d) => ({
            id: d.id,
            code: d.code,
            type: d.type,
            value: d.value,
            min_purchase: d.min_purchase,
            description:
              d.description ||
              `${d.type === "percentage" ? d.value + "%" : "₹" + d.value} OFF${
                d.min_purchase > 0 ? " on orders above ₹" + d.min_purchase : ""
              }`,
          }));

        setAvailableCoupons(activeCoupons);
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      }
    };

    fetchCoupons();
  }, []);

  const handleApplyCode = async () => {
    if (!couponCode) return;
    setIsLoading(true);
    const result = await applyDiscount(couponCode);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
    if (result.success) {
      setCouponCode("");
    }
    setIsLoading(false);
  };

  const handleApplyCodeWithCode = async (code: string) => {
    setIsLoading(true);
    const result = await applyDiscount(code);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
    if (result.success) {
      setCouponCode("");
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-secondary/30 relative">
      {/* Celebration Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-32 left-4 md:left-16 text-3xl md:text-5xl opacity-10 animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          🛍️
        </div>
        <div
          className="absolute top-40 right-4 md:right-24 text-3xl md:text-4xl opacity-10 animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "0.5s" }}
        >
          ✨
        </div>
        <div
          className="absolute bottom-32 left-1/3 text-3xl md:text-4xl opacity-10 animate-bounce"
          style={{ animationDuration: "3.5s", animationDelay: "1s" }}
        >
          💝
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12 relative z-10">
        {cartCount > 0 ? (
          <>
            {/* Happy Header */}
            <div className="text-center mb-8 md:mb-10">
              <div className="inline-flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 md:mb-6 animate-pulse">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <span className="text-sm md:text-base text-primary font-medium">
                  Your Shopping Cart
                </span>
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-headline tracking-tight mb-3 md:mb-4 bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent px-2">
                You've Got Great Taste!
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                {cartCount} {cartCount === 1 ? "item" : "items"} waiting for
                you. Let's make them yours! 🎉
              </p>
            </div>

            {/* Progress Indicator - Mobile Optimized */}
            <div className="flex justify-center mb-8 md:mb-12 overflow-x-auto">
              <div className="flex items-center gap-2 md:gap-4 min-w-max">
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:text-base shadow-lg shadow-primary/30 animate-pulse">
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-primary">
                    Cart
                  </span>
                </div>
                <div className="w-10 md:w-16 h-0.5 md:h-1 bg-gradient-to-r from-primary to-primary/30 rounded-full"></div>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm md:text-base">
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">
                    Checkout
                  </span>
                </div>
                <div className="w-10 md:w-16 h-0.5 md:h-1 bg-gradient-to-r from-primary/30 to-border rounded-full"></div>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm md:text-base">
                    <Gift className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">
                    Confirm
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                <CartItems />
                <TrustBadges />
              </div>

              <div className="lg:sticky lg:top-28 space-y-4 md:space-y-6">
                {!isUserLoading && !user && (
                  <Card className="overflow-hidden border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 via-card to-accent/10">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="relative w-24 h-16 md:w-28 md:h-20 shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src="https://picsum.photos/seed/rewards-banner/200/150"
                            layout="fill"
                            objectFit="contain"
                            alt="Rewards"
                            data-ai-hint="rewards illustration"
                          />
                        </div>
                        <div className="text-xs md:text-sm">
                          <Link
                            href="/auth/login"
                            className="font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <Heart className="w-3 h-3" />
                            Login/Sign Up
                          </Link>
                          <p className="text-muted-foreground text-xs mt-0.5 md:mt-1">
                            Unlock Exclusive Rewards
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Order Summary with Celebration Styling */}
                <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 via-card to-accent/10">
                  <CardHeader className="pb-3 md:pb-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Gift className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-lg md:text-xl">
                        Order Summary
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="coupon">
                        <AccordionTrigger className="font-semibold text-xs md:text-sm py-2 md:py-3">
                          <span className="flex items-center gap-1.5 md:gap-2">
                            <Tag className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                            <span className="hidden xs:inline">
                              Apply Coupon code / Promo Code
                            </span>
                            <span className="xs:hidden">Apply Coupon</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-3 md:pt-4">
                          {discount ? (
                            <div className="flex justify-between items-center rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950/20 pl-2.5 md:pl-3 pr-1.5 md:pr-2 py-1.5 md:py-2">
                              <p className="text-xs md:text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-1.5 md:gap-2">
                                <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span className="hidden xs:inline">
                                  CODE APPLIED: {discount.code}
                                </span>
                                <span className="xs:hidden">
                                  {discount.code}
                                </span>
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8 hover:bg-green-100 dark:hover:bg-green-900"
                                onClick={removeDiscount}
                              >
                                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3 md:space-y-4">
                              <div className="flex space-x-2">
                                <Input
                                  id="discount-code"
                                  placeholder="Enter coupon code"
                                  value={couponCode}
                                  onChange={(e) =>
                                    setCouponCode(e.target.value.toUpperCase())
                                  }
                                  className="border-2 focus:border-primary transition-colors text-sm"
                                />
                                <Button
                                  onClick={handleApplyCode}
                                  disabled={isLoading || !couponCode}
                                  className="bg-primary hover:bg-primary/90 text-sm px-3 md:px-4"
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                                  ) : (
                                    <span className="hidden xs:inline">
                                      Apply
                                    </span>
                                  )}
                                </Button>
                              </div>
                              {availableCoupons.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Available Coupons
                                  </p>
                                  <div className="grid grid-cols-1 gap-2">
                                    {availableCoupons.map((coupon) => (
                                      <Button
                                        key={coupon.id}
                                        variant="outline"
                                        className="justify-between h-auto py-2.5 md:py-3 px-3 md:px-4 border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
                                        onClick={() => {
                                          setCouponCode(coupon.code);
                                          handleApplyCodeWithCode(coupon.code);
                                        }}
                                      >
                                        <div className="flex flex-col items-start gap-0.5 md:gap-1">
                                          <span className="font-bold text-xs md:text-sm text-primary">
                                            {coupon.code}
                                          </span>
                                          <span className="text-xs text-muted-foreground font-normal hidden md:inline">
                                            {coupon.description}
                                          </span>
                                        </div>
                                        <Tag className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="space-y-2.5 md:space-y-3 pt-3 md:pt-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Sub Total</span>
                        <span className="font-medium">
                          {formatCurrency(cartSubtotal)}
                        </span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span className="hidden xs:inline">
                              Product Discount
                            </span>
                            <span className="xs:hidden">Discount</span>
                          </span>
                          <span className="font-semibold">
                            -{formatCurrency(discountAmount)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Delivery Charge
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          FREE
                        </span>
                      </div>
                      <Separator className="!my-3 md:!my-4" />
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 md:p-4 -mx-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm md:text-base">
                            TOTAL (Incl. of all Taxes)
                          </span>
                          <span className="font-bold text-xl md:text-2xl text-primary">
                            {formatCurrency(cartTotal)}
                          </span>
                        </div>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex items-center justify-between text-xs md:text-sm text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/20 rounded-lg p-2.5 md:p-3 -mx-2">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden xs:inline">You Save</span>
                            <span className="xs:hidden">Save</span>
                          </span>
                          <span>{formatCurrency(discountAmount)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 md:pt-4">
                    <Button
                      size="lg"
                      className="w-full text-sm md:text-lg font-bold py-4 md:py-6 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1"
                      asChild
                    >
                      <Link
                        href="/checkout"
                        className="flex items-center gap-1.5 md:gap-2"
                      >
                        <Heart className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden xs:inline">
                          Proceed to Checkout
                        </span>
                        <span className="xs:hidden">Checkout</span>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Happy Guarantee Box */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-3 md:p-4 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm md:text-base text-green-800 dark:text-green-300">
                        100% Happiness Guarantee
                      </h3>
                      <p className="text-xs md:text-sm text-green-700 dark:text-green-400 mt-0.5 md:mt-1">
                        Not completely satisfied? We'll make it right. Your
                        happiness is our priority! 💚
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <CartItems />
        )}
      </div>
    </div>
  );
}
