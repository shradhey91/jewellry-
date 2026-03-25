'use client';

import { useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatus } from './actions';
import type { Order } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save & Mark as Shipped'}</Button>;
}

interface UpdateStatusDialogProps {
  order: Order;
  children: React.ReactNode;
}

export function UpdateStatusDialog({ order, children }: UpdateStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const orderTotal = useMemo(() => {
    return order.items.reduce((acc, item) => acc + item.price_snapshot.total * item.quantity, 0) - (order.discount?.amount || 0);
  }, [order]);


  const handleAction = async (formData: FormData) => {
    const trackingNumber = formData.get('trackingNumber') as string;
    
    if (!trackingNumber) {
        toast({ title: "Error", description: "Tracking number is required.", variant: "destructive"});
        return;
    }

    const result = await updateOrderStatus(order.id, 'shipped', { trackingNumber });
    toast({
      title: result.success ? 'Success' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });

    if (result.success) {
      setOpen(false);
      router.refresh();
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Shipment Details</DialogTitle>
          <DialogDescription>
            Provide the shipping carrier and tracking number for order #{order.id.split('-')[1]}.
          </DialogDescription>
        </DialogHeader>
        <form action={handleAction} className="space-y-4">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Automatic Carrier Selection</AlertTitle>
                <AlertDescription>
                    Based on the order total of {formatCurrency(orderTotal)}, a carrier will be automatically selected based on your shipping provider settings.
                </AlertDescription>
            </Alert>
            
             <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input id="trackingNumber" name="trackingNumber" placeholder="e.g., AWB123456789" />
            </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
