import { NextResponse } from 'next/server';

// CRITICAL: force-dynamic prevents Next.js from pre-rendering this as a static route at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  // Brisbane/QLD is always UTC+10 (no daylight saving)
  const aestOffset = 10 * 60 * 60 * 1000;
  const aestDate = new Date(now.getTime() + aestOffset);
  const dateStr = aestDate.toISOString().split('T')[0];

  return NextResponse.json({
    utc: now.toISOString(),
    aest: aestDate.toISOString().replace('Z', ''),
    date: dateStr,
    hour: aestDate.getUTCHours(),
    minute: aestDate.getUTCMinutes(),
  });
}
