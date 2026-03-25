'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { resetPasswordAction } from '@/auth/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reset Password'}
    </Button>
  );
}

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [state, formAction] = useFormState(resetPasswordAction, { success: false, message: '' });
    const { toast } = useToast();

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? 'Success!' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                router.push('/auth/login');
            }
        }
    }, [state, toast, router]);
    
    if (!token) {
        return (
             <CardContent>
                <p className="text-destructive text-center">Invalid or missing password reset token.</p>
             </CardContent>
        )
    }

    return (
         <CardContent>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required />
              </div>
              {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
              {state.errors?.confirmPassword && <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>}
              <SubmitButton />
            </form>
        </CardContent>
    )
}

export default function ResetPasswordPage() {
  return (
     <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1599475732155-c1f9c878950f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhYnN0cmFjdCUyMGdvbGQlMjBwYXR0ZXJufGVufDB8fHx8MTc2ODYwMzY5Mnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Abstract background"
          fill
          className="object-cover opacity-20"
          data-ai-hint="abstract gold pattern"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-background" />
      </div>
      <Card className="w-full max-w-sm z-10">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Enter and confirm your new password below.
          </CardDescription>
        </CardHeader>
        <Suspense fallback={<CardContent><Loader2 className="mx-auto h-6 w-6 animate-spin" /></CardContent>}>
            <ResetPasswordForm />
        </Suspense>
         <CardContent className="text-center text-sm">
            <Link href="/auth/login" className="text-muted-foreground hover:text-primary">
                Back to Login
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
