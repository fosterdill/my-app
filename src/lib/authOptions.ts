import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Github from 'next-auth/providers/github';

import { db } from '@/lib/db';

const authOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
};

export default authOptions;
