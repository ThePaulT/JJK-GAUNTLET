import type { Metadata } from 'next';
import Link from 'next/link';

import './globals.css';

export const metadata: Metadata = {
  title: 'JJK Gauntlet',
  description:
    'Run lore-constrained Jujutsu Kaisen fights through a deterministic event and state simulator.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6">
          <header className="flex items-baseline justify-between border-b border-sand py-5">
            <Link href="/" className="display text-xl tracking-[0.22em] uppercase">
              JJK Gauntlet
            </Link>
            <span className="text-[10px] tracking-[0.18em] uppercase text-curse sm:text-xs">World-1 · Prototype</span>
          </header>
          <main className="flex-1 py-6 sm:py-10">{children}</main>
          <footer className="border-t border-sand py-5 text-xs text-ash">
            Unofficial fan-made simulation. Canon mechanics, matchup inference and prototype rules
            are labeled separately. Results are hypothetical—not canon events.
          </footer>
        </div>
      </body>
    </html>
  );
}
