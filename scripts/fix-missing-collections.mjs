// Migrates the 3 missing collections: customers, mediaLibrary, passwordResetTokens
// Run with: node scripts/fix-missing-collections.mjs

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  const altPath = path.join(ROOT, '.env');
  const p = fs.existsSync(envPath) ? envPath : altPath;
  if (!fs.existsSync(p)) return;
  const lines = fs.readFileSync(p, 'utf8').replace(/\r/g, '').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnv();

const uri = process.env.MONGO_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'jewellery_store';
const DATA_DIR = path.join(ROOT, 'src', 'lib', 'server', 'data');

if (!uri) {
  console.error('❌  MONGO_URI is not set');
  process.exit(1);
}

const MISSING = [
  { file: 'customers.json',              collection: 'customers' },
  { file: 'media-library.json',          collection: 'mediaLibrary' },
  { file: 'password-reset-tokens.json',  collection: 'passwordResetTokens' },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  console.log(`\n🔗  Connected — database: "${DB_NAME}"\n`);

  for (const { file, collection } of MISSING) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠  Skipped ${file} (not found)`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const col = client.db(DB_NAME).collection(collection);
    await col.deleteMany({});
    if (data.length > 0) {
      await col.insertMany(data);
    }
    console.log(`  ✓  ${collection}: ${data.length} documents`);
  }

  console.log('\n🎉  Done!\n');
} catch (err) {
  console.error('\n❌  Failed:', err);
  process.exit(1);
} finally {
  await client.close();
}
