// pages/api/hello_world.js
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { db } from '@/lib/db';
import { users } from '@/lib/schema';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await db.select().from(users);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { name, email, age } = await req.json();
    const result = await db
      .insert(users)
      .values({
        name,
        age, // Add the missing 'age' property with a default value
        email,
      })
      .returning();
    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
