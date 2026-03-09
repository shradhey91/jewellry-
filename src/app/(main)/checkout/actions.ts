

'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createOrder } from '@/lib/server/api';
import type { CartItem } from '@/lib/types';
import { cookies } from 'next/headers';
import { findOrCreateGuestUser } from '@/lib/server/auth';

const placeOrderSchema = z.object({
  cartItems: z.string(),
  shippingAddress: z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(5, 'Valid ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  email: z.string().email({ message: "Please enter a valid email."}),
  phone_number: z.string().regex(/^\d{10,15}$/, 'A valid phone number is required.'),
  discountCode: z.string().optional(),
  discountAmount: z.coerce.number().optional(),
});

export type PlaceOrderFormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
  orderId?: string;
};

export async function placeOrderAction(
  prevState: PlaceOrderFormState,
  formData: FormData
): Promise<PlaceOrderFormState> {
  
  const cartItems = JSON.parse(formData.get('cartItems') as string) as CartItem[];
  const shippingAddress = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('zip') as string,
      country: formData.get('country') as string,
  };
  const email = formData.get('email') as string;
  const phone_number = formData.get('phone_number') as string;

  const discountCode = formData.get('discountCode') as string | undefined;
  const discountAmount = formData.get('discountAmount') ? Number(formData.get('discountAmount')) : undefined;

  const validatedFields = placeOrderSchema.safeParse({
    cartItems: formData.get('cartItems'),
    shippingAddress,
    email,
    phone_number,
    discountCode,
    discountAmount
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Invalid order data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  if (cartItems.length === 0) {
      return { message: "Your cart is empty.", errors: { cart: ['Cannot place an empty order.']}};
  }

  let userId: string;
  const sessionCookie = cookies().get('session')?.value;
  const session = sessionCookie ? JSON.parse(sessionCookie) : null;
  
  if (session?.id) {
    userId = session.id;
  } else {
    // Guest checkout: find or create a user profile
    const guestUser = await findOrCreateGuestUser(validatedFields.data.email, validatedFields.data.shippingAddress.name, validatedFields.data.phone_number);
    userId = guestUser.id;
  }
  
  const discount = discountCode && discountAmount !== undefined ? { code: discountCode, amount: discountAmount } : undefined;

  try {
    const orderId = await createOrder(cartItems, shippingAddress, userId, discount);
    return { message: 'Order placed successfully!', orderId: orderId };
  } catch (error) {
    return { message: 'Failed to place order. Please try again.' };
  }
}
