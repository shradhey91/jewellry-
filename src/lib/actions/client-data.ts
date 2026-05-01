'use server';

import { getGiftMessages, getProductsByIds, getMetals, getPurities } from '@/lib/server/api';
import type { Product, Metal, Purity } from '@/lib/types';

export async function getGiftMessagesAction(): Promise<{ category: string; messages: string[] }[]> {
  return getGiftMessages();
}

export async function getProductsByIdsAction(ids: string[]): Promise<Product[]> {
  return getProductsByIds(ids);
}

export async function getMetalsAction(): Promise<Metal[]> {
  return getMetals();
}

export async function getPuritiesAction(): Promise<Purity[]> {
  return getPurities();
}

import { getProducts, updateProductMedia } from '@/lib/server/api';
import type { ProductMedia } from '@/lib/types';

export async function getProductsAction() {
  return getProducts();
}

export async function updateProductMediaAction(productId: string, media: ProductMedia[]): Promise<{ success: boolean }> {
  return updateProductMedia(productId, media);
}
