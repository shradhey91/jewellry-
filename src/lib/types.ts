

export interface FeatureTab {
  tabTitle: string;
  contentTitle: string;
  points: string[];
  imageUrl: string;
  imageHint: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  hint: string;
}

export interface SocialProofSettings {
  isEnabled: boolean;
  showOnMobile: boolean;
  position: 'bottom-left' | 'bottom-right';
  customNames: string[];
  productIds: string[];
}

export interface FooterContent {
    columns: {
        id: string;
        title: string;
        links: { id: string; label: string; url: string }[];
    }[];
    contact: {
        email: string;
    };
    locations: { id: string; name: string }[];
    socials: {
        facebook: string;
        instagram: string;
        twitter: string;
        youtube: string;
    };
    bottom: {
        copyright: string;
        links: { id: string; label: string; url: string }[];
    };
}

export interface PromoBannerItem {
    id: string;
    title: string;
    subtitle: string;
    code: string;
    ctaText: string;
    ctaLink: string;
}

export interface PromoBannersSection {
    items: PromoBannerItem[];
}

export interface VideoAsset {
  id: string;
  name: string;
  url: string;
}


export interface VideoHighlightItem {
    id: string;
    videoUrl: string; // Changed from videoId
    title: string;
    link: string;
}

export interface VideoHighlightsSection {
    eyebrow: string;
    title: string;
    description: string;
    items: VideoHighlightItem[];
}

export interface HeroSliderItem {
    id: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    imageUrl: string;
    imageHint: string;
}

export interface HeroSliderSection {
    items: HeroSliderItem[];
    height?: number;
}

export interface HeroSection {
    title: string;
    titleHighlight: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    videoUrl: string;
    fallbackImageUrl: string;
    fallbackImageHint?: string;
    videoEnabled?: boolean;
    videoStartTime?: number;
    videoEndTime?: number;
    videoZoom?: number;
}

export interface IconHighlightItem {
    id: string;
    name: string;
    imageUrl: string;
    imageHint: string;
    link: string;
}

export interface IconHighlightsSection {
    items: IconHighlightItem[];
    showText?: boolean;
}

export interface TextHighlightItem {
    id: string;
    title: string;
    description: string;
}

export interface TextHighlightsSection {
    enabled: boolean;
    items: TextHighlightItem[];
}

export interface SplitBannerItem {
    id: string;
    title: string;
    description: string;
    buttonLabel: string;
    buttonLink: string;
    imageUrl: string;
    imageHint: string;
}

export interface SplitBannerSection {
    enabled: boolean;
    banners: SplitBannerItem[];
}

export type GridItem = 
    | {
        id: string;
        type: 'text';
        title: string;
        content: string;
        buttonLabel: string;
        buttonLink: string;
    }
    | {
        id: string;
        type: 'image';
        imageUrl: string;
        imageHint: string;
    };

export interface ImageGridSection {
    enabled: boolean;
    items: GridItem[];
}

export interface InstagramSection {
    enabled: boolean;
    handle: string;
    postImageUrls: string[];
}


export interface ProductCarouselSection {
    title: string;
    categoryId?: string | null;
    enabled: boolean;
}

export interface ImageBannerSection {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    imageUrl: string;
    imageHint: string;
    textPosition?: "left" | "right";
}

export interface ShopByCategoryItem {
    id: string;
    name: string;
    link: string;
    imageUrl: string;
    imageHint: string;
}

export interface ShopByCategorySection {
    categories: ShopByCategoryItem[];
}

export interface TestimonialItem {
    id: string;
    name: string;
    location: string;
    text: string;
    rating: number;
    imageUrl: string;
    imageHint: string;
}

export interface TestimonialsSection {
    enabled: boolean;
    title: string;
    items: TestimonialItem[];
}

export interface JournalEntry {
    id: string;
    title: string;
    excerpt: string;
    link: string;
    imageUrl: string;
    imageHint: string;
}

