import { describe, expect, test } from 'vitest';
import { initialCombatant, resolvePilotEncounter, runPilot } from '../lib/pilot.ts';
import { isPilotTeam, pilotTeams, PILOT_BOSSES, PILOT_PICKS, PILOT_PROFILES } from '../lib/pilot-data.ts';

import { PILOT_MATCHUPS } from '../lib/pilot-plans.ts';

describe('curated draft and deterministic combat', () => {
  test('six distinct offers make eight teams, with no repeated pick', () => {
    const offers = PILOT_PICKS.flatMap(p => [...p.ids]);
    expect(new Set(offers).size).toBe(6);
    expect(pilotTeams()).toHaveLength(8);
    expect(PILOT_MATCHUPS).toHaveLength(40);
    for (const team of pilotTeams()) expect(isPilotTeam(team)).toBe(true);
    expect(isPilotTeam(['yuji', 'yuji', 'todo'])).toBe(false);
    expect(isPilotTeam(['yuji', 'yuta', 'todo'])).toBe(false);
    expect(() => runPilot('seed', ['gojo', 'maki', 'todo'])).toThrow();
  });
  test('same inputs replay, including reordered team input', () => {
    const ids = ['yuji', 'megumi', 'todo'];
    expect(runPilot('repeat', ids)).toEqual(runPilot('repeat', [...ids].reverse()));
  });
  test('all 40 starting matchups have bounded, legal state transitions', () => {
    for (const team of pilotTeams()) for (const boss of PILOT_BOSSES) for (let seed = 0; seed < 10; seed++) {
      const result = resolvePilotEncounter(team.map(initialCombatant), initialCombatant(boss), `matrix-${seed}`);
      expect(result.paragraphs).toHaveLength(3);
      expect(result.events.length).toBeLessThan(250);
      const state = structuredClone(result.start);
      for (const e of result.events) {
        const actor = state.find(s => s.id === e.actor)!;
        if (!['domain_end'].includes(e.kind)) expect(actor.status, `${boss}: ${e.text}`).toBe('active');
        for (const change of e.changes) {
          const i = state.findIndex(s => s.id === change.id);
          expect(state[i], `${e.id} ${e.kind}`).toEqual(change.before);
          state[i] = change.after;
          expect(change.after.ce).toBeGreaterThanOrEqual(0);
          expect(change.after.body).toBeGreaterThanOrEqual(0);
          expect(change.after.ce).toBeLessThanOrEqual(PILOT_PROFILES[change.id].reserves);
          if (change.before.status === 'out') expect(change.after.status).toBe('out');
        }
      }
      expect(state).toEqual(result.end);
    }
  });
  test('Megumi can leave the same matchup uninjured or injured as exchanges change', () => {
    const outcomes = new Set<string>();
    for (let n = 0; n < 100; n++) {
      const r = resolvePilotEncounter(['yuta', 'megumi', 'todo'].map(id => initialCombatant(id as 'yuta' | 'megumi' | 'todo')), initialCombatant('jogo'), `megumi-${n}`);
      const m = r.end.find(s => s.id === 'megumi')!;
      outcomes.add(m.body === PILOT_PROFILES.megumi.body ? 'uninjured' : 'injured');
    }
    expect([...outcomes].sort()).toEqual(['injured', 'uninjured']);
  });
  test('survivor retries carry exact state; no new casualty lottery', () => {
    let retries = 0;
    for (const team of pilotTeams()) for (let n = 0; n < 10; n++) {
      const run = runPilot(`retry-${n}`, team);
      for (let i = 1; i < run.rounds.length; i++) {
        const before = run.rounds[i - 1], current = run.rounds[i];
        if (before.rung === current.rung) { retries++; expect(current.combat.start).toEqual(before.combat.end); }
      }
    }
    expect(retries).toBeGreaterThan(0);
  });
  test('Todo never swaps Maki; zero CE does not exempt allies from a domain', () => {
    const boss = initialCombatant('jogo'); boss.domain = 2; boss.ce = 8;
    const team = ['yuji', 'maki', 'inumaki'].map(id => initialCombatant(id as 'yuji' | 'maki' | 'inumaki'));
    team[0].ce = 0;
    const r = resolvePilotEncounter(team, boss, 'domain-targets');
    expect(r.events.some(e => e.kind === 'target_excluded' && e.target === 'maki')).toBe(true);
    expect(r.events.some(e => e.kind === 'domain_hit' && e.target === 'yuji')).toBe(true);
    for (let i = 0; i < 20; i++) {
      const result = runPilot(`swap-${i}`, ['yuta', 'maki', 'todo']);
      expect(result.rounds.flatMap(r => r.combat.events).some(e => ['setup','rescue'].includes(e.kind) && e.target === 'maki')).toBe(false);
    }
  });
});
