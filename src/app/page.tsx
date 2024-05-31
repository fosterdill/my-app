'use client';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  console.log(session);
  if (session) {
    return (
      <div>
        <h1>Home</h1>
        <p>Hi {session.user?.name}!</p>
        <p>
          Click <a href="/api/auth/signout">here</a> to sign out
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1>Home</h1>
      <p>
        Click <a href="/api/auth/signin">here</a> to sign in
      </p>
    </div>
  );
}
