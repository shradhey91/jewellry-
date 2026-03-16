'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { saveProduct } from '@/lib/server/api';
import type { Product, ProductMedia, ProductVariant, DiamondDetail } from '@/lib/types';
import { getUploadedMedia } from '@/lib/server/actions/media';

const toBoolean = z.string().optional().transform(val => val?.toLowerCase() === 'true').default(false);
const semicolonStringToArray = z.string().optional().transform(val => val ? val.split(';').map(s => s.trim()).filter(Boolean) : []);
const emptyStringToNull = z.string().optional().transform(val => (val === '' || val === undefined) ? null : val);
const emptyNumberToNull = z.string().optional().transform(val => (val === '' || val === undefined) ? null : Number(val)).pipe(z.number().nullable().optional());

const BulkProductSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  is_active: toBoolean,
  
  category_ids: semicolonStringToArray,
  cross_sell_products: semicolonStringToArray,
  upsell_products: semicolonStringToArray,

  metal_id: z.string().min(1, "metal_id is required"),
  purity_id: z.string().min(1, "purity_id is required"),
  tax_class_id: z.string().min(1, "tax_class_id is required"),
  gross_weight: z.coerce.number(),
  net_weight: z.coerce.number(),
  making_charge_type: z.enum(['fixed', 'percentage']),
  making_charge_value: z.coerce.number(),
  auto_price_enabled: toBoolean,
  manual_price: emptyNumberToNull,
  
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  
  // Media files by filename
  media_1: z.string().optional().nullable(),
  media_2: z.string().optional().nullable(),
  media_3: z.string().optional().nullable(),
  media_4: z.string().optional().nullable(),
  media_5: z.string().optional().nullable(),

  // Variants (up to 3 for simplicity)
  variant_1_label: emptyStringToNull,
  variant_1_stock: emptyNumberToNull,
  variant_2_label: emptyStringToNull,
  variant_2_stock: emptyNumberToNull,
  variant_3_label: emptyStringToNull,
  variant_3_stock: emptyNumberToNull,

  has_diamonds: toBoolean,
  // Single diamond component for simplicity
  diamond_count: emptyNumberToNull,
  diamond_weight: emptyNumberToNull,
  diamond_price: emptyNumberToNull,
  diamond_type: emptyStringToNull.pipe(z.enum(['Natural', 'Lab-grown']).nullable().optional()),
  diamond_cut: emptyStringToNull,
  diamond_color: emptyStringToNull,
  diamond_clarity: emptyStringToNull,

  has_size_dimensions: toBoolean,
  height: emptyNumberToNull,
  width: emptyNumberToNull,
  length: emptyNumberToNull,
  has_ring_size: toBoolean,
});

export interface BulkUploadState {
  message: string;
  success: boolean;
  results?: {
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  };
}

function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    // Regex to split by comma but ignore commas inside quotes
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    
    const rowObject: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      const rawValue = values[j]?.trim() ?? '';
      // Remove quotes if present and un-escape double quotes
      if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
        rowObject[headers[j]] = rawValue.substring(1, rawValue.length - 1).replace(/""/g, '"');
      } else {
        rowObject[headers[j]] = rawValue;
      }
    }
    rows.push(rowObject);
  }
  return rows;
}


