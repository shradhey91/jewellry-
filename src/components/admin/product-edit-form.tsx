

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Product, Metal, Purity, TaxClass, DiamondDetail, ProductMedia, Category, ProductReview, ProductVariant, FeatureTab, GalleryImage } from "@/lib/types";
import { saveOrUpdateProduct, ProductFormState } from "@/app/admin/products/[id]/actions";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Trash2, PlusCircle, Wand2, Loader2, X, Info } from "lucide-react";
import { RelatedProductsManager } from "./related-products-manager";
import { ProductImageManager } from "./product-image-manager";
import { DynamicPricingCard } from "./dynamic-pricing-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductReviewsList } from "./reviews/product-reviews-list";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

export interface ProductEditFormProps {
  product: Product;
  metals: Metal[];
  purities: Purity[];
  taxClasses: TaxClass[];
  categories: Category[];
  isNew?: boolean;
  crossSellProducts?: Product[];
  upsellProducts?: Product[];
  reviews?: ProductReview[];
}

function SubmitButton({ isNew }: { isNew?: boolean }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : (isNew ? "Create Product" : "Save Changes")}</Button>;
}

const getCategoryDepth = (categoryId: string | null, allCategories: Category[]): number => {
    if (!categoryId) return 0;
    const category = allCategories.find(c => c.id === categoryId);
    if (!category || !category.parent_id) return 0;
    return 1 + getCategoryDepth(category.parent_id, allCategories);
};

