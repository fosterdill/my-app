import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Cron job executed at:', new Date().toISOString());

  try {
    const response = await fetch('https://maker.ifttt.com/trigger/new_version/with/key/cw5gqWCxEnj1ptPpvbw-6S', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to trigger IFTTT webhook');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error triggering IFTTT webhook:', error);
    return NextResponse.json({ ok: false, error: 'Failed to trigger webhook' }, { status: 500 });
  }
}
