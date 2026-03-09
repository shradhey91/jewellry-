
"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import type { Menu, MenuItem, Category } from "@/lib/types";
import { saveMenuAction, MenuFormState } from "@/app/admin/menus/actions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, PlusCircle, GripVertical, Settings, Eye, Text, Image as ImageIcon, Link as LinkIcon, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast.tsx";
import Image from "next/image";
import { PageHeader } from "../page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadFileAction } from "@/lib/server/actions/media";

interface MenuBuilderProps {
  menu: Menu;
  categories: Category[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Menu"}</Button>;
}

const getCategoryDepth = (categoryId: string | null, allCategories: Category[]): number => {
    if (!categoryId) return 0;
    const category = allCategories.find(c => c.id === categoryId);
    if (!category || !category.parent_id) return 0;
    return 1 + getCategoryDepth(category.parent_id, allCategories);
};

const ImageUpload = ({ label, value, onUrlChange }: { label: string; value: string; onUrlChange: (url: string) => void; }) => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({ title: "File too large", description: "Please select an image smaller than 2MB.", variant: "destructive" });
                return;
            }
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('subfolder', 'megamenu');

            const result = await uploadFileAction(formData);

            if (result.success && result.url) {
                onUrlChange(result.url);
                toast({ title: "Upload successful", description: "Image has been uploaded." });
            } else {
                toast({ title: "Upload failed", description: result.message, variant: "destructive" });
            }
            setIsUploading(false);
            e.target.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <div className="w-16 h-16 rounded-md border flex items-center justify-center bg-muted shrink-0">
                    {value ? <Image src={value} alt="Preview" width={64} height={64} className="object-contain" /> : <ImageIcon className="h-6 w-6 text-muted-foreground"/>}
                </div>
                <Input
                    type="text"
                    placeholder="https://... or upload"
                    value={value}
                    onChange={(e) => onUrlChange(e.target.value)}
                />
                 <Button asChild variant="outline" className="relative" disabled={isUploading}>
                   <div>
                       {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                       Upload
                       <Input 
                           type="file" 
                           accept="image/*"
                           onChange={handleFileChange}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           disabled={isUploading}
                       />
                   </div>
               </Button>
            </div>
        </div>
    );
};