export function ProductEditForm({ 
    product, 
    metals, 
    purities, 
    taxClasses, 
    categories,
    isNew = false,
    crossSellProducts = [],
    upsellProducts = [],
    reviews = []
}: ProductEditFormProps) {
  const router = useRouter();
  const initialState: ProductFormState = { message: "", errors: {} };
  const [state, formAction] = useFormState(saveOrUpdateProduct, initialState);
  const { toast } = useToast();
  
  const [selectedMetal, setSelectedMetal] = useState(product.metal_id);
  const [selectedPurity, setSelectedPurity] = useState(product.purity_id);
  const [autoPrice, setAutoPrice] = useState(product.auto_price_enabled);
  const [isActive, setIsActive] = useState(product.is_active);
  const [hasDiamonds, setHasDiamonds] = useState(product.has_diamonds);
  const [hasSizeDimensions, setHasSizeDimensions] = useState(product.has_size_dimensions ?? false);
  const [hasRingSize, setHasRingSize] = useState(product.has_ring_size ?? false);
  const [showGalleryGrid, setShowGalleryGrid] = useState(product.showGalleryGrid ?? false);
  const [variants, setVariants] = useState<ProductVariant[]>(product.variants || []);
  const [diamondDetails, setDiamondDetails] = useState<DiamondDetail[]>(
    (product.diamond_details || []).map((d, i) => ({ ...d, id: `client-id-${i}` }))
  );
  
  const [currentCrossSells, setCurrentCrossSells] = useState<Product[]>(crossSellProducts);
  const [currentUpSells, setCurrentUpSells] = useState<Product[]>(upsellProducts);

  const [media, setMedia] = useState<ProductMedia[]>(() => 
    [...(product.media || [])].sort((a, b) => a.sort_order - b.sort_order)
  );

  const [description, setDescription] = useState(product.description);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(product.category_ids || []);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  
  const defaultFeatureTabs: FeatureTab[] = [
    { tabTitle: "Outstanding Features", contentTitle: "Crafted for Brilliance", points: ["Hand-selected, ethically sourced diamonds and gemstones.", "Solid {purity?.label} {metal?.name} for lasting beauty.", "Artisanal craftsmanship in every single detail.", "Includes a certificate of authenticity."], imageUrl: "https://picsum.photos/seed/features/800/800", imageHint: "craftsmanship" },
    { tabTitle: "Supreme Quality", contentTitle: "Built to Last", points: ["Backed by a lifetime warranty.", "Expertly inspected for perfection.", "Made with responsibly sourced materials."], imageUrl: "https://picsum.photos/seed/quality/800/800", imageHint: "jewelry tools" },
    { tabTitle: "Unique Design", contentTitle: "One of a Kind", points: ["Designed in-house by our artisans.", "A modern take on a timeless classic.", "Customizable to your preference."], imageUrl: "https://picsum.photos/seed/design/800/800", imageHint: "jewelry design sketch" },
  ];
  const [featureTabs, setFeatureTabs] = useState<FeatureTab[]>(product.featureTabs && product.featureTabs.length > 0 ? product.featureTabs : defaultFeatureTabs);

  const defaultGalleryImages: GalleryImage[] = [
    { id: 'gallery1', url: "https://picsum.photos/seed/gallery1/600/800", hint: "Gallery image 1" },
    { id: 'gallery2', url: "https://picsum.photos/seed/gallery2/600/800", hint: "Gallery image 2" },
    { id: 'gallery3', url: "https://picsum.photos/seed/gallery3/600/800", hint: "Gallery image 3" },
  ];
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages : defaultGalleryImages);


  const availablePurities = useMemo(() => {
    return purities.filter(p => p.metal_id === selectedMetal && p.is_active);
  }, [selectedMetal, purities]);

  useEffect(() => {
    if (!availablePurities.find(p => p.id === selectedPurity)) {
        setSelectedPurity(availablePurities[0]?.id || '');
    }
  }, [selectedMetal, availablePurities, selectedPurity]);
  
  const hierarchicalCategories = useMemo(() => {
    const buildHierarchy = (parentId: string | null = null): Category[] => {
        return categories
        .filter(category => category.parent_id === parentId)
        .flatMap(category => [
            category,
            ...buildHierarchy(category.id)
        ]);
    };
    return buildHierarchy();
  }, [categories]);

  useEffect(() => {
    if (state.message) {
      if(state.errors && Object.keys(state.errors).length > 0) {
        toast({ title: "Validation Error", description: state.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: state.message });
        if (isNew && state.product_id) {
          router.push(`/admin/products/${state.product_id}`);
        } else if (!isNew) {
            router.refresh();
        }
      }
    }
  }, [state, toast, router, isNew]);
  
  const handleFeatureTabChange = (index: number, field: keyof FeatureTab, value: string | string[]) => {
      const newTabs = [...featureTabs];
      // @ts-ignore
      newTabs[index][field] = value;
      setFeatureTabs(newTabs);
  };

  const addDiamondDetail = () => {
    setDiamondDetails(prev => [
      ...prev,
      { 
        id: `client-id-${Date.now()}`, 
        purity: '14K', 
        count: 1, 
        weight: 0, 
        size: 0, 
        price: 0,
        diamond_type: 'Natural',
        cut: '',
        color: '',
        clarity: '',
        rate_per_carat: 0,
        setting_charges: 0,
        certification_cost: 0,
        brand_margin: 0
      }
    ]);
  };
  
  const handleVariantChange = (id: string, field: keyof ProductVariant, value: any) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };
  
  const addVariant = () => {
      setVariants(prev => [...prev, {
          id: `new-variant-${Date.now()}`,
          product_id: product.id,
          label: '',
          stock_quantity: 0,
          is_preorder: false,
          is_made_to_order: false,
          lead_time_days: null
      }]);
  };
  
  const removeVariant = (id: string) => {
      setVariants(prev => prev.filter(v => v.id !== id));
  };

  const removeDiamondDetail = (id: string) => {
    setDiamondDetails(prev => prev.filter(d => d.id !== id));
  };
  
  const handleDiamondChange = (id: string, field: keyof DiamondDetail, value: any) => {
    setDiamondDetails(prev => prev.map(d => 
        d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const preparedMediaForForm = media.map((m, index) => ({
      ...m,
      sort_order: index
  }));

  const handleGenerateDescription = async () => {
      setIsGenerating(true);
      try {
          const form = document.querySelector('form')!;
          const formData = new FormData(form);

          const metalName = metals.find(m => m.id === formData.get('metal_id'))?.name || '';
          const purityLabel = purities.find(p => p.id === formData.get('purity_id'))?.label || '';
          
          const input = {
              name: formData.get('name') as string,
              metal: metalName,
              purity: purityLabel,
              grossWeight: Number(formData.get('gross_weight')),
              netWeight: Number(formData.get('net_weight')),
              makingChargeType: formData.get('making_charge_type') as 'fixed' | 'percentage',
              makingChargeValue: Number(formData.get('making_charge_value')),
              seoTitle: formData.get('seo_title') as string,
              seoDescription: formData.get('seo_description') as string,
          };
          
          // Dynamically import to prevent module-level crash when GOOGLE_GENAI_API_KEY is missing
          const { generateProductDescription } = await import("@/ai/flows/product-description-generator");
          const result = await generateProductDescription(input);
          setDescription(result.description);
          toast({ title: "Description Generated", description: "AI has generated a new description for your product." });

      } catch (error) {
          console.error("AI description generation failed:", error);
          toast({ title: "Error", description: "Failed to generate AI description.", variant: "destructive" });
      } finally {
          setIsGenerating(false);
      }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    setIsCategoryPopoverOpen(false);
  };
  
  const handleCategoryRemove = (categoryId: string) => {
    setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId));
  };

  const selectedCategories = useMemo(() => {
    return categories.filter(c => selectedCategoryIds.includes(c.id));
  }, [selectedCategoryIds, categories]);
  
  const addGalleryImage = () => {
    setGalleryImages(prev => [...prev, { id: `new-${Date.now()}`, url: '', hint: '' }]);
  };

  const removeGalleryImage = (id: string) => {
    setGalleryImages(prev => prev.filter(item => item.id !== id));
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="description" value={description || ''} />
      <input type="hidden" name="category_ids" value={JSON.stringify(selectedCategoryIds)} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="diamond_details" value={JSON.stringify(diamondDetails)} />
      <input type="hidden" name="cross_sell_products" value={JSON.stringify(currentCrossSells.map(p => p.id))} />
      <input type="hidden" name="upsell_products" value={JSON.stringify(currentUpSells.map(p => p.id))} />
      <input type="hidden" name="media" value={JSON.stringify(media.map((m, i) => ({ ...m, sort_order: i })))} />
      <input type="hidden" name="featureTabs" value={JSON.stringify(featureTabs)} />
      <input type="hidden" name="galleryImages" value={JSON.stringify(galleryImages)} />
      
        <Tabs defaultValue="general">
            <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="organization">Organization</TabsTrigger>
                <TabsTrigger value="variants_and_pricing">Variants, Pricing & Specs</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                {!isNew && <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>}
            </TabsList>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <TabsContent value="general" className="mt-0 space-y-8" forceMount>
                        <Card>
                          <CardHeader>
                              <CardTitle>General Information</CardTitle>
                              <CardDescription>Basic product details and descriptions.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div className="space-y-2">
                              <Label htmlFor="name">Product Name</Label>
                              <Input id="name" name="name" defaultValue={product.name} />
                              {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
                              </div>
                              <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                  <Label htmlFor="description_display">Description</Label>
                                  <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                                      {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                      Generate with AI
                                  </Button>
                              </div>
                              <Textarea id="description_display" name="description_display" value={description || ''} onChange={(e) => setDescription(e.target.value)} rows={5} />
                              {state.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
                              </div>
                          </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="organization" className="mt-0 space-y-8" forceMount>
                       <Card>
                            <CardHeader>
                                <CardTitle>Organization</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Categories</Label>
                                    <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isCategoryPopoverOpen}
                                            className="w-full justify-between h-auto min-h-10"
                                            >
                                            <div className="flex gap-1 flex-wrap">
                                                {selectedCategories.length > 0 ? (
                                                    selectedCategories.map(category => (
                                                        <Badge
                                                            variant="secondary"
                                                            key={category.id}
                                                            className="mr-1"
                                                            onClick={(e) => { e.stopPropagation(); handleCategoryRemove(category.id); }}
                                                        >
                                                            {category.name}
                                                            <X className="ml-1 h-3 w-3" />
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground">Select categories...</span>
                                                )}
                                            </div>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                            <CommandInput placeholder="Search categories..." />
                                            <CommandList>
                                                <CommandEmpty>No category found.</CommandEmpty>
                                                <CommandGroup>
                                                {hierarchicalCategories.map(category => (
                                                    <CommandItem
                                                        key={category.id}
                                                        value={category.name}
                                                        onSelect={() => handleCategorySelect(category.id)}
                                                        style={{paddingLeft: `${'1 + getCategoryDepth(category.id, categories) * 1.5'}rem`}}
                                                    >
                                                        {category.name}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {state.errors?.category_ids && <p className="text-sm font-medium text-destructive">{state.errors.category_ids[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax_class_id">Tax Class (GST)</Label>
                                    <Select name="tax_class_id" defaultValue={product.tax_class_id}>
                                        <SelectTrigger id="tax_class_id"><SelectValue placeholder="Select tax class" /></SelectTrigger>
                                        <SelectContent>
                                            {taxClasses.filter(t => t.is_active).map(tax => (
                                                <SelectItem key={tax.id} value={tax.id}>{tax.name} ({tax.rate_type === 'percentage' ? `${tax.rate_value}%` : `₹${tax.rate_value}`})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {state.errors?.tax_class_id && <p className="text-sm font-medium text-destructive">{state.errors.tax_class_id[0]}</p>}
                                </div>
                            </CardContent>
                        </Card>
                        {!isNew && (
                            <>
                                <RelatedProductsManager 
                                    title="Up-Sells (You Might Also Like)"
                                    description="Encourage customers to purchase these related, often higher-value, items instead."
                                    products={currentUpSells}
                                    onProductsChange={setCurrentUpSells}
                                    currentProductId={product.id}
                                />
                                <RelatedProductsManager 
                                    title="Cross-Sells (Customers Also Viewed)"
                                    description="Suggest these products in the cart or on the product page to increase order value."
                                    products={currentCrossSells}
                                    onProductsChange={setCurrentCrossSells}
                                    currentProductId={product.id}
                                />
                            </>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="variants_and_pricing" className="mt-0 space-y-8" forceMount>
                       <Card>
                            <CardHeader>
                                <CardTitle>Pricing & Specifications</CardTitle>
                                <CardDescription>Define the material, weight, and pricing rules.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="metal_id">Metal</Label>
                                        <Select name="metal_id" value={selectedMetal} onValueChange={setSelectedMetal}>
                                            <SelectTrigger id="metal_id"><SelectValue placeholder="Select a metal" /></SelectTrigger>
                                            <SelectContent>
                                                {metals.filter(m => m.is_active).map(metal => (
                                                    <SelectItem key={metal.id} value={metal.id}>{metal.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {state.errors?.metal_id && <p className="text-sm font-medium text-destructive">{state.errors.metal_id[0]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="purity_id">Purity</Label>
                                        <Select name="purity_id" value={selectedPurity} onValueChange={setSelectedPurity}>
                                            <SelectTrigger id="purity_id"><SelectValue placeholder="Select purity" /></SelectTrigger>
                                            <SelectContent>
                                                {availablePurities.map(purity => (
                                                    <SelectItem key={purity.id} value={purity.id}>{purity.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {state.errors?.purity_id && <p className="text-sm font-medium text-destructive">{state.errors.purity_id[0]}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="gross_weight">Gross Weight (g)</Label>
                                        <Input id="gross_weight" name="gross_weight" type="number" step="0.001" defaultValue={product.gross_weight} />
                                        {state.errors?.gross_weight && <p className="text-sm font-medium text-destructive">{state.errors.gross_weight[0]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="net_weight">Net Weight (g)</Label>
                                        <Input id="net_weight" name="net_weight" type="number" step="0.001" defaultValue={product.net_weight} />
                                        {state.errors?.net_weight && <p className="text-sm font-medium text-destructive">{state.errors.net_weight[0]}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="making_charge_type">Making Charge Type</Label>
                                        <Select name="making_charge_type" defaultValue={product.making_charge_type}>
                                            <SelectTrigger id="making_charge_type"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                                <SelectItem value="fixed">Fixed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="making_charge_value">Making Charge Value</Label>
                                        <Input id="making_charge_value" name="making_charge_value" type="number" step="0.01" defaultValue={product.making_charge_value} />
                                        {state.errors?.making_charge_value && <p className="text-sm font-medium text-destructive">{state.errors.making_charge_value[0]}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Dimensions & Variants</CardTitle>
                                <CardDescription>Specify physical dimensions and available variants like sizes.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="has_size_dimensions" className="text-base">Enable Physical Dimensions</Label>
                                        <p className="text-sm text-muted-foreground">Show height, width, length on the product page.</p>
                                    </div>
                                    <Switch id="has_size_dimensions" name="has_size_dimensions" checked={hasSizeDimensions} onCheckedChange={setHasSizeDimensions}/>
                                </div>
                                {hasSizeDimensions && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="height">Height (cm)</Label>
                                            <Input id="height" name="height" type="number" step="0.01" defaultValue={product.height ?? ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="width">Width (cm)</Label>
                                            <Input id="width" name="width" type="number" step="0.01" defaultValue={product.width ?? ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="length">Length (cm)</Label>
                                            <Input id="length" name="length" type="number" step="0.01" defaultValue={product.length ?? ''} />
                                        </div>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="has_ring_size" className="text-base">Enable Ring Size Selection</Label>
                                        <p className="text-sm text-muted-foreground">Allows customers to select a ring size from variants.</p>
                                    </div>
                                    <Switch id="has_ring_size" name="has_ring_size" checked={hasRingSize} onCheckedChange={setHasRingSize}/>
                                </div>
                                {variants.map((variant, index) => (
                                    <div key={variant.id} className="p-4 border rounded-lg space-y-4 relative">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-6 w-6"
                                            onClick={() => removeVariant(variant.id!)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Variant Label</Label>
                                                <Input
                                                    value={variant.label}
                                                    onChange={(e) => handleVariantChange(variant.id!, 'label', e.target.value)}
                                                    placeholder="e.g., Size 7 or 18-inch"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Stock Quantity</Label>
                                                <Input
                                                    type="number"
                                                    value={variant.stock_quantity}
                                                    onChange={(e) => handleVariantChange(variant.id!, 'stock_quantity', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Gross Weight (g)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.001"
                                                    value={variant.gross_weight ?? ''}
                                                    onChange={(e) => handleVariantChange(variant.id!, 'gross_weight', e.target.value ? Number(e.target.value) : null)}
                                                    placeholder={`Default: ${product.gross_weight || 0}g`}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Net Weight (g)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.001"
                                                    value={variant.net_weight ?? ''}
                                                    onChange={(e) => handleVariantChange(variant.id!, 'net_weight', e.target.value ? Number(e.target.value) : null)}
                                                    placeholder={`Default: ${product.net_weight || 0}g`}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 pt-2">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`preorder-${variant.id}`}
                                                    checked={variant.is_preorder}
                                                    onCheckedChange={(checked) => handleVariantChange(variant.id!, 'is_preorder', checked)}
                                                />
                                                <Label htmlFor={`preorder-${variant.id}`}>Pre-order</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`made-to-order-${variant.id}`}
                                                    checked={variant.is_made_to_order}
                                                    onCheckedChange={(checked) => handleVariantChange(variant.id!, 'is_made_to_order', checked)}
                                                />
                                                <Label htmlFor={`made-to-order-${variant.id}`}>Made to Order</Label>
                                            </div>
                                             {variant.is_made_to_order && (
                                                <div className="space-y-2 flex-1">
                                                    <Label htmlFor={`lead-time-${variant.id}`}>Lead Time (Days)</Label>
                                                    <Input
                                                        type="number"
                                                        id={`lead-time-${variant.id}`}
                                                        value={variant.lead_time_days || ''}
                                                        onChange={(e) => handleVariantChange(variant.id!, 'lead_time_days', Number(e.target.value) || null)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addVariant}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
                                </Button>
                            </CardContent>
                        </Card>
                        
                        <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Diamond Details</CardTitle>
                                <CardDescription>
                                Specify diamond attributes if applicable.
                                </CardDescription>
                            </div>
                            <Switch
                                id="has_diamonds"
                                name="has_diamonds"
                                checked={hasDiamonds}
                                onCheckedChange={setHasDiamonds}
                            />
                            </div>
                        </CardHeader>
                        {hasDiamonds && (
                            <CardContent className="space-y-4">
                                <Separator />
                                <div className="space-y-4">
                                    {diamondDetails.map((detail, index) => (
                                        <div key={detail.id} className="p-4 border rounded-lg space-y-4 relative">
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                className="absolute top-2 right-2 h-6 w-6" 
                                                onClick={() => removeDiamondDetail(detail.id!)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                                <div className="space-y-2">
                                                    <Label>Diamond Type</Label>
                                                    <RadioGroup 
                                                        value={detail.diamond_type || ''}
                                                        onValueChange={(value) => handleDiamondChange(detail.id!, 'diamond_type', value)}
                                                        className="flex gap-4"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="Natural" id={`type-natural-${index}`} />
                                                            <Label htmlFor={`type-natural-${index}`}>Natural</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="Lab-grown" id={`type-lab-${index}`} />
                                                            <Label htmlFor={`type-lab-${index}`}>Lab-grown</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Metal Purity for Setting</Label>
                                                    <RadioGroup 
                                                        value={detail.purity || ''}
                                                        onValueChange={(value) => handleDiamondChange(detail.id!, 'purity', value)}
                                                        className="flex gap-4"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="14K" id={`purity-14k-${index}`} />
                                                            <Label htmlFor={`purity-14k-${index}`}>14K</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="18K" id={`purity-18k-${index}`} />
                                                            <Label htmlFor={`purity-18k-${index}`}>18K</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Count</Label>
                                                    <Input type="number" value={detail.count ?? ''} onChange={(e) => handleDiamondChange(detail.id!, 'count', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Total Weight (cts)</Label>
                                                    <Input type="number" step="0.01" value={detail.weight ?? ''} onChange={(e) => handleDiamondChange(detail.id!, 'weight', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Size (mm)</Label>
                                                    <Input type="number" step="0.01" value={detail.size ?? ''} onChange={(e) => handleDiamondChange(detail.id!, 'size', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Price (INR)</Label>
                                                    <Input type="number" placeholder="Overrides calculation" value={detail.price ?? ''} onChange={(e) => handleDiamondChange(detail.id!, 'price', e.target.value)} />
                                                </div>
                                            </div>

                                            <Separator />
                                            <p className="text-sm font-medium text-muted-foreground">Quality & Costing</p>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Cut</Label>
                                                    <Input value={detail.cut ?? ''} placeholder="e.g. Excellent" onChange={(e) => handleDiamondChange(detail.id!, 'cut', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Color</Label>
                                                    <Input value={detail.color ?? ''} placeholder="e.g. G" onChange={(e) => handleDiamondChange(detail.id!, 'color', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Clarity</Label>
                                                    <Input value={detail.clarity ?? ''} placeholder="e.g. VVS1" onChange={(e) => handleDiamondChange(detail.id!, 'clarity', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Rate per Carat</Label>
                                                    <Input type="number" value={detail.rate_per_carat ?? ''} onChange={(e) => handleDiamondChange(detail.id!, 'rate_per_carat', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Setting Charges</Label>
                                                    <Input type="number" value={detail.setting_charges ?? ''} onChange={(e) => handleDiamondChange(detail.id!, 'setting_charges', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Certification Cost (IGI/GIA)</Label>
                                                    <Input type="number" value={detail.certification_cost ?? ''} onChange={(e) => handleDiamondChange(detail.id!, 'certification_cost', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Brand Margin (%)</Label>
                                                    <Input type="number" value={detail.brand_margin ?? ''} onChange={(e) => handleDiamondChange(detail.id!, 'brand_margin', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" onClick={addDiamondDetail}>
                                    Add Diamond
                                </Button>
                            </CardContent>
                        )}
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="media" className="mt-0 space-y-8" forceMount>
                       <ProductImageManager product={product} media={media} onMediaChange={setMedia} isNew={isNew} />
                       <Card>
                          <CardHeader>
                              <CardTitle>Advanced Theme Media</CardTitle>
                              <CardDescription>Content for specific themes like Theme 4.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <Accordion type="multiple" className="w-full space-y-4">
                              <AccordionItem value="feature-tabs">
                                  <AccordionTrigger>Feature Tabs</AccordionTrigger>
                                  <AccordionContent className="space-y-4 pt-4">
                                      {featureTabs.map((tab, index) => (
                                          <div key={index} className="p-4 border rounded-lg space-y-4">
                                              <h4 className="font-semibold">Tab {index + 1}</h4>
                                              <div className="space-y-2">
                                                  <Label>Tab Title</Label>
                                                  <Input value={tab.tabTitle} onChange={(e) => handleFeatureTabChange(index, 'tabTitle', e.target.value)} />
                                              </div>
                                              <div className="space-y-2">
                                                  <Label>Content Title</Label>
                                                  <Input value={tab.contentTitle} onChange={(e) => handleFeatureTabChange(index, 'contentTitle', e.target.value)} />
                                              </div>
                                              <div className="space-y-2">
                                                  <Label>Feature Points (one per line)</Label>
                                                  <Textarea value={tab.points.join('\\n')} onChange={(e) => handleFeatureTabChange(index, 'points', e.target.value.split('\\n'))} rows={4} />
                                              </div>
                                              <div className="space-y-2">
                                                  <Label>Image URL</Label>
                                                  <Input value={tab.imageUrl} onChange={(e) => handleFeatureTabChange(index, 'imageUrl', e.target.value)} />
                                              </div>
                                          </div>
                                      ))}
                                  </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="gallery-grid">
                                  <AccordionTrigger>Gallery Grid</AccordionTrigger>
                                  <AccordionContent className="space-y-4 pt-4">
                                       <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="showGalleryGrid" className="text-base">Show Gallery Grid</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Display a grid of images or videos on the product page (Theme 4 only).
                                            </p>
                                        </div>
                                        <Switch id="showGalleryGrid" name="showGalleryGrid" checked={showGalleryGrid} onCheckedChange={setShowGalleryGrid}/>
                                      </div>
                                      {galleryImages.map((image, index) => (
                                          <div key={image.id} className="p-4 border rounded-lg space-y-2 relative">
                                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-destructive" onClick={() => removeGalleryImage(image.id)}>
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                            <div className="space-y-2">
                                              <Label>Item {index + 1} URL (Image, GIF, or Video)</Label>
                                              <Input value={image.url} onChange={(e) => {
                                                  const newImages = [...galleryImages];
                                                  newImages[index].url = e.target.value;
                                                  setGalleryImages(newImages);
                                              }} />
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Hint for AI</Label>
                                              <Input value={image.hint} onChange={(e) => {
                                                  const newImages = [...galleryImages];
                                                  newImages[index].hint = e.target.value;
                                                  setGalleryImages(newImages);
                                              }} />
                                            </div>
                                          </div>
                                      ))}
                                      <Button type="button" variant="outline" onClick={addGalleryImage}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                                  </AccordionContent>
                              </AccordionItem>
                              </Accordion>
                          </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="seo" className="mt-0 space-y-8" forceMount>
                         <Card>
                            <CardHeader>
                                <CardTitle>SEO</CardTitle>
                                <CardDescription>Settings for search engine optimization.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="seo_title">SEO Title</Label>
                                    <Input id="seo_title" name="seo_title" defaultValue={product.seo_title} />
                                    {state.errors?.seo_title && <p className="text-sm font-medium text-destructive">{state.errors.seo_title[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="seo_description">SEO Description</Label>
                                    <Textarea id="seo_description" name="seo_description" defaultValue={product.seo_description} />
                                    {state.errors?.seo_description && <p className="text-sm font-medium text-destructive">{state.errors.seo_description[0]}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {!isNew && (
                      <TabsContent value="reviews" className="mt-0" forceMount>
                          <ProductReviewsList productId={product.id} initialReviews={reviews} />
                      </TabsContent>
                    )}
                </div>
                <div className="lg:col-span-1 space-y-8 sticky top-24">
                    <Card>
                        <CardHeader>
                            <CardTitle>Publish</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="is_active" className="text-base">
                                    {isActive ? "Visible" : "Draft"}
                                </Label>
                                <Switch id="is_active" name="is_active" checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        </CardContent>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="auto_price_enabled" className="text-base">Auto-Pricing</Label>
                                <Switch id="auto_price_enabled" name="auto_price_enabled" checked={autoPrice} onCheckedChange={setAutoPrice} />
                            </div>
                        </CardContent>
                        <CardContent className="space-y-2">
                            <Label htmlFor="manual_price">Manual Price (INR)</Label>
                            <Input id="manual_price" name="manual_price" type="number" defaultValue={product.manual_price ?? ""} placeholder="e.g. 50000" disabled={autoPrice} />
                            {state.errors?.manual_price && <p className="text-sm font-medium text-destructive">{state.errors.manual_price[0]}</p>}
                        </CardContent>
                        <CardContent>
                            <SubmitButton isNew={isNew} />
                        </CardContent>
                    </Card>
                    <DynamicPricingCard product={product} />
                </div>
            </div>
        </Tabs>
    </form>
  );
}
