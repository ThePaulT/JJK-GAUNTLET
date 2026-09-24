import { describe, expect, test } from 'vitest';

import { DB } from '../lib/data.ts';
import { ACTIVE_RULESETS, isActiveRuleset, WORLD_REPLAY_PREFIX, WORLD_RULESET } from '../lib/rulesets.ts';

describe('legacy and world ruleset boundary', () => {
  test('reserves world-1 without advertising it as an active resolver', () => {
    expect(WORLD_RULESET).toBe('world-1');
    expect(WORLD_REPLAY_PREFIX).toBe('w1_');
    expect(ACTIVE_RULESETS).toEqual(['curated-1', 'curated-2', 'solo-1', 'solo-2']);
    expect(isActiveRuleset('solo-2')).toBe(true);
    expect(isActiveRuleset(WORLD_RULESET)).toBe(false);
  });

  test('marks every aggregate domain formula as a legacy game mechanic', () => {
    expect(DB.domain_rules.length).toBeGreaterThan(0);
    expect(DB.domain_rules.every((rule) => rule.canon_status === 'game_mechanic')).toBe(true);
    expect(DB.domain_rules.every((rule) => rule.text.toLowerCase().includes('legacy'))).toBe(true);
  });
});
