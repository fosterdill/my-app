import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { db } from '@/lib/db';
import { notes } from '@/lib/schema';

export async function PUT(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  try {
    const token = await getToken({ req });
    const { title, content } = await req.json();
    const updatedNote = await db
      .update(notes)
      .set({
        title,
        content,
      })
      .where(and(eq(notes.userId, token!.sub!), eq(notes.id, id)))
      .returning();
    return NextResponse.json(updatedNote, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  try {
    const token = await getToken({ req });
    await db
      .delete(notes)
      .where(and(eq(notes.userId, token!.sub!), eq(notes.id, id)))
      .execute();
    return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
