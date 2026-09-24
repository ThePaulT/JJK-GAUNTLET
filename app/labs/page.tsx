import Link from 'next/link';

export const metadata = { title: 'Legacy Labs — JJK Gauntlet' };

const LABS = [
  {
    href: '/freestyle',
    title: 'Freestyle Lab',
    description: 'Build teams of up to three and compare outcomes across repeated seeded score-model trials.',
  },
  {
    href: '/daily',
    title: 'Daily Draft Lab',
    description: 'Play the same date-seeded three-round draft as everyone else using the original score model.',
  },
];

export default function LabsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-sand pb-5">
        <p className="eyebrow">Legacy Labs</p>
        <h1 className="display mt-2 text-4xl">Preserved experiments.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ash">
          These modes use the original aggregate score and seeded swing model. They remain playable,
          but their results are not outputs from the lore-constrained world resolver now in development.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        {LABS.map((lab) => (
          <Link key={lab.href} href={lab.href} className="panel p-5 hover:border-ash">
            <h2 className="display text-2xl">{lab.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ash">{lab.description}</p>
            <span className="mt-4 block text-sm text-curse">Open lab →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
