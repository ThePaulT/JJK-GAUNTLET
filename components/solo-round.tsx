import { character } from '@/lib/data.ts';
import {
  resolveSoloPath,
  SOLO_PROFILES,
  type SoloBossId,
  type SoloFighterId,
} from '@/lib/solo-data.ts';
import type { RoundResult } from '@/lib/engine.ts';

import { Portrait } from './portrait.tsx';

const beatLabels = ['Opening', 'Interaction', 'Consequence'] as const;

export function SoloRoundView({ round }: { round: RoundResult }) {
  const fighterId = round.teamIds[0] as SoloFighterId;
  const bossId = round.enemyIds[0] as SoloBossId;
  const resolved = round.solo ?? resolveSoloPath(fighterId, bossId, 'measured', 'legacy-display');
  const fighter = character(fighterId);
  const boss = character(bossId);
  const mutual = resolved.winner === 'mutual';
  const resultLine = mutual
    ? `${boss.name} falls, but ${fighter.name} cannot continue`
    : round.won
      ? `${fighter.name} wins and advances`
      : `${boss.name} wins`;

  return (
    <article className="panel flex flex-col gap-5 p-5 sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="eyebrow">Boss {round.rung + 1} of 5 · Fresh encounter</p>
          <h2 className="display mt-2 text-3xl sm:text-4xl">{fighter.name} vs {boss.name}</h2>
          <p className={`mt-2 text-sm font-medium ${round.won ? 'text-curse' : 'text-blood'}`}>
            {resolved.verdict.charAt(0).toUpperCase() + resolved.verdict.slice(1)} · {resultLine}
          </p>
          <p className="mt-2 text-xs text-ash">{resolved.approachLabel}</p>
        </div>
        <div className="flex items-center gap-2" aria-label={`${fighter.name} versus ${boss.name}`}>
          <Portrait id={fighterId} size={64} className="border border-curse" />
          <span className="display text-xl text-ash">vs</span>
          <Portrait id={bossId} size={64} className="border border-blood" />
        </div>
      </header>

      <section className="border-y border-sand py-5">
        <h3 className="display text-xl">{resolved.title}</h3>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {resolved.beats.map((beat, index) => (
            <li key={beat} className="border-l-2 border-sand pl-3">
              <p className="eyebrow">{beatLabels[index]}</p>
              <p className="mt-2 text-sm leading-6">{beat}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-3 text-sm leading-6 sm:grid-cols-2">
        <div className="bg-panel-2 p-4">
          <p className="eyebrow">Cost paid</p>
          <p className="mt-2 text-ash">{resolved.cost}</p>
        </div>
        <div className="bg-panel-2 p-4">
          <p className="eyebrow">What decides it</p>
          <p className="mt-2 text-ash">{resolved.hinge}</p>
        </div>
      </div>

      {resolved.uncertainty ? (
        <p className="border-l-2 border-curse pl-3 text-xs leading-5 text-ash">
          <strong className="text-bone">Authored uncertainty:</strong> {resolved.uncertainty} The seed selects only between the listed plausible branches; it never rolls a power total.
        </p>
      ) : null}

      <details className="text-sm text-ash">
        <summary className="cursor-pointer text-bone">Versions, loadouts &amp; ruling boundary</summary>
        <div className="mt-4 space-y-3 leading-6">
          <p><strong className="text-bone">{fighter.name} — {SOLO_PROFILES[fighterId].version}.</strong> {SOLO_PROFILES[fighterId].loadout}</p>
          {SOLO_PROFILES[fighterId].boundary ? <p><strong className="text-bone">Fighter boundary:</strong> {SOLO_PROFILES[fighterId].boundary}</p> : null}
          <p><strong className="text-bone">{boss.name} — {SOLO_PROFILES[bossId].version}.</strong> {SOLO_PROFILES[bossId].loadout}</p>
          <p><strong className="text-bone">Declared commitment:</strong> {resolved.commit}</p>
          <p className="text-xs">Depicted abilities and explicit mechanics are canon facts. This cross-matchup path and its winner are an authored game ruling.</p>
        </div>
      </details>
    </article>
  );
}
