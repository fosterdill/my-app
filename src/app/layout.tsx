import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Providers from '@/components/providers';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" lang="en">
      <body className={cn(inter.className, 'h-full')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
