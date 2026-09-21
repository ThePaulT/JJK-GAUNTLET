import type { RoundResult } from '@/lib/engine.ts';
import { combatCondition } from '@/lib/pilot.ts';
import { character } from '@/lib/data.ts';
import { Portrait } from './portrait.tsx';

export function PilotRoundView({ round }: { round: RoundResult }) {
  const combat = round.combat;
  if (!combat) return null;
  return <article className="panel flex flex-col gap-5 p-5 sm:p-7">
    <header className="flex items-center justify-between gap-4">
      <div><p className="eyebrow">Boss {round.rung + 1} of 5 · Encounter {round.round}</p><h2 className="display mt-2 text-3xl">{round.enemyLabel}</h2></div>
      <Portrait id={round.enemyIds[0]} size={72} className="border border-sand" />
    </header>
    {combat.highlights ? <ul className="list-disc space-y-3 pl-5 text-sm leading-7 sm:text-base" aria-label="Battle highlights">
      {combat.highlights.map((p, i) => <li key={i}>{p}</li>)}
    </ul> : <div className="space-y-4 text-sm leading-7">{combat.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>}
    {combat.highlights && <details className="border-t border-sand pt-3"><summary className="cursor-pointer text-sm text-ash">Read the full narrative</summary><div className="mt-4 space-y-4 text-sm leading-7" aria-label="Battle narrative">{combat.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div></details>}
    <div className="flex flex-wrap gap-3 border-t border-sand pt-4">
      {combat.end.filter(s => !round.enemyIds.includes(s.id)).map(s => <div key={s.id} className="flex items-center gap-2">
        <Portrait id={s.id} size={34} className={s.status === 'out' ? 'grayscale opacity-40' : ''} />
        <div><p className="text-xs">{character(s.id).name}</p><p className="text-[11px] text-ash">{combatCondition(s)}</p></div>
      </div>)}
    </div>
    <details className="border-t border-sand pt-3">
      <summary className="cursor-pointer text-xs text-ash">How the fight unfolded</summary>
      <ol className="mt-3 flex flex-col gap-2 text-xs leading-5 text-ash">
        {combat.events.map(e => <li key={e.id}><span className="text-bone">Exchange {e.exchange}.</span> {e.text}</li>)}
      </ol>
      <p className="mt-3 text-xs">Boss condition: {combatCondition(combat.end.find(s => s.id === round.enemyIds[0])!)}</p>
    </details>
  </article>;
}
