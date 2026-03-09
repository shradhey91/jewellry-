
import { NextResponse } from 'next/server';
import { getSocialProofSettings, getProductsByIds } from '@/lib/server/api';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const settings = await getSocialProofSettings();
    
    // Ensure productIds is an array before fetching
    const productIds = Array.isArray(settings.productIds) ? settings.productIds : [];
    const products = await getProductsByIds(productIds);
    
    return NextResponse.json({
      settings,
      products,
    });
  } catch (error) {
    console.error("API Error fetching social proof data:", error);
    return NextResponse.json({ error: 'Failed to fetch social proof data' }, { status: 500 });
  }
}
