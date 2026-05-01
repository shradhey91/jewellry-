import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';

export async function GET() {
  try {
    await db.initialize();
    const now = new Date();
    const activeDiscounts = db.discounts.filter(d => {
      if (!d.is_active) return false;
      if (d.start_date && new Date(d.start_date) > now) return false;
      if (d.end_date && new Date(d.end_date) < now) return false;
      if (d.usage_limit !== null && d.usage_count >= d.usage_limit) return false;
      return true;
    }).map(({ code, type, value, min_purchase, description, id }) => ({
      id, code, type, value, min_purchase, description,
    }));

    return NextResponse.json(activeDiscounts);
  } catch (error) {
    console.error('Failed to fetch active discounts:', error);
    return NextResponse.json([], { status: 500 });
  }
}
