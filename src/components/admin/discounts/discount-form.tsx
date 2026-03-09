"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { saveDiscountAction, type DiscountFormState } from "@/app/admin/discounts/actions";
import type { Discount } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import { Switch } from "@/components/ui/switch";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

interface DiscountFormProps {
  discount?: Discount;
  onSuccess: () => void;
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : isNew ? "Create Discount" : "Save Changes"}
    </Button>
  );
}

export function DiscountForm({ discount, onSuccess }: DiscountFormProps) {
  const isNew = !discount;
  const initialState: DiscountFormState = { message: "", errors: {} };
  const [state, setState] = useState<DiscountFormState>(initialState);
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [isActive, setIsActive] = useState(discount?.is_active ?? true);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed_amount">(discount?.type ?? 'percentage');
  const [startDate, setStartDate] = useState<Date | undefined>(discount?.start_date ? new Date(discount.start_date) : new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(discount?.end_date ? new Date(discount.end_date) : undefined);
  
  // Calendar open state
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);

  // Reset form state when discount changes
  useEffect(() => {
    if (discount) {
      setIsActive(discount.is_active ?? true);
      setDiscountType(discount.type ?? 'percentage');
      setStartDate(discount.start_date ? new Date(discount.start_date) : new Date());
      setEndDate(discount.end_date ? new Date(discount.end_date) : undefined);
    }
  }, [discount]);

  useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({ title: "Validation Error", description: state.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: state.message });
        onSuccess();
        router.refresh();
      }
    }
  }, [state, toast, onSuccess, router]);

  const formAction = useCallback(async (formData: FormData) => {
    formData.set('type', discountType);
    formData.set('is_active', isActive ? 'on' : 'off');
    if(startDate) formData.set('start_date', startDate.toISOString());
    if(endDate) formData.set('end_date', endDate.toISOString());
    const result = await saveDiscountAction(initialState, formData);
    setState(result);
  }, [discountType, isActive, startDate, endDate]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={discount?.id || ""} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Discount Code</Label>
            <Input 
              id="code" 
              name="code" 
              defaultValue={discount?.code} 
              placeholder="e.g., SUMMER20" 
              className="uppercase"
              autoComplete="off"
            />
            {state.errors?.code && <p className="text-sm font-medium text-destructive">{state.errors.code[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Discount Type</Label>
            <RadioGroup 
              value={discountType} 
              onValueChange={(v) => setDiscountType(v as "percentage" | "fixed_amount")} 
              className="flex items-center space-x-4 pt-2"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="type-percentage" />
                    <Label htmlFor="type-percentage" className="cursor-pointer">Percentage (%)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed_amount" id="type-fixed" />
                    <Label htmlFor="type-fixed" className="cursor-pointer">Fixed Amount (₹)</Label>
                </div>
            </RadioGroup>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="value">Discount Value</Label>
            <Input 
              id="value" 
              name="value" 
              type="text" 
              inputMode="numeric"
              defaultValue={discount?.value} 
              placeholder={discountType === 'percentage' ? "e.g., 20 for 20%" : "e.g., 500 for ₹500"} 
            />
            {state.errors?.value && <p className="text-sm font-medium text-destructive">{state.errors.value[0]}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="min_purchase">Minimum Purchase (₹)</Label>
            <Input 
              id="min_purchase" 
              name="min_purchase" 
              type="text" 
              inputMode="numeric"
              defaultValue={discount?.min_purchase} 
              placeholder="0 for no minimum" 
            />
            {state.errors?.min_purchase && <p className="text-sm font-medium text-destructive">{state.errors.min_purchase[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd MMM yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar 
                  mode="single" 
                  selected={startDate} 
                  onSelect={(date) => {
                    setStartDate(date);
                    setIsStartCalendarOpen(false);
                  }} 
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">When the discount becomes active</p>
        </div>
        <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <div className="flex gap-2">
              <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen} className="flex-1">
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMM yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={endDate} 
                    onSelect={(date) => {
                      setEndDate(date);
                      setIsEndCalendarOpen(false);
                    }} 
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {endDate && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 shrink-0"
                  onClick={() => setEndDate(undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Leave empty for no expiry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="usage_limit">Usage Limit (Optional)</Label>
            <Input 
              id="usage_limit" 
              name="usage_limit" 
              type="text" 
              inputMode="numeric"
              defaultValue={discount?.usage_limit ?? ''} 
              placeholder="Leave blank for unlimited" 
            />
            {state.errors?.usage_limit && <p className="text-sm font-medium text-destructive">{state.errors.usage_limit[0]}</p>}
            <p className="text-xs text-muted-foreground">Total times this coupon can be used</p>
        </div>
        <div className="flex items-end pb-2">
            <div className="flex items-center space-x-2">
                <Switch 
                  id="is_active" 
                  name="is_active" 
                  checked={isActive} 
                  onCheckedChange={setIsActive} 
                />
                <Label htmlFor="is_active" className="cursor-pointer font-medium">
                  {isActive ? 'Active' : 'Inactive'}
                </Label>
            </div>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button">Cancel</Button>
        </DialogClose>
        <SubmitButton isNew={isNew} />
      </DialogFooter>
    </form>
  );
}
