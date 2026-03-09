
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import type { ShopPageContent, ShopPageCategoryItem, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast.tsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { Upload, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Simplified ImageEditor for this form
const ImageEditor: React.FC<{
  id: string;
  label: string;
  defaultUrl: string;
  defaultHint: string;
  onImageChange: (id: string, url: string) => void;
}> = ({ id, label, defaultUrl, defaultHint, onImageChange }) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { onImageChange(`imageUrl-${id}`, reader.result as string); };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <Label className="font-semibold">{label}</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1">
          <div className="aspect-video relative rounded-md overflow-hidden border">
            <Image src={defaultUrl} alt={defaultHint} fill className="object-cover" unoptimized />
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`imageUrl-${id}`}>Image URL</Label>
             <div className="flex items-center gap-2">
              <Input id={`imageUrl-${id}`} name={`imageUrl-${id}`} value={defaultUrl} readOnly className="bg-muted/50" />
              <Button asChild variant="outline" className="relative">
                <div>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`imageHint-${id}`}>Image Hint (for AI)</Label>
            <Input id={`imageHint-${id}`} name={`imageHint-${id}`} defaultValue={defaultHint} />
          </div>
        </div>
      </div>
    </div>
  );
};


function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Changes"}</Button>;
}

interface ShopPageEditorFormProps {
  content: ShopPageContent;
  allCategories: Category[];
  action: (prevState: any, formData: FormData) => Promise<{ message: string }>;
}

export function ShopPageEditorForm({ content: initialContent, allCategories, action }: ShopPageEditorFormProps) {
  const [content, setContent] = useState(initialContent);
  const [state, formAction] = useFormState(action, { message: '' });
  const { toast } = useToast();

  const topLevelCategories = allCategories.filter(c => c.parent_id === null);

  const [categoryOrder, setCategoryOrder] = useState<ShopPageCategoryItem[]>(() => {
    const existing = initialContent.categories.map(c => c.id);
    const allTopLevelIds = topLevelCategories.map(c => c.id);
    const newCategories = allTopLevelIds.filter(id => !existing.includes(id));
    
    return [
      ...initialContent.categories,
      ...newCategories.map(id => ({ id, visible: true }))
    ];
  });


  useEffect(() => {
    if (state.message) {
      toast({
        title: state.message.includes('Failed') ? "Error" : "Success",
        description: state.message,
        variant: state.message.includes('Failed') ? "destructive" : "default",
      });
    }
  }, [state, toast]);
  
  const handleImageChange = (fieldId: string, url: string) => {
    setContent(current => ({ ...current, hero: { ...current.hero, imageUrl: url } }));
  };
  
  const handleCategoryVisibilityChange = (categoryId: string, visible: boolean) => {
      setCategoryOrder(current => current.map(c => c.id === categoryId ? { ...c, visible } : c));
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="categoryOrder" value={JSON.stringify(categoryOrder)} />
      <div className="space-y-6">
        <Accordion type="multiple" defaultValue={['hero', 'main', 'categories']} className="w-full space-y-4">
          
          <AccordionItem value="hero">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Hero Section</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="hero-title">Title</Label>
                    <Input id="hero-title" name="hero-title" defaultValue={content.hero.title} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hero-subtitle">Subtitle</Label>
                    <Textarea id="hero-subtitle" name="hero-subtitle" defaultValue={content.hero.subtitle} />
                </div>
                <ImageEditor 
                    id="hero" 
                    label="Background Image" 
                    defaultUrl={content.hero.imageUrl} 
                    defaultHint={content.hero.imageHint} 
                    onImageChange={handleImageChange}
                />
              </AccordionContent>
            </Card>
          </AccordionItem>
          
          <AccordionItem value="main">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Main Content</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="main-title">Section Title</Label>
                    <Input id="main-title" name="main-title" defaultValue={content.main.title} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="main-allProductsLinkText">"All Products" Button Text</Label>
                    <Input id="main-allProductsLinkText" name="main-allProductsLinkText" defaultValue={content.main.allProductsLinkText} />
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
          
          <AccordionItem value="categories">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Category Display</CardTitle>
                   <CardDescription>Manage visibility of top-level categories on the shop page.</CardDescription>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-2">
                {categoryOrder.map(item => {
                    const category = topLevelCategories.find(c => c.id === item.id);
                    if (!category) return null;
                    return (
                        <div key={category.id} className={cn("flex items-center justify-between rounded-lg border p-4", !item.visible && "bg-muted/50")}>
                            <div className="flex items-center gap-3">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <p className={cn("font-medium", !item.visible && "text-muted-foreground")}>{category.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    {item.visible ? 'Visible' : 'Hidden'}
                                </span>
                                <Switch
                                    checked={item.visible}
                                    onCheckedChange={(checked) => handleCategoryVisibilityChange(category.id, checked)}
                                />
                            </div>
                        </div>
                    )
                })}
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
        <Card>
          <CardFooter className="p-6">
            <SubmitButton />
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}

    