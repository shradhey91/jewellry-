
'use client';

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitCustomerReviewAction, ReviewFormState } from "@/lib/server/actions/products";
import { useUser } from "@/auth/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast.tsx";
import Link from "next/link";

function StarRating({ rating, setRating }: { rating: number; setRating: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => setRating(star)}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              "h-6 w-6 cursor-pointer transition-colors",
              rating >= star ? "text-primary fill-primary" : "text-muted-foreground/50"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Submit Review
    </Button>
  );
}


export function CustomerReviewForm({ productId }: { productId: string }) {
    const { user, isLoading } = useUser();
    const [rating, setRating] = useState(5);
    const { toast } = useToast();
    const initialState: ReviewFormState = { message: "", errors: {} };
    const [state, formAction] = useFormState(submitCustomerReviewAction, initialState);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.errors ? "Error" : "Thank you!",
                description: state.message,
                variant: state.errors ? "destructive" : "default",
            });
        }
    }, [state, toast]);

    if (isLoading) {
        return (
             <Card>
                <CardContent className="p-6">
                    <div className="h-10 w-1/3 bg-muted animate-pulse rounded-md" />
                </CardContent>
            </Card>
        )
    }
    
    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You must be <Link href="/auth/login" className="underline font-semibold hover:text-primary">logged in</Link> to write a review.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Write a Review</CardTitle>
                <CardDescription>Share your thoughts with other customers.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="product_id" value={productId} />
                    <input type="hidden" name="rating" value={rating} />
                    <input type="hidden" name="reviewer_name" value={user.name || 'Anonymous'} />
                    
                    <div className="space-y-2">
                        <Label>Your Rating</Label>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="text">Your Review</Label>
                        <Textarea id="text" name="text" placeholder="What did you like or dislike?" />
                        {state.errors?.text && <p className="text-sm text-destructive">{state.errors.text[0]}</p>}
                    </div>

                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}

    