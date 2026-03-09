"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  saveTaxClassAction,
  type TaxClassFormState,
} from "@/app/admin/tax-classes/actions";
import type { TaxClass } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import { Switch } from "@/components/ui/switch";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaxClassFormProps {
  taxClass?: TaxClass;
  onSuccess: () => void;
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : isNew ? "Create Tax Class" : "Save Changes"}
    </Button>
  );
}

export function TaxClassForm({ taxClass, onSuccess }: TaxClassFormProps) {
  const isNew = !taxClass;
  const initialState: TaxClassFormState = { message: "", errors: {} };
  const [state, setState] = useState<TaxClassFormState>(initialState);
  const { toast } = useToast();
  const router = useRouter();

  const [isActive, setIsActive] = useState(taxClass?.is_active ?? true);
  const [rateType, setRateType] = useState<'percentage' | 'flat'>(taxClass?.rate_type ?? 'percentage');

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
    const result = await saveTaxClassAction(state, formData);
    setState(result);
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={taxClass?.id || ""} />

      <div className="space-y-2">
        <Label htmlFor="name">Tax Class Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={taxClass?.name}
          placeholder="e.g., GST 3%"
        />
        {state.errors?.name && (
          <p className="text-sm font-medium text-destructive">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rate_type">Tax Type</Label>
        <Select
          name="rate_type"
          defaultValue={rateType}
          onValueChange={(value) => setRateType(value as 'percentage' | 'flat')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select tax type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage (%)</SelectItem>
            <SelectItem value="flat">Flat Amount (₹)</SelectItem>
          </SelectContent>
        </Select>
        {state.errors?.rate_type && (
          <p className="text-sm font-medium text-destructive">
            {state.errors.rate_type[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rate_value">
          Tax Value ({rateType === 'percentage' ? '%' : '₹'})
        </Label>
        <Input
          id="rate_value"
          name="rate_value"
          type="text"
          inputMode="decimal"
          step="0.01"
          defaultValue={taxClass?.rate_value}
          placeholder={rateType === 'percentage' ? "e.g., 3" : "e.g., 500"}
        />
        {state.errors?.rate_value && (
          <p className="text-sm font-medium text-destructive">
            {state.errors.rate_value[0]}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="is_active" className="text-base">
            Active Status
          </Label>
          <p className="text-sm text-muted-foreground">
            Inactive tax classes cannot be assigned to new products.
          </p>
        </div>
        <Switch
          id="is_active"
          name="is_active"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
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
