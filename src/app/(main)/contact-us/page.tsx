
import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getContactPageContent } from '@/app/admin/pages/contact-us/actions';

export const runtime = 'nodejs';

export const dynamic = "force-dynamic";

export default async function ContactUsPage() {
  const content = await getContactPageContent();
  
  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-6xl py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Contact
          </p>
          <h1 className="mt-2 text-4xl font-bold font-headline tracking-tight sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            {content.email && (
              <>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Mail className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Email Us</h3>
                    <p className="mt-1 text-muted-foreground">
                      Our team will get back to you within 24 hours.
                    </p>
                    <a href={`mailto:${content.email}`} className="mt-2 inline-block font-medium text-primary hover:underline">
                      {content.email}
                    </a>
                  </div>
                </div>
                <Separator />
              </>
            )}
            
            {content.phone && (
              <>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Phone className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Call Us</h3>
                    <p className="mt-1 text-muted-foreground">
                      {content.workingHours || 'Mon - Fri from 9am to 6pm.'}
                    </p>
                    <a href={`tel:${content.phone}`} className="mt-2 inline-block font-medium text-primary hover:underline">
                      {content.phone}
                    </a>
                  </div>
                </div>
                <Separator />
              </>
            )}
            
            {content.address && (
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <MapPin className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Visit Us</h3>
                  <p className="mt-1 text-muted-foreground">
                    {content.address}
                  </p>
                  <a href="#" className="mt-2 inline-block font-medium text-primary hover:underline">
                    Get Directions
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <Card className="rounded-xl shadow-lg">
            <CardContent className="p-8">
              <form action="#" method="POST" className="space-y-6">
                <div>
                  <label htmlFor="name" className="sr-only">Full name</label>
                  <Input id="name" name="name" type="text" placeholder="Full name" />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <Input id="email" name="email" type="email" placeholder="Email address" />
                </div>
                <div>
                  <label htmlFor="phone" className="sr-only">Phone number</label>
                  <Input id="phone" name="phone" type="tel" placeholder="Phone number" />
                </div>
                <div>
                  <label htmlFor="message" className="sr-only">Message</label>
                  <Textarea id="message" name="message" rows={5} placeholder="Your message..." />
                </div>
                <div>
                  <Button type="submit" className="w-full" size="lg">Send Message</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
