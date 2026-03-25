
"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveEmailSettings } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Email Settings
    </Button>
  );
}

export function EmailSettingsForm({ settings }: { settings: any }) {
  const initialState = { message: "" };
  const [state, formAction] = useFormState(saveEmailSettings, initialState);
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

  return (
    <form action={formAction}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>
            Enter the details of your SMTP provider to send transactional emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smtp_host">SMTP Host</Label>
            <Input id="smtp_host" name="smtp_host" defaultValue={settings.smtp_host} placeholder="e.g., smtp.example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input id="smtp_port" name="smtp_port" type="number" defaultValue={settings.smtp_port} placeholder="e.g., 587" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="smtp_from">From Address</Label>
              <Input id="smtp_from" name="smtp_from" type="email" defaultValue={settings.smtp_from} placeholder="e.g., no-reply@aparra.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_user">SMTP Username</Label>
            <Input id="smtp_user" name="smtp_user" defaultValue={settings.smtp_user} placeholder="Your SMTP username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_pass">SMTP Password</Label>
            <Input id="smtp_pass" name="smtp_pass" type="password" defaultValue={settings.smtp_pass} />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
