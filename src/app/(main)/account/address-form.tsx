"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { saveAddress } from "./actions";
import type { Address } from "@/lib/types";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : isNew ? "Add Address" : "Save Changes"}
    </Button>
  );
}

export function AddressForm({
  address,
  onSuccess,
}: {
  address: Address | null;
  onSuccess: () => void;
}) {
  const [state, formAction] = useFormState(saveAddress, { message: "" });
  const { toast } = useToast();
  const isNew = !address;

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors ? "Error" : "Success",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
      if (!state.errors) {
        onSuccess();
      }
    }
  }, [state, toast, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      {address && <input type="hidden" name="id" value={address.id} />}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" defaultValue={address?.name} />
        {state.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input id="address" name="address" defaultValue={address?.address} />
        {state.errors?.address && (
          <p className="text-sm text-destructive">{state.errors.address[0]}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={address?.city} />
          {state.errors?.city && (
            <p className="text-sm text-destructive">{state.errors.city[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" defaultValue={address?.state} />
          {state.errors?.state && (
            <p className="text-sm text-destructive">{state.errors.state[0]}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input id="zip" name="zip" defaultValue={address?.zip} />
          {state.errors?.zip && (
            <p className="text-sm text-destructive">{state.errors.zip[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            defaultValue={address?.country || "India"}
          />
          {state.errors?.country && (
            <p className="text-sm text-destructive">
              {state.errors.country[0]}
            </p>
          )}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <SubmitButton isNew={isNew} />
      </DialogFooter>
    </form>
  );
}
