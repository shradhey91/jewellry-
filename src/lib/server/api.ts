

'use server';

// This file contains server-only data-fetching and mutation logic.
// It is NOT meant to be imported into client components.

import { promises as fs } from 'fs';
import path from 'path';
import type { Product, Metal, Purity, TaxClass, Category, ProductVariant, ProductMedia, DiamondDetail, Menu, MenuItem, ChangeHistory, Customer, User, ProductReview, Order, ShippingAddress, CartItem, SocialProofSettings, BlogPost, Address, SalesData, Role } from '@/lib/types';
import { db } from './db';
import { sendOrderConfirmationEmail } from '../email';

// --- CORE LOGIC (Simulating Backend Services) ---

const calculateProductPrice = (
  product: Omit<Product, 'price_breakup' | 'display_price' | 'availability'>
): Product['price_breakup'] => {
  const metal = db.metals.find(m => m.id === product.metal_id);
  const purity = db.purities.find(p => p.id === product.purity_id);
  const tax = db.taxClasses.find(t => t.id === product.tax_class_id);

  if (!metal || !purity || !tax) {
    return { metal_value: 0, making_charge: 0, diamond_value: 0, gst: 0, total: 0 };
  }

  const net_weight = product.net_weight ?? 0;
  const pricePerGramForPurity = metal.price_per_gram * purity.fineness;
  const metal_value = pricePerGramForPurity * net_weight;
  
  let making_charge: number;
  if (product.making_charge_type === 'fixed') {
    making_charge = product.making_charge_value;
  } else {
    making_charge = metal_value * (product.making_charge_value / 100);
  }
  
  const diamond_value = product.has_diamonds 
    ? product.diamond_details.reduce((acc, detail) => acc + (detail.price || 0), 0)
    : 0;

  const subtotal = metal_value + making_charge + diamond_value;
  const gstRate = tax.rate_type === 'percentage' ? tax.rate_value / 100 : tax.rate_value;
  const gst = tax.rate_type === 'percentage' ? subtotal * gstRate : gstRate;
  const total = subtotal + gst;

  return {
    metal_value: parseFloat(metal_value.toFixed(2)),
    making_charge: parseFloat(making_charge.toFixed(2)),
    diamond_value: parseFloat(diamond_value.toFixed(2)),
    gst: Math.round(gst),
    total: Math.round(total),
  };
};

const calculateVariantPrice = (
  product: Omit<Product, 'price_breakup' | 'display_price' | 'availability'>,
  variant: ProductVariant
): Product['price_breakup'] => {
  const metal = db.metals.find(m => m.id === product.metal_id);
  const purity = db.purities.find(p => p.id === product.purity_id);
  const tax = db.taxClasses.find(t => t.id === product.tax_class_id);

  if (!metal || !purity || !tax) {
    return { metal_value: 0, making_charge: 0, diamond_value: 0, gst: 0, total: 0 };
  }
  
  const net_weight = variant.net_weight ?? product.net_weight ?? 0;

  const pricePerGramForPurity = metal.price_per_gram * purity.fineness;
  const metal_value = pricePerGramForPurity * net_weight;
  
  let making_charge: number;
  if (product.making_charge_type === 'fixed') {
    making_charge = product.making_charge_value;
  } else {
    making_charge = metal_value * (product.making_charge_value / 100);
  }
  
  const diamond_value = product.has_diamonds 
    ? product.diamond_details.reduce((acc, detail) => acc + (detail.price || 0), 0)
    : 0;

  const subtotal = metal_value + making_charge + diamond_value;
  const gstRate = tax.rate_type === 'percentage' ? tax.rate_value / 100 : tax.rate_value;
  const gst = tax.rate_type === 'percentage' ? subtotal * gstRate : gstRate;
  const total = subtotal + gst;

  return {
    metal_value: parseFloat(metal_value.toFixed(2)),
    making_charge: parseFloat(making_charge.toFixed(2)),
    diamond_value: parseFloat(diamond_value.toFixed(2)),
    gst: Math.round(gst),
    total: Math.round(total),
  };
};

