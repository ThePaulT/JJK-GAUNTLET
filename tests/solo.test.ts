import { describe, expect, test } from 'vitest';

import { runSolo } from '../lib/solo.ts';
import {
  SOLO_BOSSES,
  SOLO_FIGHTERS,
  SOLO_RULINGS,
  SOLO_RULESET,
  soloRuling,
} from '../lib/solo-data.ts';

describe('authored solo gauntlet', () => {
  test('covers every one of the 30 fighter-boss pairs exactly once', () => {
    expect(SOLO_RULINGS).toHaveLength(30);
    const keys = SOLO_RULINGS.map(ruling => `${ruling.fighterId}:${ruling.bossId}`);
    expect(new Set(keys).size).toBe(30);
    for (const fighter of SOLO_FIGHTERS) for (const boss of SOLO_BOSSES) {
      const ruling = soloRuling(fighter, boss);
      expect(ruling.reasons.length).toBeGreaterThanOrEqual(2);
      expect(ruling.reasons.length).toBeLessThanOrEqual(3);
      if (ruling.verdict === 'favored') expect(ruling.swing).toBeTruthy();
      if (ruling.verdict === 'decisive') expect(ruling.swing).toBeUndefined();
    }
  });

  test('runs stop at the first authored loss and ignore the seed', () => {
    const records = { yuji: 3, yuta: 4, megumi: 0, maki: 3, todo: 0, inumaki: 0 } as const;
    for (const fighter of SOLO_FIGHTERS) {
      const one = runSolo('one', fighter);
      const two = runSolo('two', fighter);
      expect(one.ruleset).toBe(SOLO_RULESET);
      expect(one.rungsCleared).toBe(records[fighter]);
      expect(one.rounds).toHaveLength(records[fighter] + 1);
      expect(one.rounds.at(-1)?.won).toBe(false);
      expect(one.rounds.map(round => ({ ...round, team: undefined, enemy: undefined }))).toEqual(two.rounds.map(round => ({ ...round, team: undefined, enemy: undefined })));
    }
  });

  test('Inumaki versus Sukuna is a decisive loss without claiming universal immunity', () => {
    const ruling = soloRuling('inumaki', 'sukuna');
    expect(ruling.winner).toBe('boss');
    expect(ruling.verdict).toBe('decisive');
    expect(ruling.reasons.join(' ')).toMatch(/brief hitch/i);
    expect(ruling.reasons.join(' ')).not.toMatch(/immune|never affects|cannot affect/i);
  });

  test('Yuta decisively exorcises every cursed-spirit rung with positive energy available', () => {
    for (const boss of ['hanami', 'jogo', 'mahito'] as const) {
      const ruling = soloRuling('yuta', boss);
      expect(ruling.winner).toBe('fighter');
      expect(ruling.verdict).toBe('decisive');
      expect(ruling.reasons.join(' ')).toMatch(/positive-energy/i);
    }
  });

  test('rejects unsupported fighters and empty seeds', () => {
    expect(() => runSolo('seed', 'gojo')).toThrow();
    expect(() => runSolo('', 'yuji')).toThrow();
  });
});
