import Link from 'next/link';

import { DB } from '@/lib/data.ts';

const MODES = [
  {
    href: '/gauntlet',
    name: 'Solo Gauntlet',
    line: 'Choose one fighter and see how far they get through five bosses.',
    detail: 'The current authored edition: sixty reviewed matchups and twelve scoped limit-breaks.',
  },
  {
    href: '/labs',
    name: 'Legacy Labs',
    line: 'Explore the older Freestyle and Daily Draft experiments.',
    detail: 'These modes use the original seeded score model, not the upcoming world resolver.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <p className="eyebrow">One fighter · Five bosses</p>
        <h1 className="display max-w-2xl text-4xl leading-tight sm:text-5xl">
          How far does your JJK fighter get?
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ash">
          Pick one of twelve reviewed character versions and run the five-boss ladder. Choose a
          disciplined line or a costly limit-break where one is credible, then see the opening,
          interaction and consequence instead of a hidden power roll.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {MODES.map((m) => (
          <Link key={m.href} href={m.href} className="panel flex flex-col gap-3 p-5 hover:border-ash">
            <span className="display text-2xl">{m.name}</span>
            <span className="text-sm leading-relaxed text-bone">{m.line}</span>
            <span className="text-xs leading-relaxed text-ash">{m.detail}</span>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="eyebrow">What the ruling fixes</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-ash">
          Every rung starts as a fresh fight in a neutral arena with no prep or outside help. The
          exact versions and loadouts are declared before the result. Contested branches select only
          between authored executions, and terminal costs can end a run even when the boss falls.
        </p>
        <p className="max-w-2xl text-xs leading-relaxed text-ash">The current authored edition remains replayable while the lore-constrained world resolver is built. Freestyle and Daily Draft are preserved in Legacy Labs using the wider {DB.characters.length}-character database.</p>
      </section>
    </div>
  );
}
