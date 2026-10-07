export type WorldCharacterId = 'yuji' | 'mahito' | 'yuta' | 'jogo' | 'maki' | 'hanami';
export type WorldMatchupId = 'yuji-mahito' | 'yuta-jogo' | 'maki-hanami';
export type WorldApproach = 'adaptive' | 'pressure' | 'counterplay';
export type WorldAttribute = 'movement' | 'reaction' | 'martial' | 'technique' | 'tactical' | 'barrier' | 'output' | 'reinforcement' | 'rct';
export type ConsequenceTier = 0 | 1 | 2 | 3 | 4 | 5;
export type CeBand = 0 | 1 | 2 | 3 | 4;
export type Confidence = 'canon' | 'inferred' | 'prototype';
export type EventPhase = 'opening' | 'escalation' | 'finish';

export interface CapabilityBand { floor: number; typical: number; ceiling: number }
export interface WorldDomain {
  id: string; name: string; mastery: number; barrier: number;
  effectClass: 'soul' | 'environmental' | 'technique';
  sureHit: string; targetFilter: 'ce-recognized' | 'all-inside'; confidence: Confidence;
}
export interface WorldCharacter {
  id: WorldCharacterId; name: string; shortName: string; version: string; loadout: string;
  attributes: Record<WorldAttribute, CapabilityBand>; abilities: readonly string[];
  traits: readonly string[]; domain: WorldDomain | null;
}
export interface WorldMatchup {
  id: WorldMatchupId; fighterId: WorldCharacterId; opponentId: WorldCharacterId;
  mechanic: string; promise: string; lockedConditions: readonly string[];
}
export interface CombatantState {
  id: WorldCharacterId; condition: ConsequenceTier; ce: CeBand;
  technique: 'ready' | 'active' | 'burned-out' | 'exhausted';
  domainAvailable: boolean; simpleDomain: 'unavailable' | 'ready' | 'active' | 'collapsed';
  soulDamage: ConsequenceTier; effects: string[]; terminal: boolean;
}
export interface WorldEvent {
  id: string; beat: number; phase: EventPhase; actorId: WorldCharacterId;
  targetIds: WorldCharacterId[]; abilityId?: string; ruleId: string; title: string;
  summary: string; basis: string; resolution: 'hard-rule' | 'seeded-check' | 'state-consequence';
  confidence: Confidence; changes: string[]; decisive?: boolean;
  uncertainty?: { label: string; margin: number; succeeded: boolean };
}
export interface StoryBeat { phase: EventPhase; label: string; text: string; eventIds: string[] }
export interface FinalCombatantState {
  id: WorldCharacterId; condition: ConsequenceTier; conditionLabel: string; ce: CeBand;
  ceLabel: string; technique: CombatantState['technique']; domainAvailable: boolean;
  soulDamage: ConsequenceTier; effects: string[];
}
export interface WorldSimulationResult {
  ruleset: 'world-1'; matchupId: WorldMatchupId; approach: WorldApproach; seed: string;
  fightForm: string; winnerId: WorldCharacterId; loserId: WorldCharacterId; verdict: string;
  decisiveRule: string; events: WorldEvent[]; story: StoryBeat[]; finalStates: FinalCombatantState[];
}
export interface OutcomeDistribution { sampleSize: number; outcomes: Array<{ winnerId: WorldCharacterId; count: number }> }
