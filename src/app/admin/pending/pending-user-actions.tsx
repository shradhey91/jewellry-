'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.tsx';
import { approveUser, rejectUser } from './actions';

export function PendingUserActions({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    const result = await approveUser(userId);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
    router.refresh();
    setIsApproving(false);
  };

  const handleReject = async () => {
    setIsRejecting(true);
    const result = await rejectUser(userId);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
    router.refresh();
    setIsRejecting(false);
  };

  return (
    <>
      <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" title="Manually Verify" onClick={handleApprove} disabled={isApproving || isRejecting}>
        {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" title="Delete User" onClick={handleReject} disabled={isApproving || isRejecting}>
        {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
      </Button>
    </>
  );
}
