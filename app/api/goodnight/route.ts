import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST() {
  const db = getSupabaseAdmin();
  const { data: roster } = await db.from('roster_periods').select('id').eq('is_active', true).single();
  if (!roster) return NextResponse.json({ error: 'No active roster' }, { status: 404 });
  const today = new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { data: capsule } = await db.from('daily_capsules').select('day_number')
    .eq('roster_period_id', roster.id).eq('unlock_date', today).single();
  const { data, error } = await db.from('goodnight_pings')
    .insert({ roster_period_id: roster.id, day_number: capsule?.day_number || null, pinged_at: new Date().toISOString() })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
