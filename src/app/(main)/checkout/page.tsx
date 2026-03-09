'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useCart } from '@/hooks/use-cart.tsx';
import { Button } from '@/components/ui/button';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Check, Shield, Truck, Heart, Sparkles, Gift, Star } from 'lucide-react';

import { ShippingForm } from '@/components/checkout/shipping-form';
import { OrderSummary } from '@/components/checkout/order-summary';
import { placeOrderAction, PlaceOrderFormState } from './actions';
import { createCashfreeOrder, verifyCashfreePayment } from './razorpay-actions';
import { useToast } from '@/hooks/use-toast.tsx';
import { getAccountDetails } from '@/app/(main)/account/actions';
import type { User } from '@/lib/types';

const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  phone_number: z.string().regex(/^\d{10,15}$/, 'A valid phone number is required for delivery updates.'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(5, 'Valid ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, isCartReady, discount, discountAmount } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
        country: 'India'
    }
  });

  const { reset } = methods;

  useEffect(() => {
    async function fetchUser() {
        const userDetails = await getAccountDetails();
        setUser(userDetails);

        const defaultValues: Partial<CheckoutFormValues> = { country: 'India' };

        if (userDetails) {
            defaultValues.email = userDetails.email || '';
            defaultValues.phone_number = userDetails.phone_number || '';

            if (userDetails.default_address_id && userDetails.addresses) {
                const defaultAddress = userDetails.addresses.find(a => a.id === userDetails.default_address_id);
                if (defaultAddress) {
                    defaultValues.name = defaultAddress.name;
                    defaultValues.address = defaultAddress.address;
                    defaultValues.city = defaultAddress.city;
                    defaultValues.state = defaultAddress.state;
                    defaultValues.zip = defaultAddress.zip;
                    defaultValues.country = defaultAddress.country || 'India';
                }
            }
        }
        reset(defaultValues);
        setIsLoading(false);
    }
    fetchUser();
  }, [reset]);

  const [formState, setFormState] = useState<PlaceOrderFormState>({ message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isCartReady) return;
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Redirecting you to the shop.",
      });
      router.push('/shop');
    }
  }, [cartItems, isCartReady, router, toast]);

  useEffect(() => {
      if (formState.orderId) {
        toast({
          title: "Order Placed!",
          description: formState.message,
        });
        clearCart();
        router.push(`/checkout/order-confirmation/${formState.orderId}`);
      } else if (formState.message && (formState.errors || formState.message.includes('Failed'))) {
        toast({
          title: "Error",
          description: formState.message,
          variant: "destructive",
        });
      }
  }, [formState, router, toast, clearCart]);

  const handlePayment = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);

    const customerDetails = {
        id: user?.id || `guest_${data.phone_number}`,
        email: data.email,
        phone: data.phone_number,
        name: data.name
    };

    const cashfreeOrder = await createCashfreeOrder(cartTotal, customerDetails);

    if (!cashfreeOrder || !cashfreeOrder.payment_session_id) {
        toast({ title: 'Error', description: 'Could not initialize payment. Please try again.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }

    const cashfree = new (window as any).Cashfree(cashfreeOrder.payment_session_id);

    cashfree.checkout({
        paymentSessionId: cashfreeOrder.payment_session_id,
        redirectTarget: "_self"
    }).then(async (result: any) => {
        setIsSubmitting(false);
        if (result.error) {
            toast({ title: 'Payment Failed', description: result.error.message, variant: 'destructive'});
        }
        if (result.payment && result.payment.status === "SUCCESS") {
            setIsSubmitting(true);
            const isVerified = await verifyCashfreePayment(result.order.orderId);

            if (isVerified) {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                formData.append('cartItems', JSON.stringify(cartItems));
                if (discount) {
                    formData.append('discountCode', discount.code);
                    formData.append('discountAmount', discountAmount.toString());
                }

                const orderResult = await placeOrderAction({ message: "", errors: {} }, formData);
                setFormState(orderResult);
            } else {
                toast({ title: 'Payment Verification Failed', description: 'Your payment could not be verified. Please contact support.', variant: 'destructive'});
                setIsSubmitting(false);
            }
        }
    });
  };

  if (!isCartReady || isLoading) {
    return <div className="container py-24 text-center">Loading checkout...</div>;
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <>
        <Script
            id="cashfree-checkout-js"
            src="https://sdk.cashfree.com/js/v3/cashfree.js"
        />
        
        {/* Celebration Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-20 left-4 md:left-10 text-4xl md:text-6xl opacity-10 animate-bounce" style={{ animationDuration: '3s' }}>✨</div>
            <div className="absolute top-32 right-4 md:right-20 text-3xl md:text-5xl opacity-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>🎉</div>
            <div className="absolute bottom-32 left-1/4 text-3xl md:text-4xl opacity-10 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>💝</div>
            <div className="absolute top-1/3 right-1/4 text-3xl md:text-5xl opacity-10 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '0.3s' }}>🌟</div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12 lg:py-20 relative z-10">
            {/* Happy Header */}
            <div className="text-center mb-8 md:mb-12">
                <div className="inline-flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 md:mb-6 animate-pulse">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    <span className="text-sm md:text-base text-primary font-medium">You're almost there!</span>
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-headline tracking-tight mb-3 md:mb-4 bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent px-2">
                    Complete Your Amazing Order
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                    Great choice! You're just a few steps away from something wonderful. 🎁
                </p>
            </div>

            {/* Trust Badges - Mobile Optimized */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-3 md:gap-6 mb-8 md:mb-12">
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground bg-card px-3 md:px-4 py-2 md:py-2 rounded-full shadow-sm border border-border">
                    <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                    <span className="hidden xs:inline">Secure Payment</span>
                    <span className="xs:hidden">Secure</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground bg-card px-3 md:px-4 py-2 md:py-2 rounded-full shadow-sm border border-border">
                    <Truck className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                    <span className="hidden xs:inline">Free Shipping</span>
                    <span className="xs:hidden">Free Ship</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground bg-card px-3 md:px-4 py-2 md:py-2 rounded-full shadow-sm border border-border">
                    <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                    <span className="hidden xs:inline">Made with Love</span>
                    <span className="xs:hidden">With Love</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground bg-card px-3 md:px-4 py-2 md:py-2 rounded-full shadow-sm border border-border">
                    <Gift className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                    <span className="hidden xs:inline">Easy Returns</span>
                    <span className="xs:hidden">Returns</span>
                </div>
            </div>

            {/* Progress Indicator - Mobile Optimized */}
            <div className="flex justify-center mb-8 md:mb-12 overflow-x-auto">
                <div className="flex items-center gap-2 md:gap-4 min-w-max">
                    <div className="flex items-center gap-1 md:gap-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:text-base">
                            <Check className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <span className="text-xs md:text-sm font-medium text-primary">Cart</span>
                    </div>
                    <div className="w-10 md:w-16 h-0.5 md:h-1 bg-gradient-to-r from-primary to-primary/30 rounded-full"></div>
                    <div className="flex items-center gap-1 md:gap-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg shadow-primary/30 animate-pulse text-sm md:text-base">
                            <Star className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-primary">Checkout</span>
                    </div>
                    <div className="w-10 md:w-16 h-0.5 md:h-1 bg-gradient-to-r from-primary/30 to-border rounded-full"></div>
                    <div className="flex items-center gap-1 md:gap-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm md:text-base">
                            <Gift className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <span className="text-xs md:text-sm font-medium text-muted-foreground">Confirm</span>
                    </div>
                </div>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(handlePayment)} className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-16 items-start">
                    <div className="space-y-4 md:space-y-6 lg:space-y-8">
                        {/* Shipping Section with Happy Header */}
                        <div className="bg-gradient-to-br from-card to-secondary/20 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-border">
                            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Truck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg md:text-xl font-bold font-headline">Shipping Details</h2>
                                    <p className="text-xs md:text-sm text-muted-foreground truncate">Where should we send your goodies?</p>
                                </div>
                            </div>
                            <ShippingForm user={user} />
                        </div>
                    </div>

                    <div className="lg:sticky lg:top-28 space-y-4 md:space-y-6 lg:space-y-8">
                        {/* Order Summary with Celebration Styling */}
                        <div className="bg-gradient-to-br from-primary/5 via-card to-accent/10 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border-2 border-primary/20">
                            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Gift className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg md:text-xl font-bold font-headline">Your Order</h2>
                                    <p className="text-xs md:text-sm text-muted-foreground">You've made excellent choices!</p>
                                </div>
                            </div>
                            <OrderSummary />
                        </div>

                        {/* CTA Button with Encouragement */}
                        <div className="space-y-3 md:space-y-4">
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full text-base md:text-lg font-bold py-4 md:py-6 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 md:w-5 h-5 animate-spin" />
                                        <span className="hidden xs:inline">Processing Your Magic...</span>
                                        <span className="xs:hidden">Processing...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 md:w-5 md:h-5" />
                                        <span className="hidden xs:inline">Complete My Order - {formatCurrency(cartTotal)}</span>
                                        <span className="xs:hidden">Pay {formatCurrency(cartTotal)}</span>
                                    </span>
                                )}
                            </Button>

                            {/* Reassurance Text */}
                            <p className="text-center text-xs md:text-sm text-muted-foreground flex items-center justify-center gap-1.5 md:gap-2">
                                <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                                Your payment information is secure and encrypted
                            </p>
                        </div>

                        {/* Happy Guarantee Box */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-3 md:p-4 border-2 border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm md:text-base text-green-800 dark:text-green-300">100% Happiness Guarantee</h3>
                                    <p className="text-xs md:text-sm text-green-700 dark:text-green-400 mt-0.5 md:mt-1">
                                        Not completely satisfied? We'll make it right. Your happiness is our priority! 💚
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    </>
  );
}
