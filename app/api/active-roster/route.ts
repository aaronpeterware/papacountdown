import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getSupabaseAdmin();
  const { data: roster, error: rosterError } = await db
    .from('roster_periods')
    .select('*')
    .eq('is_active', true)
    .single();

  if (rosterError || !roster) return NextResponse.json({ roster: null, capsules: [] });

  const { data: capsules } = await db
    .from('daily_capsules')
    .select('*')
    .eq('roster_period_id', roster.id)
    .order('day_number', { ascending: true });

  return NextResponse.json({ roster, capsules: capsules || [] });
}
