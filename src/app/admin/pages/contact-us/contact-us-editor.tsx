'use client';

import { useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { saveContactPageContent, type ContactPageData } from './actions';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

interface ContactUsEditorProps {
  initialContent: ContactPageData;
}

export function ContactUsEditor({ initialContent }: ContactUsEditorProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [state, formAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const data: ContactPageData = {
        title: formData.get('title') as string,
        subtitle: formData.get('subtitle') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        workingHours: formData.get('workingHours') as string,
        contactFormEnabled: formData.get('contactFormEnabled') === 'on',
        showMap: formData.get('showMap') === 'on',
      };

      const result = await saveContactPageContent(data);
      
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });

      return result;
    },
    { message: '' }
  );

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await formAction(formData);
    });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertTitle>Contact Page Editor</AlertTitle>
        <AlertDescription>
          Customize all content on your Contact Us page. Changes will be reflected immediately.
        </AlertDescription>
      </Alert>

      <form action={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Page Header</CardTitle>
            <CardDescription>Main title and subtitle for the contact page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input 
                id="title" 
                name="title" 
                defaultValue={initialContent.title}
                placeholder="Enter page title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input 
                id="subtitle" 
                name="subtitle" 
                defaultValue={initialContent.subtitle}
                placeholder="Enter subtitle"
              />
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Email, phone, and address details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address (where contact form submissions will be sent)
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                defaultValue={initialContent.email}
                placeholder="your@email.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                This is the email address where all contact form submissions will be received
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input 
                id="phone" 
                name="phone" 
                defaultValue={initialContent.phone}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Physical Address
              </Label>
              <Textarea 
                id="address" 
                name="address" 
                defaultValue={initialContent.address}
                placeholder="Enter your business address"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingHours" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Working Hours
              </Label>
              <Input 
                id="workingHours" 
                name="workingHours" 
                defaultValue={initialContent.workingHours}
                placeholder="Mon - Sat: 10:00 AM - 8:00 PM"
              />
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <Card>
          <CardHeader>
            <CardTitle>Page Settings</CardTitle>
            <CardDescription>Enable or disable page features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="contactFormEnabled">Contact Form</Label>
                <p className="text-sm text-muted-foreground">
                  Show contact form on the page
                </p>
              </div>
              <Switch 
                id="contactFormEnabled" 
                name="contactFormEnabled"
                defaultChecked={initialContent.contactFormEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showMap">Location Map</Label>
                <p className="text-sm text-muted-foreground">
                  Show Google Maps location
                </p>
              </div>
              <Switch 
                id="showMap" 
                name="showMap"
                defaultChecked={initialContent.showMap}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
