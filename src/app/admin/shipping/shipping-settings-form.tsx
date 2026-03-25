'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { saveShippingSettings } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface ShippingSettings {
  blockedPincodes: string[];
  blockedCities: string[];
  delhivery?: {
    apiToken?: string;
  };
  sequel?: {
    apiToken?: string;
  };
  shiprocket?: {
    apiToken?: string;
  };
}

interface ShippingSettingsFormProps {
  settings: ShippingSettings;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save All Settings
    </Button>
  );
}

export function ShippingSettingsForm({ settings }: ShippingSettingsFormProps) {
  const [state, formAction] = useFormState(saveShippingSettings, { message: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.message.includes('Failed') ? 'Error' : 'Success',
        description: state.message,
        variant: state.message.includes('Failed') ? 'destructive' : 'default',
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Blocklist</CardTitle>
          <CardDescription>
            Enter pincodes or cities where you do not deliver. Add one entry per line or separate by commas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="blockedPincodes">Blocked Pincodes</Label>
            <Textarea
              id="blockedPincodes"
              name="blockedPincodes"
              defaultValue={settings.blockedPincodes.join('\n')}
              placeholder="e.g., 110001, 400051, 560038"
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blockedCities">Blocked Cities</Label>
            <Textarea
              id="blockedCities"
              name="blockedCities"
              defaultValue={settings.blockedCities.join('\n')}
              placeholder="e.g., Mumbai, Delhi"
              rows={5}
            />
             <p className="text-xs text-muted-foreground">City names are not case-sensitive.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delhivery Integration</CardTitle>
          <CardDescription>
            Enter your Delhivery API token to integrate with their services.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="space-y-2">
                <Label htmlFor="delhiveryApiToken">Delhivery API Token</Label>
                <Input
                  id="delhiveryApiToken"
                  name="delhiveryApiToken"
                  defaultValue={settings.delhivery?.apiToken || ''}
                  placeholder="Enter your Delhivery API token"
                  type="password"
                />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Sequel Logistics Integration</CardTitle>
          <CardDescription>
            Enter your Sequel Logistics API token to integrate with their services.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="space-y-2">
                <Label htmlFor="sequelApiToken">Sequel Logistics API Token</Label>
                <Input
                  id="sequelApiToken"
                  name="sequelApiToken"
                  defaultValue={settings.sequel?.apiToken || ''}
                  placeholder="Enter your Sequel Logistics API token"
                  type="password"
                />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Shiprocket Integration</CardTitle>
          <CardDescription>
            Enter your Shiprocket API token to integrate with their services.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="space-y-2">
                <Label htmlFor="shiprocketApiToken">Shiprocket API Token</Label>
                <Input
                  id="shiprocketApiToken"
                  name="shiprocketApiToken"
                  defaultValue={settings.shiprocket?.apiToken || ''}
                  placeholder="Enter your Shiprocket API token"
                  type="password"
                />
            </div>
        </CardContent>
      </Card>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
