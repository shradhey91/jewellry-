'use server';

import { getOrderById } from '@/lib/server/api';
import type { Order } from '@/lib/types';

export async function getOrderAction(id: string): Promise<Order | null> {
  if (!id) return null;
  const order = await getOrderById(id);
  return order ?? null;
}