export interface JournalSection {
    enabled: boolean;
    title: string;
    categoryId?: string | null;
    entries: JournalEntry[];
}

export interface ImageSliderItem {
    id: string;
    imageUrl: string;
    imageHint: string;
    link: string;
}

export interface ImageSliderSection {
    enabled: boolean;
    eyebrow: string;
    title: string;
    ctaText: string;
    ctaLink: string;
    items: ImageSliderItem[];
}


export type SectionType = 
    | 'hero' 
    | 'iconHighlights' 
    | 'heroSlider' 
    | 'videoHighlights' 
    | 'newestProducts'
    | 'promoBanners'
    | 'videoSection'
    | 'bestSellers'
    | 'imageBanner1'
    | 'imageBanner2'
    | 'shopByCategory'
    | 'testimonials'
    | 'journal'
    | 'imageSlider';

export interface HomepageContent {
    layout: HomepageSection[];
    isEnabled?: boolean;
    hero: HeroSection;
    iconHighlights: IconHighlightsSection;
    heroSlider: HeroSliderSection;
    videoHighlights: VideoHighlightsSection;
    newestProducts: ProductCarouselSection;
    promoBanners: PromoBannersSection;
    videoSection: HeroSection;
    bestSellers: ProductCarouselSection;
    imageBanner1: ImageBannerSection;
    imageBanner2: ImageBannerSection;
    shopByCategory: ShopByCategorySection;
    testimonials: TestimonialsSection;
    journal: JournalSection;
    imageSlider: ImageSliderSection;
    textHighlights: TextHighlightsSection;
    splitBanner: SplitBannerSection;
    imageGrid: ImageGridSection;
    instagram: InstagramSection;
}

// Diamond Guide Content Types
export interface FourCItem {
  icon: 'Scissors' | 'Droplets' | 'Search' | 'Scaling';
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export interface DiamondShapeItem {
  name: string;
  imageUrl: string;
  imageHint: string;
}

export interface DiamondGuideContent {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    imageHint: string;
  };
  fourCs: {
    title: string;
    subtitle: string;
    items: FourCItem[];
  };
  shapes: {
    title: string;
    subtitle: string;
    items: DiamondShapeItem[];
  };
  anatomy: {
    title: string;
    subtitle: string;
    imageUrl: string;
    imageHint: string;
  };
  cta: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
}

export interface ShopPageCategoryItem {
    id: string;
    visible: boolean;
}

export interface ShopPageContent {
    hero: {
        title: string;
        subtitle: string;
        imageUrl: string;
        imageHint: string;
    };
    main: {
        title: string;
        allProductsLinkText: string;
    };
    categories: ShopPageCategoryItem[];
}


export interface Metal {
  id: string;
  name: string;
  is_active: boolean;
  price_per_gram: number; // Base price for the pure metal
  created_at: string;
  updated_at: string;
}

export interface Purity {
  id: string;
  metal_id: string;
  label: string; // e.g. 22K, 18K, 925
  fineness: number; // e.g. 0.916 for 22K, 0.750 for 18K
  is_active: boolean;
  updated_at: string;
}

export interface TaxClass {
  id: string;
  name: string;
  rate_type: 'percentage' | 'flat';
  rate_value: number;
  is_active: boolean;
}

export interface PriceBreakup {
  metal_value: number;
  making_charge: number;
  diamond_value: number;
  gst: number;
  total: number;
}

export interface DiamondDetail {
  id?: string; // Optional, for client-side keying
  purity: '14K' | '18K' | null;
  count: number | null;
  weight: number | null;
  size: number | null;
  price: number | null;
  diamond_type: 'Natural' | 'Lab-grown' | null;
  cut: string | null;
  color: string | null;
  clarity: string | null;
  rate_per_carat: number | null;
  setting_charges: number | null;
  certification_cost: number | null;
  brand_margin: number | null;
}

