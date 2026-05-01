

'use server';

import { verifyAdmin, getSessionPayload } from '@/lib/server/auth-admin';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { saveProduct, updateProductMedia, searchProductsByName as searchProductsApi, saveProductReview, updateProductReview, deleteProductReview, getProductById } from '@/lib/server/api';
import type { ProductMedia, DiamondDetail, Product, ProductReview, ProductVariant, FeatureTab, GalleryImage } from '@/lib/types';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { db } from '../db';


async function verifyCustomer() {
  const payload = await getSessionPayload();
  if (!payload) throw new Error("You must be logged in to leave a review.");
  return payload;
}

const diamondDetailSchema = z.object({
  id: z.string().optional(),
  purity: z.enum(['14K', '18K']).nullable(),
  count: z.preprocess(val => val || null, z.coerce.number().nullable()),
  weight: z.preprocess(val => val || null, z.coerce.number().nullable()),
  size: z.preprocess(val => val || null, z.coerce.number().nullable()),
  price: z.preprocess(val => val || null, z.coerce.number().nullable()),
  diamond_type: z.enum(['Natural', 'Lab-grown']).nullable(),
  cut: z.string().nullable(),
  color: z.string().nullable(),
  clarity: z.string().nullable(),
  rate_per_carat: z.preprocess(val => val || null, z.coerce.number().nullable()),
  setting_charges: z.preprocess(val => val || null, z.coerce.number().nullable()),
  certification_cost: z.preprocess(val => val || null, z.coerce.number().nullable()),
  brand_margin: z.preprocess(val => val || null, z.coerce.number().nullable()),
});

const mediaSchema = z.object({
  id: z.string(),
  url: z.string(), // Removed .url() validation to allow relative paths
  hint: z.string(),
  is_primary: z.boolean(),
  sort_order: z.number(),
  media_type: z.enum(['image', 'video']),
});

const variantSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  label: z.string(), // Allow empty label for newly added variants
  stock_quantity: z.coerce.number().min(0),
  gross_weight: z.coerce.number().nullable().optional(),
  net_weight: z.coerce.number().nullable().optional(),
  price_breakup: z.any().optional(),
  display_price: z.any().optional(),
  is_preorder: z.boolean(),
  is_made_to_order: z.boolean(),
  lead_time_days: z.coerce.number().nullable(),
});

const featureTabSchema = z.object({
    tabTitle: z.string(),
    contentTitle: z.string(),
    points: z.array(z.string()),
    imageUrl: z.string(), // Removed .url() validation
    imageHint: z.string(),
});

const galleryImageSchema = z.object({
    id: z.string(),
    url: z.string(), // Removed .url() validation
    hint: z.string(),
});

const productSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional().nullable(),
  category_ids: z.array(z.string()).min(1, 'At least one category is required.'),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  gross_weight: z.coerce.number().positive('Gross weight must be positive'),
  net_weight: z.coerce.number().positive('Net weight must be positive'),
  metal_id: z.string().min(1, 'Metal is required.'),
  purity_id: z.string().min(1, 'Purity is required.'),
  tax_class_id: z.string().min(1, 'Tax class is required.'),
  making_charge_type: z.enum(['fixed', 'percentage']),
  making_charge_value: z.coerce.number().min(0, 'Making charge cannot be negative'),
  auto_price_enabled: z.boolean(),
  manual_price: z.preprocess(
    val => (val === "" || val === null || val === undefined) ? null : Number(val),
    z.coerce.number().optional().nullable()
  ),
  is_active: z.boolean(),
  has_diamonds: z.boolean(),
  diamond_details: z.array(diamondDetailSchema),
  cross_sell_products: z.array(z.string()),
  upsell_products: z.array(z.string()),
  media: z.array(mediaSchema),
  has_size_dimensions: z.boolean(),
  height: z.preprocess(val => val || null, z.coerce.number().nullable()),
  width: z.preprocess(val => val || null, z.coerce.number().nullable()),
  length: z.preprocess(val => val || null, z.coerce.number().nullable()),
  has_ring_size: z.boolean(),
  showGalleryGrid: z.boolean().optional(),
  variants: z.array(variantSchema),
  featureTabs: z.array(featureTabSchema),
  galleryImages: z.array(galleryImageSchema),
}).refine(data => data.gross_weight >= data.net_weight, {
    message: "Gross weight cannot be less than net weight",
    path: ["gross_weight"],
});

export type ProductFormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
  product_id?: string;
};

