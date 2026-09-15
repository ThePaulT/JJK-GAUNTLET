'use client';

import { character } from '@/lib/data.ts';
import type { RoundResult } from '@/lib/engine.ts';

import { BreakdownPanel } from './breakdown-panel.tsx';
import { Portrait } from './portrait.tsx';

export function RoundView({
  round,
  story,
  storyState,
  showBreakdown = false,
}: {
  round: RoundResult;
  story?: string;
  storyState?: 'loading' | 'ready' | 'error';
  showBreakdown?: boolean;
}) {
  const fell = round.fellIds.map((id) => character(id).name);

  return (
    <article className="panel flex flex-col gap-4 p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">
            {round.rung >= 0 ? `Rung ${round.rung + 1}` : `Round ${round.round}`} ·{' '}
            {round.enemyLabel}
          </span>
          <span className="display text-2xl">
            {round.won ? `${round.enemyLabel} falls` : `${round.enemyLabel} holds`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {round.upset ? (
            <span className={`stamp stamp-press ${round.upsetSide === 'team' ? 'text-curse' : 'text-blood'}`}>
              {round.upsetSide === 'team' ? 'Upset' : 'Upset against you'}
            </span>
          ) : null}
          {round.narrowWin && round.won && !round.upset ? (
            <span className="stamp text-curse">By a hair</span>
          ) : null}
          <span className="font-mono text-sm text-ash">
            <span className={round.won ? 'text-bone' : ''}>{round.teamScore.toFixed(1)}</span>
            {' · '}
            <span className={round.won ? '' : 'text-bone'}>{round.enemyScore.toFixed(1)}</span>
          </span>
        </div>
      </header>

      <div className="flex items-center gap-4 border-y border-sand py-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {round.teamIds.map((id) => (
            <span key={id} className="flex items-center gap-1.5">
              <Portrait
                id={id}
                size={28}
                className={`border border-sand ${round.fellIds.includes(id) ? 'opacity-30' : ''}`}
              />
              <span
                className={`text-[11px] ${round.fellIds.includes(id) ? 'text-ash line-through' : 'text-bone'}`}
              >
                {character(id).name}
              </span>
            </span>
          ))}
        </div>
        <span className="eyebrow shrink-0">vs</span>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {round.enemyIds.map((id) => (
            <span key={id} className="flex items-center gap-1.5">
              <span className="text-[11px] text-bone">{character(id).name}</span>
              <Portrait id={id} size={28} className="border border-sand" />
            </span>
          ))}
        </div>
      </div>

      <div className="min-h-[3.5rem] text-sm leading-relaxed">
        {storyState === 'loading' ? (
          <span className="text-ash">Writing it up…</span>
        ) : (
          <p>{story}</p>
        )}
      </div>

      {round.notes.filter((n) => !n.startsWith('UPSET')).length ? (
        <ul className="flex flex-col gap-1">
          {round.notes
            .filter((n) => !n.startsWith('UPSET'))
            .map((n, i) => (
              <li
                key={i}
                className="border-l-2 border-curse pl-2 text-[11px] leading-relaxed text-ash"
              >
                {n}
              </li>
            ))}
        </ul>
      ) : null}

      {fell.length ? (
        <p className="text-xs text-blood">
          {fell.join(' and ')} {fell.length > 1 ? 'are' : 'is'} out of the run.
        </p>
      ) : null}

      {showBreakdown ? (
        <details className="border-t border-sand pt-3">
          <summary className="eyebrow cursor-pointer">Why</summary>
          <div className="mt-3 grid gap-6 sm:grid-cols-2">
            <BreakdownPanel label="Your team" b={round.team} />
            <BreakdownPanel label={round.enemyLabel} b={round.enemy} />
          </div>
        </details>
      ) : null}
    </article>
  );
}
