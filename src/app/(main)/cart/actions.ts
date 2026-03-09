'use server';

import { getDiscountByCode } from '@/lib/server/actions/discounts';

export async function validateDiscountCode(code: string, subtotal: number) {
  const discount = await getDiscountByCode(code);

  if (!discount) {
    return { success: false, message: 'Invalid discount code.' };
  }
  if (!discount.is_active) {
    return { success: false, message: 'This discount is no longer active.' };
  }
  const now = new Date();
  if (discount.start_date && new Date(discount.start_date) > now) {
    return { success: false, message: 'This discount is not yet active.' };
  }
  if (discount.end_date && new Date(discount.end_date) < now) {
    return { success: false, message: 'This discount has expired.' };
  }
  // Check usage limit - only count completed orders
  if (discount.usage_limit !== null && discount.usage_count >= discount.usage_limit) {
    return { success: false, message: 'This discount has reached its usage limit.' };
  }
  if (subtotal < discount.min_purchase) {
    return { success: false, message: `A minimum purchase of ₹${discount.min_purchase} is required.` };
  }

  return { success: true, message: 'Discount applied!', discount };
}
