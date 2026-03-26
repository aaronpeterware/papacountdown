import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getSupabaseAdmin();
  const { data: roster } = await db.from('roster_periods').select('id').eq('is_active', true).single();
  if (!roster) return NextResponse.json([]);
  const { data } = await db.from('leo_journal_entries').select('*').eq('roster_period_id', roster.id).order('created_at', { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  const body = await req.json();
  const { data: roster } = await db.from('roster_periods').select('id').eq('is_active', true).single();
  if (!roster) return NextResponse.json({ error: 'No active roster' }, { status: 404 });
  const today = new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { data, error } = await db.from('leo_journal_entries')
    .insert({ ...body, roster_period_id: roster.id, entry_date: today }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
