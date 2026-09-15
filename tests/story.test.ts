import { describe, expect, it } from 'vitest';

import { character } from '@/lib/data.ts';
import { runGauntlet } from '@/lib/engine.ts';
import { cleanStory, fallbackNarration, splitRunStories } from '@/lib/narrate.ts';
import { bestStoryLine, cardFacts, shareText } from '@/lib/share.ts';
import type { SavedRun } from '@/lib/share.ts';

function savedRun(seed: string, team = ['yuji', 'yuta', 'maki']): SavedRun {
  const result = runGauntlet(seed, 'hero', team);
  return {
    id: 'testrun1',
    createdAt: '2026-09-15T00:00:00.000Z',
    mode: 'gauntlet',
    side: 'hero',
    seed,
    teamIds: team,
    result,
    stories: result.rounds.map((r) => fallbackNarration({ side: 'hero', round: r })),
  };
}

describe('fallback narration', () => {
  it('never contradicts the result it is given', () => {
    for (let i = 0; i < 60; i += 1) {
      const result = runGauntlet(`story${i}`, 'hero', ['yuji', 'megumi', 'nobara']);
      for (const round of result.rounds) {
        const story = fallbackNarration({ side: 'hero', round });
        const enemy = character(round.enemyIds[0]).name;
        expect(story).toContain(enemy);
        if (round.won) {
          expect(story).toContain('goes down');
          expect(story).not.toContain('still standing when the dust drops');
        } else {
          expect(story).toContain('still standing');
        }
        for (const id of round.fellIds) {
          expect(story).toContain(character(id).name);
        }
      }
    }
  });

  it('is stable for the same round', () => {
    const round = runGauntlet('stable', 'hero', ['yuji', 'todo', 'nanami']).rounds[0];
    expect(fallbackNarration({ side: 'hero', round })).toBe(
      fallbackNarration({ side: 'hero', round }),
    );
  });

  it('stays short enough for a card', () => {
    for (let i = 0; i < 40; i += 1) {
      const round = runGauntlet(`len${i}`, 'villain', ['sukuna', 'uraume', 'mahito']).rounds[0];
      const story = fallbackNarration({ side: 'villain', round });
      expect(story.split(/(?<=[.!?])\s+/).length).toBeLessThanOrEqual(4);
    }
  });
});

describe('share card', () => {
  it('reports the record, the rung it stopped at, and the ladder', () => {
    const run = savedRun('card-1');
    const facts = cardFacts(run);
    expect(facts.record).toBe(run.result.record);
    expect(facts.rankTitle).toBe(run.result.rankTitle);
    expect(facts.rungs).toHaveLength(5);
    expect(facts.rungs.filter((r) => r.cleared)).toHaveLength(run.result.rungsCleared);
    if (run.result.fullClear) expect(facts.lostAt).toBeNull();
    else expect(facts.lostAt).toBe(run.result.rounds.at(-1)!.enemyLabel);
  });

  it('picks one sentence short enough to print', () => {
    for (let i = 0; i < 30; i += 1) {
      const line = bestStoryLine(savedRun(`line${i}`));
      expect(line.length).toBeGreaterThan(0);
      expect(line.length).toBeLessThanOrEqual(150);
    }
  });

  it('writes share text that names the squad and the outcome', () => {
    const run = savedRun('share-1');
    const text = shareText(run);
    expect(text).toContain(character(run.teamIds[0]).name);
    expect(text).toContain(run.result.fullClear ? 'Full clear' : run.result.record);
  });
});

describe('story cleanup', () => {
  it('strips the markdown a model reaches for despite being told not to', () => {
    expect(cleanStory('He fires **Piercing Blood** through the guard.')).toBe(
      'He fires Piercing Blood through the guard.',
    );
    expect(cleanStory('Hakari’s *Idle Death Gamble* collapses.')).toBe(
      'Hakari’s Idle Death Gamble collapses.',
    );
    expect(cleanStory('## Round 1\n- Yuji wins.')).toBe('Round 1 Yuji wins.');
    expect(cleanStory('Line one.\n\nLine two.')).toBe('Line one. Line two.');
  });

  it('leaves ordinary prose alone', () => {
    const prose = "Nobara's Resonance reaches Mahito's true body, and he knows it.";
    expect(cleanStory(prose)).toBe(prose);
    // Snake_case tags and mid-word underscores are not emphasis.
    expect(cleanStory('The soul_strike lands.')).toBe('The soul_strike lands.');
  });
});

describe('run narration parsing', () => {
  it('splits one answer into a story per round', () => {
    const answer = [
      '<<1>> Hanami opens on the front foot, roots tearing the asphalt.',
      '<<2>> Jogo takes the second exchange and makes them pay for it.',
      '<<3>> By the third, nobody is standing up straight.',
    ].join('\n\n');
    const out = splitRunStories(answer, 3);
    expect(out).toHaveLength(3);
    expect(out[0]).toContain('Hanami opens');
    expect(out[1]).toContain('Jogo takes');
    expect(out[2]).toContain('nobody is standing');
  });

  it('tolerates square-bracket markers and stray prose before the first one', () => {
    const out = splitRunStories('Here is the fight.\n[[1]] Round one.\n[[2]] Round two.', 2);
    expect(out[0]).toBe('Round one.');
    expect(out[1]).toBe('Round two.');
  });

  it('leaves a missing round null rather than shifting the rest', () => {
    const out = splitRunStories('<<1>> One.\n<<3>> Three.', 3);
    expect(out[0]).toBe('One.');
    expect(out[1]).toBeNull();
    expect(out[2]).toBe('Three.');
  });

  it('ignores markers outside the round count', () => {
    const out = splitRunStories('<<1>> One.\n<<9>> Nine.', 1);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe('One.');
  });

  it('strips markdown inside each round', () => {
    const out = splitRunStories('<<1>> He fires **Piercing Blood** clean through.', 1);
    expect(out[0]).toBe('He fires Piercing Blood clean through.');
  });
});