const resolveAvailability = (variant: ProductVariant): Product['availability'] => {
    if (variant.stock_quantity > 0) return 'IN_STOCK';
    if (variant.is_preorder) return 'PRE_ORDER';
    if (variant.is_made_to_order) return 'MADE_TO_ORDER';
    return 'OUT_OF_STOCK';
}

const processProduct = (product: Omit<Product, 'price_breakup' | 'display_price' | 'availability'>): Product => {
    const processedVariants = (product.variants || []).map(variant => {
        const price_breakup = calculateVariantPrice(product, variant);
        const display_price = product.auto_price_enabled === false && product.manual_price !== null 
            ? product.manual_price 
            : price_breakup.total;
        return {
            ...variant,
            price_breakup,
            display_price,
        };
    });

    const defaultVariant = processedVariants.find(v => v.stock_quantity > 0) || processedVariants[0] || null;
    
    const price_breakup = defaultVariant?.price_breakup || calculateProductPrice(product);
    const display_price = defaultVariant?.display_price ?? (product.auto_price_enabled === false && product.manual_price !== null 
        ? product.manual_price 
        : price_breakup.total);
    
    const availability = product.variants.length > 0 ? resolveAvailability(product.variants[0]) : 'OUT_OF_STOCK';

    return {
        ...product,
        variants: processedVariants,
        price_breakup,
        display_price,
        availability,
    }
}

// --- MOCK API ENDPOINTS ---

const SIMULATED_DELAY = 100;

export async function getProducts(): Promise<Product[]> {
  await db.initialize();
  const processedProducts = db.products.map(processProduct);
  return processedProducts;
};

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    await db.initialize();
    const foundProducts = db.products.filter(p => ids.includes(p.id));
    return foundProducts.map(processProduct);
};

export async function searchProductsByName(query: string): Promise<Product[]> {
    await db.initialize();
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();
    const filtered = db.products.filter(p => p.name.toLowerCase().includes(lowerCaseQuery));
    return filtered.map(processProduct);
};

export async function getProductById(id: string): Promise<Product | undefined> {
    await db.initialize();
    const product = db.products.find(p => p.id === id);
    return product ? processProduct(product) : undefined;
};

export async function saveProduct(productData: Omit<Product, 'price_breakup' | 'display_price' | 'availability' | 'created_at' | 'updated_at' | 'certificates' >): Promise<Product> {
    await db.initialize();
    if (productData.id && productData.id !== 'new') {
        const index = db.products.findIndex(p => p.id === productData.id);
        if (index !== -1) {
            const updatedProductData = {
                ...db.products[index],
                ...productData,
                updated_at: new Date().toISOString()
            };
            db.products[index] = updatedProductData;
            await db.saveProducts();
            await db.logChange('Product', updatedProductData.id, updatedProductData.name, 'Updated');
            return processProduct(updatedProductData);
        } else {
            throw new Error("Product not found for update");
        }
    } else {
        const newId = `prod-${Date.now()}`;
        
        const finalVariants = (productData.variants || []).map(v => ({ ...v, product_id: newId }));
        const finalMedia = (productData.media || []).map(m => ({ ...m, product_id: newId }));

        const newProduct: Omit<Product, 'price_breakup' | 'display_price' | 'availability'> = {
            ...productData,
            id: newId,
            variants: finalVariants,
            media: finalMedia,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            certificates: [],
        };
        db.products.push(newProduct);
        await db.saveProducts();
        await db.logChange('Product', newProduct.id, newProduct.name, 'Created');
        return processProduct(newProduct);
    }
};

export async function getMetals(): Promise<Metal[]> {
    await db.initialize();
    return db.metals;
}

export async function getMetalById(id: string): Promise<Metal | undefined> {
    await db.initialize();
    return db.metals.find(m => m.id === id);
}

export async function getPurities(): Promise<Purity[]> {
    await db.initialize();
    return db.purities;
}

