
'use client';
import { useWishlist } from '@/hooks/use-wishlist';
import { Button, ButtonProps } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast.tsx';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { useUser } from '@/auth/hooks/use-user';
import { LoginSignupModal } from '@/components/auth/login-signup-modal';

interface WishlistButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    product: Product;
    variant?: ButtonProps["variant"];
    showText?: boolean;
    children?: React.ReactNode;
}

export function WishlistButton({ product, variant = "outline", showText = true, className, children, ...props }: WishlistButtonProps) {
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const { user } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast({
        title: 'Removed from Wishlist',
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product.id);
      toast({
        title: 'Added to Wishlist',
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  return (
    <>
      <Button variant={variant} className={cn(className)} onClick={handleToggleWishlist} {...props}>
        <Heart className={cn("mr-2 h-4 w-4", isInWishlist && "fill-primary text-primary")} />
        {children ? children : showText && (isInWishlist ? 'In Wishlist' : 'Add to Wishlist')}
      </Button>
      <LoginSignupModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        title="Join to Create Your Wishlist"
        description="Sign up or log in to save your favorite items and access them from any device."
      />
    </>
  );
}
