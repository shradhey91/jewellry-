"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart.tsx';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag, Trash2, Gift, Sparkles, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getGiftMessages } from '@/lib/server/api';

interface GiftMessageCategory {
  category: string;
  messages: string[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function CartItems() {
  const { cartItems, removeFromCart, updateQuantity, updateGiftMessage } = useCart();
  const [localQuantities, setLocalQuantities] = useState<{[key: string]: number}>({});
  const [expandedGiftItems, setExpandedGiftItems] = useState<{[key: string]: boolean}>({});
  const [giftMessageSuggestions, setGiftMessageSuggestions] = useState<GiftMessageCategory[]>([]);
  const [selectedGiftCategories, setSelectedGiftCategories] = useState<{[key: string]: string}>({});

  useEffect(() => {
    getGiftMessages().then(setGiftMessageSuggestions);
  }, []);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setLocalQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    const [productId, variantId] = itemId.split('|');
    updateQuantity(productId, variantId, newQuantity);
  };

  const getQuantity = (item: typeof cartItems[0]) => {
    const key = item.product_id + '|' + item.variant_id;
    return localQuantities[key] || item.quantity;
  };

  const getItemKey = (item: typeof cartItems[0]) => item.product_id + '|' + item.variant_id;

  const toggleGiftMessage = (itemId: string) => {
    setExpandedGiftItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleGiftMessageSave = (itemId: string, message: string) => {
    const [productId, variantId] = itemId.split('|');
    updateGiftMessage(productId, variantId, message);
  };

  const handleGiftCategorySelect = (itemId: string, category: string) => {
    setSelectedGiftCategories(prev => ({ ...prev, [itemId]: category }));
  };

  const handleSuggestionClick = (itemId: string, message: string) => {
    handleGiftMessageSave(itemId, message);
  };

  const getSelectedMessages = (itemId: string) => {
    const category = selectedGiftCategories[itemId];
    if (!category) return [];
    const cat = giftMessageSuggestions.find(c => c.category === category);
    return cat ? cat.messages : [];
  };

  return (
    <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-3xl font-bold text-foreground flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                </div>
                My Cart
            </h2>
            <span className="text-xs md:text-sm font-bold text-primary bg-primary/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </span>
        </div>

        <div className="space-y-3 md:space-y-4">
            {cartItems.map((item) => {
                const quantity = getQuantity(item);
                const itemTotal = item.price_snapshot.total * quantity;
                const itemKey = getItemKey(item);
                const selectedMessages = getSelectedMessages(itemKey);

                return (
                    <Card key={item.product_id + item.variant_id} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-card overflow-hidden transform hover:-translate-y-1">
                        <div className="flex flex-col sm:flex-row">
                            {/* Product Image */}
                            <div className="sm:w-40 md:sm:w-48 h-40 md:h-48 sm:h-auto flex-shrink-0 bg-gradient-to-br from-secondary/30 to-accent/20 relative overflow-hidden">
                                <Image
                                    src={item.product_image || "https://picsum.photos/seed/placeholder/300/300"}
                                    alt={item.product_name}
                                    width={192}
                                    height={192}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-2 left-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 p-4 md:p-6">
                                <div className="flex flex-col h-full">
                                    {/* Top Section */}
                                    <div className="flex justify-between items-start gap-3 md:gap-4 mb-3 md:mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base md:text-xl font-bold text-foreground mb-2 line-clamp-2">
                                                <Link href={`/products/${item.product_id}`} className="hover:text-primary transition-colors">
                                                    {item.product_name}
                                                </Link>
                                            </h3>
                                            {item.variant_label && (
                                                <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3 text-primary" />
                                                    <span className="font-medium">Variant:</span> {item.variant_label}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-lg md:text-2xl font-bold text-primary">{formatCurrency(itemTotal)}</p>
                                            {quantity > 1 && (
                                                <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">
                                                    {formatCurrency(item.price_snapshot.total)} each
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Separator className="my-3 md:my-4" />

                                    {/* Middle Section - Quantity & Actions */}
                                    <div className="flex items-center justify-between mt-auto flex-wrap gap-3">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <span className="text-xs md:text-sm font-bold text-muted-foreground">Qty:</span>
                                            <div className="flex items-center border-2 border-primary/20 rounded-xl overflow-hidden shadow-sm">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 md:h-10 md:w-10 rounded-none hover:bg-primary hover:text-primary-foreground transition-colors"
                                                    onClick={() => handleQuantityChange(item.product_id + '|' + item.variant_id, quantity - 1)}
                                                    disabled={quantity <= 1}
                                                >
                                                    <Minus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                </Button>
                                                <div className="h-8 w-14 md:h-10 md:w-16 flex items-center justify-center bg-gradient-to-r from-primary/10 to-accent/10 font-bold text-sm md:text-base text-primary">
                                                    {quantity}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 md:h-10 md:w-10 rounded-none hover:bg-primary hover:text-primary-foreground transition-colors"
                                                    onClick={() => handleQuantityChange(item.product_id + '|' + item.variant_id, quantity + 1)}
                                                >
                                                    <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 gap-2 transition-colors h-8 md:h-9"
                                            onClick={() => removeFromCart(item.product_id, item.variant_id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                            <span className="hidden sm:inline">Remove</span>
                                        </Button>
                                    </div>

                                    {/* Gift Option */}
                                    <div className="mt-3 md:mt-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`gift-${item.product_id}-${item.variant_id}`}
                                                checked={!!item.gift_message || expandedGiftItems[itemKey]}
                                                onCheckedChange={() => toggleGiftMessage(itemKey)}
                                                className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
                                            />
                                            <Label
                                                htmlFor={`gift-${item.product_id}-${item.variant_id}`}
                                                className="cursor-pointer font-bold flex items-center gap-1.5 md:gap-2 text-primary text-sm md:text-base"
                                            >
                                                <Gift className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                This is a gift 🎁
                                            </Label>
                                        </div>

                                        {(!!item.gift_message || expandedGiftItems[itemKey]) && (
                                            <div className="mt-3 md:mt-4 space-y-3 md:space-y-4 p-3 md:p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                                                {/* Gift Message Suggestions */}
                                                {giftMessageSuggestions.length > 0 && (
                                                    <div className="space-y-2 md:space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Label className="text-xs md:text-sm font-semibold">Message Suggestions</Label>
                                                            <Gift className="w-3 h-3 text-primary" />
                                                        </div>
                                                        
                                                        {/* Category Selector */}
                                                        <Select 
                                                            onValueChange={(category) => handleGiftCategorySelect(itemKey, category)}
                                                            value={selectedGiftCategories[itemKey]}
                                                        >
                                                            <SelectTrigger className="text-sm border-primary/20 focus:border-primary">
                                                                <SelectValue placeholder="📋 Choose a category..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {giftMessageSuggestions.map((cat, idx) => (
                                                                    <SelectItem key={idx} value={cat.category}>
                                                                        <span className="flex items-center gap-2">
                                                                            {cat.category}
                                                                            <span className="text-xs text-muted-foreground">({cat.messages.length})</span>
                                                                        </span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        {/* Message Buttons - Grid Layout */}
                                                        {selectedMessages.length > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-xs text-muted-foreground">Tap a message to select:</p>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {selectedMessages.map((msg, i) => (
                                                                        <Button
                                                                            key={i}
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className={`h-auto py-2.5 px-3 text-xs md:text-sm justify-start text-left whitespace-normal transition-all ${
                                                                                item.gift_message === msg 
                                                                                    ? 'border-primary bg-primary/5 text-primary font-semibold' 
                                                                                    : 'border-border hover:border-primary hover:bg-primary/5'
                                                                            }`}
                                                                            onClick={() => handleSuggestionClick(itemKey, msg)}
                                                                        >
                                                                            <span className="line-clamp-2">{msg}</span>
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Divider */}
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <Separator />
                                                    </div>
                                                    <div className="relative flex justify-center text-xs uppercase">
                                                        <span className="bg-gradient-to-r from-primary/5 via-card to-accent/5 px-2 text-muted-foreground">Or write your own</span>
                                                    </div>
                                                </div>

                                                {/* Custom Gift Message */}
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gift-message-${item.product_id}-${item.variantId}`} className="font-semibold text-xs md:text-sm flex items-center gap-1.5">
                                                        <Sparkles className="w-3 h-3 text-primary" />
                                                        Your personal message
                                                    </Label>
                                                    <Textarea
                                                        id={`gift-message-${item.product_id}-${item.variantId}`}
                                                        value={item.gift_message || ''}
                                                        onChange={(e) => handleGiftMessageSave(itemKey, e.target.value)}
                                                        placeholder="Write your heartfelt message here..."
                                                        maxLength={150}
                                                        className="min-h-[80px] md:min-h-[100px] border-2 focus:border-primary transition-colors text-sm resize-none"
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-muted-foreground">
                                                            {(item.gift_message || '').length}/150 characters
                                                        </p>
                                                        {item.gift_message && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                onClick={() => handleGiftMessageSave(itemKey, '')}
                                                            >
                                                                Clear
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Display Gift Message */}
                                    {item.gift_message && (
                                        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                                            <div className="p-3 md:p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border-l-4 border-primary">
                                                <p className="text-xs md:text-sm text-muted-foreground italic">
                                                    <strong className="text-foreground flex items-center gap-1.5">
                                                        <Gift className="w-3.5 h-3.5 text-primary" />
                                                        Gift Message:
                                                    </strong>{" "}
                                                    "{item.gift_message}"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    </div>
  );
}
