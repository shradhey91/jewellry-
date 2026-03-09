import type { MinimalistHomepageContent, Product } from "./types";
import { getMongoDB } from "./server/mongodb";
import { getProducts, getProductsForCategory, getAllPosts } from "./server/api";

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

export async function getMinimalistHomepageContent(): Promise<MinimalistHomepageContent> {
  const data = await getDoc("minimalistHomepageContent");
  if (!data)
    throw new Error("Minimalist homepage content not found in database");
  return data;
}

export async function saveMinimalistHomepageContent(
  content: MinimalistHomepageContent,
): Promise<void> {
  await saveDoc("minimalistHomepageContent", content);
}

export async function getMobileMinimalistHomepageContent(): Promise<MinimalistHomepageContent> {
  try {
    const data = await getDoc("mobileMinimalistHomepageContent");
    if (!data) {
      // Fall back to desktop version if mobile version doesn't exist
      const desktopContent = await getMinimalistHomepageContent();
      await saveDoc("mobileMinimalistHomepageContent", desktopContent);
      return desktopContent;
    }
    return data;
  } catch (error) {
    console.error("Could not read mobile minimalist content:", error);
    return getMinimalistHomepageContent();
  }
}

export async function saveMobileMinimalistHomepageContent(
  content: MinimalistHomepageContent,
): Promise<void> {
  await saveDoc("mobileMinimalistHomepageContent", content);
}

interface MinimalistHomepageData {
  content: MinimalistHomepageContent;
  newestProducts: Product[];
  bestSellerProducts: Product[];
}

export async function getMinimalistHomepageData(): Promise<MinimalistHomepageData> {
  const [content, allProducts, allPosts] = await Promise.all([
    getMinimalistHomepageContent(),
    getProducts(),
    getAllPosts(),
  ]);

  const newestProducts = content.newestProducts?.categoryId
    ? await getProductsForCategory(content.newestProducts.categoryId)
    : allProducts.slice(0, 10);

  const bestSellerProducts = content.bestSellers?.categoryId
    ? await getProductsForCategory(content.bestSellers.categoryId)
    : allProducts
        .slice(0, 10)
        .sort((a, b) => b.display_price - a.display_price);

  if (content.journal?.enabled) {
    const publishedPosts = allPosts.filter(
      (p) =>
        p.status === "published" &&
        p.published_at &&
        new Date(p.published_at) <= new Date(),
    );
    const journalPosts = content.journal.categoryId
      ? publishedPosts.filter((p) =>
          p.category_ids.includes(content.journal.categoryId!),
        )
      : publishedPosts;

    content.journal.entries = journalPosts.slice(0, 3).map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      link: `/blog/${post.slug}`,
      imageUrl:
        post.featured_image_url ||
        "https://picsum.photos/seed/journal-fallback/400/300",
      imageHint: post.title,
    }));
  }

  return { content, newestProducts, bestSellerProducts };
}
