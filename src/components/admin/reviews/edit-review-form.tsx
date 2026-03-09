"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateProductReviewAction, ReviewFormState } from "@/app/admin/products/[id]/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ProductReview } from "@/lib/types";

interface EditReviewFormProps {
  review: ProductReview;
  onSuccess: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

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

export function EditReviewForm({ review, onSuccess }: EditReviewFormProps) {
  const initialState: ReviewFormState = { message: "", errors: {} };
  const [state, formAction] = useFormState(updateProductReviewAction, initialState);
  const [rating, setRating] = useState(review.rating);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({
          title: "Error",
          description: state.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: state.message });
        onSuccess();
      }
    }
  }, [state, toast, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={review.id} />
      <input type="hidden" name="product_id" value={review.product_id} />
      <input type="hidden" name="status" value={review.status} />
      <input type="hidden" name="rating" value={rating} />

      <div className="space-y-2">
        <Label htmlFor="reviewer_name">Reviewer Name</Label>
        <Input
          id="reviewer_name"
          name="reviewer_name"
          defaultValue={review.reviewer_name}
        />
        {state.errors?.reviewer_name && <p className="text-sm text-destructive">{state.errors.reviewer_name[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRating rating={rating} setRating={setRating} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="text">Review Text</Label>
        <Textarea
          id="text"
          name="text"
          defaultValue={review.text}
          rows={4}
        />
        {state.errors?.text && <p className="text-sm text-destructive">{state.errors.text[0]}</p>}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <SubmitButton />
      </DialogFooter>
    </form>
  );
}
