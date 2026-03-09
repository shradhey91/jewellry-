
"use client";

import React, { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import type { Metal, Purity } from "@/lib/types";
import { saveMetalPrices, type PricingFormState } from "@/lib/server/actions/pricing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PurityDialog } from "./purity-dialog";
import { PlusCircle } from "lucide-react";
import { PurityDeleteDialog } from "./purity-delete-dialog";
import { Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toggleMetalActiveAction } from "@/lib/server/actions/pricing";

type MetalWithPurities = Metal & { purities: Purity[] };

interface PricingFormProps {
  metalsWithPurities: MetalWithPurities[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save All Prices"}</Button>;
}

export function PricingForm({ metalsWithPurities }: PricingFormProps) {
  const initialState: PricingFormState = { message: "", errors: {} };
  const [state, setState] = useState<PricingFormState>(initialState);
  const { toast } = useToast();

  const [metalPrices, setMetalPrices] = useState<Record<string, string>>(() => {
    const initialPrices: Record<string, string> = {};
    metalsWithPurities.forEach(metal => {
      initialPrices[metal.id] = String(metal.price_per_gram);
    });
    return initialPrices;
  });

  const handlePriceChange = (metalId: string, price: string) => {
    setMetalPrices(prev => ({ ...prev, [metalId]: price }));
  };

  useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({ title: "Validation Error", description: state.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: state.message });
      }
    }
  }, [state, toast]);

  const formAction = async (formData: FormData) => {
    const result = await saveMetalPrices(initialState, formData);
    setState(result);
  };

  const handleMetalToggle = async (metalId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const result = await toggleMetalActiveAction(metalId, newStatus);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        // Reload the page to reflect the new status from server
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast({
        title: "Error",
        description: "Failed to update metal status. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Pricing Management</CardTitle>
          <CardDescription>
            Set base metal prices. Prices for each purity are calculated automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {metalsWithPurities.map(metal => (
            <div key={metal.id} className={!metal.is_active ? "opacity-60" : ""}>
              <Card className="overflow-hidden">
                <CardHeader className="flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                      <Label htmlFor={`price-${metal.id}`} className="text-lg font-semibold">
                          {metal.name}
                      </Label>
                      <Input
                          id={`price-${metal.id}`}
                          name={`price-${metal.id}`}
                          type="number"
                          step="0.01"
                          value={metalPrices[metal.id] || ''}
                          onChange={(e) => handlePriceChange(metal.id, e.target.value)}
                          className="w-48"
                          placeholder="Enter base price/gram"
                          disabled={!metal.is_active}
                      />
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                          <Switch
                              id={`active-${metal.id}`}
                              checked={metal.is_active}
                              onCheckedChange={() => handleMetalToggle(metal.id, metal.is_active)}
                          />
                          <Label htmlFor={`active-${metal.id}`} className="text-sm font-medium">
                              {metal.is_active ? "Active" : "Inactive"}
                          </Label>
                      </div>
                      <PurityDialog metalId={metal.id}>
                          <Button variant="outline" size="sm" disabled={!metal.is_active}>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add Purity
                          </Button>
                      </PurityDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Purity Label</TableHead>
                        <TableHead>Fineness</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Calculated Price/Gram</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metal.purities.map(purity => (
                        <TableRow key={purity.id} className={!metal.is_active ? "bg-muted/30" : ""}>
                          <TableCell className="font-medium">{purity.label}</TableCell>
                          <TableCell>{(purity.fineness * 100).toFixed(1)}%</TableCell>
                           <TableCell>
                              <Badge variant={purity.is_active ? "secondary" : "outline"} className="text-xs">
                                  {purity.is_active ? "Active" : "Inactive"}
                              </Badge>
                              {!metal.is_active && (
                                  <Badge variant="destructive" className="text-xs ml-2">
                                      Metal Inactive
                                  </Badge>
                              )}
                           </TableCell>
                          <TableCell className="text-right font-mono">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(metalPrices[metal.id] || 0) * purity.fineness)}
                          </TableCell>
                           <TableCell className="text-right">
                                <PurityDialog metalId={metal.id} purity={purity}>
                                    <Button variant="ghost" size="sm" disabled={!metal.is_active}>Edit</Button>
                                </PurityDialog>
                                <PurityDeleteDialog purity={purity}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!metal.is_active}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </PurityDeleteDialog>
                           </TableCell>
                        </TableRow>
                      ))}
                      {metal.purities.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">No purities defined for this metal.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
