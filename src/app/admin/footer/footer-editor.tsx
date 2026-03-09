
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import type { FooterContent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast.tsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2 } from 'lucide-react';

interface FooterEditorProps {
  content: FooterContent;
  action: (prevState: any, formData: FormData) => Promise<{ message: string }>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Footer"}</Button>;
}

export function FooterEditor({ content: initialContent, action }: FooterEditorProps) {
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
  
  const handleColumnChange = (colIndex: number, field: 'title', value: string) => {
    const newColumns = [...content.columns];
    newColumns[colIndex][field] = value;
    setContent(prev => ({ ...prev, columns: newColumns }));
  };

  const handleLinkChange = (colIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => {
    const newColumns = [...content.columns];
    newColumns[colIndex].links[linkIndex][field] = value;
    setContent(prev => ({ ...prev, columns: newColumns }));
  };
  
  const addLink = (colIndex: number) => {
    const newColumns = [...content.columns];
    newColumns[colIndex].links.push({ id: `new-${Date.now()}`, label: "New Link", url: "#" });
    setContent(prev => ({ ...prev, columns: newColumns }));
  }

  const removeLink = (colIndex: number, linkIndex: number) => {
    const newColumns = [...content.columns];
    newColumns[colIndex].links.splice(linkIndex, 1);
    setContent(prev => ({ ...prev, columns: newColumns }));
  }
  
  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...content.locations];
    newLocations[index].name = value;
    setContent(prev => ({ ...prev, locations: newLocations }));
  }
  
  const addLocation = () => {
    setContent(prev => ({...prev, locations: [...prev.locations, {id: `new-${Date.now()}`, name: "New Location"}]}))
  }
  
  const removeLocation = (index: number) => {
    const newLocations = [...content.locations];
    newLocations.splice(index, 1);
    setContent(prev => ({ ...prev, locations: newLocations }));
  }
  
   const handleSocialChange = (field: keyof FooterContent['socials'], value: string) => {
    setContent(prev => ({ ...prev, socials: { ...prev.socials, [field]: value } }));
  };
  
   const handleBottomChange = (field: 'copyright' | 'links', value: any) => {
       if(field === 'links') {
           setContent(prev => ({...prev, bottom: {...prev.bottom, links: value}}))
       } else {
           setContent(prev => ({ ...prev, bottom: { ...prev.bottom, [field]: value } }));
       }
  };

  return (
    <form action={formAction}>
        <input type="hidden" name="columns" value={JSON.stringify(content.columns)} />
        <input type="hidden" name="contact" value={JSON.stringify(content.contact)} />
        <input type="hidden" name="locations" value={JSON.stringify(content.locations)} />
        <input type="hidden" name="socials" value={JSON.stringify(content.socials)} />
        <input type="hidden" name="bottom" value={JSON.stringify(content.bottom)} />

      <div className="space-y-6">
        <Accordion type="multiple" defaultValue={['col-0', 'col-1', 'contact', 'socials']} className="w-full space-y-4">
          
          {content.columns.map((column, colIndex) => (
             <AccordionItem value={`col-${colIndex}`} key={column.id}>
                <Card>
                <AccordionTrigger className="p-6 w-full">
                    <CardHeader className="p-0 text-left">
                        <CardTitle>Link Column: {column.title}</CardTitle>
                    </CardHeader>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Column Title</Label>
                        <Input value={column.title} onChange={e => handleColumnChange(colIndex, 'title', e.target.value)} />
                    </div>
                    <div className="space-y-3">
                        <Label>Links</Label>
                        {column.links.map((link, linkIndex) => (
                            <div key={link.id} className="flex items-center gap-2 p-2 border rounded-md">
                                <div className="grid grid-cols-2 gap-2 flex-grow">
                                    <Input placeholder="Label" value={link.label} onChange={e => handleLinkChange(colIndex, linkIndex, 'label', e.target.value)} />
                                    <Input placeholder="URL" value={link.url} onChange={e => handleLinkChange(colIndex, linkIndex, 'url', e.target.value)} />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(colIndex, linkIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => addLink(colIndex)}><PlusCircle className="mr-2 h-4 w-4" /> Add Link</Button>
                    </div>
                </AccordionContent>
                </Card>
            </AccordionItem>
          ))}
          
          <AccordionItem value="contact">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left"><CardTitle>Contact & Locations</CardTitle></CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input value={content.contact.email} onChange={e => setContent(prev => ({...prev, contact: {...prev.contact, email: e.target.value}}))} />
                </div>
                <div className="space-y-3">
                    <Label>Store Locations</Label>
                    {content.locations.map((location, index) => (
                         <div key={location.id} className="flex items-center gap-2">
                            <Input value={location.name} onChange={e => handleLocationChange(index, e.target.value)} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeLocation(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addLocation}><PlusCircle className="mr-2 h-4 w-4" /> Add Location</Button>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

           <AccordionItem value="socials">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left"><CardTitle>Social Media</CardTitle></CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Facebook URL</Label>
                    <Input value={content.socials.facebook} onChange={e => handleSocialChange('facebook', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Instagram URL</Label>
                    <Input value={content.socials.instagram} onChange={e => handleSocialChange('instagram', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Twitter URL</Label>
                    <Input value={content.socials.twitter} onChange={e => handleSocialChange('twitter', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>YouTube URL</Label>
                    <Input value={content.socials.youtube} onChange={e => handleSocialChange('youtube', e.target.value)} />
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

           <AccordionItem value="bottom">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left"><CardTitle>Bottom Bar</CardTitle></CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                    <Label>Copyright Text</Label>
                    <Input value={content.bottom.copyright} onChange={e => handleBottomChange('copyright', e.target.value)} />
                </div>
                <div className="space-y-3">
                    <Label>Bottom Links</Label>
                    {content.bottom.links.map((link, index) => (
                        <div key={link.id} className="flex items-center gap-2 p-2 border rounded-md">
                             <div className="grid grid-cols-2 gap-2 flex-grow">
                                <Input placeholder="Label" value={link.label} onChange={e => {
                                    const newLinks = [...content.bottom.links];
                                    newLinks[index].label = e.target.value;
                                    handleBottomChange('links', newLinks);
                                }} />
                                <Input placeholder="URL" value={link.url} onChange={e => {
                                    const newLinks = [...content.bottom.links];
                                    newLinks[index].url = e.target.value;
                                    handleBottomChange('links', newLinks);
                                }} />
                            </div>
                        </div>
                    ))}
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
