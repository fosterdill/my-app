import type { NextRequest } from 'next/server';
// eslint-disable-next-line no-duplicate-imports
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.sub) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:function/',
};
