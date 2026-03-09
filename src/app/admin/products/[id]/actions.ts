

'use server';
// This file now acts as a pass-through to the centralized product actions.
// This prevents breaking existing component imports.
// The actual logic is in /src/lib/server/actions/products.ts

// Explicitly import and re-export only the server actions.
// Types should be imported directly by components that need them.
import {
    saveOrUpdateProduct,
    updateProductImages,
    searchProductsByName,
    addProductReviewAction,
    updateProductReviewAction,
    deleteProductReviewAction,
    deleteProduct,
    submitCustomerReviewAction,
    updateProductReviewStatus,
} from '@/lib/server/actions/products';

export {
    saveOrUpdateProduct,
    updateProductImages,
    searchProductsByName,
    addProductReviewAction,
    updateProductReviewAction,
    deleteProductReviewAction,
    deleteProduct,
    submitCustomerReviewAction,
    updateProductReviewStatus,
};

    