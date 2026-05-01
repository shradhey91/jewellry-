"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveWhatsAppSettings, WhatsAppFormState } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast.tsx";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface WhatsAppFormProps {
  settings: {
    enabled: boolean;
    phoneNumber: string;
    defaultMessage?: string;
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Settings
    </Button>
  );
}

export function WhatsAppForm({ settings }: WhatsAppFormProps) {
  const initialState = { message: "", errors: {} };
  const [state, formAction] = useFormState(saveWhatsAppSettings, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors && Object.keys(state.errors).length > 0 ? "Error" : "Success",
        description: state.message,
        variant: state.errors && Object.keys(state.errors).length > 0 ? "destructive" : "default",
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>WhatsApp Chat Widget</CardTitle>
          <CardDescription>
            Configure the floating WhatsApp chat widget for your storefront.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-base">Enable Widget</Label>
              <p className="text-sm text-muted-foreground">
                Show the WhatsApp chat button on your site.
              </p>
            </div>
            <Switch
              id="enabled"
              name="enabled"
              defaultChecked={settings.enabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">WhatsApp Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              defaultValue={settings.phoneNumber}
              placeholder="e.g., 919876543210"
            />
             {state.errors?.phoneNumber && <p className="text-sm text-destructive">{state.errors.phoneNumber[0]}</p>}
            <p className="text-xs text-muted-foreground">
              Include country code without '+' or spaces.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultMessage">Default Message</Label>
            <Textarea
              id="defaultMessage"
              name="defaultMessage"
              defaultValue={settings.defaultMessage || ''}
              placeholder="e.g., Hello! I'm interested in your products."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This message will be pre-filled when a customer clicks the widget.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
