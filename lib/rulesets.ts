/**
 * Stable ruleset identifiers. Existing replay families are immutable; world-1
 * is reserved until the event/state resolver and its replay loader ship.
 */
export const WORLD_RULESET = 'world-1' as const;
export const WORLD_REPLAY_PREFIX = 'w1_' as const;

export const ACTIVE_RULESETS = ['curated-1', 'curated-2', 'solo-1', 'solo-2'] as const;

export function isActiveRuleset(value: string): value is (typeof ACTIVE_RULESETS)[number] {
  return (ACTIVE_RULESETS as readonly string[]).includes(value);
}
