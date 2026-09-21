import type { Breakdown, RoundResult, RunResult } from './engine.ts';
import { character } from './data.ts';
import {
  isSoloFighter,
  SOLO_BOSSES,
  SOLO_RULESET,
  soloRuling,
  type SoloFighterId,
} from './solo-data.ts';

const emptyBreakdown = (): Breakdown => ({
  topPower: 0,
  others: 0,
  synergy: 0,
  counters: 0,
  domain: 0,
  specials: 0,
  blackFlash: 0,
  rng: 0,
  flat: 0,
  total: 0,
  firedCounters: [],
  firedSynergies: [],
  domainNotes: [],
  specialNotes: [],
});

export function runSolo(seed: string, fighterId: string): RunResult {
  if (!seed || !isSoloFighter(fighterId)) throw new Error('Invalid solo run');
  const rounds: RoundResult[] = [];

  for (const [rung, bossId] of SOLO_BOSSES.entries()) {
    const ruling = soloRuling(fighterId, bossId);
    const won = ruling.winner === 'fighter';
    rounds.push({
      round: rung + 1,
      rung,
      teamIds: [fighterId],
      enemyIds: [bossId],
      enemyLabel: character(bossId).name,
      teamScore: 0,
      enemyScore: 0,
      margin: 0,
      won,
      upset: false,
      upsetSide: null,
      upsetReason: null,
      fellIds: won ? [] : [fighterId],
      enemyFellIds: won ? [bossId] : [],
      narrowWin: ruling.verdict === 'favored' && won,
      notes: [...ruling.reasons],
      team: emptyBreakdown(),
      enemy: emptyBreakdown(),
    });
    if (!won) break;
  }

  const rungsCleared = rounds.filter((round) => round.won).length;
  const fullClear = rungsCleared === SOLO_BOSSES.length;
  return {
    ruleset: SOLO_RULESET,
    seed,
    mode: 'gauntlet',
    side: 'hero',
    teamIds: [fighterId],
    rounds,
    rungsCleared,
    fullClear,
    record: `${rungsCleared}-${fullClear ? 0 : 1}`,
    rankTitle: soloRank(rungsCleared),
    mvpId: fighterId,
    survivorIds: fullClear ? [fighterId] : [],
    xp: rungsCleared * 100,
    hype: false,
    upsets: 0,
  };
}

function soloRank(cleared: number): string {
  return ['Stopped at the gate', 'One curse down', 'Two-rung run', 'Special-grade line', 'Reached the King', 'Ladder conquered'][cleared]!;
}

export function randomSoloFighter(seedValue = Math.random()): SoloFighterId {
  const index = Math.min(Math.floor(seedValue * 6), 5);
  return ['yuji', 'yuta', 'megumi', 'maki', 'todo', 'inumaki'][index] as SoloFighterId;
}
