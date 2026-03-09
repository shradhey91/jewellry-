import { Hero } from "@/components/homepage/hero";
import { HeroSlider } from "@/components/homepage/hero-slider";
import { VideoHighlights } from "@/components/homepage/video-highlights";
import { CategoryHighlights } from "@/components/homepage/category-highlights";
import { ProductCarousel } from "@/components/homepage/product-carousel";
import { ShopByCategory } from "@/components/homepage/shop-by-category";
import { Testimonials } from "@/components/homepage/testimonials";
import { ImageBanner } from "@/components/homepage/image-banner";
import { Journal } from "@/components/homepage/journal";
import { PromoBanners } from "@/components/homepage/promo-banners";
import { VideoSection } from "./video-section";
import { ImageSlider } from "./image-slider";

export const sectionComponents = {
  hero: Hero,
  iconHighlights: CategoryHighlights,
  heroSlider: HeroSlider,
  videoHighlights: VideoHighlights,
  newestProducts: ProductCarousel,
  promoBanners: PromoBanners,
  videoSection: VideoSection,
  bestSellers: ProductCarousel,
  imageBanner1: ImageBanner,
  imageBanner2: ImageBanner,
  shopByCategory: ShopByCategory,
  testimonials: Testimonials,
  journal: Journal,
  imageSlider: ImageSlider,
};
