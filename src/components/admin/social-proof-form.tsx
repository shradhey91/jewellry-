

"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  saveSocialProofSettingsAction,
  SocialProofFormState,
} from "@/app/admin/social-proof/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProductSearch } from "@/components/admin/product-search";
import { ProductCard } from "@/components/products/product-card";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast.tsx";
import type { Product, SocialProofSettings } from "@/lib/types";

interface SocialProofFormProps {
  initialSettings: SocialProofSettings;
  initialProducts: Product[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Settings
    </Button>
  );
}

export function SocialProofForm({
  initialSettings,
  initialProducts,
}: SocialProofFormProps) {
  const [state, formAction] = useFormState(saveSocialProofSettingsAction, { message: "", errors: {} });
  const { toast } = useToast();

  const [isEnabled, setIsEnabled] = useState(initialSettings.isEnabled);
  const [showOnMobile, setShowOnMobile] = useState(initialSettings.showOnMobile);
  const [position, setPosition] = useState(initialSettings.position);
  const [customNames, setCustomNames] = useState(
    (initialSettings.customNames || []).join("\n")
  );
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors && Object.keys(state.errors).length > 0 ? "Error" : "Success",
        description: state.message,
        variant: state.errors && Object.keys(state.errors).length > 0 ? "destructive" : "default",
      });
    }
  }, [state, toast]);

  const addProduct = (product: Product) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts((prev) => [...prev, product]);
    }
  };

  const removeProduct = (idToRemove: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== idToRemove));
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="productIds" value={JSON.stringify(selectedProducts.map(p => p.id))} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Products to Display</CardTitle>
              <CardDescription>
                Search for and select the products you want to appear in social
                proof notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductSearch onProductSelect={addProduct} filterActive={true} />
              <div className="mt-4 space-y-2">
                {selectedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="relative group">
                        <ProductCard product={product} />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeProduct(product.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-4">
                    No products selected.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8 sticky top-24">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isEnabled" className="text-base">
                    Enable Social Proof
                  </Label>
                </div>
                <Switch
                  id="isEnabled"
                  name="isEnabled"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="showOnMobile" className="text-base">
                    Show on Mobile
                  </Label>
                </div>
                <Switch
                  id="showOnMobile"
                  name="showOnMobile"
                  checked={showOnMobile}
                  onCheckedChange={setShowOnMobile}
                />
              </div>
              <div className="space-y-3">
                <Label className="font-semibold">Position</Label>
                <RadioGroup
                  name="position"
                  value={position}
                  onValueChange={(value) =>
                    setPosition(value as "bottom-left" | "bottom-right")
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-left" id="pos-bl" />
                    <Label htmlFor="pos-bl">Bottom Left</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-right" id="pos-br" />
                    <Label htmlFor="pos-br">Bottom Right</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Enter the names and locations to be displayed. Add one entry per line.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                name="customNames"
                value={customNames}
                onChange={(e) => setCustomNames(e.target.value)}
                rows={5}
                placeholder="Priya from Mumbai&#10;Rohan from Delhi"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </Card>

        </div>
      </div>
    </form>
  );
}
