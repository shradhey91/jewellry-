
import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/server/api';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ site_logo_url: settings.site_logo_url || null });
  } catch (error) {
    console.error("API Error fetching settings:", error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
