"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type {
  HomepageContent,
  HeroSliderItem,
  PromoBannerItem,
  ImageSliderItem,
  HomepageSection,
  ShopByCategoryItem,
  TestimonialItem,
  JournalEntry,
} from "@/lib/types";
import { getThemeSettings, saveThemeSettings } from "@/lib/server/api";
import { cookies } from "next/headers";
import { getMongoDB } from "@/lib/server/mongodb";

async function verifyAdmin() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) throw new Error("Authentication required.");
  try {
    const claims = JSON.parse(sessionCookie);
    if (claims.role !== "admin") throw new Error("Authorization failed.");
  } catch {
    throw new Error("Invalid session.");
  }
}

// --- MongoDB helpers ---
async function readHomepageContent(
  collection: string,
): Promise<HomepageContent> {
  const db = await getMongoDB();
  const doc = await db
    .collection(collection)
    .findOne({ _docType: "singleton" });
  if (!doc) throw new Error(`No content found in collection: ${collection}`);
  const { _id, _docType, ...rest } = doc;
  return rest as HomepageContent;
}

async function writeHomepageContent(
  collection: string,
  content: HomepageContent,
): Promise<void> {
  const db = await getMongoDB();
  await db
    .collection(collection)
    .replaceOne(
      { _docType: "singleton" },
      { ...content, _docType: "singleton" },
      { upsert: true },
    );
}

// --- Zod Schemas ---
const heroSchema = z.object({
  title: z.string(),
  titleHighlight: z.string(),
  subtitle: z.string(),
  ctaText: z.string(),
  ctaLink: z.string(),
  videoUrl: z.string(),
  fallbackImageUrl: z.string(),
  fallbackImageHint: z.string().optional(),
  videoEnabled: z.boolean().optional(),
  videoStartTime: z.coerce.number().optional(),
  videoEndTime: z.coerce.number().optional(),
});

const iconHighlightItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  link: z.string(),
  imageUrl: z.string(),
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
const imageSliderItemSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  imageHint: z.string(),
  link: z.string().optional(),
});
const imageSliderSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  ctaText: z.string(),
  ctaLink: z.string(),
  items: z.array(imageSliderItemSchema),
});
const promoBannerItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  code: z.string(),
  ctaText: z.string(),
  ctaLink: z.string(),
});
const promoBannersSchema = z.object({ items: z.array(promoBannerItemSchema) });
const productCarouselSchema = z.object({
  title: z.string(),
  categoryId: z.string().nullable().optional(),
});
const imageBannerSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  ctaText: z.string(),
  ctaLink: z.string(),
  imageUrl: z.string(),
  imageHint: z.string(),
  textPosition: z.enum(["left", "right"]).optional(),
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
const homepageSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  visible: z.boolean(),
});

const homepageContentSchema = z.object({
  layout: z.array(homepageSectionSchema),
  isEnabled: z.boolean().optional(),
  hero: heroSchema,
  iconHighlights: iconHighlightsSchema,
  heroSlider: heroSliderSchema,
  newestProducts: productCarouselSchema,
  bestSellers: productCarouselSchema,
  imageBanner1: imageBannerSchema,
  imageBanner2: imageBannerSchema,
  shopByCategory: z.object({ categories: z.array(shopByCategoryItemSchema) }),
  testimonials: z.object({
    title: z.string(),
    items: z.array(testimonialItemSchema),
  }),
  journal: z.object({
    title: z.string(),
    categoryId: z.string().nullable().optional(),
    entries: z.array(journalEntrySchema),
  }),
  videoHighlights: z.any(),
  promoBanners: promoBannersSchema,
  videoSection: heroSchema,
  imageSlider: imageSliderSchema,
});

export type AppearanceFormState = {
  message: string;
  errors?: { [key: string]: any };
};

// --- Form Helpers ---
const getFormValue = (formData: FormData, key: string, fallback: any): any =>
  formData.get(key) ?? fallback;
const getFormBoolean = (
  formData: FormData,
  key: string,
  fallback: boolean,
): boolean => getFormValue(formData, key, fallback) === "on";
const getFormNumber = (
  formData: FormData,
  key: string,
  fallback: number,
): number => Number(getFormValue(formData, key, fallback));

