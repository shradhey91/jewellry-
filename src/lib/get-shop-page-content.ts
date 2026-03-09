import type { ShopPageContent } from "./types";
import { getMongoDB } from "./server/mongodb";

const defaultContent: ShopPageContent = {
  hero: { title: "", subtitle: "", imageUrl: "", imageHint: "" },
  main: { title: "All Products", allProductsLinkText: "View All" },
  categories: [],
};

async function getDoc(): Promise<any> {
  const db = await getMongoDB();
  const doc = await db
    .collection("shopPageContent")
    .findOne({ _docType: "singleton" });
  if (!doc) return null;
  const { _id, _docType, ...rest } = doc;
  return rest;
}

export async function getShopPageContent(): Promise<ShopPageContent> {
  try {
    const data = await getDoc();
    return data || defaultContent;
  } catch (error) {
    console.error("Could not read shop page content:", error);
    return defaultContent;
  }
}

export async function saveShopPageContent(
  content: ShopPageContent,
): Promise<{ success: boolean }> {
  try {
    const db = await getMongoDB();
    await db
      .collection("shopPageContent")
      .replaceOne(
        { _docType: "singleton" },
        { ...content, _docType: "singleton" },
        { upsert: true },
      );
    return { success: true };
  } catch (error) {
    console.error("Could not save shop page content:", error);
    return { success: false };
  }
}
