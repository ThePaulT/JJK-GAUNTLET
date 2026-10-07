import { describe, expect, test } from 'vitest';

import { WORLD_APPROACHES, WORLD_MATCHUPS, worldCharacter } from '../lib/world/data.ts';
import { simulateWorldFight } from '../lib/world/engine.ts';

describe('world-1 prototype', () => {
  test('replays the same event log from the same setup and seed', () => {
    for (const matchup of WORLD_MATCHUPS) {
      const input = { matchupId: matchup.id, approach: 'adaptive' as const, seed: 'REPLAY01' };
      expect(simulateWorldFight(input)).toEqual(simulateWorldFight(input));
    }
  });

  test('every emitted ability belongs to the acting character version', () => {
    for (const matchup of WORLD_MATCHUPS) for (const approach of Object.keys(WORLD_APPROACHES) as Array<keyof typeof WORLD_APPROACHES>) {
      for (let index = 0; index < 40; index += 1) {
        const result = simulateWorldFight({ matchupId: matchup.id, approach, seed: `LEGAL-${index}` });
        for (const event of result.events) {
          if (event.abilityId) expect(worldCharacter(event.actorId).abilities).toContain(event.abilityId);
        }
        expect(result.events.at(-1)?.decisive).toBe(true);
      }
    }
  });

  test('all three matchups produce bounded alternate endings across legal seeds', () => {
    for (const matchup of WORLD_MATCHUPS) {
      const winners = new Set(Array.from({ length: 240 }, (_, index) =>
        simulateWorldFight({ matchupId: matchup.id, approach: 'adaptive', seed: `BRANCH-${index}` }).winnerId,
      ));
      expect(winners).toContain(matchup.fighterId);
      expect(winners).toContain(matchup.opponentId);
    }
  });

  test('Mahito can only be finished through logged soul access', () => {
    for (let index = 0; index < 100; index += 1) {
      const result = simulateWorldFight({ matchupId: 'yuji-mahito', approach: 'adaptive', seed: `SOUL-${index}` });
      if (result.winnerId === 'yuji') {
        expect(result.events.some((event) => event.ruleId.startsWith('INT-SOUL') || event.ruleId === 'INT-DOM-CASTER-BREAK')).toBe(true);
        expect(result.finalStates.find((state) => state.id === 'mahito')?.soulDamage).toBe(5);
      }
    }
  });

  test('Simple Domain is temporary and never erases Mahito’s domain', () => {
    for (let index = 0; index < 100; index += 1) {
      const result = simulateWorldFight({ matchupId: 'yuji-mahito', approach: 'counterplay', seed: `SD-${index}` });
      const simple = result.events.find((event) => event.ruleId === 'INT-DOM-SIMPLE');
      if (simple) {
        expect(simple.summary).toMatch(/temporary|remain active/i);
        expect(simple.changes).not.toContain('Mahito domain destroyed');
      }
    }
  });

  test('Maki has no CE to drain and Hanami never uses an invented domain', () => {
    for (let index = 0; index < 100; index += 1) {
      const result = simulateWorldFight({ matchupId: 'maki-hanami', approach: 'pressure', seed: `HR-${index}` });
      const maki = result.finalStates.find((state) => state.id === 'maki');
      expect(maki?.ceLabel).toBe('None by constitution');
      expect(result.events.find((event) => event.ruleId === 'INT-HR-ZERO-CE')?.changes.join(' ')).toMatch(/no effect|no valid target/i);
      expect(result.events.some((event) => event.actorId === 'hanami' && event.abilityId === 'domain-expansion')).toBe(false);
    }
  });

  test('domain endings log burnout and positive-energy finishes require contact setup', () => {
    for (let index = 0; index < 140; index += 1) {
      const result = simulateWorldFight({ matchupId: 'yuta-jogo', approach: 'adaptive', seed: `DOM-${index}` });
      const rctIndex = result.events.findIndex((event) => event.abilityId === 'rct-output');
      if (rctIndex >= 0) {
        expect(result.events.slice(0, rctIndex).some((event) => event.changes.some((change) => /contact|pinned/i.test(change)))).toBe(true);
      }
      if (result.events.some((event) => event.ruleId === 'INT-DOM-CLASH')) {
        expect(result.events.some((event) => event.ruleId === 'INT-DOM-BURNOUT')).toBe(true);
      }
    }
  });
});
