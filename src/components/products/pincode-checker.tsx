
'use client';

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { checkDeliveryAvailability } from "@/app/(main)/products/actions";
import { Loader2, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gift, Truck } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="ghost" className="text-primary hover:text-primary" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
        </Button>
    )
}

export function PincodeChecker() {
    const { toast } = useToast();
    const [pincode, setPincode] = useState("");

    const handleCheck = async (formData: FormData) => {
        const code = formData.get('pincode') as string;
        const result = await checkDeliveryAvailability(code);
        toast({
            title: result.available ? "Delivery Available" : "Delivery Unavailable",
            description: result.message,
            variant: result.available ? "default" : "destructive",
        });
    }

    return (
        <div className="space-y-3">
            <form action={handleCheck} className="flex items-center gap-2 rounded-md border p-1 bg-background">
                <Select defaultValue="IN">
                    <SelectTrigger className="w-[80px] border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="IN">IN</SelectItem>
                    </SelectContent>
                </Select>
                <div className="relative flex-grow flex items-center border-l">
                    <MapPin className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                        name="pincode"
                        placeholder="Enter Pincode" 
                        className="bg-transparent border-0 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0" 
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        maxLength={6}
                    />
                </div>
                <SubmitButton />
            </form>
             <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground px-2">
                <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4"/>
                    <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4"/>
                    <span>Gifting Available</span>
                </div>
            </div>
        </div>
    );
}