export async function bulkUploadProductsAction(
  prevState: BulkUploadState,
  formData: FormData
): Promise<BulkUploadState> {
  const dataFile = formData.get('dataFile') as File | null;

  if (!dataFile) {
    return { success: false, message: 'Product data file is required.' };
  }
  
  if (!dataFile.name.endsWith('.csv')) {
      return { success: false, message: 'Data file must be a .csv file.' };
  }

  const allMediaFiles = await getUploadedMedia();
  const mediaUrlMap = new Map<string, string>();
  allMediaFiles.forEach(file => {
      mediaUrlMap.set(file.name, file.url);
  });

  let productsToCreate: Record<string, any>[];
  try {
    const fileContent = await dataFile.text();
    productsToCreate = parseCsv(fileContent);
  } catch (error) {
    return { success: false, message: 'Invalid or malformed CSV file.' };
  }

  let successful = 0;
  const errors: string[] = [];

  for (const productData of productsToCreate) {
    try {
        const validatedData = BulkProductSchema.parse(productData);

        const mediaFilenames = [
            validatedData.media_1, 
            validatedData.media_2, 
            validatedData.media_3, 
            validatedData.media_4, 
            validatedData.media_5
        ].filter(Boolean) as string[];

        const media: ProductMedia[] = mediaFilenames
            .map((filename, index) => {
                const url = mediaUrlMap.get(filename);
                if (!url) {
                    console.warn(`Media file "${filename}" not found in library for product "${validatedData.name}".`);
                    return null;
                }
                return {
                    id: `media-${Date.now()}-${index}`,
                    product_id: '', // Will be set when product is created
                    url: url,
                    hint: filename,
                    sort_order: index,
                    is_primary: index === 0,
                    media_type: url.endsWith('.mp4') || url.endsWith('.webm') ? 'video' : 'image',
                } as ProductMedia;
            })
            .filter((m): m is ProductMedia => m !== null);

        const variants: Omit<ProductVariant, 'product_id' | 'id'>[] = [];
        for (let i = 1; i <= 3; i++) {
            const label = (validatedData as any)[`variant_${i}_label`];
            const stock = (validatedData as any)[`variant_${i}_stock`];
            if (label && stock !== null && stock !== undefined) {
                variants.push({
                    label,
                    stock_quantity: Number(stock),
                    is_preorder: false, // Defaulting for simplicity
                    is_made_to_order: false,
                    lead_time_days: null,
                });
            }
        }
        
        const diamond_details: DiamondDetail[] = [];
        if (validatedData.has_diamonds && validatedData.diamond_count) {
            diamond_details.push({
                count: validatedData.diamond_count,
                weight: validatedData.diamond_weight,
                price: validatedData.diamond_price,
                diamond_type: validatedData.diamond_type,
                cut: validatedData.diamond_cut,
                color: validatedData.diamond_color,
                clarity: validatedData.diamond_clarity,
                purity: null,
                size: null,
                rate_per_carat: null,
                setting_charges: null,
                certification_cost: null,
                brand_margin: null,
            });
        }

        const newProductData = {
            id: validatedData.id || 'new',
            name: validatedData.name,
            description: validatedData.description,
            is_active: validatedData.is_active,
            category_ids: validatedData.category_ids,
            cross_sell_products: validatedData.cross_sell_products || [],
            upsell_products: validatedData.upsell_products || [],
            metal_id: validatedData.metal_id,
            purity_id: validatedData.purity_id,
            tax_class_id: validatedData.tax_class_id,
            gross_weight: validatedData.gross_weight,
            net_weight: validatedData.net_weight,
            making_charge_type: validatedData.making_charge_type,
            making_charge_value: validatedData.making_charge_value,
            auto_price_enabled: validatedData.auto_price_enabled,
            manual_price: validatedData.manual_price ?? null,
            variants,
            media,
            seo_title: validatedData.seo_title,
            seo_description: validatedData.seo_description,
            has_diamonds: validatedData.has_diamonds,
            diamond_details,
            has_size_dimensions: validatedData.has_size_dimensions,
            height: validatedData.height ?? null,
            width: validatedData.width ?? null,
            length: validatedData.length ?? null,
            has_ring_size: validatedData.has_ring_size,
        };
        
        await saveProduct(newProductData as any);
        
        successful++;
    } catch (e: any) {
        const name = productData.name || 'Unnamed Product';
        if (e instanceof z.ZodError) {
             errors.push(`Failed to validate product "${name}": ${e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')}`);
        } else {
             errors.push(`Failed to create product "${name}": ${e.message}`);
        }
    }
  }

  revalidatePath('/admin/products');

  return {
    success: true,
    message: `Bulk upload completed. See results below.`,
    results: {
      total: productsToCreate.length,
      successful,
      failed: errors.length,
      errors,
    },
  };
}