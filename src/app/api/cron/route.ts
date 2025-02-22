import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('Cron job executed at:', new Date().toISOString());

  return NextResponse.json({ ok: true });
}
