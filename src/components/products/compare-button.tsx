
'use client';

import React from 'react';
import { useCompare } from '@/hooks/use-compare';
import { Button, ButtonProps } from '@/components/ui/button';
import { GitCompareArrows } from 'lucide-react';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CompareButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    product: Product;
    variant?: ButtonProps['variant'];
    showText?: boolean;
    children?: React.ReactNode;
}

export function CompareButton({ product, variant = 'outline', showText = true, className, children, ...props }: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare, isCompareFull } = useCompare();
  const { toast } = useToast();
  const inCompare = isInCompare(product.id);

  const handleToggleCompare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCompare) {
      removeFromCompare(product.id);
      toast({
        title: 'Removed from Compare',
        description: `${product.name} has been removed from your comparison.`,
      });
    } else {
      const { success, message } = addToCompare(product.id);
      toast({
        title: success ? 'Added to Compare' : 'Could Not Add',
        description: message,
        variant: success ? 'default' : 'destructive',
      });
    }
  };
  
  const isDisabled = isCompareFull && !inCompare;

  return (
    <Button 
        variant={variant} 
        className={cn(className, inCompare && 'border-primary text-primary')} 
        onClick={handleToggleCompare} 
        disabled={isDisabled}
        {...props}
    >
      <GitCompareArrows className={cn("mr-2 h-4 w-4", inCompare && "text-primary")} />
      {children ? children : showText && (inCompare ? 'In Compare' : 'Compare')}
    </Button>
  );
}
