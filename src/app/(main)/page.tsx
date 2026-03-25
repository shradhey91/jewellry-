import { getProducts, getProductsForCategory, getThemeSettings } from "@/lib/server/api";
import { getHomepageContent } from "@/lib/get-homepage-content";
import { getMinimalistHomepageData } from "@/lib/get-minimalist-homepage-content";
import type { Product, HomepageContent } from "@/lib/types";
import { redirect } from "next/navigation";
import { DefaultHomepageTheme } from "./themes/default-homepage-theme";
import MinimalistHomepageTheme from "./themes/minimalist-homepage-theme";

export const runtime = 'nodejs';

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch all data concurrently
  const [
    themeSettings,
    allProducts
  ] = await Promise.all([
    getThemeSettings(),
    getProducts()
  ]);
  
  if (themeSettings.activeHomepageTheme === 'minimalist') {
    const { content, newestProducts, bestSellerProducts } = await getMinimalistHomepageData();
      
    return <MinimalistHomepageTheme content={content} newestProducts={newestProducts} bestSellerProducts={bestSellerProducts} />;
  }

  // Logic for the default theme
  const defaultContent = await getHomepageContent();

  if (defaultContent.isEnabled === false) {
    redirect('/shop');
  }

  const defaultNewestProducts = defaultContent.newestProducts?.categoryId 
    ? await getProductsForCategory(defaultContent.newestProducts.categoryId)
    : allProducts.slice(0, 10);

  const defaultBestSellers = defaultContent.bestSellers?.categoryId
    ? await getProductsForCategory(defaultContent.bestSellers.categoryId)
    : allProducts.slice(0, 10).sort((a,b) => b.display_price - a.display_price);

  return (
    <DefaultHomepageTheme
      content={defaultContent}
      newestProducts={defaultNewestProducts}
      bestSellerProducts={defaultBestSellers}
    />
  );
}
