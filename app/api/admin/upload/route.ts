import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const bucket = (formData.get('bucket') as string) || 'bedtime-stories';
  const path = formData.get('path') as string;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const filePath = path || `uploads/${Date.now()}-${file.name}`;

  const { data, error } = await db.storage.from(bucket).upload(filePath, Buffer.from(bytes), { contentType: file.type, upsert: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = db.storage.from(bucket).getPublicUrl(data.path);
  return NextResponse.json({ url: publicUrl, path: data.path });
}
