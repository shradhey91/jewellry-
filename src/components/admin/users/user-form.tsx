
"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { saveUserAction, type UserFormState } from "@/lib/server/actions/admins";
import type { User } from "@/lib/types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : isNew ? "Create Admin" : "Save Changes"}
    </Button>
  );
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const isNew = !user;
  const initialState: UserFormState = { message: "", errors: {} };
  const [state, setState] = useState<UserFormState>(initialState);
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
    const result = await saveUserAction(initialState, formData);
    setState(result);
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={user?.id || ""} />

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={user?.name}
          placeholder="e.g., Jane Doe"
        />
        {state.errors?.name && (
          <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

       <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user?.email}
          placeholder="e.g., jane.doe@example.com"
        />
        {state.errors?.email && (
          <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role" defaultValue={user?.role ?? "moderator"}>
            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="marketer">Marketer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
        </Select>
         {state.errors?.role && (
          <p className="text-sm font-medium text-destructive">{state.errors.role[0]}</p>
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
