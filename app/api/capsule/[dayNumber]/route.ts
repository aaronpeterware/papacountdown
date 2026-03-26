import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { dayNumber: string } }) {
  const db = getSupabaseAdmin();
  const { data: roster } = await db.from('roster_periods').select('id').eq('is_active', true).single();
  if (!roster) return NextResponse.json({ error: 'No active roster' }, { status: 404 });

  const { data: capsule, error } = await db.from('daily_capsules')
    .select('*').eq('roster_period_id', roster.id).eq('day_number', parseInt(params.dayNumber)).single();

  if (error || !capsule) return NextResponse.json({ error: 'Capsule not found' }, { status: 404 });
  return NextResponse.json(capsule);
}

export async function PATCH(req: Request, { params }: { params: { dayNumber: string } }) {
  const db = getSupabaseAdmin();
  const body = await req.json();
  const { data: roster } = await db.from('roster_periods').select('id').eq('is_active', true).single();
  if (!roster) return NextResponse.json({ error: 'No active roster' }, { status: 404 });

  const { data, error } = await db.from('daily_capsules')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('roster_period_id', roster.id).eq('day_number', parseInt(params.dayNumber))
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
