"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { savePaymentGatewaySettings, PaymentGatewayFormState } from './actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast.tsx';
import { KeyRound, CheckCircle2, AlertTriangle, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


interface PaymentGatewayFormProps {
    initialSettings: any;
}

function SubmitButton({ gateway }: { gateway: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" name="gateway" value={gateway} disabled={pending}>
      {pending ? "Saving..." : "Save Credentials"}
    </Button>
  );
}

function GatewayCard({ gatewayName, gatewayKey, settings, fields }: { gatewayName: string, gatewayKey: string, settings: any, fields: {key: string, label: string, placeholder: string}[] }) {
    const initialState: PaymentGatewayFormState = { message: "", errors: {} };
    const [state, formAction] = useFormState(savePaymentGatewaySettings, initialState);
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

    const isConnected = fields.every(field => settings[gatewayKey]?.[field.key]);
    
    return (
        <form action={formAction}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-6 w-6" />
                            {gatewayName}
                        </CardTitle>
                        <Badge variant={isConnected ? "secondary" : "outline"}>
                            {isConnected ? <CheckCircle2 className="mr-1.5 h-4 w-4 text-green-500"/> : <AlertTriangle className="mr-1.5 h-4 w-4 text-orange-500" />}
                            {isConnected ? "Configured" : "Not Configured"}
                        </Badge>
                    </div>
                    <CardDescription>Enter your API credentials to activate this gateway.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map(field => (
                        <div className="space-y-2" key={field.key}>
                            <Label htmlFor={`${gatewayKey}-${field.key}`}>{field.label}</Label>
                            <Input id={`${gatewayKey}-${field.key}`} name={`${gatewayKey}-${field.key}`} placeholder={field.placeholder} defaultValue={settings[gatewayKey]?.[field.key] ?? ''} type={field.key.toLowerCase().includes('secret') || field.key.toLowerCase().includes('key') && !field.key.toLowerCase().includes('id') ? 'password' : 'text'} />
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <SubmitButton gateway={gatewayKey} />
                </CardFooter>
            </Card>
        </form>
    )
}

export function PaymentGatewayForm({ initialSettings }: PaymentGatewayFormProps) {
  return (
    <div className="max-w-2xl space-y-6">
        <GatewayCard 
            gatewayName="Razorpay" 
            gatewayKey="razorpay" 
            settings={initialSettings} 
            fields={[
                { key: 'apiKey', label: 'Key ID', placeholder: 'rzp_live_********'},
                { key: 'apiSecret', label: 'Key Secret', placeholder: '**************'}
            ]}
        />
        <GatewayCard 
            gatewayName="Cashfree" 
            gatewayKey="cashfree" 
            settings={initialSettings} 
            fields={[
                { key: 'appId', label: 'App ID', placeholder: 'Enter your Cashfree App ID'},
                { key: 'secretKey', label: 'Secret Key', placeholder: '**************'}
            ]}
        />
    </div>
  );
}
