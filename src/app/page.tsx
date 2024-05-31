'use client';
import { useSession } from 'next-auth/react';

import { Notes } from '@/components/notes';
import { uiRoutes } from '@/constants/uiRoutes';

export default function Home() {
  const { data: session } = useSession();

  console.log(session);
  if (session) {
    return (
      <div>
        <h1>Home</h1>
        <p>Hi {session.user?.name}!</p>
        <p>
          Click <a href={uiRoutes.signOut}>here</a> to sign out
        </p>
        <Notes />
      </div>
    );
  }

  return (
    <div>
      <h1>Home</h1>
      <p>
        Click <a href={uiRoutes.signIn}>here</a> to sign in
      </p>
    </div>
  );
}
