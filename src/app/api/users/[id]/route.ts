// pages/api/hello_world.js
import { eq } from 'drizzle-orm/sql';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { db } from '@/lib/db';
import { users } from '@/lib/schema';

export async function DELETE(req: NextRequest, { params: { id } }: { params: { id: number } }) {
  try {
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await db.delete(users).where(eq(users.id, id)).returning();

    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