export async function getPurityById(id: string): Promise<Purity | undefined> {
    await db.initialize();
    return db.purities.find(p => p.id === id);
}

export async function getTaxClasses(): Promise<TaxClass[]> {
    await db.initialize();
    return db.taxClasses;
}

export async function getCategories(): Promise<Category[]> {
    await db.initialize();
    return JSON.parse(JSON.stringify(db.categories));
};

export async function getCategoryById(id: string): Promise<Category | undefined> {
    await db.initialize();
    const category = db.categories.find(c => c.id === id);
    return category ? JSON.parse(JSON.stringify(category)) : undefined;
};

const getSubCategoryIds = (parentId: string, allCategories: Category[]): string[] => {
    const children = allCategories.filter(cat => cat.parent_id === parentId);
    return children.flatMap(child => [child.id, ...getSubCategoryIds(child.id, allCategories)]);
}

export async function getProductsForCategory(categoryId: string): Promise<Product[]> {
    const allCategories = await getCategories();
    const allProducts = await getProducts();
    
    const categoryIdsToFilter = [categoryId, ...getSubCategoryIds(categoryId, allCategories)];
    
    const filteredProducts = allProducts.filter(product => 
        product.category_ids.some(id => categoryIdsToFilter.includes(id))
    );
    
    return filteredProducts;
};


export async function saveCategory(categoryData: Omit<Category, 'id'> & {id?: string}): Promise<Category> {
    await db.initialize();
    if (categoryData.id) {
        const index = db.categories.findIndex(c => c.id === categoryData.id);
        if (index !== -1) {
            db.categories[index] = { ...db.categories[index], ...categoryData } as Category;
            await db.saveCategories();
            await db.logChange('Category', db.categories[index].id, db.categories[index].name, 'Updated');
            return db.categories[index];
        } else {
            throw new Error("Category not found");
        }
    } else {
        const newCategory: Category = {
            id: `cat-${Date.now()}`,
            name: categoryData.name,
            parent_id: categoryData.parent_id,
            icon: categoryData.icon || null,
            imageUrl: categoryData.imageUrl || null,
        };
        db.categories.push(newCategory);
        await db.saveCategories();
        await db.logChange('Category', newCategory.id, newCategory.name, 'Created');
        return newCategory;
    }
};

export async function deleteCategory(id: string): Promise<{ success: boolean }> {
    await db.initialize();
    const isCategoryInUse = db.products.some(p => p.category_ids.includes(id));
    if (isCategoryInUse) {
        throw new Error("This category cannot be deleted because it is currently assigned to one or more products.");
    }
    const hasChildren = db.categories.some(c => c.parent_id === id);
    if (hasChildren) {
        throw new Error("This category cannot be deleted because it has sub-categories.");
    }
    
    const categoryToDelete = db.categories.find(c => c.id === id);
    const initialLength = db.categories.length;
    db.categories = db.categories.filter(c => c.id !== id);
    const success = db.categories.length < initialLength;
    
    if (success && categoryToDelete) {
        await db.saveCategories();
        await db.logChange('Category', categoryToDelete.id, categoryToDelete.name, 'Deleted');
        return { success: true };
    } else {
        throw new Error("Category not found.");
    }
};

export async function updateMetalPrices(updates: { id: string; price_per_gram: number }[]): Promise<{ success: boolean }> {
    await db.initialize();
    for (const update of updates) {
        const metal = db.metals.find(m => m.id === update.id);
        if (metal) {
          metal.price_per_gram = update.price_per_gram;
          metal.updated_at = new Date().toISOString();
          await db.logChange('Pricing', metal.id, `${metal.name} Price`, 'Updated');
        }
    }
    await db.saveMetals();
    return { success: true };
};

