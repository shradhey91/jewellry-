'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, MapPin, Home, Building } from 'lucide-react';
import type { User as UserType, Address } from '@/lib/types';

interface ShippingFormProps {
  user: UserType | null;
}

export function ShippingForm({ user }: ShippingFormProps) {
  const { control, reset } = useFormContext();

  const handleAddressChange = (addressId: string) => {
    if (addressId === 'new-address') {
      reset({ name: '', address: '', city: '', state: '', zip: '', country: 'India', email: user?.email || '', phone_number: user?.phone_number || '' });
    } else {
      const selectedAddress = user?.addresses?.find(a => a.id === addressId);
      if (selectedAddress) {
        reset({
          email: user?.email || '',
          phone_number: user?.phone_number || '',
          name: selectedAddress.name,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          country: selectedAddress.country || 'India',
        });
      }
    }
  };

  return (
    <div className="space-y-4 md:space-y-5">
      {user && user.addresses && user.addresses.length > 0 && (
        <div className="space-y-2">
            <Label className="text-sm md:text-base font-semibold flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" />
                Saved Addresses
            </Label>
            <Select onValueChange={handleAddressChange} defaultValue={user.default_address_id || 'new-address'}>
                <SelectTrigger className="border-2 focus:border-primary transition-colors text-sm">
                    <SelectValue placeholder="Select a saved address" />
                </SelectTrigger>
                <SelectContent>
                    {user.addresses.map(address => (
                        <SelectItem key={address.id} value={address.id}>{address.name} - {address.address}, {address.city}</SelectItem>
                    ))}
                    <SelectItem value="new-address">+ Enter a new address</SelectItem>
                </SelectContent>
            </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <FormField
            control={control}
            name="email"
            render={({ field }) => (
            <FormItem>
                <Label className="font-semibold flex items-center gap-2 text-sm md:text-base">
                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                    Email
                </Label>
                <FormControl>
                <Input {...field} type="email" placeholder="you@example.com" disabled={!!user && !!user.email} className="border-2 focus:border-primary transition-colors text-sm" />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <FormField
            control={control}
            name="phone_number"
            render={({ field }) => (
            <FormItem>
                <Label className="font-semibold flex items-center gap-2 text-sm md:text-base">
                    <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                    Phone
                </Label>
                <FormControl>
                <Input {...field} type="tel" placeholder="For delivery updates" disabled={!!user && !!user.phone_number} className="border-2 focus:border-primary transition-colors text-sm" />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
      </div>

      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <Label className="font-semibold flex items-center gap-2 text-sm md:text-base">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                Full Name
            </Label>
            <FormControl>
              <Input {...field} placeholder="John Doe" className="border-2 focus:border-primary transition-colors text-sm" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <Label className="font-semibold flex items-center gap-2 text-sm md:text-base">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                Street Address
            </Label>
            <FormControl>
              <Input {...field} placeholder="123 Main St" className="border-2 focus:border-primary transition-colors text-sm" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
         <FormField
            control={control}
            name="city"
            render={({ field }) => (
            <FormItem>
                <Label className="font-semibold flex items-center gap-2 text-sm md:text-base">
                    <Building className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                    City
                </Label>
                <FormControl>
                <Input {...field} placeholder="Mumbai" className="border-2 focus:border-primary transition-colors text-sm" />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={control}
            name="state"
            render={({ field }) => (
            <FormItem>
                <Label className="font-semibold text-sm md:text-base">State</Label>
                <FormControl>
                <Input {...field} placeholder="Maharashtra" className="border-2 focus:border-primary transition-colors text-sm" />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={control}
            name="zip"
            render={({ field }) => (
            <FormItem>
                <Label className="font-semibold text-sm md:text-base">ZIP Code</Label>
                <FormControl>
                <Input {...field} placeholder="400001" className="border-2 focus:border-primary transition-colors text-sm" />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
      </div>

       <FormField
        control={control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <Label className="font-semibold text-sm md:text-base">Country</Label>
            <FormControl>
              <Input {...field} placeholder="India" className="border-2 focus:border-primary transition-colors text-sm" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
