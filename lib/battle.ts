import { character } from './data.ts';
import type { RoundResult } from './engine.ts';

export interface BattleBeat {
  act: 1 | 2 | 3;
  title: string;
  caption: string;
  effect: 'clash' | 'domain' | 'counter' | 'special' | 'result';
  actors: string[];
}

/** A visual recap of recorded modifiers, not a second combat simulation. */
export function battleBeats(round: RoundResult): BattleBeat[] {
  const names = (ids: string[]) => ids.map((id) => character(id).name).join(', ');
  const beats: BattleBeat[] = [{
    act: 1, title: 'Opening exchange', effect: 'clash', actors: [...round.teamIds, ...round.enemyIds],
    caption: `${names(round.teamIds)} face ${round.enemyLabel}.`,
  }];
  for (const [ids, breakdown] of [[round.teamIds, round.team], [round.enemyIds, round.enemy]] as const) {
    if (breakdown.domainNotes.length) {
      const casters = ids.filter((id) => character(id).tags.includes('sure_hit_domain'));
      if (casters.length) beats.push({
        act: 2, effect: 'domain', actors: casters,
        title: casters.map((id) => character(id).domain.name ?? 'Domain expansion').join(' / '),
        caption: `${names(casters)} — ${breakdown.domain > 0 ? 'domain advantage' : 'domain pressure answered'}. ${breakdown.domainNotes.filter((n) => n.rule !== 'domain_pressure').map((n) => n.text).join(' ') || 'Sure-hit pressure enters the exchange.'}`,
      });
    }
    const counter = breakdown.firedCounters[0];
    if (counter) beats.push({ act: 2, effect: 'counter', actors: ids.filter((id) => character(id).tags.includes(counter.attacker_tag)), title: 'Counter technique', caption: counter.explanation });
    const synergy = breakdown.firedSynergies[0];
    if (synergy) beats.push({ act: 2, effect: 'special', actors: [...ids], title: synergy.label, caption: synergy.explanation });
    if (breakdown.specialNotes.length) beats.push({ act: 2, effect: 'special', actors: [...ids], title: 'Signature ability', caption: breakdown.specialNotes.join(' · ') });
    if (breakdown.blackFlash > 0) beats.push({ act: 2, effect: 'counter', actors: [...ids], title: 'Black Flash', caption: `${names(ids)} gain a Black Flash boost.` });
  }
  if (beats.length === 1) beats.push({ act: 2, effect: 'clash', actors: [...round.teamIds, ...round.enemyIds], title: 'Pressure builds', caption: 'Power, technique and teamwork decide the exchange.' });
  beats.push({
    act: 3, effect: 'result', actors: round.won ? round.teamIds : round.enemyIds,
    title: round.upset ? (round.won ? 'Upset victory' : 'The boss turns it around') : round.won ? (round.narrowWin ? 'A costly victory' : 'Boss defeated') : 'The boss holds',
    caption: [round.upsetReason, round.fellIds.length ? `${names(round.fellIds)} ${round.fellIds.length === 1 ? 'is' : 'are'} knocked out.` : round.won ? 'Your squad stays standing.' : 'Your squad survives this exchange.', ...round.notes].filter(Boolean).join(' '),
  });
  return beats;
}
