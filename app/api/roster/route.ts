import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from('roster_periods').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  const body = await req.json();
  const { start_date, days_on = 14, days_off = 6 } = body;
  if (!start_date) return NextResponse.json({ error: 'start_date required' }, { status: 400 });

  await db.from('roster_periods').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');

  const startDate = new Date(start_date);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days_on - 1);

  const { data: roster, error: rosterError } = await db
    .from('roster_periods')
    .insert({ start_date, end_date: endDate.toISOString().split('T')[0], days_on, days_off, is_active: true })
    .select().single();

  if (rosterError) return NextResponse.json({ error: rosterError.message }, { status: 500 });

  const capsules = Array.from({ length: days_on }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return { roster_period_id: roster.id, day_number: i + 1, unlock_date: d.toISOString().split('T')[0] };
  });

  await db.from('daily_capsules').insert(capsules);
  return NextResponse.json(roster);
}
