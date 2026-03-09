"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { HomepageContent, HeroSliderItem, IconHighlightItem } from './types';
import { getMongoDB } from '../mongodb';
import { getHomepageContent, saveHomepageContent, getMobileHomepageContent, saveMobileHomepageContent } from '../../get-homepage-content';

// Define schemas for validation
const heroSchema = z.object({
  title: z.string(),
  titleHighlight: z.string(),
  subtitle: z.string(),
  ctaText: z.string(),
  ctaLink: z.string(),
  videoUrl: z.string(),
  fallbackImageUrl: z.string(),
  videoEnabled: z.boolean().optional(),
});

const iconHighlightItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  link: z.string(),
  imageUrl: z.string().url(),
  imageHint: z.string(),
});

const iconHighlightsSchema = z.object({
    items: z.array(iconHighlightItemSchema),
    showText: z.boolean().optional(),
});

const heroSliderItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  ctaText: z.string(),
  ctaLink: z.string(),
  imageUrl: z.string(),
  imageHint: z.string(),
});

const heroSliderSchema = z.object({
    items: z.array(heroSliderItemSchema),
    height: z.number().optional(),
});

const productCarouselSchema = z.object({
  title: z.string(),
});

const imageBannerSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  ctaText: z.string(),
  ctaLink: z.string(),
  imageUrl: z.string(),
  imageHint: z.string(),
});

const shopByCategoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  link: z.string(),
  imageUrl: z.string(),
  imageHint: z.string(),
});

const testimonialItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  text: z.string(),
  rating: z.number(),
  imageUrl: z.string(),
  imageHint: z.string(),
});

const journalEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  excerpt: z.string(),
  link: z.string(),
  imageUrl: z.string(),
  imageHint: z.string(),
});

const homepageContentSchema = z.object({
  hero: heroSchema,
  iconHighlights: iconHighlightsSchema,
  heroSlider: heroSliderSchema,
  newestProducts: productCarouselSchema,
  bestSellers: productCarouselSchema,
  imageBanner1: imageBannerSchema,
  imageBanner2: imageBannerSchema,
  shopByCategory: z.object({
    categories: z.array(shopByCategoryItemSchema),
  }),
  testimonials: z.object({
      title: z.string(),
      items: z.array(testimonialItemSchema)
  }),
  journal: z.object({
      title: z.string(),
      entries: z.array(journalEntrySchema)
  }),
  videoHighlights: z.any(),
});

export type AppearanceFormState = {
  message: string;
  errors?: {
    [key: string]: any;
  };
};

