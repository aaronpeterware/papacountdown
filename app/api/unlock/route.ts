import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const db = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const dayNumber = searchParams.get('day');
  if (!dayNumber) return NextResponse.json({ error: 'day param required' }, { status: 400 });

  const now = new Date();
  const today = new Date(now.getTime() + 10 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { data: roster } = await db.from('roster_periods').select('id').eq('is_active', true).single();
  if (!roster) return NextResponse.json({ unlocked: false });

  const { data: capsule } = await db.from('daily_capsules')
    .select('unlock_date').eq('roster_period_id', roster.id).eq('day_number', parseInt(dayNumber)).single();

  if (!capsule) return NextResponse.json({ unlocked: false });
  return NextResponse.json({ unlocked: capsule.unlock_date <= today, today, unlock_date: capsule.unlock_date });
}