export async function saveOrUpdateProduct(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await verifyAdmin();
  const diamondDetailsRaw = formData.get('diamond_details') as string | null;
  const diamond_details = diamondDetailsRaw ? JSON.parse(diamondDetailsRaw) : [];

  const crossSellProductsRaw = formData.get('cross_sell_products') as string | null;
  const cross_sell_products = crossSellProductsRaw ? JSON.parse(crossSellProductsRaw) : [];

  const upsellProductsRaw = formData.get('upsell_products') as string | null;
  const upsell_products = upsellProductsRaw ? JSON.parse(upsellProductsRaw) : [];

  const mediaRaw = formData.get('media') as string | null;
  const media = mediaRaw ? JSON.parse(mediaRaw) : [];

  const variantsRaw = formData.get('variants') as string | null;
  const variants = variantsRaw ? JSON.parse(variantsRaw) : [];

  const categoryIdsRaw = formData.get('category_ids') as string | null;
  const category_ids = categoryIdsRaw ? JSON.parse(categoryIdsRaw) : [];
  
  const featureTabsRaw = formData.get('featureTabs') as string | null;
  const featureTabs = featureTabsRaw ? JSON.parse(featureTabsRaw) : [];

  const galleryImagesRaw = formData.get('galleryImages') as string | null;
  const galleryImages = galleryImagesRaw ? JSON.parse(galleryImagesRaw) : [];


  const validatedFields = productSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    description: formData.get('description'),
    category_ids: category_ids,
    seo_title: formData.get('seo_title'),
    seo_description: formData.get('seo_description'),
    gross_weight: formData.get('gross_weight'),
    net_weight: formData.get('net_weight'),
    metal_id: formData.get('metal_id'),
    purity_id: formData.get('purity_id'),
    tax_class_id: formData.get('tax_class_id'),
    making_charge_type: formData.get('making_charge_type'),
    making_charge_value: formData.get('making_charge_value'),
    auto_price_enabled: formData.get('auto_price_enabled') === 'on',
    manual_price: formData.get('manual_price'),
    is_active: formData.get('is_active') === 'on',
    has_diamonds: formData.get('has_diamonds') === 'on',
    diamond_details: diamond_details,
    cross_sell_products: cross_sell_products,
    upsell_products: upsell_products,
    media: media,
    has_size_dimensions: formData.get('has_size_dimensions') === 'on',
    height: formData.get('height'),
    width: formData.get('width'),
    length: formData.get('length'),
    has_ring_size: formData.get('has_ring_size') === 'on',
    showGalleryGrid: formData.get('showGalleryGrid') === 'on',
    variants: variants,
    featureTabs: featureTabs,
    galleryImages: galleryImages,
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Failed to save product. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const isNew = validatedFields.data.id === 'new';

  try {
    const savedProduct = await saveProduct(validatedFields.data);

    revalidatePath('/admin/products');
    revalidatePath('/products', 'layout');
    revalidatePath('/admin/history');

    if (isNew) {
      // This is a special case to handle redirection after creation.
      // The form will see this ID and know to redirect.
      return { message: 'Product created successfully!', product_id: savedProduct.id };
    }

    revalidatePath(`/admin/products/${savedProduct.id}`);
  } catch (error) {
     return { message: 'Database error. Could not save product.' };
  }


  return { message: 'Product updated successfully!' };
}


const imageUpdateSchema = z.object({
  productId: z.string(),
  media: z.array(mediaSchema)
});

export type ImageFormState = {
    message: string;
    errors?: {
        [key: string]: string[] | undefined;
    };
}

export async function updateProductImages(
  prevState: ImageFormState,
  formData: FormData
): Promise<ImageFormState> {
  await verifyAdmin();
  const productId = formData.get('productId') as string;
  const mediaData = JSON.parse(formData.get('media') as string);

  const validatedFields = imageUpdateSchema.safeParse({ productId, media: mediaData });

  if (!validatedFields.success) {
      return {
          message: 'Invalid data provided.',
          errors: validatedFields.error.flatten().fieldErrors,
      };
  }

  try {
      await updateProductMedia(validatedFields.data.productId, validatedFields.data.media);
      revalidatePath(`/admin/products/${productId}`);
      revalidatePath(`/products/${productId}`);
      revalidatePath('/admin/history');
      return { message: 'Images updated successfully!' };
  } catch (error) {
      return { message: 'Database error: Could not update images.' };
  }
}

export async function searchProductsByName(query: string): Promise<Product[]> {
    if (!query) return [];
    const products = await searchProductsApi(query);
    return products;
}

