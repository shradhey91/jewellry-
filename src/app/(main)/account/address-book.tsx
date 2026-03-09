
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Home, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddressForm } from './address-form';
import type { Address, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { deleteAddress, setDefaultAddress } from './actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface AddressBookProps {
    user: User;
}

export function AddressBook({ user }: AddressBookProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const { toast } = useToast();

    const handleEdit = (address: Address) => {
        setSelectedAddress(address);
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedAddress(null);
        setDialogOpen(true);
    };

    const handleDelete = async (addressId: string) => {
        const result = await deleteAddress(addressId);
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
        // Don't refresh - just update locally
        if (result.success) {
            // Address will be removed on next page visit
        }
    }

    const handleSetDefault = async (addressId: string) => {
        const result = await setDefaultAddress(addressId);
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
        // Don't refresh - just update locally
    };
    
    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Your Addresses</CardTitle>
                        <CardDescription>Manage your saved shipping addresses.</CardDescription>
                    </div>
                     <Button onClick={handleAdd}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
                    </Button>
                </CardHeader>
                <CardContent>
                    {user.addresses && user.addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.addresses.map(address => (
                                <Card key={address.id} className="p-4 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <address className="not-italic text-sm text-muted-foreground">
                                            <div className="font-semibold text-foreground flex items-center gap-2 mb-1">
                                                {address.name}
                                                {user.default_address_id === address.id && (
                                                    <Badge variant="secondary">
                                                        <Star className="mr-1 h-3 w-3"/>
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                            {address.address}<br />
                                            {address.city}, {address.state} {address.zip}<br />
                                            {address.country}
                                        </address>
                                        <div className="flex flex-col gap-1 -mr-2 -mt-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(address)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete this address.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(address.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                    {user.default_address_id !== address.id && (
                                        <div className="mt-4 pt-4 border-t">
                                            <Button variant="outline" size="sm" onClick={() => handleSetDefault(address.id)}>Set as Default</Button>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border rounded-lg">
                            <Home className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Addresses Saved</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Add a new address to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                    </DialogHeader>
                    <AddressForm 
                        address={selectedAddress}
                        onSuccess={() => {
                            setDialogOpen(false);
                            onAddressChange();
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
