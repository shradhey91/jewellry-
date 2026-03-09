import type { DiamondGuideContent } from "./types";
import { getMongoDB } from "./server/mongodb";

const defaultContent: DiamondGuideContent = {
  hero: { eyebrow: "", title: "", subtitle: "", imageUrl: "", imageHint: "" },
  fourCs: { title: "", subtitle: "", items: [] },
  shapes: { title: "", subtitle: "", items: [] },
  anatomy: { title: "", subtitle: "", imageUrl: "", imageHint: "" },
  cta: { title: "", subtitle: "", ctaText: "", ctaLink: "" },
};

export async function getDiamondGuideContent(): Promise<DiamondGuideContent> {
  try {
    const db = await getMongoDB();
    const doc = await db
      .collection("diamondGuideContent")
      .findOne({ _docType: "singleton" });
    if (!doc) return defaultContent;
    const { _id, _docType, ...rest } = doc;
    return rest as DiamondGuideContent;
  } catch (error) {
    console.error("Could not read diamond guide content:", error);
    return defaultContent;
  }
}

export async function saveDiamondGuideContent(
  content: DiamondGuideContent,
): Promise<{ success: boolean }> {
  try {
    const db = await getMongoDB();
    await db
      .collection("diamondGuideContent")
      .replaceOne(
        { _docType: "singleton" },
        { ...content, _docType: "singleton" },
        { upsert: true },
      );
    return { success: true };
  } catch (error) {
    console.error("Could not save diamond guide content:", error);
    return { success: false };
  }
}