export async function savePurity(purityData: Omit<Purity, 'id' | 'updated_at'> & {id?: string}): Promise<Purity> {
    await db.initialize();
    const metal = db.metals.find(m => m.id === purityData.metal_id);
    if (!metal) throw new Error("Metal not found for purity");

    if (purityData.id) {
        const index = db.purities.findIndex(p => p.id === purityData.id);
        if (index !== -1) {
            db.purities[index] = { ...db.purities[index], ...purityData, updated_at: new Date().toISOString() };
            await db.savePurities();
            await db.logChange('Pricing', db.purities[index].id, `${metal.name} Purity: ${db.purities[index].label}`, 'Updated');
            return db.purities[index];
        } else {
            throw new Error("Purity not found");
        }
    } else {
        const newPurity: Purity = {
            ...purityData,
            id: `purity-${Date.now()}`,
            updated_at: new Date().toISOString()
        };
        db.purities.push(newPurity);
        await db.savePurities();
        await db.logChange('Pricing', newPurity.id, `${metal.name} Purity: ${newPurity.label}`, 'Created');
        return newPurity;
    }
};

export async function deletePurity(id: string): Promise<{ success: boolean }> {
    await db.initialize();
    const purityToDelete = db.purities.find(p => p.id === id);
    const initialLength = db.purities.length;
    db.purities = db.purities.filter(p => p.id !== id);
    const success = db.purities.length < initialLength;

    if (success && purityToDelete) {
        const metal = db.metals.find(m => m.id === purityToDelete.metal_id);
        await db.savePurities();
        await db.logChange('Pricing', purityToDelete.id, `${metal?.name || 'Unknown'} Purity: ${purityToDelete.label}`, 'Deleted');
    }
    return { success };
};

export async function saveTaxClass(taxClassData: Omit<TaxClass, 'id'> & {id?: string}): Promise<TaxClass> {
    await db.initialize();
    if (taxClassData.id) {
        const index = db.taxClasses.findIndex(t => t.id === taxClassData.id);
        if (index !== -1) {
            db.taxClasses[index] = { ...db.taxClasses[index], ...taxClassData };
            await db.saveTaxClasses();
            await db.logChange('Tax', db.taxClasses[index].id, db.taxClasses[index].name, 'Updated');
            return db.taxClasses[index];
        } else {
            throw new Error("Tax class not found");
        }
    } else {
        const newTaxClass: TaxClass = {
            ...taxClassData,
            id: `tax-${Date.now()}`,
        };
        db.taxClasses.push(newTaxClass);
        await db.saveTaxClasses();
        await db.logChange('Tax', newTaxClass.id, newTaxClass.name, 'Created');
        return newTaxClass;
    }
};

export async function deleteTaxClass(id: string): Promise<{ success: boolean }> {
    await db.initialize();
    const isTaxClassInUse = db.products.some(p => p.tax_class_id === id);
    if (isTaxClassInUse) {
        throw new Error("This tax class cannot be deleted because it is currently assigned to one or more products.");
    }
    
    const taxClassToDelete = db.taxClasses.find(t => t.id === id);
    const initialLength = db.taxClasses.length;
    db.taxClasses = db.taxClasses.filter(t => t.id !== id);
    const success = db.taxClasses.length < initialLength;
    
    if (success && taxClassToDelete) {
        await db.saveTaxClasses();
        await db.logChange('Tax', taxClassToDelete.id, taxClassToDelete.name, 'Deleted');
        return { success: true };
    } else {
        throw new Error("Tax class not found.");
    }
};

export async function updateProductMedia(productId: string, media: ProductMedia[]): Promise<{ success: boolean }> {
    await db.initialize();
    const product = db.products.find(p => p.id === productId);
    if (product) {
        product.media = media;
        await db.saveProducts();
        return { success: true };
    } else {
        throw new Error("Product not found");
    }
};

const HIDDEN_MENU_CATEGORY_IDS = [
    'cat-featured',
    'cat-trending',
    'cat-men',
    'cat-women',
    'cat-boy',
    'cat-girl'
];

const categoryToMenuItem = (category: Category, allCategories: Category[]): MenuItem => {
  return {
    id: `dynamic-cat-${category.id}`,
    label: category.name,
    link: `/category/${category.id}`,
    parent_id: category.parent_id ? `dynamic-cat-${category.parent_id}` : null,
    sort_order: 0, // This will be reassigned later
    icon: category.icon,
    imageUrl: category.imageUrl,
  };
};