const reviewSchema = z.object({
    id: z.string().optional(),
    product_id: z.string(),
    reviewer_name: z.string().min(1, "Reviewer name is required."),
    rating: z.coerce.number().min(1).max(5),
    text: z.string().min(10, "Review must be at least 10 characters."),
    status: z.enum(['pending', 'approved', 'rejected']),
});

export type ReviewFormState = {
    message: string;
    errors?: { [key: string]: string[] | undefined; };
};

export async function addProductReviewAction(prevState: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
    await verifyAdmin();
    const validatedFields = reviewSchema.safeParse({
        product_id: formData.get('product_id'),
        reviewer_name: formData.get('reviewer_name'),
        rating: formData.get('rating'),
        text: formData.get('text'),
        status: 'approved', // Admin reviews are auto-approved
    });

    if (!validatedFields.success) {
        return {
            message: "Failed to add review.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await saveProductReview(validatedFields.data);
        revalidatePath(`/products/${validatedFields.data.product_id}`);
        revalidatePath(`/admin/products/${validatedFields.data.product_id}`);
        return { message: "Review added successfully!" };
    } catch (error) {
        return { message: "Database error: Could not save review." };
    }
}

export async function submitCustomerReviewAction(prevState: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
    try {
        await verifyCustomer();
    } catch (e: any) {
        return { message: e.message, errors: { form: [e.message] } };
    }

    const validatedFields = reviewSchema.safeParse({
        product_id: formData.get('product_id'),
        reviewer_name: formData.get('reviewer_name'),
        rating: formData.get('rating'),
        text: formData.get('text'),
        status: 'pending', // Customer reviews are pending approval
    });

    if (!validatedFields.success) {
        return {
            message: "Failed to submit review.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await saveProductReview(validatedFields.data);
        revalidatePath(`/products/${validatedFields.data.product_id}`);
        return { message: "Review submitted for approval. Thank you!" };
    } catch (error) {
        return { message: "Database error: Could not save review." };
    }
}

export async function updateProductReviewAction(prevState: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
    await verifyAdmin();
    const validatedFields = reviewSchema.safeParse({
        id: formData.get('id'),
        product_id: formData.get('product_id'),
        reviewer_name: formData.get('reviewer_name'),
        rating: formData.get('rating'),
        text: formData.get('text'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            message: "Failed to update review.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await updateProductReview(validatedFields.data as ProductReview);
        revalidatePath(`/products/${validatedFields.data.product_id}`);
        revalidatePath(`/admin/products/${validatedFields.data.product_id}`);
        return { message: "Review updated successfully!" };
    } catch (error) {
        return { message: "Database error: Could not update review." };
    }
}

export async function updateProductReviewStatus(reviewId: string, productId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean, message: string }> {
    await verifyAdmin();
    try {
        const review = db.reviews.find(r => r.id === reviewId);
        if (!review) {
            return { success: false, message: "Review not found." };
        }
        review.status = status;
        await updateProductReview(review);
        revalidatePath(`/products/${productId}`);
        revalidatePath(`/admin/products/${productId}`);
        return { success: true, message: `Review status updated to ${status}.` };
    } catch(e) {
        console.error("Failed to update review status:", e);
        return { success: false, message: "Failed to update review status." };
    }
}

export async function deleteProductReviewAction(reviewId: string, productId: string): Promise<{ success: boolean, message: string }> {
    await verifyAdmin();
    try {
        await deleteProductReview(reviewId);
        revalidatePath(`/products/${productId}`);
        revalidatePath(`/admin/products/${productId}`);
        return { success: true, message: "Review deleted successfully." };
    } catch (error) {
        return { success: false, message: "Database error: Could not delete review." };
    }
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
    try {
        await verifyAdmin();
    } catch(e: any) {
        return { success: false, message: e.message };
    }

    try {
        await db.initialize();
        const productToDelete = db.products.find(p => p.id === productId);
        if (!productToDelete) {
            return { success: false, message: 'Product not found.' };
        }
        
        db.products = db.products.filter(p => p.id !== productId);
        await db.saveProducts();
        await db.logChange('Product', productToDelete.id, productToDelete.name, 'Deleted');
        
        revalidatePath('/admin/products');
        revalidatePath('/products', 'layout');
        revalidatePath('/admin/history');

        return { success: true, message: 'Product deleted successfully.' };
    } catch (error) {
        console.error("Failed to delete product:", error);
        return { success: false, message: 'An error occurred while deleting the product.' };
    }
}

    