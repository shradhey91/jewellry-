
import Image from 'next/image';
import { PhoneAuthForm } from '@/auth/components/phone-auth-form';

export default function LoginPage() {
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
      <div className="relative z-10">
        <PhoneAuthForm />
      </div>
    </div>
  );
}
