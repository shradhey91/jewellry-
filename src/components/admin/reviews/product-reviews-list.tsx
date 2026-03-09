
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast.tsx";
import { useRouter } from "next/navigation";
import { ProductReview } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, MoreVertical, Edit, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProductReviewAction, updateProductReviewStatus } from "@/app/admin/products/[id]/actions";
import { EditReviewDialog } from "./edit-review-dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductReviewsListProps {
  productId: string;
  initialReviews: ProductReview[];
}

export function ProductReviewsList({ productId, initialReviews }: ProductReviewsListProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const router = useRouter();
  const { toast } = useToast();

  const handleStatusUpdate = async (reviewId: string, status: "approved" | "rejected") => {
    const result = await updateProductReviewStatus(reviewId, productId, status);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
      router.refresh();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleDelete = async (reviewId: string) => {
    const result = await deleteProductReviewAction(reviewId, productId);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      router.refresh();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const statusVariant = (status: ProductReview['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved': return 'secondary';
      case 'pending': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Reviews</CardTitle>
        <CardDescription>Manage and view all reviews for this product.</CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="flex items-start gap-4 border p-4 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold">{review.reviewer_name}</p>
                        <Badge variant={statusVariant(review.status)}>{review.status}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-primary fill-primary" : "text-muted-foreground/50")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(review.created_at), "MMMM d, yyyy")}
                  </p>
                  <p className="mt-2 text-sm text-foreground/80">{review.text}</p>
                </div>
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       {review.status !== 'approved' && (
                         <DropdownMenuItem onSelect={() => handleStatusUpdate(review.id, 'approved')}>
                            <Check className="mr-2 h-4 w-4" /> Approve
                         </DropdownMenuItem>
                       )}
                       {review.status !== 'rejected' && (
                         <DropdownMenuItem onSelect={() => handleStatusUpdate(review.id, 'rejected')}>
                            <X className="mr-2 h-4 w-4" /> Reject
                         </DropdownMenuItem>
                       )}
                       <DropdownMenuSeparator />
                       <EditReviewDialog review={review}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                       </EditReviewDialog>
                       <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                       </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                   <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this review.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(review.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No reviews for this product yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

    