async function updateContent(
  getContent: () => Promise<HomepageContent>,
  saveContent: (c: HomepageContent) => Promise<void>,
  formData: FormData
): Promise<AppearanceFormState> {
  try {
    const originalContent: HomepageContent = await getContent();
    const updatedContent: HomepageContent = JSON.parse(JSON.stringify(originalContent));

    const form = Object.fromEntries(formData.entries());
    const getValue = (key: string, fallback: any) => form[key] ?? fallback;

    // Update Hero
    updatedContent.hero = {
      title: getValue('hero-title', originalContent.hero.title) as string,
      titleHighlight: getValue('hero-titleHighlight', originalContent.hero.titleHighlight) as string,
      subtitle: getValue('hero-subtitle', originalContent.hero.subtitle) as string,
      ctaText: getValue('hero-ctaText', originalContent.hero.ctaText) as string,
      ctaLink: getValue('hero-ctaLink', originalContent.hero.ctaLink) as string,
      videoUrl: getValue('hero-videoUrl', originalContent.hero.videoUrl) as string,
      fallbackImageUrl: getValue('imageUrl-hero-fallback', originalContent.hero.fallbackImageUrl) as string,
      videoEnabled: getValue('hero-videoEnabled', false) === 'on',
    };

    // Update Icon Highlights
    updatedContent.iconHighlights = {
      items: originalContent.iconHighlights.items.map((item, i) => ({
        ...item,
        name: getValue(`icon-${i}-name`, item.name) as string,
        link: getValue(`icon-${i}-link`, item.link) as string,
        imageUrl: getValue(`imageUrl-icon-${item.id}`, item.imageUrl) as string,
        imageHint: getValue(`imageHint-icon-${item.id}`, item.imageHint) as string,
      })),
      showText: getValue('iconHighlights-showText', false) === 'on'
    };

    // Update Hero Slider
    const heroSliderItemsRaw = formData.get('heroSliderItems') as string;
    if (heroSliderItemsRaw) {
      const clientSlides: HeroSliderItem[] = JSON.parse(heroSliderItemsRaw);
      updatedContent.heroSlider.items = clientSlides.map(item => {
        const finalId = item.id.startsWith('new-')
          ? `slide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          : item.id;
        return {
          id: finalId,
          title: getValue(`heroSlider-${item.id}-title`, item.title) as string,
          subtitle: getValue(`heroSlider-${item.id}-subtitle`, item.subtitle) as string,
          ctaText: getValue(`heroSlider-${item.id}-ctaText`, item.ctaText) as string,
          ctaLink: getValue(`heroSlider-${item.id}-ctaLink`, item.ctaLink) as string,
          imageUrl: getValue(`imageUrl-heroSlider-${item.id}`, item.imageUrl) as string,
          imageHint: getValue(`imageHint-heroSlider-${item.id}`, item.imageHint) as string,
        };
      });
    }

    // Update carousels
    updatedContent.newestProducts.title = getValue('newest-title', originalContent.newestProducts.title) as string;
    updatedContent.bestSellers.title = getValue('bestsellers-title', originalContent.bestSellers.title) as string;

    // Update banners
    updatedContent.imageBanner1 = {
      title: getValue('banner1-title', originalContent.imageBanner1.title) as string,
      subtitle: getValue('banner1-subtitle', originalContent.imageBanner1.subtitle) as string,
      ctaText: getValue('banner1-ctaText', originalContent.imageBanner1.ctaText) as string,
      ctaLink: getValue('banner1-ctaLink', originalContent.imageBanner1.ctaLink) as string,
      imageUrl: getValue('imageUrl-banner-diamonds', originalContent.imageBanner1.imageUrl) as string,
      imageHint: getValue('imageHint-banner-diamonds', originalContent.imageBanner1.imageHint) as string,
    };
    updatedContent.imageBanner2 = {
      title: getValue('banner2-title', originalContent.imageBanner2.title) as string,
      subtitle: getValue('banner2-subtitle', originalContent.imageBanner2.subtitle) as string,
      ctaText: getValue('banner2-ctaText', originalContent.imageBanner2.ctaText) as string,
      ctaLink: getValue('banner2-ctaLink', originalContent.imageBanner2.ctaLink) as string,
      imageUrl: getValue('imageUrl-banner-gifting', originalContent.imageBanner2.imageUrl) as string,
      imageHint: getValue('imageHint-banner-gifting', originalContent.imageBanner2.imageHint) as string,
    };

    // Update Shop by Category
    updatedContent.shopByCategory.categories = originalContent.shopByCategory.categories.map((cat, i) => ({
      ...cat,
      name: getValue(`category-${i}-name`, cat.name) as string,
      link: getValue(`category-${i}-link`, cat.link) as string,
      imageUrl: getValue(`imageUrl-category-${cat.id}`, cat.imageUrl) as string,
      imageHint: getValue(`imageHint-category-${cat.id}`, cat.imageHint) as string,
    }));

    // Update Testimonials
    updatedContent.testimonials.title = getValue('testimonials-title', originalContent.testimonials.title) as string;
    updatedContent.testimonials.items = originalContent.testimonials.items.map((item, i) => ({
      ...item,
      text: getValue(`testimonial-${i}-text`, item.text) as string,
      name: getValue(`testimonial-${i}-name`, item.name) as string,
      location: getValue(`testimonial-${i}-location`, item.location) as string,
      imageUrl: getValue(`imageUrl-testimonial-${item.id}`, item.imageUrl) as string,
      imageHint: getValue(`imageHint-testimonial-${item.id}`, item.imageHint) as string,
    }));

    // Update Journal
    updatedContent.journal.title = getValue('journal-title', originalContent.journal.title) as string;
    updatedContent.journal.entries = originalContent.journal.entries.map((entry, i) => ({
      ...entry,
      title: getValue(`journal-${i}-title`, entry.title) as string,
      excerpt: getValue(`journal-${i}-excerpt`, entry.excerpt) as string,
      link: getValue(`journal-${i}-link`, entry.link) as string,
      imageUrl: getValue(`imageUrl-journal-${entry.id}`, entry.imageUrl) as string,
      imageHint: getValue(`imageHint-journal-${entry.id}`, entry.imageHint) as string,
    }));

    const validationResult = homepageContentSchema.safeParse(updatedContent);
    if (!validationResult.success) {
      console.error("Validation Error:", validationResult.error.flatten().fieldErrors);
      return {
        message: "Failed to save. Please check all fields for valid URLs and required content.",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    await saveContent(validationResult.data as HomepageContent);
    revalidatePath("/", "layout");
    return { message: "Homepage content updated successfully!" };
  } catch (error) {
    console.error("Failed to save appearance settings:", error);
    return { message: "An unexpected error occurred while saving." };
  }
}

export async function saveAppearanceAction(
  prevState: AppearanceFormState,
  formData: FormData
): Promise<AppearanceFormState> {
  return updateContent(getHomepageContent, saveHomepageContent, formData);
}

export async function saveMobileAppearanceAction(
  prevState: AppearanceFormState,
  formData: FormData
): Promise<AppearanceFormState> {
  const filteredFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    if (!key.match(/^heroSlider-\d+-.+/)) {
      filteredFormData.append(key, value);
    }
  }
  if (formData.has('heroSliderItems')) {
    filteredFormData.append('heroSliderItems', formData.get('heroSliderItems')!);
  }
  return updateContent(getMobileHomepageContent, saveMobileHomepageContent, filteredFormData);
}