export function MenuBuilder({ menu, categories }: MenuBuilderProps) {
  const [items, setItems] = useState<MenuItem[]>(() => 
    [...menu.items].sort((a, b) => a.sort_order - b.sort_order)
  );
  
  const hierarchicalCategories = categories.map(cat => {
      const depth = getCategoryDepth(cat.id, categories);
      return { ...cat, depth };
  });

  const initialState: MenuFormState = { message: "", errors: {} };
  const [state, setState] = useState<MenuFormState>(initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        console.error("Menu save errors:", state.errors);
        toast({ title: "Validation Error", description: state.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: state.message });
      }
    }
  }, [state, toast]);

  const formAction = async (formData: FormData) => {
    formData.set('items', JSON.stringify(items));
    const result = await saveMenuAction(state, formData);
    setState(result);
  };

  const updateItem = (id: string, field: keyof MenuItem, value: any) => {
    setItems(currentItems => {
        let newItems = currentItems.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        return newItems;
    });
  };

  const addItem = () => {
    const newItem: MenuItem = {
      id: `new-${Date.now()}`,
      label: "New Item",
      link: "#",
      parent_id: null,
      sort_order: items.length,
    };
    setItems(prev => [...prev, newItem]);
    toast({
        title: "Menu Item Added",
        description: "A new item has been added. Remember to save your changes."
    });
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find(i => i.id === id);
    setItems(prev => prev.filter(item => item.id !== id && item.parent_id !== id));
    toast({
        title: "Menu Item Removed",
        description: `"${itemToRemove?.label || 'Item'}" removed. Remember to save changes.`
    });
  };
  
  const handleLinkTypeChange = (item: MenuItem, type: 'category' | 'custom', value?: string) => {
      if (type === 'custom') {
        updateItem(item.id, 'link', '#');
      } else {
        const categoryId = value;
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          setItems(currentItems => currentItems.map(i => 
              i.id === item.id 
              ? {...i, link: `/category/${category.id}`, label: i.label || category.name, icon: category.icon, imageUrl: category.imageUrl} 
              : i
          ));
        }
      }
  };

  const buildHierarchy = (currentItems: MenuItem[], parentId: string | null = null): MenuItem[] => {
    return currentItems
      .filter(item => item.parent_id === parentId)
      .sort((a,b) => a.sort_order - b.sort_order)
      .flatMap(item => [
        item,
        ...buildHierarchy(currentItems, item.id)
      ]);
  };

  const hierarchicalItems = buildHierarchy(items);

  const getMenuItemDepth = (itemId: string): number => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.parent_id) return 0;
    return 1 + getMenuItemDepth(item.parent_id);
  }

  return (
    <form action={formAction}>
        <input type="hidden" name="menuId" value={menu.id} />
        <PageHeader
            title="Menu Management"
            description="Configure the navigation for your storefront."
        >
             <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addItem}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Menu Item
                </Button>
                <SubmitButton />
            </div>
        </PageHeader>
        <div className="space-y-4">
        {hierarchicalItems.map((item) => {
            const depth = getMenuItemDepth(item.id);
            const isCustomLink = !item.link.startsWith('/category/');
            const isTopLevel = depth === 0;

            return (
                <Card key={item.id} className="bg-muted/30">
                  <CardHeader className="flex flex-row items-center gap-4 p-4">
                     <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                     <div className="flex-1">
                        <Input
                            value={item.label}
                            onChange={e => updateItem(item.id, 'label', e.target.value)}
                            placeholder="Menu item label"
                            className="text-base font-semibold border-0 shadow-none -ml-2 focus-visible:ring-1 focus-visible:ring-ring"
                        />
                     </div>
                     <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                     </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Tabs defaultValue="content" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="content"><LinkIcon className="mr-2"/>Content</TabsTrigger>
                        <TabsTrigger value="appearance"><Eye className="mr-2"/>Appearance</TabsTrigger>
                        <TabsTrigger value="structure"><Settings className="mr-2"/>Structure</TabsTrigger>
                        <TabsTrigger value="mega" disabled={!isTopLevel}><Text className="mr-2"/>Mega Menu</TabsTrigger>
                      </TabsList>

                      <TabsContent value="content" className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                                <Label>Link Type</Label>
                                <Select
                                value={isCustomLink ? 'custom' : 'category'}
                                onValueChange={(value) => handleLinkTypeChange(item, value as any)}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select link type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">Custom URL</SelectItem>
                                        <SelectItem value="category">Category</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {isCustomLink ? (
                            <div className="space-y-2">
                                <Label htmlFor={`link-${item.id}`}>Custom URL</Label>
                                <Input
                                id={`link-${item.id}`}
                                value={item.link}
                                onChange={e => updateItem(item.id, 'link', e.target.value)}
                                placeholder="/pages/about-us"
                                />
                            </div>
                            ) : (
                            <div className="space-y-2">
                                <Label htmlFor={`link-category-${item.id}`}>Category</Label>
                                <Select
                                    value={item.link.replace('/category/', '')}
                                    onValueChange={(value) => handleLinkTypeChange(item, 'category', value)}
                                >
                                    <SelectTrigger id={`link-category-${item.id}`}>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hierarchicalCategories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id} style={{ paddingLeft: `${1 + cat.depth * 1.5}rem` }}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            )}
                        </div>
                      </TabsContent>

                      <TabsContent value="appearance" className="pt-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`icon-${item.id}`}>Lucide Icon Name</Label>
                                    <Input
                                        id={`icon-${item.id}`}
                                        value={item.icon || ''}
                                        onChange={(e) => updateItem(item.id, 'icon', e.target.value)}
                                        placeholder="e.g., Shirt"
                                    />
                                </div>
                                <div className="space-y-2">
                                <Label>Icon Image URL</Label>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-md border flex items-center justify-center bg-background shrink-0">
                                    {item.imageUrl ? <Image src={item.imageUrl} alt="Icon preview" width={24} height={24} className="object-contain" /> : <ImageIcon className="h-5 w-5 text-muted-foreground"/>}
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="https://example.com/icon.png"
                                        value={item.imageUrl || ""}
                                        onChange={(e) => updateItem(item.id, 'imageUrl', e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Optional. Overrides Lucide icon.</p>
                                </div>
                            </div>
                      </TabsContent>

                      <TabsContent value="structure" className="pt-6">
                           <div className="space-y-2 max-w-sm">
                                <Label htmlFor={`parent-${item.id}`}>Parent Item</Label>
                                <Select 
                                    value={item.parent_id || "null"}
                                    onValueChange={value => updateItem(item.id, 'parent_id', value === "null" ? null : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">None (Top-level)</SelectItem>
                                        {items.filter(parent => parent.id !== item.id && getMenuItemDepth(parent.id) < 2).map(parent => (
                                            <SelectItem key={parent.id} value={parent.id} style={{paddingLeft: `${1 + getMenuItemDepth(parent.id) * 1.5}rem`}}>{parent.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                      </TabsContent>
                      
                      <TabsContent value="mega" className="pt-6">
                           <Accordion type="multiple" className="w-full space-y-4">
                               <AccordionItem value="layout">
                                   <AccordionTrigger>Layout</AccordionTrigger>
                                   <AccordionContent className="pt-4">
                                      <div className="space-y-2 max-w-xs">
                                          <Label>Sub-Category Grid Columns</Label>
                                          <Select 
                                              value={String(item.subnavColumns || 3)}
                                              onValueChange={(value) => updateItem(item.id, 'subnavColumns', Number(value))}
                                          >
                                              <SelectTrigger><SelectValue placeholder="Select column count" /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="2">2 Columns</SelectItem>
                                                  <SelectItem value="3">3 Columns</SelectItem>
                                                  <SelectItem value="4">4 Columns</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </div>
                                   </AccordionContent>
                               </AccordionItem>
                               <AccordionItem value="promo-1">
                                   <AccordionTrigger>Promo Section 1 (Right)</AccordionTrigger>
                                   <AccordionContent className="pt-4">
                                        <div className="space-y-4">
                                          <div className="space-y-2">
                                              <Label>Promo Title</Label>
                                              <Input value={item.promoTitle || ''} onChange={(e) => updateItem(item.id, 'promoTitle', e.target.value)} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label>Promo Description</Label>
                                              <Input value={item.promoDescription || ''} onChange={(e) => updateItem(item.id, 'promoDescription', e.target.value)} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label>Promo Link</Label>
                                              <Input value={item.promoLink || ''} onChange={(e) => updateItem(item.id, 'promoLink', e.target.value)} />
                                          </div>
                                          <ImageUpload 
                                            label="Promo Image URL"
                                            value={item.promoImageUrl || ''}
                                            onUrlChange={(url) => updateItem(item.id, 'promoImageUrl', url)}
                                          />
                                      </div>
                                   </AccordionContent>
                               </AccordionItem>
                               <AccordionItem value="promo-2">
                                   <AccordionTrigger>Promo Section 2 (Right)</AccordionTrigger>
                                   <AccordionContent className="pt-4">
                                      <div className="space-y-4">
                                          <div className="space-y-2">
                                              <Label>Promo Title</Label>
                                              <Input value={item.promo2Title || ''} onChange={(e) => updateItem(item.id, 'promo2Title', e.target.value)} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label>Promo Description</Label>
                                              <Input value={item.promo2Description || ''} onChange={(e) => updateItem(item.id, 'promo2Description', e.target.value)} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label>Promo Link</Label>
                                              <Input value={item.promo2Link || ''} onChange={(e) => updateItem(item.id, 'promo2Link', e.target.value)} />
                                          </div>
                                          <ImageUpload 
                                            label="Promo Image URL"
                                            value={item.promo2ImageUrl || ''}
                                            onUrlChange={(url) => updateItem(item.id, 'promo2ImageUrl', url)}
                                          />
                                      </div>
                                   </AccordionContent>
                               </AccordionItem>
                                <AccordionItem value="bottom-banner">
                                   <AccordionTrigger>Bottom Banner</AccordionTrigger>
                                   <AccordionContent className="pt-4">
                                       <div className="space-y-4">
                                           <div className="space-y-2">
                                              <Label>Bottom Banner Title</Label>
                                              <Input value={item.subnavPromoTitle || ''} onChange={(e) => updateItem(item.id, 'subnavPromoTitle', e.target.value)} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label>Bottom Banner Link</Label>
                                              <Input value={item.subnavPromoLink || ''} onChange={(e) => updateItem(item.id, 'subnavPromoLink', e.target.value)} />
                                          </div>
                                           <ImageUpload 
                                            label="Bottom Banner Image URL"
                                            value={item.subnavPromoImageUrl || ''}
                                            onUrlChange={(url) => updateItem(item.id, 'subnavPromoImageUrl', url)}
                                          />
                                      </div>
                                   </AccordionContent>
                               </AccordionItem>
                           </Accordion>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
            )
        })}
        </div>
    </form>
  );
}
