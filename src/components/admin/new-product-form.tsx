

"use client";

import { useActionState, useEffect, useState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import type { Product, Metal, Purity, TaxClass, DiamondDetail, ProductMedia, Category, ProductVariant, FeatureTab, GalleryImage } from "@/lib/types";
import { saveOrUpdateProduct } from "@/app/admin/products/[id]/actions";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import { Separator } from "../ui/separator";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Trash2, PlusCircle, Wand2, Loader2, X, Info } from "lucide-react";
import { RelatedProductsManager } from "./related-products-manager";
import { ProductImageManager } from "./product-image-manager";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { generateProductDescription } from "@/ai/flows/product-description-generator";
import { DynamicPricingCard } from "./dynamic-pricing-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductEditForm } from "./product-edit-form";


export interface NewProductFormProps {
  product: Product;
  metals: Metal[];
  purities: Purity[];
  taxClasses: TaxClass[];
  categories: Category[];
}

export function NewProductForm(props: NewProductFormProps) {
  // We can just reuse the main edit form, passing the `isNew` prop.
  // This avoids code duplication and ensures both forms stay in sync.
  return <ProductEditForm {...props} isNew={true} />;
}

