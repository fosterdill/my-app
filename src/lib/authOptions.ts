import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { Session, SessionStrategy } from 'next-auth';
import { Adapter } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';
import Github from 'next-auth/providers/github';

import { db } from '@/lib/db';

const authOptions = {
  adapter: DrizzleAdapter(db) as Adapter,
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  strategy: 'jwt',
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async session({ token, session }: { token: JWT; session: Session }) {
      session.user.id = token.sub;
      return session;
    },
  },
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
};

export default authOptions;
