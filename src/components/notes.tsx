/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/zjWgLbDOtsJ
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

/** Add fonts into your Next.js project:

import { Libre_Franklin } from 'next/font/google'
import { Rubik } from 'next/font/google'

libre_franklin({
  subsets: ['latin'],
  display: 'swap',
})

rubik({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Notes() {
  return (
    <div className="flex size-full flex-col">
      <header className="bg-gray-100 px-6 py-4 dark:bg-gray-800">
        <h1 className="text-2xl font-bold">Notes</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
      </div>
      <div className="bg-gray-100 px-6 py-4 dark:bg-gray-800">
        <form className="flex items-center space-x-4">
          <div className="flex-1">
            <Input className="w-full" name="title" placeholder="Note title" />
          </div>
          <div className="flex-1">
            <Input className="w-full" name="content" placeholder="Note content" />
          </div>
          <Button type="submit">Add Note</Button>
        </form>
      </div>
    </div>
  );
}
