// Plain JavaScript migration script — no TypeScript, no ts-node needed.
// Run with: node scripts/migrate-to-mongodb.mjs

import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8").replace(/\r/g, "");
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const uri = process.env.MONGO_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "jewellery_store";
const DATA_DIR = path.join(ROOT, "src", "lib", "server", "data");
const BLOG_POSTS_DIR = path.join(ROOT, "src", "lib", "blog", "posts");

if (!uri) {
  console.error("❌  MONGO_URI is not set in .env");
  process.exit(1);
}

const ARRAY_FILES = [
  { file: "products.json", collection: "products" },
  { file: "categories.json", collection: "categories" },
  { file: "metals.json", collection: "metals" },
  { file: "purities.json", collection: "purities" },
  { file: "tax-classes.json", collection: "taxClasses" },
  { file: "users.json", collection: "users" },
  { file: "customers.json", collection: "customers" },
  { file: "orders.json", collection: "orders" },
  { file: "reviews.json", collection: "reviews" },
  { file: "discounts.json", collection: "discounts" },
  { file: "roles.json", collection: "roles" },
  { file: "menus.json", collection: "menus" },
  { file: "media-library.json", collection: "mediaLibrary" },
  { file: "history.json", collection: "history" },
  { file: "gift-messages.json", collection: "giftMessages" },
  { file: "password-reset-tokens.json", collection: "passwordResetTokens" },
];

const SINGLETON_FILES = [
  { file: "settings.json", collection: "settings" },
  { file: "site-theme-settings.json", collection: "themeSettings" },
  { file: "footer-content.json", collection: "footerContent" },
  { file: "mobile-footer-content.json", collection: "mobileFooterContent" },
  { file: "social-proof.json", collection: "socialProof" },
  { file: "developer-settings.json", collection: "developerSettings" },
];

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function migrateArrayFile(client, file, collectionName) {
  const data = readJson(path.join(DATA_DIR, file));
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log(`  ⚠  Skipped ${file} (empty or not found)`);
    return;
  }
  const col = client.db(DB_NAME).collection(collectionName);
  await col.deleteMany({});
  await col.insertMany(data);
  console.log(`  ✓  ${collectionName}: ${data.length} documents`);
}

async function migrateSingletonFile(client, file, collectionName) {
  const raw = readJson(path.join(DATA_DIR, file));
  if (!raw) {
    console.log(`  ⚠  Skipped ${file} (not found)`);
    return;
  }
  const data = Array.isArray(raw) ? raw[0] : raw;
  if (!data) {
    console.log(`  ⚠  Skipped ${file} (empty)`);
    return;
  }
  const col = client.db(DB_NAME).collection(collectionName);
  await col.deleteMany({});
  await col.insertOne({ ...data, _docType: "singleton" });
  console.log(`  ✓  ${collectionName}: 1 singleton document`);
}

async function migrateBlogPosts(client) {
  if (!fs.existsSync(BLOG_POSTS_DIR)) {
    console.log("  ⚠  Blog posts directory not found");
    return;
  }
  const files = fs
    .readdirSync(BLOG_POSTS_DIR)
    .filter((f) => f.endsWith(".json"));
  if (!files.length) {
    console.log("  ⚠  No blog posts found");
    return;
  }
  const posts = files
    .map((f) => readJson(path.join(BLOG_POSTS_DIR, f)))
    .filter(Boolean);
  const col = client.db(DB_NAME).collection("blogPosts");
  await col.deleteMany({});
  await col.insertMany(posts);
  console.log(`  ✓  blogPosts: ${posts.length} documents`);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  console.log(`\n🔗  Connected to MongoDB Atlas — database: "${DB_NAME}"\n`);
  console.log("📦  Migrating array collections...");
  for (const { file, collection } of ARRAY_FILES)
    await migrateArrayFile(client, file, collection);
  console.log("\n⚙️   Migrating singleton collections...");
  for (const { file, collection } of SINGLETON_FILES)
    await migrateSingletonFile(client, file, collection);
  console.log("\n📝  Migrating blog posts...");
  await migrateBlogPosts(client);
  console.log("\n🎉  Migration complete!\n");
} catch (err) {
  console.error("\n❌  Migration failed:", err);
  process.exit(1);
} finally {
  await client.close();
}
