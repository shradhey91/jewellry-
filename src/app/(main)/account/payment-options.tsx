"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, PlusCircle, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// Mock data - in a real app, this would come from a secure backend
const mockPaymentMethods = [
  { id: "pm_1", type: "Visa", last4: "4242", expiry: "08/26" },
  { id: "pm_2", type: "Mastercard", last4: "5555", expiry: "12/27" },
];

export function PaymentOptions() {
  const [methods, setMethods] = useState(mockPaymentMethods);
  const { toast } = useToast();

  const handleRemove = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    toast({
      title: "Payment Method Removed",
      description: "The selected card has been removed from your account.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Payment Options</CardTitle>
          <CardDescription>Manage your saved payment methods.</CardDescription>
        </div>
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Card
        </Button>
      </CardHeader>
      <CardContent>
        {methods.length > 0 ? (
          <div className="space-y-4">
            {methods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">
                      {method.type} ending in {method.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.expiry}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove your saved card ending in{" "}
                        {method.last4}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemove(method.id)}
                      >
                        Remove Card
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-lg">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              No Saved Payment Methods
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You can save your payment details during checkout for a faster
              experience next time.
            </p>
            <Button variant="outline" className="mt-6" disabled>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
