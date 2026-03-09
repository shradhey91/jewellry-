
import { promises as fs } from 'fs';
import path from 'path';
import type { FooterContent } from './types';
import { db } from './server/db';


const defaultContent: FooterContent = {
  columns: [],
  contact: { email: "" },
  locations: [],
  socials: { facebook: "", instagram: "", twitter: "", youtube: "" },
  bottom: { copyright: "", links: [] }
};

export async function getFooterContent(): Promise<FooterContent> {
  await db.initialize();
  return db.footerContent || defaultContent;
}

export async function saveFooterContent(content: FooterContent): Promise<{ success: boolean }> {
  await db.initialize();
  db.footerContent = content;
  await db.saveFooterContent();
  return { success: true };
}

export async function getMobileFooterContent(): Promise<FooterContent> {
  await db.initialize();
  return db.mobileFooterContent || defaultContent;
}

export async function saveMobileFooterContent(content: FooterContent): Promise<{ success: boolean }> {
  await db.initialize();
  db.mobileFooterContent = content;
  await db.saveMobileFooterContent();
  return { success: true };
}
