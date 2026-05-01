"use client";

import { formatCurrency } from '@/lib/utils';

import { useState } from "react";
import { Wand2, Loader2, Info } from "lucide-react";
import { getDynamicPricingSuggestions } from "@/ai/flows/dynamic-pricing-suggestions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast.tsx";
import { Separator } from "../ui/separator";

interface DynamicPricingCardProps {
  product: Product;
}

export function DynamicPricingCard({ product }: DynamicPricingCardProps) {
  const isNew = product.id === 'new';
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{ suggestedPriceOverride: number; rationale: string } | null>(null);
  const [competitorPrice, setCompetitorPrice] = useState(Math.round(product.display_price * 0.95));
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await getDynamicPricingSuggestions({
        productId: product.id,
        productName: product.name,
        currentPrice: product.display_price,
        calculatedPrice: product.price_breakup.total,
        competitorPrice,
        marketTrend: "Stable with slight upward trend for gold",
        inventoryLevel: product.availability,
        recentSalesData: "5 units sold in the last 7 days",
      });
      setSuggestion(result);
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({
        title: "Error",
        description: "Failed to get AI pricing suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApplySuggestion = () => {
    if (suggestion) {
      const manualPriceInput = document.getElementById('manual_price') as HTMLInputElement;
      const autoPriceSwitch = document.querySelector('button[name="auto_price_enabled"]') as HTMLButtonElement | null;
      
      if (manualPriceInput) {
        manualPriceInput.value = suggestion.suggestedPriceOverride.toString();

        if (autoPriceSwitch && autoPriceSwitch.getAttribute('aria-checked') === 'true') {
          autoPriceSwitch.click();
        }
        
        toast({
          title: "Suggestion Applied",
          description: "Manual price has been updated. Remember to save your changes.",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Wand2 className="text-primary" />
          AI Pricing Assistant
        </CardTitle>
        <CardDescription>Get AI-powered suggestions for manual price overrides.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isNew ? (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Save Product to Use AI</AlertTitle>
                <AlertDescription>
                    The AI Pricing Assistant will be available once the product has been created.
                </AlertDescription>
            </Alert>
        ) : (
            <>
                <div className="space-y-2">
                    <Label htmlFor="competitorPrice">Competitor Price (for AI context)</Label>
                    <Input 
                        id="competitorPrice" 
                        type="number"
                        value={competitorPrice}
                        onChange={(e) => setCompetitorPrice(Number(e.target.value))}
                    />
                </div>

                <Button onClick={handleGetSuggestion} disabled={isLoading} className="w-full">
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                    </>
                ) : (
                    <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Get AI Suggestion
                    </>
                )}
                </Button>
                
                {suggestion && (
                <>
                    <Separator />
                    <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>AI Suggestion: {formatCurrency(suggestion.suggestedPriceOverride)}</AlertTitle>
                    <AlertDescription className="mt-2 text-foreground/80">
                        <strong>Rationale:</strong> {suggestion.rationale}
                    </AlertDescription>
                    </Alert>
                </>
                )}
            </>
        )}
      </CardContent>
      {suggestion && !isNew && (
          <CardFooter>
              <Button variant="outline" className="w-full" onClick={handleApplySuggestion}>Apply Suggestion to Form</Button>
          </CardFooter>
      )}
    </Card>
  );
}
