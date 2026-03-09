
'use client';

import type { MinimalistHomepageContent } from "@/lib/types";
import type { Product } from "@/lib/types";
import { MinimalistHero } from "./components/minimalist/MinimalistHero";
import { MinimalistDiamondInterpretations } from "./components/minimalist/MinimalistDiamondInterpretations";
import { MinimalistSignatureCollections } from "./components/minimalist/MinimalistSignatureCollections";
import { MinimalistCategoryGridWithTrending } from "./components/minimalist/MinimalistCategoryGridWithTrending";
import { MinimalistWorldOfBrand } from "./components/minimalist/MinimalistWorldOfBrand";
import { MinimalistAssuranceAndExchange } from "./components/minimalist/MinimalistAssuranceAndExchange";
import { MinimalistGiftsAndExperiences } from "./components/minimalist/MinimalistGiftsAndExperiences";
import { MinimalistTestimonials } from "./components/minimalist/MinimalistTestimonials";
import { MinimalistJournal } from "./components/minimalist/MinimalistJournal";
import { MinimalistTextHighlights } from "./components/minimalist/MinimalistTextHighlights";
import { MinimalistSplitBanner } from "./components/minimalist/MinimalistSplitBanner";
import { MinimalistImageGrid } from "./components/minimalist/MinimalistImageGrid";
import { MinimalistInstagram } from "./components/minimalist/MinimalistInstagram";
import { MinimalistImageSlider } from "./components/minimalist/MinimalistImageSlider";
import { MinimalistProductCarousel } from "./components/minimalist/MinimalistProductCarousel";

interface MinimalistHomepageProps {
    content: MinimalistHomepageContent;
    newestProducts: Product[];
    bestSellerProducts: Product[];
}

export default function MinimalistHomepageTheme({ content, newestProducts, bestSellerProducts }: MinimalistHomepageProps) {
  return (
    <div className="bg-background">
      <MinimalistHero
        data={content.hero}
      />
      <MinimalistDiamondInterpretations
        data={content.diamond_interpretations}
      />
      <MinimalistSignatureCollections
        data={content.signature_collections}
      />
      <MinimalistCategoryGridWithTrending
        data={content.category_grid_with_trending}
      />
      <MinimalistProductCarousel
        data={content.newestProducts}
        products={newestProducts}
      />
      <MinimalistWorldOfBrand
        data={content.world_of_brand}
      />
       <MinimalistProductCarousel
        data={content.bestSellers}
        products={bestSellerProducts}
      />
      <MinimalistImageSlider data={content.imageSlider} />
      <MinimalistSplitBanner data={content.splitBanner} />
      <MinimalistTextHighlights data={content.textHighlights} />
      <MinimalistImageGrid data={content.imageGrid} />
      <MinimalistInstagram data={content.instagram} />
      <MinimalistTestimonials 
        data={content.testimonials}
      />
      <MinimalistAssuranceAndExchange
        data={content.assurance_and_exchange}
      />
       <MinimalistJournal
        data={content.journal}
      />
      <MinimalistGiftsAndExperiences
        data={content.gifts_and_experiences}
      />
    </div>
  );
}