// --- Section Updaters ---
function updateLayout(data: HomepageContent, formData: FormData) {
  const layoutRaw = formData.get("layout") as string;
  if (layoutRaw) data.layout = JSON.parse(layoutRaw);
}

function updateHero(
  data: HomepageContent,
  original: HomepageContent,
  formData: FormData,
) {
  if (!formData.has("hero-title")) return;
  data.hero = {
    title: getFormValue(formData, "hero-title", original.hero.title),
    titleHighlight: getFormValue(
      formData,
      "hero-titleHighlight",
      original.hero.titleHighlight,
    ),
    subtitle: getFormValue(formData, "hero-subtitle", original.hero.subtitle),
    ctaText: getFormValue(formData, "hero-ctaText", original.hero.ctaText),
    ctaLink: getFormValue(formData, "hero-ctaLink", original.hero.ctaLink),
    videoUrl: getFormValue(formData, "hero-videoUrl", original.hero.videoUrl),
    fallbackImageUrl: getFormValue(
      formData,
      "imageUrl-hero-fallback",
      original.hero.fallbackImageUrl,
    ),
    fallbackImageHint: getFormValue(
      formData,
      "imageHint-hero-fallback",
      original.hero.fallbackImageHint,
    ),
    videoEnabled: getFormBoolean(
      formData,
      "hero-videoEnabled",
      original.hero.videoEnabled ?? false,
    ),
    videoStartTime: getFormNumber(
      formData,
      "hero-videoStartTime",
      original.hero.videoStartTime || 0,
    ),
    videoEndTime: getFormNumber(
      formData,
      "hero-videoEndTime",
      original.hero.videoEndTime || 0,
    ),
  };
}

function updateVideoSection(
  data: HomepageContent,
  original: HomepageContent,
  formData: FormData,
) {
  if (!formData.has("videoSection-title")) return;
  data.videoSection = {
    title: getFormValue(
      formData,
      "videoSection-title",
      original.videoSection.title,
    ),
    titleHighlight: getFormValue(
      formData,
      "videoSection-titleHighlight",
      original.videoSection.titleHighlight,
    ),
    subtitle: getFormValue(
      formData,
      "videoSection-subtitle",
      original.videoSection.subtitle,
    ),
    ctaText: getFormValue(
      formData,
      "videoSection-ctaText",
      original.videoSection.ctaText,
    ),
    ctaLink: getFormValue(
      formData,
      "videoSection-ctaLink",
      original.videoSection.ctaLink,
    ),
    videoUrl: getFormValue(
      formData,
      "videoSection-videoUrl",
      original.videoSection.videoUrl,
    ),
    fallbackImageUrl: getFormValue(
      formData,
      "imageUrl-videoSection-fallback",
      original.videoSection.fallbackImageUrl,
    ),
    fallbackImageHint: getFormValue(
      formData,
      "imageHint-videoSection-fallback",
      original.videoSection.fallbackImageHint,
    ),
    videoEnabled: getFormBoolean(
      formData,
      "videoSection-videoEnabled",
      original.videoSection.videoEnabled ?? false,
    ),
    videoStartTime: getFormNumber(
      formData,
      "videoSection-videoStartTime",
      original.videoSection.videoStartTime || 0,
    ),
    videoEndTime: getFormNumber(
      formData,
      "videoSection-videoEndTime",
      original.videoSection.videoEndTime || 0,
    ),
  };
}

function updateIconHighlights(
  data: HomepageContent,
  original: HomepageContent,
  formData: FormData,
) {
  if (!formData.has("icon-0-name")) return;
  data.iconHighlights = {
    items: original.iconHighlights.items.map((item, i) => ({
      ...item,
      name: getFormValue(formData, `icon-${i}-name`, item.name),
      link: getFormValue(formData, `icon-${i}-link`, item.link),
      imageUrl: getFormValue(
        formData,
        `imageUrl-icon-${item.id}`,
        item.imageUrl,
      ),
      imageHint: getFormValue(
        formData,
        `imageHint-icon-${item.id}`,
        item.imageHint,
      ),
    })),
    showText: getFormBoolean(
      formData,
      "iconHighlights-showText",
      original.iconHighlights.showText ?? true,
    ),
  };
}

