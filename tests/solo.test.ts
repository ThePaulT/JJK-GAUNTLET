import { describe, expect, test } from 'vitest';

import { runSolo } from '../lib/solo.ts';
import {
  resolveSoloPath,
  SOLO_BOSSES,
  SOLO_FIGHTERS,
  SOLO_PROFILES,
  SOLO_RULINGS,
  SOLO_RULESET,
  soloGamble,
  soloRuling,
} from '../lib/solo-data.ts';

describe('authored solo gauntlet v2', () => {
  test('covers every one of the 60 fighter-boss pairs exactly once', () => {
    expect(SOLO_FIGHTERS).toHaveLength(12);
    expect(SOLO_RULINGS).toHaveLength(60);
    const keys = SOLO_RULINGS.map(ruling => `${ruling.fighterId}:${ruling.bossId}`);
    expect(new Set(keys).size).toBe(60);
    for (const fighter of SOLO_FIGHTERS) for (const boss of SOLO_BOSSES) {
      const ruling = soloRuling(fighter, boss);
      expect(ruling.reasons).toHaveLength(3);
      if (ruling.verdict === 'favored') expect(ruling.swing).toBeTruthy();
      if (ruling.verdict === 'decisive') expect(ruling.swing).toBeUndefined();
      const path = resolveSoloPath(fighter, boss, 'measured', 'audit');
      expect(path.beats).toEqual(ruling.reasons);
      expect(path.winner).toBe(ruling.winner);
    }
  });

  test('standard runs stop at the first authored loss', () => {
    const records: Record<(typeof SOLO_FIGHTERS)[number], number> = {
      yuji: 3,
      yuta: 4,
      megumi: 0,
      maki: 3,
      todo: 0,
      inumaki: 0,
      gojo: 4,
      hakari: 2,
      kashimo: 1,
      yuki: 2,
      toji: 3,
      yorozu: 3,
    };
    for (const fighter of SOLO_FIGHTERS) {
      const result = runSolo('standard', fighter);
      expect(result.ruleset).toBe(SOLO_RULESET);
      expect(result.rungsCleared).toBe(records[fighter]);
      expect(result.rounds).toHaveLength(records[fighter] + 1);
      expect(result.rounds.at(-1)?.won).toBe(false);
    }
  });

  test('all contested branches are deterministic for a seed and contain complete causal paths', () => {
    let gambleCount = 0;
    for (const fighter of SOLO_FIGHTERS) for (const boss of SOLO_BOSSES) {
      const option = soloGamble(fighter, boss);
      if (!option) continue;
      gambleCount += 1;
      const one = resolveSoloPath(fighter, boss, 'limit-break', 'same-seed');
      const two = resolveSoloPath(fighter, boss, 'limit-break', 'same-seed');
      expect(one).toEqual(two);
      expect(one.beats).toHaveLength(3);
      expect(one.cost.length).toBeGreaterThan(20);
      expect(one.hinge.length).toBeGreaterThan(20);
      if (option.paths.length > 1) {
        const seen = new Set(Array.from({ length: 100 }, (_, index) => resolveSoloPath(fighter, boss, 'limit-break', `branch-${index}`).branchIndex));
        expect(seen.size).toBe(option.paths.length);
      }
    }
    expect(gambleCount).toBe(12);
  });

  test('terminal techniques can defeat a boss without clearing or continuing the ladder', () => {
    const result = runSolo('amber', 'kashimo', ['limit-break']);
    const round = result.rounds[0]!;
    expect(round.solo?.winner).toBe('mutual');
    expect(round.enemyFellIds).toEqual(['hanami']);
    expect(round.fellIds).toEqual(['kashimo']);
    expect(round.won).toBe(false);
    expect(result.rungsCleared).toBe(0);
    expect(result.rounds).toHaveLength(1);
  });

  test('Inumaki lethal speech is an explicit uncertain ruling, never a guaranteed kill', () => {
    const gamble = soloGamble('inumaki', 'hanami');
    expect(gamble?.paths.map(path => path.winner).sort()).toEqual(['boss', 'mutual']);
    expect(gamble?.paths.every(path => path.uncertainty)).toBe(true);
    expect(gamble?.paths.map(path => path.hinge).join(' ')).toMatch(/never proves|does not prove/i);
    expect(soloRuling('inumaki', 'sukuna').reasons.join(' ')).toMatch(/brief hitch/i);
  });

  test('Hakari and Kashimo preserve their actual state-machine costs', () => {
    expect(SOLO_PROFILES.hakari.loadout).toMatch(/starts in base|must establish/i);
    expect(SOLO_PROFILES.hakari.boundary).toMatch(/4 minutes 11 seconds|not.*generic/i);
    expect(SOLO_PROFILES.kashimo.boundary).toMatch(/one-use|collapse/i);
    expect(soloRuling('hakari', 'hanami').reasons.join(' ')).toMatch(/rule|jackpot/i);
  });

  test('rejects unsupported fighters, choices and empty seeds', () => {
    expect(() => runSolo('seed', 'choso')).toThrow();
    expect(() => runSolo('', 'yuji')).toThrow();
    expect(() => runSolo('seed', 'todo', ['limit-break'])).toThrow();
    expect(() => runSolo('seed', 'yuji', ['measured', 'measured', 'measured', 'measured', 'measured', 'measured'])).toThrow();
  });
});
