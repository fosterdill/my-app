import { NextAuthOptions } from 'next-auth';
import Github from 'next-auth/providers/github';

const authOptions = {
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
} satisfies NextAuthOptions;

export default authOptions;
