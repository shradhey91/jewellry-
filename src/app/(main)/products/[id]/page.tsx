

import { getProductById, getProductsByIds, getProductReviews, getMetalById, getPurityById, getCategoryById, getThemeSettings } from '@/lib/server/api';
import { notFound } from 'next/navigation';
import { DefaultTheme } from '../themes/default-theme';
import { Theme2 } from '../themes/theme-2';
import { Theme3 } from '../themes/theme-3';
import { Theme4 } from '../themes/theme-4';

export const runtime = 'nodejs';

export default async function ProductPageController({ params }: { params: { id: string } }) {
  const { id } = params;

  // 1. Fetch all necessary data concurrently
  const [
    product,
    themeSettings
  ] = await Promise.all([
    getProductById(id),
    getThemeSettings()
  ]);

  if (!product) {
    notFound();
  }

  // Fetch remaining data that depends on the product
  const [
    primaryCategory,
    crossSellProducts,
    upsellProducts,
    reviews,
    metal,
    purity
  ] = await Promise.all([
      product.category_ids[0] ? getCategoryById(product.category_ids[0]) : Promise.resolve(null),
      product.cross_sell_products && product.cross_sell_products.length > 0 ? getProductsByIds(product.cross_sell_products) : Promise.resolve([]),
      product.upsell_products && product.upsell_products.length > 0 ? getProductsByIds(product.upsell_products) : Promise.resolve([]),
      getProductReviews(product.id),
      getMetalById(product.metal_id),
      getPurityById(product.purity_id),
  ]);

  // 2. Prepare props for the theme component
  const themeProps = {
    product,
    primaryCategory,
    crossSellProducts,
    upsellProducts,
    reviews,
    metal,
    purity
  };

  // 3. Conditionally render the correct theme component
  if (themeSettings.activeProductTheme === 'theme_2') {
    return <Theme2 {...themeProps} />;
  }
  
  if (themeSettings.activeProductTheme === 'theme_3') {
    return <Theme3 {...themeProps} />;
  }
  
  if (themeSettings.activeProductTheme === 'theme_4') {
    return <Theme4 {...themeProps} />;
  }

  return <DefaultTheme {...themeProps} />;
}
