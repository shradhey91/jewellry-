import { getMongoDB } from "./mongodb";
import type {
  Product,
  Metal,
  Purity,
  TaxClass,
  Category,
  Menu,
  ChangeHistory,
  Customer,
  User,
  ProductReview,
  Order,
  BlogPost,
  Discount,
  Role,
} from "@/lib/types";

interface PasswordResetToken {
  userId: string;
  token: string;
  expiresAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getCollection<T>(collectionName: string): Promise<T[]> {
  const db = await getMongoDB();
  const docs = await db.collection(collectionName).find({}).toArray();
  return docs.map(({ _id, ...rest }) => rest as T);
}

async function getSingleDoc<T>(collectionName: string): Promise<T> {
  const db = await getMongoDB();
  const doc = await db
    .collection(collectionName)
    .findOne({ _docType: "singleton" });
  if (!doc) return {} as T;
  const { _id, _docType, ...rest } = doc;
  return rest as T;
}

async function replaceCollection<T>(
  collectionName: string,
  items: T[],
): Promise<void> {
  const db = await getMongoDB();
  const col = db.collection(collectionName);
  await col.deleteMany({});
  if (items.length > 0) {
    await col.insertMany(items.map((item) => ({ ...(item as any) })));
  }
}

async function replaceSingleDoc(
  collectionName: string,
  data: any,
): Promise<void> {
  const db = await getMongoDB();
  await db
    .collection(collectionName)
    .replaceOne(
      { _docType: "singleton" },
      { ...data, _docType: "singleton" },
      { upsert: true },
    );
}

// ---------------------------------------------------------------------------
// Database class — identical public interface to original file-based version
// ---------------------------------------------------------------------------

class Database {
  products: Omit<
    Product,
    "price_breakup" | "display_price" | "availability"
  >[] = [];
  metals: Metal[] = [];
  purities: Purity[] = [];
  taxClasses: TaxClass[] = [];
  categories: Category[] = [];
  menus: Menu[] = [];
  history: ChangeHistory[] = [];
  users: User[] = [];
  roles: Role[] = [];
  reviews: ProductReview[] = [];
  orders: Order[] = [];
  posts: BlogPost[] = [];
  discounts: Discount[] = [];
  settings: any = {};
  themeSettings: any = {};
  mediaLibrary: any[] = [];
  socialProofSettings: any = {};
  footerContent: any = {};
  mobileFooterContent: any = {};
  developerSettings: any = {};
  tempOtps: any[] = [];
  giftMessages: any[] = [];
  passwordResetTokens: PasswordResetToken[] = [];

  async initialize() {
    [
      this.products,
      this.metals,
      this.purities,
      this.taxClasses,
      this.categories,
      this.menus,
      this.history,
      this.users,
      this.roles,
      this.reviews,
      this.orders,
      this.posts,
      this.discounts,
      this.mediaLibrary,
      this.tempOtps,
      this.giftMessages,
      this.passwordResetTokens,
      this.settings,
      this.themeSettings,
      this.socialProofSettings,
      this.footerContent,
      this.mobileFooterContent,
      this.developerSettings,
    ] = await Promise.all([
      getCollection<
        Omit<Product, "price_breakup" | "display_price" | "availability">
      >("products"),
      getCollection<Metal>("metals"),
      getCollection<Purity>("purities"),
      getCollection<TaxClass>("taxClasses"),
      getCollection<Category>("categories"),
      getCollection<Menu>("menus"),
      getCollection<ChangeHistory>("history"),
      getCollection<User>("users"),
      getCollection<Role>("roles"),
      getCollection<ProductReview>("reviews"),
      getCollection<Order>("orders"),
      getCollection<BlogPost>("blogPosts"),
      getCollection<Discount>("discounts"),
      getCollection<any>("mediaLibrary"),
      getCollection<any>("tempOtps"),
      getCollection<any>("giftMessages"),
      getCollection<PasswordResetToken>("passwordResetTokens"),
      getSingleDoc<any>("settings"),
      getSingleDoc<any>("themeSettings"),
      getSingleDoc<any>("socialProof"),
      getSingleDoc<any>("footerContent"),
      getSingleDoc<any>("mobileFooterContent"),
      getSingleDoc<any>("developerSettings"),
    ]);

    // Apply defaults for singletons that may not exist yet in MongoDB
    if (!this.themeSettings || Object.keys(this.themeSettings).length === 0) {
      this.themeSettings = {
        activeProductTheme: "default",
        activeHomepageTheme: "default",
      };
    }
    if (
      !this.developerSettings ||
      Object.keys(this.developerSettings).length === 0
    ) {
      this.developerSettings = { show_otp_in_admin: false };
    }
  }

  // --- Collection save methods ---
  saveProducts = () => replaceCollection("products", this.products);
  saveMetals = () => replaceCollection("metals", this.metals);
  savePurities = () => replaceCollection("purities", this.purities);
  saveTaxClasses = () => replaceCollection("taxClasses", this.taxClasses);
  saveCategories = () => replaceCollection("categories", this.categories);
  saveMenus = () => replaceCollection("menus", this.menus);
  saveHistory = () => replaceCollection("history", this.history);
  saveUsers = () => replaceCollection("users", this.users);
  saveRoles = () => replaceCollection("roles", this.roles);
  saveReviews = () => replaceCollection("reviews", this.reviews);
  saveOrders = () => replaceCollection("orders", this.orders);
  saveDiscounts = () => replaceCollection("discounts", this.discounts);
  savePosts = () => replaceCollection("blogPosts", this.posts);
  savePasswordResetTokens = () =>
    replaceCollection("passwordResetTokens", this.passwordResetTokens);
  saveGiftMessages = () => replaceCollection("giftMessages", this.giftMessages);
  saveTempOtps = () => replaceCollection("tempOtps", this.tempOtps);
  saveMediaLibrary = () => replaceCollection("mediaLibrary", this.mediaLibrary);

  // --- Singleton save methods ---
  saveSettings = () => replaceSingleDoc("settings", this.settings);
  saveThemeSettings = () =>
    replaceSingleDoc("themeSettings", this.themeSettings);
  saveSocialProofSettings = () =>
    replaceSingleDoc("socialProof", this.socialProofSettings);
  saveFooterContent = () =>
    replaceSingleDoc("footerContent", this.footerContent);
  saveMobileFooterContent = () =>
    replaceSingleDoc("mobileFooterContent", this.mobileFooterContent);
  saveDeveloperSettings = () =>
    replaceSingleDoc("developerSettings", this.developerSettings);

  async logChange(
    entity_type: ChangeHistory["entity_type"],
    entity_id: string,
    entity_name: string,
    action: ChangeHistory["action"],
    user: string = "admin@aparra.com",
  ) {
    const newHistoryEntry: ChangeHistory = {
      id: `hist-${Date.now()}`,
      entity_type,
      entity_id,
      entity_name,
      action,
      user,
      timestamp: new Date().toISOString(),
    };
    this.history.unshift(newHistoryEntry);
    await this.saveHistory();
  }
}

export const db = new Database();
