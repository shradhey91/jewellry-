

'use server';

import { revalidatePath } from 'next/cache';
import { updateOrderStatus as apiUpdateOrderStatus } from '@/lib/server/api';
import type { Order } from '@/lib/types';
import { cookies } from 'next/headers';

export async function updateOrderStatus(
    orderId: string, 
    status: Order['status'], 
    shippingDetails?: { trackingNumber: string }
): Promise<{ success: boolean; message: string }> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return { success: false, message: "Authentication required." };
    }
    try {
        const claims = JSON.parse(sessionCookie);
        if (claims.role !== 'admin') {
            return { success: false, message: "Admin role required." };
        }
    } catch {
        return { success: false, message: "Invalid session." };
    }

    try {
        const updatedOrder = await apiUpdateOrderStatus(orderId, status, shippingDetails);
        if (!updatedOrder) {
            return { success: false, message: 'Order not found.' };
        }
        revalidatePath('/admin/orders');
        revalidatePath('/admin');
        revalidatePath(`/checkout/order-confirmation/${orderId}`);
        return { success: true, message: `Order status updated to ${status}.` };
    } catch (error) {
        console.error("Failed to update order status:", error);
         if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An error occurred while updating the order status.' };
    }
}

    