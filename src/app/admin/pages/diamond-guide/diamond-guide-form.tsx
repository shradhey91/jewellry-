
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import { DiamondGuideContent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast.tsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { Upload } from 'lucide-react';

interface DiamondGuideFormProps {
  content: DiamondGuideContent;
  action: (prevState: any, formData: FormData) => Promise<{ message: string }>;
}

const ImageEditor: React.FC<{
  id: string;
  label: string;
  defaultUrl: string;
  defaultHint: string;
  hint: string;
  onImageChange: (id: string, url: string) => void;
}> = ({ id, label, defaultUrl, defaultHint, hint, onImageChange }) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB size limit
        alert("File is too large. Please select an image smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(`imageUrl-${id}`, reader.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = ""; // Reset file input
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
                <Label htmlFor={`imageUrl-${id}`}>Image</Label>
                <div className="flex items-center gap-4">
                  <Input id={`imageUrl-${id}`} name={`imageUrl-${id}`} value={defaultUrl} readOnly className="bg-muted/50" />
                  <Button asChild variant="outline" className="relative">
                    <div>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                      <Input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{hint}</p>
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

export function DiamondGuideForm({ content: initialContent, action }: DiamondGuideFormProps) {
  const [content, setContent] = useState(initialContent);
  const [state, formAction] = useFormState(action, { message: '' });
  const { toast } = useToast();

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
    // This is a bit complex due to nested structure, a library like Immer would simplify this.
    const parts = fieldId.split('-'); // e.g. "imageUrl-fourCs-0"
    const key = parts[1];
    
    setContent(currentContent => {
        const newContent = JSON.parse(JSON.stringify(currentContent)); // Deep copy
        if(key === 'hero') newContent.hero.imageUrl = url;
        if(key === 'anatomy') newContent.anatomy.imageUrl = url;
        if(key === 'fourCs') {
            const index = parseInt(parts[2], 10);
            newContent.fourCs.items[index].imageUrl = url;
        }
        if(key === 'shapes') {
            const index = parseInt(parts[2], 10);
            newContent.shapes.items[index].imageUrl = url;
        }
        return newContent;
    });
  };

  return (
    <form action={formAction}>
      <div className="space-y-6">
        <Accordion type="multiple" defaultValue={['hero', 'fourCs']} className="w-full space-y-4">
          
          <AccordionItem value="hero">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Hero Section</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="hero-eyebrow">Eyebrow Text</Label>
                    <Input id="hero-eyebrow" name="hero-eyebrow" defaultValue={content.hero.eyebrow} />
                </div>
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
                    hint="Main background image for the hero section."
                    onImageChange={handleImageChange}
                />
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="fourCs">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>The 4Cs Section</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="fourCs-title">Section Title</Label>
                    <Input id="fourCs-title" name="fourCs-title" defaultValue={content.fourCs.title} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="fourCs-subtitle">Section Subtitle</Label>
                    <Input id="fourCs-subtitle" name="fourCs-subtitle" defaultValue={content.fourCs.subtitle} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.fourCs.items.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4">
                            <h4 className="font-semibold">{item.icon} - {item.title}</h4>
                            <input type="hidden" name={`fourCs-${index}-title`} value={item.title} />
                            <div className="space-y-2">
                                <Label htmlFor={`fourCs-${index}-description`}>Description</Label>
                                <Textarea id={`fourCs-${index}-description`} name={`fourCs-${index}-description`} defaultValue={item.description} />
                            </div>
                            <ImageEditor 
                                id={`fourCs-${index}`} 
                                label="Card Image" 
                                defaultUrl={item.imageUrl} 
                                defaultHint={item.imageHint} 
                                hint="Image for this 4C card."
                                onImageChange={handleImageChange}
                             />
                        </div>
                    ))}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
          
          <AccordionItem value="shapes">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Diamond Shapes</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="shapes-title">Section Title</Label>
                    <Input id="shapes-title" name="shapes-title" defaultValue={content.shapes.title} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="shapes-subtitle">Section Subtitle</Label>
                    <Input id="shapes-subtitle" name="shapes-subtitle" defaultValue={content.shapes.subtitle} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {content.shapes.items.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-2">
                           <Label htmlFor={`shapes-${index}-name`}>Name</Label>
                           <Input id={`shapes-${index}-name`} name={`shapes-${index}-name`} defaultValue={item.name} />
                           <ImageEditor 
                                id={`shapes-${index}`} 
                                label="Shape Image" 
                                defaultUrl={item.imageUrl} 
                                defaultHint={item.imageHint} 
                                hint="Image for the shape."
                                onImageChange={handleImageChange}
                            />
                        </div>
                    ))}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
          
           <AccordionItem value="anatomy">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Anatomy Section</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="anatomy-title">Title</Label>
                    <Input id="anatomy-title" name="anatomy-title" defaultValue={content.anatomy.title} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="anatomy-subtitle">Subtitle</Label>
                    <Textarea id="anatomy-subtitle" name="anatomy-subtitle" defaultValue={content.anatomy.subtitle} />
                </div>
                <ImageEditor 
                    id="anatomy" 
                    label="Anatomy Diagram" 
                    defaultUrl={content.anatomy.imageUrl} 
                    defaultHint={content.anatomy.imageHint} 
                    hint="Diagram showing diamond anatomy."
                    onImageChange={handleImageChange}
                />
              </AccordionContent>
            </Card>
          </AccordionItem>
          
          <AccordionItem value="cta">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Call to Action Section</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="cta-title">Title</Label>
                    <Input id="cta-title" name="cta-title" defaultValue={content.cta.title} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cta-subtitle">Subtitle</Label>
                    <Textarea id="cta-subtitle" name="cta-subtitle" defaultValue={content.cta.subtitle} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="cta-ctaText">Button Text</Label>
                        <Input id="cta-ctaText" name="cta-ctaText" defaultValue={content.cta.ctaText} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cta-ctaLink">Button Link</Label>
                        <Input id="cta-ctaLink" name="cta-ctaLink" defaultValue={content.cta.ctaLink} />
                    </div>
                </div>
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