const buildHierarchy = (items: MenuItem[], parentId: string | null = null, currentSortOrder = 0): [MenuItem[], number] => {
  let order = currentSortOrder;
  const children = items
    .filter(item => item.parent_id === parentId)
    .sort((a,b) => a.sort_order - b.sort_order)
    .flatMap(item => {
        const [sortedChildren, nextOrder] = buildHierarchy(items, item.id, order + 1);
        order = nextOrder;
        return [{ ...item, sort_order: order - 1 }, ...sortedChildren];
    });
  return [children, order];
};

const generateMenuItemsFromCategories = (allCategories: Category[]): MenuItem[] => {
    const visibleCategories = allCategories.filter(c => !HIDDEN_MENU_CATEGORY_IDS.includes(c.id));
    return visibleCategories.map(c => categoryToMenuItem(c, visibleCategories));
}

export async function getMenuById(id: string): Promise<Menu | undefined> {
    await db.initialize();
    const menu = db.menus.find(m => m.id === id);

    if (id === 'menu-1' && menu) {
        const dynamicCategoryItems = generateMenuItemsFromCategories(db.categories);

        // Merge static item data (like mega menu promos) into dynamic items
        const mergedItems = dynamicCategoryItems.map(dynamicItem => {
            const staticItem = menu.items.find(staticItem => staticItem.link === dynamicItem.link);
            if (staticItem) {
                return { 
                    ...dynamicItem, 
                    ...staticItem, // Static data like promos overrides dynamic data
                    id: dynamicItem.id, // Keep dynamic ID structure
                    parent_id: dynamicItem.parent_id, // Keep dynamic parent
                    label: staticItem.label || dynamicItem.label, // Prefer static label
                };
            }
            return dynamicItem;
        });

        // Include any static items that weren't merged (e.g., custom links like "Home")
        const staticOnlyItems = menu.items.filter(staticItem => 
            !dynamicCategoryItems.some(dynamicItem => dynamicItem.link === staticItem.link)
        );

        const allItems = [...staticOnlyItems, ...mergedItems];
        
        // Re-build hierarchy and sort order
        const topLevelItems = allItems.filter(i => i.parent_id === null);
        let finalSortedItems: MenuItem[] = [];
        let sortOrder = 0;
        
        topLevelItems.sort((a, b) => a.sort_order - b.sort_order).forEach(topItem => {
             const [children, nextOrder] = buildHierarchy(allItems, topItem.id, sortOrder + 1);
             finalSortedItems.push({ ...topItem, sort_order: sortOrder });
             finalSortedItems.push(...children);
             sortOrder = nextOrder;
        });


        // A simpler sort as a fallback if the above is too complex
         const hierarchy = buildHierarchy(allItems, null)[0];
         const sortedFinal = hierarchy.map((item, index) => ({...item, sort_order: index}));


        return { ...menu, items: sortedFinal };
    }
    
    return menu ? JSON.parse(JSON.stringify(menu)) : undefined;
};

