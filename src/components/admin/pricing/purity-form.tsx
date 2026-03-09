
"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { savePurityAction, type PurityFormState } from "@/app/admin/pricing/actions";
import type { Purity } from "@/lib/types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import { Switch } from "@/components/ui/switch";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

interface PurityFormProps {
  metalId: string;
  purity?: Purity;
  onSuccess: () => void;
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : isNew ? 'Create Purity' : 'Save Changes'}
    </Button>
  );
}

export function PurityForm({ metalId, purity, onSuccess }: PurityFormProps) {
  const isNew = !purity;
  const initialState: PurityFormState = { message: "", errors: {} };
  const [state, setState] = useState<PurityFormState>(initialState);
  const { toast } = useToast();
  const router = useRouter();

  const [isActive, setIsActive] = useState(purity?.is_active ?? true);

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
    const result = await savePurityAction(state, formData);
    setState(result);
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={purity?.id || ''} />
      <input type="hidden" name="metal_id" value={metalId} />

      <div className="space-y-2">
        <Label htmlFor="label">Purity Label</Label>
        <Input
          id="label"
          name="label"
          type="text"
          defaultValue={purity?.label}
          placeholder="e.g., 22K or 925 Sterling"
        />
        {state.errors?.label && (
          <p className="text-sm font-medium text-destructive">{state.errors.label[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fineness">Fineness (Decimal)</Label>
        <Input
          id="fineness"
          name="fineness"
          type="number"
          step="any"
          defaultValue={purity?.fineness}
          placeholder="e.g., 0.916 for 22K (91.6%)"
        />
        {state.errors?.fineness && (
          <p className="text-sm font-medium text-destructive">{state.errors.fineness[0]}</p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="is_active" className="text-base">
            Active Status
          </Label>
          <p className="text-sm text-muted-foreground">
            Inactive purities cannot be assigned to new products.
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
