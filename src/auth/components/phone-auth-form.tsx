'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { loginAction, sendVerificationOtpAction, verifyPhoneAction, LoginState, SendOtpState, VerifyPhoneState } from '@/auth/actions';
import { useToast } from '@/hooks/use-toast.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

function LoginSubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : 'Sign In'}</Button>;
}
function SendOtpSubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : 'Send OTP'}</Button>;
}
function VerifyOtpSubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : 'Verify & Sign In'}</Button>;
}

export function PhoneAuthForm() {
  const [step, setStep] = useState<'login' | 'add_phone' | 'verify_otp'>('login');
  const [loginState, loginFormAction] = useFormState(loginAction, { success: false });
  const [sendOtpState, sendOtpFormAction] = useFormState(sendVerificationOtpAction, { success: false });
  const [verifyPhoneState, verifyPhoneFormAction] = useFormState(verifyPhoneAction, { success: false });

  const { toast } = useToast();
  const router = useRouter();
  
  // Effect for login action
  useEffect(() => {
    if (loginState.success) {
      if (loginState.redirect) {
        toast({ title: 'Login Successful', description: 'Welcome back!' });
        router.push(loginState.redirect);
        router.refresh();
      } else if (loginState.needsPhoneVerification) {
        setStep('add_phone');
      }
    } else if (loginState.error) {
      toast({ title: 'Error', description: loginState.error, variant: 'destructive' });
    }
  }, [loginState, toast, router]);

  // Effect for send OTP action
  useEffect(() => {
    if (sendOtpState.success && sendOtpState.phone) {
        toast({ title: 'OTP Sent', description: `An OTP has been sent to ${sendOtpState.phone}` });
        setStep('verify_otp');
    } else if (sendOtpState.error) {
        toast({ title: 'Error', description: sendOtpState.error, variant: 'destructive' });
    }
  }, [sendOtpState, toast]);

  // Effect for verify phone action
  useEffect(() => {
    if (verifyPhoneState.success && verifyPhoneState.redirect) {
      toast({ title: 'Success!', description: 'Phone number verified. You are now logged in.' });
      router.push(verifyPhoneState.redirect);
      router.refresh();
    } else if (verifyPhoneState.error) {
       toast({ title: 'Error', description: verifyPhoneState.error, variant: 'destructive' });
    }
  }, [verifyPhoneState, toast, router]);

  if (step === 'add_phone') {
    return (
      <Card className="w-full max-w-sm">
        <form action={sendOtpFormAction}>
          <input type="hidden" name="userId" value={loginState.userId} />
          <input type="hidden" name="email" value={loginState.email ?? ''} />
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Add Phone Number</CardTitle>
            <CardDescription>Please add and verify a phone number to continue to your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" placeholder="9876543210" required />
              {sendOtpState.error && <p className="text-sm text-destructive">{sendOtpState.error}</p>}
            </div>
            <SendOtpSubmitButton />
          </CardContent>
        </form>
      </Card>
    );
  }

  if (step === 'verify_otp') {
      return (
        <Card className="w-full max-w-sm">
            <form action={verifyPhoneFormAction}>
                <input type="hidden" name="userId" value={sendOtpState.userId || loginState.userId} />
                <input type="hidden" name="phone" value={sendOtpState.phone} />
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Enter OTP</CardTitle>
                    <CardDescription>We've sent a one-time password to {sendOtpState.phone}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="otp">One-Time Password</Label>
                    <Input id="otp" name="otp" type="text" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit OTP" required />
                    {verifyPhoneState.error && <p className="text-sm text-destructive">{verifyPhoneState.error}</p>}
                    </div>
                    <VerifyOtpSubmitButton />
                    <Button variant="link" size="sm" onClick={() => setStep('add_phone')}>Use a different number</Button>
                </CardContent>
            </form>
        </Card>
      );
  }

  return (
    <Card className="w-full max-w-sm">
      <form action={loginFormAction}>
          <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sign In / Sign Up</CardTitle>
              <CardDescription>Enter your details to access your account or create a new one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="identifier">Email or Phone Number</Label>
                  <Input id="identifier" name="identifier" placeholder="" required />
              </div>
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                        Forgot password?
                    </Link>
                  </div>
                  <Input id="password" name="password" type="password" placeholder="" />
              </div>
              <LoginSubmitButton />
          </CardContent>
      </form>
       <CardContent className="text-center text-sm">
            <Link href="/auth/signup" className="text-muted-foreground hover:text-primary">
                Don't have an account? Sign Up
            </Link>
        </CardContent>
    </Card>
  );
}