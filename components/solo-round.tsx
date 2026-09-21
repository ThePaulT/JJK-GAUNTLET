import { character } from '@/lib/data.ts';
import { SOLO_PROFILES, soloRuling, type SoloBossId, type SoloFighterId } from '@/lib/solo-data.ts';
import type { RoundResult } from '@/lib/engine.ts';

import { Portrait } from './portrait.tsx';

export function SoloRoundView({ round }: { round: RoundResult }) {
  const fighterId = round.teamIds[0] as SoloFighterId;
  const bossId = round.enemyIds[0] as SoloBossId;
  const ruling = soloRuling(fighterId, bossId);
  const fighter = character(fighterId);
  const boss = character(bossId);

  return (
    <article className="panel flex flex-col gap-5 p-5 sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="eyebrow">Boss {round.rung + 1} of 5 · Fresh fight</p>
          <h2 className="display mt-2 text-3xl sm:text-4xl">{fighter.name} vs {boss.name}</h2>
          <p className={`mt-2 text-sm font-medium ${round.won ? 'text-curse' : 'text-blood'}`}>
            {ruling.verdict === 'decisive' ? 'Decisive' : 'Favored'} · {round.won ? `${fighter.name} wins` : `${boss.name} wins`}
          </p>
        </div>
        <div className="flex items-center gap-2" aria-label={`${fighter.name} versus ${boss.name}`}>
          <Portrait id={fighterId} size={64} className="border border-curse" />
          <span className="display text-xl text-ash">vs</span>
          <Portrait id={bossId} size={64} className="border border-blood" />
        </div>
      </header>

      <ul className="space-y-3 border-y border-sand py-5 text-sm leading-6 sm:text-base">
        {ruling.reasons.map((reason) => <li key={reason} className="flex gap-3"><span aria-hidden="true" className={round.won ? 'text-curse' : 'text-blood'}>◆</span><span>{reason}</span></li>)}
      </ul>

      <details className="text-sm text-ash">
        <summary className="cursor-pointer text-bone">Versions, loadouts &amp; close alternative</summary>
        <div className="mt-4 space-y-3 leading-6">
          <p><strong className="text-bone">{fighter.name} — {SOLO_PROFILES[fighterId].version}.</strong> {SOLO_PROFILES[fighterId].loadout}</p>
          <p><strong className="text-bone">{boss.name} — {SOLO_PROFILES[bossId].version}.</strong> {SOLO_PROFILES[bossId].loadout}</p>
          {ruling.swing ? <p><strong className="text-bone">Credible alternative:</strong> {ruling.swing}</p> : <p>This ruling has no supported alternate outcome under the declared start.</p>}
          <p className="text-xs">This is an authored game ruling from depicted abilities and matchup inference. It is not a claim that this exact fight occurs in canon.</p>
        </div>
      </details>
    </article>
  );
}
