'use server';

import { verifyAdmin } from '@/lib/server/auth-admin';
import { revalidatePath } from 'next/cache';
import { updateOrderStatus as apiUpdateOrderStatus } from '@/lib/server/api';
import type { Order } from '@/lib/types';

export async function updateOrderStatus(
    orderId: string,
    status: Order['status'],
    shippingDetails?: { trackingNumber: string }
): Promise<{ success: boolean; message: string }> {
    try {
        await verifyAdmin();
    } catch {
        return { success: false, message: "Authentication required." };
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
