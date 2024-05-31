'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { Notes } from '@/components/notes';
import { buttonVariants } from '@/components/ui/button';
import { uiRoutes } from '@/constants/uiRoutes';
import { cn } from '@/lib/utils';

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return <Notes />;
  }

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div>
        <p>
          <Link className={cn(buttonVariants({ variant: 'default' }), 'mr-2')} href={uiRoutes.signIn}>
            Sign in
          </Link>
          to view your notes.
        </p>
      </div>
    </div>
  );
}