export async function saveMenu(menuData: Menu): Promise<Menu> {
    await db.initialize();
    const index = db.menus.findIndex(m => m.id === menuData.id);
    if (index !== -1) {
        
        const idMap = new Map<string, string>();
         menuData.items.forEach(item => {
            if (item.id.startsWith("new-")) {
                idMap.set(item.id, `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
            }
        });

        const finalItems = menuData.items.map(item => {
            const id = idMap.get(item.id) || item.id;
            const parent_id = item.parent_id ? (idMap.get(item.parent_id) || item.parent_id) : null;
            return { ...item, id, parent_id};
        });


        db.menus[index] = { ...menuData, items: finalItems };
        await db.saveMenus();
        await db.logChange('Menu', menuData.id, menuData.name, 'Updated');
        return db.menus[index];
    } else {
        throw new Error("Menu not found");
    }
};

export async function getSettings() {
    await db.initialize();
    return db.settings;
}

export async function saveSettings(newSettings: any) {
    await db.initialize();
    db.settings = newSettings;
    await db.saveSettings();
    return db.settings;
}

export async function getDeveloperSettings() {
    await db.initialize();
    return db.developerSettings;
}

export async function saveDeveloperSettings(settings: any) {
    await db.initialize();
    db.developerSettings = settings;
    await db.saveDeveloperSettings();
    return db.developerSettings;
}

export async function getTempOtps() {
    await db.initialize();
    return db.tempOtps;
}

export async function getThemeSettings(): Promise<{ activeProductTheme: string; activeHomepageTheme: string; }> {
    await db.initialize();
    return db.themeSettings;
}

export async function saveThemeSettings(newSettings: any): Promise<{ success: boolean }> {
    await db.initialize();
    db.themeSettings = newSettings;
    await db.saveThemeSettings();
    return { success: true };
}

export async function getChangeHistory(): Promise<ChangeHistory[]> {
    await db.initialize();
    return db.history;
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
    await db.initialize();
    return db.reviews.filter(r => r.product_id === productId && r.status === 'approved');
};

export async function getAllReviewsForProduct(productId: string): Promise<ProductReview[]> {
    await db.initialize();
    return db.reviews.filter(r => r.product_id === productId);
}

export async function saveProductReview(reviewData: Omit<ProductReview, 'id' | 'created_at'>): Promise<ProductReview> {
    await db.initialize();
    const newReview: ProductReview = {
        ...reviewData,
        id: `rev-${Date.now()}`,
        created_at: new Date().toISOString()
    };
    db.reviews.push(newReview);
    await db.saveReviews();
    return newReview;
};

export async function updateProductReview(reviewData: ProductReview): Promise<ProductReview> {
    await db.initialize();
    const index = db.reviews.findIndex(r => r.id === reviewData.id);
    if (index !== -1) {
        db.reviews[index] = { ...db.reviews[index], ...reviewData };
        await db.saveReviews();
        return db.reviews[index];
    } else {
        throw new Error("Review not found");
    }
};

export async function deleteProductReview(reviewId: string): Promise<{ success: boolean }> {
    await db.initialize();
    const initialLength = db.reviews.length;
    db.reviews = db.reviews.filter(r => r.id !== reviewId);
    await db.saveReviews();
    return { success: db.reviews.length < initialLength };
};

export async function createOrder(items: CartItem[], shippingAddress: ShippingAddress, userId: string, discount?: { code: string; amount: number }): Promise<string> {
    await db.initialize();
    const newOrder: Order = {
        id: `order-${Date.now()}`,
        user_id: userId,
        items,
        shippingAddress,
        status: 'processing',
        created_at: new Date().toISOString(),
        discount,
    };
    
    // --- START INVENTORY LOGIC ---
    for (const item of items) {
        const productIndex = db.products.findIndex(p => p.id === item.product_id);
        if (productIndex !== -1) {
            const product = db.products[productIndex];
            const variantIndex = product.variants.findIndex(v => v.id === item.variant_id);

            if (variantIndex !== -1) {
                const newStock = product.variants[variantIndex].stock_quantity - item.quantity;
                // Ensure stock doesn't go below zero, though this should ideally be checked before payment.
                db.products[productIndex].variants[variantIndex].stock_quantity = Math.max(0, newStock);
            }
        }
    }
    
    // Now save all changes
    db.orders.push(newOrder);
    
    // Increment coupon usage count if discount was applied
    if (discount && discount.code) {
        const discountIndex = db.discounts.findIndex(d => d.code.toLowerCase() === discount.code!.toLowerCase());
        if (discountIndex !== -1) {
            const discountItem = db.discounts[discountIndex];
            if (discountItem.usage_limit === null || discountItem.usage_count < discountItem.usage_limit) {
                db.discounts[discountIndex].usage_count = (discountItem.usage_count || 0) + 1;
                await db.saveDiscounts();
            }
        }
    }
    
    await db.saveProducts(); // <-- Save updated product stock
    await db.saveOrders(); // <-- Save the new order
    // --- END INVENTORY LOGIC ---
    
    // --- START EMAIL LOGIC ---
    const user = await getUserById(userId);
    if (user && user.email) {
        sendOrderConfirmationEmail(user.email, newOrder).catch(console.error);
    }
    // --- END EMAIL LOGIC ---

    return newOrder.id;
};

export async function getOrderById(id: string): Promise<Order | undefined> {
    await db.initialize();
    return db.orders.find(o => o.id === id);
};

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
    await db.initialize();
    return db.orders.filter(o => o.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export async function getAllOrders(): Promise<Order[]> {
    await db.initialize();
    const users = await getUsers();
    const ordersWithCustomer = db.orders.map(order => {
        const user = users.find(u => u.id === order.user_id);
        return {
            ...order,
            customerName: user ? user.name : 'Unknown User',
        };
    });
    return ordersWithCustomer.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export async function updateOrderStatus(
    orderId: string, 
    status: Order['status'], 
    shippingDetails?: { trackingNumber: string }
): Promise<Order | undefined> {
    await db.initialize();
    const orderIndex = db.orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        db.orders[orderIndex].status = status;
        
        let logMessage = `Status changed to ${status}`;

        if (status === 'shipped' && shippingDetails?.trackingNumber) {
            const order = db.orders[orderIndex];
            const orderTotal = order.items.reduce((acc, item) => acc + item.price_snapshot.total * item.quantity, 0) - (order.discount?.amount || 0);

            const settings = await getSettings();
            const delhiveryConfigured = !!settings.shipping?.delhivery?.apiToken;
            const sequelConfigured = !!settings.shipping?.sequel?.apiToken;
            const shiprocketConfigured = !!settings.shipping?.shiprocket?.apiToken;

            let carrier: string | null = null;
            if (orderTotal < 49999) {
                if (delhiveryConfigured) {
                    carrier = 'delhivery';
                } else if (shiprocketConfigured) {
                    carrier = 'shiprocket';
                } else if (sequelConfigured) {
                    carrier = 'sequel';
                }
            } else {
                if (sequelConfigured) {
                    carrier = 'sequel';
                } else if (shiprocketConfigured) {
                    carrier = 'shiprocket';
                } else if (delhiveryConfigured) {
                    carrier = 'delhivery';
                }
            }
            
            if (!carrier) {
                throw new Error("No shipping providers are configured. Please set API tokens in Admin > Shipping.");
            }

            db.orders[orderIndex].shipping_carrier = carrier;
            db.orders[orderIndex].tracking_number = shippingDetails.trackingNumber;
            logMessage += ` via ${carrier}`;
        }
        
        await db.saveOrders();
        await db.logChange('Order', db.orders[orderIndex].id, `Order #${db.orders[orderIndex].id.split('-')[1]}`, logMessage);
        return db.orders[orderIndex];
    }
    return undefined;
}

export async function getSalesDataForChart(): Promise<SalesData[]> {
    await db.initialize();
    const salesByDate: { [date: string]: number } = {};

    db.orders.forEach(order => {
        // Only include completed orders in sales data
        if (order.status === 'delivered' || order.status === 'shipped' || order.status === 'processing') {
            const date = new Date(order.created_at).toISOString().split('T')[0]; // Group by day
            const orderTotal = order.items.reduce((acc, item) => acc + item.price_snapshot.total * item.quantity, 0);
            if (salesByDate[date]) {
                salesByDate[date] += orderTotal;
            } else {
                salesByDate[date] = orderTotal;
            }
        }
    });

    const salesData: SalesData[] = Object.entries(salesByDate)
        .map(([date, totalSales]) => ({
            date,
            totalSales,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return salesData;
}


export async function getMediaLibrary(): Promise<any[]> {
    await db.initialize();
    return db.mediaLibrary;
}

export async function saveMediaLibrary(media: any[]): Promise<{ success: boolean }> {
    await db.initialize();
    db.mediaLibrary = media;
    await db.saveMediaLibrary();
    return { success: true };
}

export async function getSocialProofSettings(): Promise<SocialProofSettings> {
    await db.initialize();
    return db.socialProofSettings;
}

export async function saveSocialProofSettings(settings: SocialProofSettings): Promise<{ success: boolean }> {
    await db.initialize();
    db.socialProofSettings = settings;
    await db.saveSocialProofSettings();
    return { success: true };
}

export async function getRoles(): Promise<Role[]> {
    await db.initialize();
    return db.roles;
}

export async function saveRoles(roles: Role[]): Promise<{ success: boolean }> {
    await db.initialize();
    db.roles = roles;
    await db.saveRoles();
    await db.logChange('System', 'roles', 'Roles & Permissions', 'Updated');
    return { success: true };
}


// These were moved out of api.ts to avoid bundling server code on the client.
// We keep them here in case any server-side logic still needs them.
export async function getUsers(): Promise<User[]> {
    await db.initialize();
    return db.users;
}

export async function getCustomers(): Promise<User[]> {
    await db.initialize();
    return db.users.filter(u => u.role === 'customer');
}

export async function getAdmins(): Promise<User[]> {
    await db.initialize();
    return db.users.filter(u => u.role !== 'customer');
}

export async function getUserById(id: string): Promise<User | undefined> {
    await db.initialize();
    return db.users.find(u => u.id === id);
}

export async function updateUserName(userId: string, name: string): Promise<User | undefined> {
    await db.initialize();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        db.users[userIndex].name = name;
        await db.saveUsers();
        return db.users[userIndex];
    }
    return undefined;
}

export async function saveUserAddress(userId: string, address: Omit<Address, 'id'>): Promise<User | undefined> {
    await db.initialize();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        if (!db.users[userIndex].addresses) {
            db.users[userIndex].addresses = [];
        }
        const newAddress: Address = { ...address, id: `addr-${Date.now()}` };
        db.users[userIndex].addresses!.push(newAddress);
        await db.saveUsers();
        return db.users[userIndex];
    }
    return undefined;
}

export async function updateUserAddress(userId: string, address: Address): Promise<User | undefined> {
    await db.initialize();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex !== -1 && db.users[userIndex].addresses) {
        const addressIndex = db.users[userIndex].addresses!.findIndex(a => a.id === address.id);
        if (addressIndex !== -1) {
            db.users[userIndex].addresses![addressIndex] = address;
            await db.saveUsers();
            return db.users[userIndex];
        }
    }
    return undefined;
}

export async function deleteUserAddress(userId: string, addressId: string): Promise<User | undefined> {
    await db.initialize();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex !== -1 && db.users[userIndex].addresses) {
        db.users[userIndex].addresses = db.users[userIndex].addresses!.filter(a => a.id !== addressId);
        if (db.users[userIndex].default_address_id === addressId) {
            db.users[userIndex].default_address_id = db.users[userIndex].addresses![0]?.id || null;
        }
        await db.saveUsers();
        return db.users[userIndex];
    }
    return undefined;
}

export async function setDefaultUserAddress(userId: string, addressId: string): Promise<User | undefined> {
    await db.initialize();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const user = db.users[userIndex];
        // Ensure the address being set as default actually belongs to the user
        if (user.addresses?.some(a => a.id === addressId)) {
            user.default_address_id = addressId;
            await db.saveUsers();
            return user;
        }
    }
    return undefined;
}

export async function getAllPosts(): Promise<BlogPost[]> {
    await db.initialize();
    return db.posts;
}

export async function getGiftMessages(): Promise<any[]> {
    await db.initialize();
    return db.giftMessages;
}

export async function saveGiftMessages(messages: any[]): Promise<{ success: boolean }> {
    await db.initialize();
    db.giftMessages = messages;
    await db.saveGiftMessages();
    return { success: true };
}

    