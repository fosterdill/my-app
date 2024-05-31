'use client';
import { useSession } from 'next-auth/react';

import { Notes } from '@/components/notes';
import { uiRoutes } from '@/constants/uiRoutes';

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return <Notes />;
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
