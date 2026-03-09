import type { HomepageContent } from "./types";
import { getMongoDB } from "./server/mongodb";

const defaultContent: HomepageContent = {
  hero: {
    title: "",
    titleHighlight: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    videoUrl: "",
    fallbackImageUrl: "",
  },
  iconHighlights: { items: [] },
  newestProducts: { title: "" },
  bestSellers: { title: "" },
  imageBanner1: {
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    imageUrl: "",
    imageHint: "",
  },
  imageBanner2: {
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    imageUrl: "",
    imageHint: "",
  },
  shopByCategory: { categories: [] },
  testimonials: { title: "", items: [] },
  journal: { title: "", entries: [] },
};

async function getDoc(collection: string): Promise<any> {
  const db = await getMongoDB();
  const doc = await db
    .collection(collection)
    .findOne({ _docType: "singleton" });
  if (!doc) return null;
  const { _id, _docType, ...rest } = doc;
  return rest;
}

async function saveDoc(collection: string, data: any): Promise<void> {
  const db = await getMongoDB();
  await db
    .collection(collection)
    .replaceOne(
      { _docType: "singleton" },
      { ...data, _docType: "singleton" },
      { upsert: true },
    );
}

export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const data = await getDoc("homepageContent");
    return data || defaultContent;
  } catch (error) {
    console.error("Could not read homepage content:", error);
    return defaultContent;
  }
}

export async function saveHomepageContent(
  content: HomepageContent,
): Promise<void> {
  await saveDoc("homepageContent", content);
}

export async function getMobileHomepageContent(): Promise<HomepageContent> {
  try {
    const data = await getDoc("mobileHomepageContent");
    return data || defaultContent;
  } catch (error) {
    console.error("Could not read mobile homepage content:", error);
    return defaultContent;
  }
}

export async function saveMobileHomepageContent(
  content: HomepageContent,
): Promise<void> {
  await saveDoc("mobileHomepageContent", content);
}
