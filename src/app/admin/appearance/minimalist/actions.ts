"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { MinimalistHomepageContent } from "@/lib/types";
import { getMongoDB } from "@/lib/server/mongodb";

async function getMinimalistHomepageContent(): Promise<MinimalistHomepageContent> {
  const db = await getMongoDB();
  const doc = await db
    .collection("minimalistHomepageContent")
    .findOne({ _docType: "singleton" });
  if (!doc)
    throw new Error("Minimalist homepage content not found in database");
  const { _id, _docType, ...rest } = doc;
  return rest as MinimalistHomepageContent;
}

async function getMobileMinimalistHomepageContent(): Promise<MinimalistHomepageContent> {
  const db = await getMongoDB();
  const doc = await db
    .collection("mobileMinimalistHomepageContent")
    .findOne({ _docType: "singleton" });
  if (!doc) return getMinimalistHomepageContent(); // fallback to desktop
  const { _id, _docType, ...rest } = doc;
  return rest as MinimalistHomepageContent;
}

async function saveMinimalistHomepageContent(
  content: MinimalistHomepageContent,
): Promise<void> {
  const db = await getMongoDB();
  await db
    .collection("minimalistHomepageContent")
    .replaceOne(
      { _docType: "singleton" },
      { ...content, _docType: "singleton" },
      { upsert: true },
    );
}

async function saveMobileMinimalistHomepageContent(
  content: MinimalistHomepageContent,
): Promise<void> {
  const db = await getMongoDB();
  await db
    .collection("mobileMinimalistHomepageContent")
    .replaceOne(
      { _docType: "singleton" },
      { ...content, _docType: "singleton" },
      { upsert: true },
    );
}

export type MinimalistFormState = {
  message: string;
  errors?: { [key: string]: any };
};

