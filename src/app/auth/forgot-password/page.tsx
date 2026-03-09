

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { requestPasswordReset } from '@/auth/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast.tsx';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordReset, { success: false, message: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Check Your Email' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

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
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your admin email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.success ? (
            <p className="text-sm text-muted-foreground">
              If an account with that email exists, a password reset link has been sent. Please check your inbox.
            </p>
          ) : (
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="admin@aparra.com" required />
              </div>
              <SubmitButton />
            </form>
          )}
        </CardContent>
         <CardContent className="text-center text-sm">
            <Link href="/auth/login" className="text-muted-foreground hover:text-primary">
                Back to Login
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