function updateHeroSlider(data: HomepageContent, formData: FormData) {
  const raw = formData.get("heroSliderItems") as string;
  if (!raw) return;
  const clientSlides: HeroSliderItem[] = JSON.parse(raw);
  data.heroSlider.items = clientSlides.map((item) => {
    const finalId = item.id.startsWith("new-")
      ? `slide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      : item.id;
    return {
      id: finalId,
      title: getFormValue(formData, `heroSlider-${item.id}-title`, item.title),
      subtitle: getFormValue(
        formData,
        `heroSlider-${item.id}-subtitle`,
        item.subtitle,
      ),
      ctaText: getFormValue(
        formData,
        `heroSlider-${item.id}-ctaText`,
        item.ctaText,
      ),
      ctaLink: getFormValue(
        formData,
        `heroSlider-${item.id}-ctaLink`,
        item.ctaLink,
      ),
      imageUrl: getFormValue(
        formData,
        `imageUrl-heroSlider-${item.id}`,
        item.imageUrl,
      ),
      imageHint: getFormValue(
        formData,
        `imageHint-heroSlider-${item.id}`,
        item.imageHint,
      ),
    };
  });
}

function updateImageSlider(
  data: HomepageContent,
  original: HomepageContent,
  formData: FormData,
) {
  const raw = formData.get("imageSliderItems") as string;
  if (!raw) return;
  data.imageSlider.eyebrow = getFormValue(
    formData,
    "imageSlider-eyebrow",
    original.imageSlider.eyebrow,
  );
  data.imageSlider.title = getFormValue(
    formData,
    "imageSlider-title",
    original.imageSlider.title,
  );
  data.imageSlider.ctaText = getFormValue(
    formData,
    "imageSlider-ctaText",
    original.imageSlider.ctaText,
  );
  data.imageSlider.ctaLink = getFormValue(
    formData,
    "imageSlider-ctaLink",
    original.imageSlider.ctaLink,
  );
  const clientItems: ImageSliderItem[] = JSON.parse(raw);
  data.imageSlider.items = clientItems.map((item) => {
    const finalId = item.id.startsWith("new-")
      ? `image-slider-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      : item.id;
    return {
      id: finalId,
      imageUrl: getFormValue(
        formData,
        `imageUrl-imageSlider-${item.id}`,
        item.imageUrl,
      ),
      imageHint: getFormValue(
        formData,
        `imageHint-imageSlider-${item.id}`,
        item.imageHint,
      ),
      link: "#",
    };
  });
}

function updatePromoBanners(data: HomepageContent, formData: FormData) {
  const raw = formData.get("promoBanners") as string;
  if (!raw) return;
  const clientBanners: PromoBannerItem[] = JSON.parse(raw);
  data.promoBanners.items = clientBanners.map((item, i) => ({
    ...item,
    title: getFormValue(formData, `promo-${i}-title`, item.title),
    subtitle: getFormValue(formData, `promo-${i}-subtitle`, item.subtitle),
    code: getFormValue(formData, `promo-${i}-code`, item.code),
    ctaText: getFormValue(formData, `promo-${i}-ctaText`, item.ctaText),
    ctaLink: getFormValue(formData, `promo-${i}-ctaLink`, item.ctaLink),
  }));
}

function updateProductCarousels(
  data: HomepageContent,
  original: HomepageContent,
  formData: FormData,
) {
  if (formData.has("newest-title")) {
    data.newestProducts.title = getFormValue(
      formData,
      "newest-title",
      original.newestProducts.title,
    );
    data.newestProducts.categoryId = getFormValue(
      formData,
      "newest-categoryId",
      original.newestProducts.categoryId,
    );
  }
  if (formData.has("bestsellers-title")) {
    data.bestSellers.title = getFormValue(
      formData,
      "bestsellers-title",
      original.bestSellers.title,
    );
    data.bestSellers.categoryId = getFormValue(
      formData,
      "bestsellers-categoryId",
      original.bestSellers.categoryId,
    );
  }
}