export interface Product {
  id: string;
  name: string;
  category_ids: string[];
  metal_id: string;
  purity_id: string;
  tax_class_id: string;
  gross_weight: number;
  net_weight: number;
  making_charge_type: 'fixed' | 'percentage';
  making_charge_value: number;
  auto_price_enabled: boolean;
  manual_price: number | null;
  seo_title: string;
  seo_description: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variants: ProductVariant[];
  media: ProductMedia[];
  certificates: ProductCertificate[];
  price_breakup: PriceBreakup;
  display_price: number;
  availability: 'IN_STOCK' | 'PRE_ORDER' | 'MADE_TO_ORDER' | 'OUT_OF_STOCK';
  has_diamonds: boolean;
  diamond_details: DiamondDetail[];
  cross_sell_products: string[];
  upsell_products: string[];
  has_size_dimensions?: boolean;
  height?: number | null;
  width?: number | null;
  length?: number | null;
  has_ring_size?: boolean;
  showGalleryGrid?: boolean;
  featureTabs: FeatureTab[];
  galleryImages: GalleryImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  label: string; // e.g. Ring size, Chain length
  stock_quantity: number;
  is_preorder: boolean;
  is_made_to_order: boolean;
  lead_time_days: number | null;
  gross_weight?: number | null;
  net_weight?: number | null;
  price_breakup?: PriceBreakup;
  display_price?: number;
}

export interface ProductMedia {
  id: string;
  product_id: string;
  url: string;
  hint: string;
  sort_order: number;
  is_primary: boolean;
  media_type: 'image' | 'video';
}

export interface ProductCertificate {
  id: string;
  product_id: string;
  certificate_type: 'Hallmark' | 'Lab' | 'Brand';
  file_url: string;
  description: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  purity_id: string;
  metal_price: number;
  net_weight: number;
  making_charge: number;
  gst_rate: number;
  calculated_total: number;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  variant_id: string;
  quantity: number;
  price_snapshot: PriceBreakup;
  product_name: string;
  product_image: string;
  variant_label: string;
  created_at: string;
  gift_message?: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  icon: string | null;
  description?: string;
  imageUrl?: string | null;
}

export interface MenuItem {
    id: string;
    label: string;
    link: string;
    parent_id: string | null;
    sort_order: number;
    icon?: string | null;
    imageUrl?: string | null;
    
    // Promo 1 (Right side)
    promoTitle?: string | null;
    promoDescription?: string | null;
    promoImageUrl?: string | null;
    promoImageHint?: string | null;
    promoLink?: string | null;

    // Promo 2 (Right side, below promo 1)
    promo2Title?: string | null;
    promo2Description?: string | null;
    promo2ImageUrl?: string | null;
    promo2ImageHint?: string | null;
    promo2Link?: string | null;

    // Full-width banner at the bottom
    subnavPromoTitle?: string | null;
    subnavPromoImageUrl?: string | null;
    subnavPromoImageHint?: string | null;
    subnavPromoLink?: string | null;

    // Layout options
    subnavColumns?: number | null;
}

export interface Menu {
    id: string;
    name: string;
    items: MenuItem[];
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
}

export type BlogTheme = 'minimalist' | 'magazine' | 'classic';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    featured_image_url: string;
    author: string;
    status: 'draft' | 'published';
    category_ids: string[];
    published_at: string | null;
    created_at: string;
    updated_at: string;
    theme?: BlogTheme;
    related_post_ids?: string[];
    excerpt: string;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'admin' | 'customer';
    createdAt: any;
    phoneNumber?: string | null;
}


export interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
    id: string;
    name: string;
    email?: string | null;
    password?: string;
    phone_number?: string | null;
    role: 'admin' | 'moderator' | 'designer' | 'marketer' | 'customer';
    created_at: string;
    email_verified?: boolean;
    phone_number_verified?: boolean;
    status?: 'active' | 'banned';
    addresses?: Address[];
    default_address_id?: string | null;
}

export interface Customer {
    id: string;
    name: string | null;
    email: string;
    phone_number: string | null;
    created_at: string;
    status?: 'active' | 'banned';
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
}

