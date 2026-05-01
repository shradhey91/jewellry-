

"use client";

import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/types';
import { useCart } from '@/hooks/use-cart.tsx';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast.tsx';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { getGiftMessagesAction } from '@/lib/actions/client-data';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

interface GiftMessageCategory {
    category: string;
    messages: string[];
}

interface AddToCartFormProps {
  product: Product;
  selectedVariantId?: string;
  onVariantChange?: (variantId?: string) => void;
  showGiftOption?: boolean;
}

export function AddToCartForm({ product, selectedVariantId: propSelectedVariantId, onVariantChange, showGiftOption = true }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [internalSelectedVariantId, setInternalSelectedVariantId] = useState<string | undefined>(
    product.variants.length > 0 ? product.variants[0].id : undefined
  );
  const [giftMessageSuggestions, setGiftMessageSuggestions] = useState<GiftMessageCategory[]>([]);
  const [selectedGiftCategory, setSelectedGiftCategory] = useState<string | undefined>();

  const router = useRouter();

  useEffect(() => {
    getGiftMessagesAction().then(setGiftMessageSuggestions);
  }, []);

  const selectedMessages = giftMessageSuggestions.find(
      (c) => c.category === selectedGiftCategory
  )?.messages;

  const isControlled = propSelectedVariantId !== undefined && onVariantChange !== undefined;

  const selectedVariantId = isControlled ? propSelectedVariantId : internalSelectedVariantId;
  const setSelectedVariantId = isControlled ? onVariantChange : setInternalSelectedVariantId;


  const { addToCart } = useCart();
  const { toast } = useToast();

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);

  const handleAddToCart = () => {
    if (!selectedVariantId || !selectedVariant) {
        toast({
            title: "Unavailable",
            description: "This product is currently unavailable.",
            variant: "destructive",
        });
        return;
    }

    addToCart({
      product_id: product.id,
      variant_id: selectedVariantId,
      quantity,
      price_snapshot: selectedVariant.price_breakup || product.price_breakup,
      product_name: product.name,
      product_image: product.media.find(m => m.is_primary)?.url || '',
      variant_label: selectedVariant.label,
      gift_message: showGiftOption && isGift ? giftMessage : undefined,
    });

    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} (${selectedVariant.label}) has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!selectedVariantId || !selectedVariant) {
      toast({
        title: 'Unavailable',
        description: 'This product is currently unavailable.',
        variant: 'destructive',
      });
      return;
    }

    addToCart({
      product_id: product.id,
      variant_id: selectedVariantId,
      quantity,
      price_snapshot: selectedVariant.price_breakup || product.price_breakup,
      product_name: product.name,
      product_image: product.media.find(m => m.is_primary)?.url || '',
      variant_label: selectedVariant.label,
      gift_message: showGiftOption && isGift ? giftMessage : undefined,
    });
    router.push('/checkout');
  };
  
  const isAvailable = product.variants.length > 0;

  return (
    <div className="space-y-4">
      {(product.variants.length > 1) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="variant-select">
              {product.has_ring_size ? 'Size' : 'Variant'}
            </Label>
            <Select
              value={selectedVariantId}
              onValueChange={setSelectedVariantId}
              disabled={!isAvailable}
            >
              <SelectTrigger id="variant-select">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {product.variants.map((variant: ProductVariant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity(q => Math.max(1, q-1))}
                disabled={!isAvailable}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center flex-1">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity(q => q+1)}
                disabled={!isAvailable}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {showGiftOption && (
        <div className="space-y-4 rounded-md border p-4">
          <div className="flex items-center space-x-2">
              <Checkbox id="is-gift" checked={isGift} onCheckedChange={(checked) => setIsGift(Boolean(checked))} />
              <Label htmlFor="is-gift" className="cursor-pointer font-medium">This is a gift</Label>
          </div>
          {isGift && (
              <div className="space-y-4 pt-2">
                  {giftMessageSuggestions.length > 0 && (
                      <div className="space-y-2">
                          <Label>Message Suggestions</Label>
                          <Select onValueChange={setSelectedGiftCategory}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a category..." />
                              </SelectTrigger>
                              <SelectContent>
                                  {giftMessageSuggestions.map(cat => (
                                      <SelectItem key={cat.category} value={cat.category}>{cat.category}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                          {selectedMessages && (
                              <ScrollArea className="w-full whitespace-nowrap">
                                  <div className="flex w-max space-x-2 py-2">
                                      {selectedMessages.map((msg, i) => (
                                          <Button
                                              key={i}
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              className="h-auto shrink-0"
                                              onClick={() => setGiftMessage(msg)}
                                          >
                                              {msg}
                                          </Button>
                                      ))}
                                  </div>
                                  <ScrollBar orientation="horizontal" />
                              </ScrollArea>
                          )}
                      </div>
                  )}
                  <div className="space-y-2">
                      <Label htmlFor="gift-message">Your personal message</Label>
                      <Textarea
                          id="gift-message"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="Or write your own message here..."
                          maxLength={150}
                      />
                      <p className="text-xs text-muted-foreground text-right">{giftMessage.length}/150</p>
                  </div>
              </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
         <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={handleAddToCart}
          disabled={!isAvailable}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isAvailable ? 'Add to Cart' : 'Out of Stock'}
        </Button>
         <Button
          type="button"
          size="lg"
          className="w-full hover:bg-primary hover:text-primary-foreground"
          variant="outline"
          onClick={handleBuyNow}
          disabled={!isAvailable}
        >
          Buy Now <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
