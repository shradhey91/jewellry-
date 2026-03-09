

"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { saveCustomerAction, type CustomerFormState } from "@/app/admin/customers/actions";
import type { Customer, User } from "@/lib/types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

interface CustomerFormProps {
  customer?: User; // Changed to User to include phone_number
  onSuccess: () => void;
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : isNew ? "Create Customer" : "Save Changes"}
    </Button>
  );
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const isNew = !customer;
  const initialState: CustomerFormState = { message: "", errors: {} };
  const [state, setState] = useState<CustomerFormState>(initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({
          title: "Validation Error",
          description: state.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: state.message });
        onSuccess();
        router.refresh();
      }
    }
  }, [state, toast, onSuccess, router]);

  const formAction = async (formData: FormData) => {
    const result = await saveCustomerAction(initialState, formData);
    setState(result);
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={customer?.id || ""} />

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={customer?.name ?? ""}
          placeholder="e.g., John Doe"
        />
        {state.errors?.name && (
          <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

       <div className="space-y-2">
        <Label htmlFor="email">Email Address (Optional)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={customer?.email ?? ''}
          placeholder="e.g., john.doe@example.com"
        />
        {state.errors?.email && (
          <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone Number (Required)</Label>
        <Input
          id="phone_number"
          name="phone_number"
          type="tel"
          defaultValue={customer?.phone_number ?? ""}
          placeholder="e.g., 919876543210"
        />
        {state.errors?.phone_number && (
          <p className="text-sm font-medium text-destructive">{state.errors.phone_number[0]}</p>
        )}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <SubmitButton isNew={isNew} />
      </DialogFooter>
    </form>
  );
}