function updateImageBanners(
  data: HomepageContent,
  original: HomepageContent,
  formData: FormData,
) {
  if (formData.has("banner1-title")) {
    data.imageBanner1 = {
      ...data.imageBanner1,
      title: getFormValue(
        formData,
        "banner1-title",
        original.imageBanner1.title,
      ),
      subtitle: getFormValue(
        formData,
        "banner1-subtitle",
        original.imageBanner1.subtitle,
      ),
      ctaText: getFormValue(
        formData,
        "banner1-ctaText",
        original.imageBanner1.ctaText,
      ),
      ctaLink: getFormValue(
        formData,
        "banner1-ctaLink",
        original.imageBanner1.ctaLink,
      ),
      imageUrl: getFormValue(
        formData,
        "imageUrl-banner-diamonds",
        original.imageBanner1.imageUrl,
      ),
      imageHint: getFormValue(
        formData,
        "imageHint-banner-diamonds",
        original.imageBanner1.imageHint,
      ),
    };
  }
  if (formData.has("banner2-title")) {
    data.imageBanner2 = {
      ...data.imageBanner2,
      title: getFormValue(
        formData,
        "banner2-title",
        original.imageBanner2.title,
      ),
      subtitle: getFormValue(
        formData,
        "banner2-subtitle",
        original.imageBanner2.subtitle,
      ),
      ctaText: getFormValue(
        formData,
        "banner2-ctaText",
        original.imageBanner2.ctaText,
      ),
      ctaLink: getFormValue(
        formData,
        "banner2-ctaLink",
        original.imageBanner2.ctaLink,
      ),
      imageUrl: getFormValue(
        formData,
        "imageUrl-banner-gifting",
        original.imageBanner2.imageUrl,
      ),
      imageHint: getFormValue(
        formData,
        "imageHint-banner-gifting",
        original.imageBanner2.imageHint,
      ),
    };
  }
}

function updateShopByCategory(
  data: HomepageContent,
  original: HomepageContent,
  formData: FormData,
) {
  if (!formData.has("category-0-name")) return;
  data.shopByCategory.categories = original.shopByCategory.categories.map(
    (cat, i) => ({
      ...cat,
      name: getFormValue(formData, `category-${i}-name`, cat.name),
      link: getFormValue(formData, `category-${i}-link`, cat.link),
      imageUrl: getFormValue(
        formData,
        `imageUrl-category-${cat.id}`,
        cat.imageUrl,
      ),
      imageHint: getFormValue(
        formData,
        `imageHint-category-${cat.id}`,
        cat.imageHint,
      ),
    }),
  );
}

function updateTestimonials(
  data: HomepageContent,
  original: HomepageContent,
  formData: FormData,
) {
  if (!formData.has("testimonials-title")) return;
  data.testimonials.title = getFormValue(
    formData,
    "testimonials-title",
    original.testimonials.title,
  );
  data.testimonials.items = original.testimonials.items.map((item, i) => ({
    ...item,
    text: getFormValue(formData, `testimonial-${i}-text`, item.text),
    name: getFormValue(formData, `testimonial-${i}-name`, item.name),
    location: getFormValue(
      formData,
      `testimonial-${i}-location`,
      item.location,
    ),
    imageUrl: getFormValue(
      formData,
      `imageUrl-testimonial-${item.id}`,
      item.imageUrl,
    ),
    imageHint: getFormValue(
      formData,
      `imageHint-testimonial-${item.id}`,
      item.imageHint,
    ),
  }));
}