async function handleSave(
  formData: FormData,
  isMobile: boolean,
): Promise<MinimalistFormState> {
  try {
    const originalContent = isMobile
      ? await getMobileMinimalistHomepageContent()
      : await getMinimalistHomepageContent();

    const updatedContent: MinimalistHomepageContent = JSON.parse(
      JSON.stringify(originalContent),
    );
    const form = Object.fromEntries(formData.entries());

    const getArray = (key: string) => {
      try {
        const v = form[key] as string;
        return v ? JSON.parse(v) : [];
      } catch {
        return [];
      }
    };
    const getOptionalString = (key: string) =>
      (form[key] as string) === "null" ? null : (form[key] as string) || null;
    const getTextareaAsArray = (key: string): string[] => {
      const v = form[key] as string;
      if (!v) return [];
      return v
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean);
    };

    updatedContent.hero.enabled = form["hero-enabled"] === "on";
    updatedContent.hero.slides = getArray("hero-slides");

    updatedContent.diamond_interpretations.enabled =
      form["diamond_interpretations-enabled"] === "on";
    updatedContent.diamond_interpretations.title = form[
      "diamond_interpretations-title"
    ] as string;
    updatedContent.diamond_interpretations.cards = getArray(
      "diamond_interpretations-cards",
    );

    updatedContent.signature_collections.enabled =
      form["signature_collections-enabled"] === "on";
    updatedContent.signature_collections.title = form[
      "collections-title"
    ] as string;
    updatedContent.signature_collections.collections.primary = getArray(
      "collections-primary",
    )[0];
    updatedContent.signature_collections.collections.secondary = getArray(
      "collections-secondary",
    );

    updatedContent.category_grid_with_trending.enabled =
      form["category_grid_with_trending-enabled"] === "on";
    updatedContent.category_grid_with_trending.categories.title = form[
      "cat-grid-title"
    ] as string;
    updatedContent.category_grid_with_trending.categories.items =
      getArray("cat-grid-items");
    updatedContent.category_grid_with_trending.trending.title = form[
      "cat-trending-title"
    ] as string;
    updatedContent.category_grid_with_trending.trending.items =
      getArray("cat-trending-items");

    updatedContent.world_of_brand.enabled =
      form["world_of_brand-enabled"] === "on";
    updatedContent.world_of_brand.title = form["world-title"] as string;
    updatedContent.world_of_brand.items = getArray("world-items");

    updatedContent.newestProducts.enabled =
      form["newestProducts-enabled"] === "on";
    updatedContent.newestProducts.title = form[
      "newestProducts-title"
    ] as string;
    updatedContent.newestProducts.categoryId = getOptionalString(
      "newestProducts-categoryId",
    );

    updatedContent.bestSellers.enabled = form["bestSellers-enabled"] === "on";
    updatedContent.bestSellers.title = form["bestSellers-title"] as string;
    updatedContent.bestSellers.categoryId = getOptionalString(
      "bestSellers-categoryId",
    );

    updatedContent.imageSlider.enabled = form["imageSlider-enabled"] === "on";
    updatedContent.imageSlider.eyebrow = form["imageSlider-eyebrow"] as string;
    updatedContent.imageSlider.title = form["imageSlider-title"] as string;
    updatedContent.imageSlider.ctaText = form["imageSlider-ctaText"] as string;
    updatedContent.imageSlider.ctaLink = form["imageSlider-ctaLink"] as string;
    updatedContent.imageSlider.items = getArray("imageSlider-items");

    updatedContent.splitBanner.enabled = form["splitBanner-enabled"] === "on";
    updatedContent.splitBanner.banners = getArray("splitBanner-banners");

    updatedContent.textHighlights.enabled =
      form["textHighlights-enabled"] === "on";
    updatedContent.textHighlights.items = getArray("textHighlights-items");

    updatedContent.imageGrid.enabled = form["imageGrid-enabled"] === "on";
    updatedContent.imageGrid.items = getArray("imageGrid-items");

    updatedContent.instagram.enabled = form["instagram-enabled"] === "on";
    updatedContent.instagram.handle = form["instagram-handle"] as string;
    updatedContent.instagram.postImageUrls = getTextareaAsArray(
      "instagram-postImageUrls",
    );

    updatedContent.testimonials.enabled = form["testimonials-enabled"] === "on";
    updatedContent.testimonials.title = form["testimonials-title"] as string;
    updatedContent.testimonials.items = getArray("testimonials-items");

    updatedContent.assurance_and_exchange.enabled =
      form["assurance_and_exchange-enabled"] === "on";
    updatedContent.assurance_and_exchange.assurance.title = form[
      "assurance-title"
    ] as string;
    updatedContent.assurance_and_exchange.assurance.items =
      getArray("assurance-items");
    updatedContent.assurance_and_exchange.exchange.title = form[
      "exchange-title"
    ] as string;
    updatedContent.assurance_and_exchange.exchange.subtitle = form[
      "exchange-subtitle"
    ] as string;
    updatedContent.assurance_and_exchange.exchange.image = form[
      "exchange-image"
    ] as string;
    updatedContent.assurance_and_exchange.exchange.cta.label = form[
      "exchange-cta-label"
    ] as string;
    updatedContent.assurance_and_exchange.exchange.cta.href = form[
      "exchange-cta-href"
    ] as string;

    updatedContent.journal.enabled = form["journal-enabled"] === "on";
    updatedContent.journal.title = form["journal-title"] as string;
    updatedContent.journal.categoryId = getOptionalString("journal-categoryId");

    updatedContent.gifts_and_experiences.enabled =
      form["gifts_and_experiences-enabled"] === "on";
    updatedContent.gifts_and_experiences.gift.title = form[
      "gift-title"
    ] as string;
    updatedContent.gifts_and_experiences.gift.subtitle = form[
      "gift-subtitle"
    ] as string;
    updatedContent.gifts_and_experiences.gift.image = form[
      "gift-image"
    ] as string;
    updatedContent.gifts_and_experiences.gift.cta.label = form[
      "gift-cta-label"
    ] as string;
    updatedContent.gifts_and_experiences.gift.cta.href = form[
      "gift-cta-href"
    ] as string;
    updatedContent.gifts_and_experiences.experiences.title = form[
      "experiences-title"
    ] as string;
    updatedContent.gifts_and_experiences.experiences.items =
      getArray("experiences-items");

    if (isMobile) {
      await saveMobileMinimalistHomepageContent(updatedContent);
    } else {
      await saveMinimalistHomepageContent(updatedContent);
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/appearance/minimalist");
    return {
      message: `Minimalist ${isMobile ? "mobile" : "desktop"} content updated successfully!`,
    };
  } catch (error) {
    console.error(
      `Failed to save minimalist ${isMobile ? "mobile" : "desktop"} settings:`,
      error,
    );
    return { message: "An unexpected error occurred while saving." };
  }
}

export async function saveMinimalistHomepageAction(
  prevState: MinimalistFormState,
  formData: FormData,
): Promise<MinimalistFormState> {
  return handleSave(formData, false);
}

export async function saveMobileMinimalistHomepageAction(
  prevState: MinimalistFormState,
  formData: FormData,
): Promise<MinimalistFormState> {
  return handleSave(formData, true);
}
