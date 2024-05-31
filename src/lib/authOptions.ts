import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { SessionStrategy } from 'next-auth';
import { Adapter } from 'next-auth/adapters';
import Github from 'next-auth/providers/github';

import { db } from '@/lib/db';

const authOptions = {
  adapter: DrizzleAdapter(db) as Adapter,
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
};

export default authOptions;