function updateJournal(
  data: HomepageContent,
  original: HomepageContent,
  formData: FormData,
) {
  if (!formData.has("journal-title")) return;
  data.journal.title = getFormValue(
    formData,
    "journal-title",
    original.journal.title,
  );
  data.journal.categoryId = getFormValue(
    formData,
    "journal-categoryId",
    original.journal.categoryId,
  );
  data.journal.entries = original.journal.entries.map((entry, i) => ({
    ...entry,
    title: getFormValue(formData, `journal-${i}-title`, entry.title),
    excerpt: getFormValue(formData, `journal-${i}-excerpt`, entry.excerpt),
    link: getFormValue(formData, `journal-${i}-link`, entry.link),
    imageUrl: getFormValue(
      formData,
      `imageUrl-journal-${entry.id}`,
      entry.imageUrl,
    ),
    imageHint: getFormValue(
      formData,
      `imageHint-journal-${entry.id}`,
      entry.imageHint,
    ),
  }));
}

async function updateContentInDB(
  collection: string,
  formData: FormData,
): Promise<AppearanceFormState> {
  await verifyAdmin();
  try {
    const originalContent = await readHomepageContent(collection);
    const updatedContent: HomepageContent = JSON.parse(
      JSON.stringify(originalContent),
    );

    updateLayout(updatedContent, formData);
    updateHero(updatedContent, originalContent, formData);
    updateVideoSection(updatedContent, originalContent, formData);
    updateIconHighlights(updatedContent, originalContent, formData);
    updateHeroSlider(updatedContent, formData);
    updateImageSlider(updatedContent, originalContent, formData);
    updatePromoBanners(updatedContent, formData);
    updateProductCarousels(updatedContent, originalContent, formData);
    updateImageBanners(updatedContent, originalContent, formData);
    updateShopByCategory(updatedContent, originalContent, formData);
    updateTestimonials(updatedContent, originalContent, formData);
    updateJournal(updatedContent, originalContent, formData);

    const validationResult = homepageContentSchema.safeParse(updatedContent);
    if (!validationResult.success) {
      console.error(
        "Validation Error:",
        validationResult.error.flatten().fieldErrors,
      );
      return {
        message:
          "Failed to save. Please check all fields for valid URLs and required content.",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    await writeHomepageContent(
      collection,
      validationResult.data as HomepageContent,
    );
    revalidatePath("/", "layout");
    return { message: "Homepage content updated successfully!" };
  } catch (error) {
    console.error("Failed to save appearance settings:", error);
    return { message: "An unexpected error occurred while saving." };
  }
}

export async function saveAppearanceAction(
  prevState: AppearanceFormState,
  formData: FormData,
): Promise<AppearanceFormState> {
  return updateContentInDB("homepageContent", formData);
}

export async function saveMobileAppearanceAction(
  prevState: AppearanceFormState,
  formData: FormData,
): Promise<AppearanceFormState> {
  return updateContentInDB("mobileHomepageContent", formData);
}

export async function setHomepageEnabled(
  isEnabled: boolean,
): Promise<{ success: boolean; message: string }> {
  await verifyAdmin();
  try {
    const [desktopContent, mobileContent] = await Promise.all([
      readHomepageContent("homepageContent"),
      readHomepageContent("mobileHomepageContent"),
    ]);
    desktopContent.isEnabled = isEnabled;
    mobileContent.isEnabled = isEnabled;
    await Promise.all([
      writeHomepageContent("homepageContent", desktopContent),
      writeHomepageContent("mobileHomepageContent", mobileContent),
    ]);
    revalidatePath("/", "layout");
    return {
      success: true,
      message: `Homepage has been ${isEnabled ? "enabled" : "disabled"}.`,
    };
  } catch (error) {
    console.error("Failed to update homepage status:", error);
    return {
      success: false,
      message: "An error occurred while updating homepage status.",
    };
  }
}

export async function saveHomepageThemeSelection(
  prevState: any,
  formData: FormData,
): Promise<{ message: string }> {
  await verifyAdmin();
  const theme = formData.get("theme") as string;
  if (!theme) return { message: "No theme selected." };
  try {
    const currentSettings = await getThemeSettings();
    await saveThemeSettings({ ...currentSettings, activeHomepageTheme: theme });
    revalidatePath("/", "layout");
    revalidatePath("/admin/appearance/themes");
    return { message: "Active homepage theme updated successfully!" };
  } catch (error) {
    return { message: "Failed to save theme settings." };
  }
}
