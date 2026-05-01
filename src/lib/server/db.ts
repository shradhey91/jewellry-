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

  // ---------------------------------------------------------------------------
  // Initialization guard — ensures we only hit MongoDB once per server process.
  // Previously, every api.ts function called db.initialize() which fired 23
  // parallel MongoDB queries on EVERY request. Now it loads once and is reused.
  // Call db.invalidate() after any write so the next read gets fresh data.
  // ---------------------------------------------------------------------------
  private _initialized = false;
  private _initPromise: Promise<void> | null = null;

  async initialize() {
    // Already loaded — return immediately, no DB round-trips
    if (this._initialized) return;

    // A load is already in progress (concurrent requests) — wait for it
    if (this._initPromise) {
      await this._initPromise;
      return;
    }

    // First request: kick off the load and cache the promise
    this._initPromise = this._doInitialize();
    await this._initPromise;
  }

  private async _doInitialize() {
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

    this._initialized = true;
    this._initPromise = null;
  }

  /**
   * Call this after any write operation so the next read reloads from MongoDB.
   * This ensures admin changes are reflected without restarting the server.
   */
  invalidate() {
    this._initialized = false;
    this._initPromise = null;
  }

  // --- Collection save methods ---
  saveProducts = async () => {
    await replaceCollection("products", this.products);
    this.invalidate();
  };
  saveMetals = async () => {
    await replaceCollection("metals", this.metals);
    this.invalidate();
  };
  savePurities = async () => {
    await replaceCollection("purities", this.purities);
    this.invalidate();
  };
  saveTaxClasses = async () => {
    await replaceCollection("taxClasses", this.taxClasses);
    this.invalidate();
  };
  saveCategories = async () => {
    await replaceCollection("categories", this.categories);
    this.invalidate();
  };
  saveMenus = async () => {
    await replaceCollection("menus", this.menus);
    this.invalidate();
  };
  saveHistory = async () => {
    await replaceCollection("history", this.history); // history writes are frequent, intentionally skip invalidate
  };
  saveUsers = async () => {
    await replaceCollection("users", this.users);
    this.invalidate();
  };
  saveRoles = async () => {
    await replaceCollection("roles", this.roles);
    this.invalidate();
  };
  saveReviews = async () => {
    await replaceCollection("reviews", this.reviews);
    this.invalidate();
  };
  saveOrders = async () => {
    await replaceCollection("orders", this.orders);
    this.invalidate();
  };
  saveDiscounts = async () => {
    await replaceCollection("discounts", this.discounts);
    this.invalidate();
  };
  savePosts = async () => {
    await replaceCollection("blogPosts", this.posts);
    this.invalidate();
  };
  savePasswordResetTokens = async () => {
    await replaceCollection("passwordResetTokens", this.passwordResetTokens);
  };
  saveGiftMessages = async () => {
    await replaceCollection("giftMessages", this.giftMessages);
  };
  saveTempOtps = async () => {
    await replaceCollection("tempOtps", this.tempOtps);
  };
  saveMediaLibrary = async () => {
    await replaceCollection("mediaLibrary", this.mediaLibrary);
    this.invalidate();
  };

  // --- Singleton save methods ---
  saveSettings = async () => {
    await replaceSingleDoc("settings", this.settings);
    this.invalidate();
  };
  saveThemeSettings = async () => {
    await replaceSingleDoc("themeSettings", this.themeSettings);
    this.invalidate();
  };
  saveSocialProofSettings = async () => {
    await replaceSingleDoc("socialProof", this.socialProofSettings);
    this.invalidate();
  };
  saveFooterContent = async () => {
    await replaceSingleDoc("footerContent", this.footerContent);
    this.invalidate();
  };
  saveMobileFooterContent = async () => {
    await replaceSingleDoc("mobileFooterContent", this.mobileFooterContent);
    this.invalidate();
  };
  saveDeveloperSettings = async () => {
    await replaceSingleDoc("developerSettings", this.developerSettings);
    this.invalidate();
  };

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
