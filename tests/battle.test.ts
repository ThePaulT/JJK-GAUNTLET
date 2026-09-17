import { describe, expect, it } from 'vitest';
import { battleBeats } from '../lib/battle.ts';
import { runGauntlet } from '../lib/engine.ts';
import { character } from '../lib/data.ts';

describe('battle recap', () => {
  for (const [side, ids] of [['hero', ['inumaki', 'yuta', 'gojo']], ['villain', ['jogo', 'mahito', 'sukuna']]] as const) {
    it(`keeps ${side} playback aligned with recorded encounters`, () => {
      for (let seed = 0; seed < 30; seed++) {
        const run = runGauntlet(`battle-${seed}`, side, [...ids]);
        for (const round of run.rounds) {
          const beats = battleBeats(round);
          expect(new Set(beats.map((b) => b.act))).toEqual(new Set([1, 2, 3]));
          expect(beats.at(-1)?.effect).toBe('result');
          expect(beats.filter((b) => b.effect === 'result')).toHaveLength(1);
          expect(beats.at(-1)?.actors).toEqual(round.won ? round.teamIds : round.enemyIds);
          for (const beat of beats) {
            expect(beat.caption.length).toBeGreaterThan(0);
            for (const id of beat.actors) expect([...round.teamIds, ...round.enemyIds]).toContain(id);
            if (beat.effect === 'domain') for (const id of beat.actors) expect(character(id).tags).toContain('sure_hit_domain');
          }
          for (const id of round.fellIds) expect(beats.at(-1)?.caption).toContain(character(id).name);
        }
      }
    });
  }
});
