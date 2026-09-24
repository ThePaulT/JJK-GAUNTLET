import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Portrait } from '@/components/portrait.tsx';
import { RoundView } from '@/components/round-view.tsx';
import { ShareButtons } from '@/components/share-buttons.tsx';
import { DB, character } from '@/lib/data.ts';
import { cardFacts, shareText } from '@/lib/share.ts';
import { loadRun } from '@/lib/load-run.ts';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const run = await loadRun(id);
  if (!run) return { title: 'Run not found — JJK Gauntlet' };
  const facts = cardFacts(run);
  return {
    title: `${facts.record} · ${facts.rankTitle} — JJK Gauntlet`,
    description: shareText(run),
    openGraph: { title: `${facts.rankTitle} — ${facts.teamNames.join(' / ')}`, type: 'article' },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await loadRun(id);
  if (!run) notFound();

  const facts = cardFacts(run);
  const ladder = DB.ladders[run.side];
  const isSolo = !!run.result.ruleset?.startsWith('solo-');

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 border-b border-sand pb-6">
        <span className="eyebrow">
          {facts.sideLabel} · {isSolo ? 'authored edition' : `legacy score model · ${run.mode} · seed ${run.seed}`}
        </span>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="display text-5xl">
              {run.result.fullClear ? 'Full clear' : facts.record}
            </h1>
            <p className="text-lg">{facts.rankTitle}</p>
            {facts.lostAt ? <p className="text-sm text-ash">Fell at {facts.lostAt}</p> : null}
          </div>
          <div className="flex flex-col items-end gap-2">
            {facts.upset ? <span className="stamp text-blood">Upset</span> : null}
            {facts.hype ? <span className="stamp text-curse">Hype</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {run.teamIds.map((cid) => (
            <span
              key={cid}
              className="flex items-center gap-2 border border-sand py-1 pr-2 pl-1 text-xs"
            >
              <Portrait id={cid} size={26} />
              {character(cid).name}
            </span>
          ))}
        </div>
        {facts.bestLine ? (
          <p className="display max-w-2xl border-l-2 border-blood pl-4 text-xl leading-relaxed">
            {facts.bestLine}
          </p>
        ) : null}
      </header>

      <section className="flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">{isSolo ? 'Fighter' : 'MVP'}</span>
          <span className="flex items-center gap-2">
            {facts.mvpId ? <Portrait id={facts.mvpId} size={26} className="border border-sand" /> : null}
            {facts.mvpName ?? '—'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="eyebrow">Ladder</span>
          <span className="text-xs text-ash">
            {ladder.rungs.map((rid) => character(rid).name).join(' → ')}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="eyebrow">Mastery XP</span>
          <span>{run.result.xp}</span>
        </div>
      </section>

      <ShareButtons id={run.id} text={shareText(run)} />

      <section className="flex flex-col gap-4">
        <h2 className="eyebrow">The run, round by round</h2>
        {run.result.rounds.map((r, i) => (
          <RoundView key={`${r.rung}-${r.round}`} round={r} story={run.stories[i]} showBreakdown solo={isSolo} />
        ))}
      </section>

      <div className="flex gap-2">
        <Link className="btn" href="/gauntlet">
          Run your own
        </Link>
        {!isSolo ? <Link className="btn" href="/gauntlet">Same seed, your picks</Link> : null}
      </div>
    </div>
  );
}
