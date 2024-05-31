// pages/api/hello_world.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import authOptions from '@/lib/authOptions';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await db.select().from(users);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
