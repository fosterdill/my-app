import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { db } from '@/lib/db';
import { notes } from '@/lib/schema';

// pages/api/hello_world.js

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userNotes = await db.select().from(notes).where(eq(notes.userId, token.sub));

    return NextResponse.json(userNotes, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { title, content } = await req.json();
    const newNote = await db.insert(notes).values({
      userId: token.sub,
      title,
      content,
    });
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