export type Permission =
  | 'dashboard:view'
  | 'reports:view'
  | 'orders:view'
  | 'orders:edit'
  | 'customers:view'
  | 'customers:edit'
  | 'products:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'categories:view'
  | 'categories:create'
  | 'categories:edit'
  | 'categories:delete'
  | 'discounts:manage'
  | 'media:manage'
  | 'blog:view'
  | 'blog:create'
  | 'blog:edit'
  | 'blog:delete'
  | 'appearance:manage'
  | 'menus:manage'
  | 'pages:manage'
  | 'pricing:manage'
  | 'tax:manage'
  | 'shipping:manage'
  | 'settings:manage'
  | 'users:manage';

export interface ChangeHistory {
    id: string;
    entity_type: 'Product' | 'Category' | 'Appearance' | 'Menu' | 'Pricing' | 'Tax' | 'Order' | 'User' | 'System';
    entity_id: string;
    entity_name: string;
    action: 'Created' | 'Updated' | 'Deleted' | 'Status changed';
    user: string;
    timestamp: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number; // 1-5
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
    id: string;
    user_id: string;
    items: CartItem[];
    shippingAddress: ShippingAddress;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    created_at: string;
    customerName?: string;
    discount?: {
        code: string;
        amount: number;
    };
    shipping_carrier?: string | null;
    tracking_number?: string | null;
}

export type HomepageSection = {
    id: string;
    type: SectionType;
    visible: boolean;
};

export interface Cta {
  label: string;
  href: string;
}

export interface MinimalistHeroSlide {
  id: string;
  type: 'image' | 'video';
  title: string;
  subtitle: string;
  cta: Cta;
  imageUrl: string;
  videoUrl?: string | null;
}

export interface MinimalistHomepageContent {
  hero: {
    enabled: boolean;
    slides: MinimalistHeroSlide[];
  };
  diamond_interpretations: {
    enabled: boolean;
    title: string;
    cards: {
      id: string;
      title: string;
      image: string;
      href: string;
    }[];
  };
  signature_collections: {
    enabled: boolean;
    title: string;
    collections: {
      primary: {
        id: string;
        title: string;
        image: string;
        href: string;
        type: 'image' | 'video';
        videoUrl?: string | null;
      };
      secondary: {
        id: string;
        title: string;
        image: string;
        href: string;
      }[];
    };
  };
  category_grid_with_trending: {
    enabled: boolean;
    categories: {
      title: string;
      items: {
        id: string;
        title: string;
        image: string;
        href: string;
      }[];
    };
    trending: {
      title: string;
      items: {
        id: string;
        title: string;
        image: string;
        href: string;
      }[];
    };
  };
  world_of_brand: {
    enabled: boolean;
    title: string;
    items: {
      id: string;
      title: string;
      image: string;
      href: string;
    }[];
  };
  assurance_and_exchange: {
    enabled: boolean;
    assurance: {
      title: string;
      items: {
        id: string;
        title: string;
        description: string;
        icon: string;
      }[];
    };
    exchange: {
      title: string;
      subtitle: string;
      image: string;
      cta: Cta;
    };
  };
  gifts_and_experiences: {
    enabled: boolean;
    gift: {
      title: string;
      subtitle: string;
      image: string;
      cta: Cta;
    };
    experiences: {
      title: string;
      items: {
        id: string;
        title: string;
        subtitle: string;
        image: string;
        href: string;
      }[];
    };
  };
  newestProducts: ProductCarouselSection & { enabled: boolean; };
  bestSellers: ProductCarouselSection & { enabled: boolean; };
  testimonials: TestimonialsSection;
  journal: JournalSection & { enabled: boolean; categoryId?: string | null; };
  imageSlider: ImageSliderSection;
  textHighlights: TextHighlightsSection;
  splitBanner: SplitBannerSection;
  imageGrid: ImageGridSection;
  instagram: InstagramSection;
}

export interface SalesData {
  date: string;
  totalSales: number;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  min_purchase: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
}
