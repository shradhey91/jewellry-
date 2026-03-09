
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { initiateSignupAction, completeSignupAction, InitiateSignupState, CompleteSignupState } from '@/auth/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast.tsx';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function DetailsSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Continue'}
    </Button>
  );
}

function OtpSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify & Create Account'}
        </Button>
    );
}

export function SignupForm() {
  const [step, setStep] = useState<'details' | 'otp'>('details');

  const initialDetailsState: InitiateSignupState = { success: false };
  const [detailsState, detailsFormAction] = useFormState(initiateSignupAction, initialDetailsState);

  const initialOtpState: CompleteSignupState = { success: false };
  const [otpState, otpFormAction] = useFormState(completeSignupAction, initialOtpState);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (detailsState.success && detailsState.phone) {
      toast({ title: 'OTP Sent', description: `An OTP has been sent to ${detailsState.phone}.` });
      setStep('otp');
    } else if (detailsState.message || detailsState.errors) {
      toast({
        title: 'Error',
        description: detailsState.message || 'Please check the form for errors.',
        variant: 'destructive',
      });
    }
  }, [detailsState, toast]);

  useEffect(() => {
      if (otpState.success) {
          toast({ title: "Welcome!", description: "Your account has been created." });
          if(otpState.redirect) router.push(otpState.redirect);
      } else if (otpState.message) {
          toast({ title: 'Verification Failed', description: otpState.message, variant: 'destructive'});
      }
  }, [otpState, toast, router]);


  if (step === 'otp') {
      return (
        <Card className="w-full max-w-sm">
            <form action={otpFormAction}>
                <input type="hidden" name="phone_number" value={detailsState.phone} />
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Verify Your Number</CardTitle>
                    <CardDescription>Enter the 6-digit code sent to {detailsState.phone}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="otp">One-Time Password</Label>
                        <Input id="otp" name="otp" type="text" inputMode="numeric" maxLength={6} required />
                    </div>
                    <OtpSubmitButton />
                    <Button variant="link" size="sm" onClick={() => setStep('details')}>Use a different number</Button>
                </CardContent>
            </form>
        </Card>
      )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>
          Enter your details to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={detailsFormAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
            {detailsState.errors?.name && <p className="text-sm text-destructive">{detailsState.errors.name[0]}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="name@example.com" required/>
            {detailsState.errors?.email && <p className="text-sm text-destructive">{detailsState.errors.email[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input id="phone_number" name="phone_number" type="tel" placeholder="9876543210" required/>
            {detailsState.errors?.phone_number && <p className="text-sm text-destructive">{detailsState.errors.phone_number[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {detailsState.errors?.password && <p className="text-sm text-destructive">{detailsState.errors.password[0]}</p>}
          </div>
          <DetailsSubmitButton />
        </form>
      </CardContent>
      <CardContent className="text-center text-sm">
        <Link href="/auth/login" className="text-muted-foreground hover:text-primary">
          Already have an account? Sign In
        </Link>
      </CardContent>
    </Card>
  );
}
