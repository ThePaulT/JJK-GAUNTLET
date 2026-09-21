import { describe, expect, test } from 'vitest';
import { initialCombatant, resolvePilotEncounter, runPilot, combatCondition } from '../lib/pilot.ts';
import { isPilotTeam, pilotTeams, PILOT_BOSSES, PILOT_ROSTER, draftOptions, PILOT_PROFILES } from '../lib/pilot-data.ts';

import { PILOT_MATCHUPS } from '../lib/pilot-plans.ts';

describe('curated draft and deterministic combat', () => {
  test('six available fighters make twenty teams, with no repeated pick', () => {
    const offers = PILOT_ROSTER;
    expect(new Set(offers).size).toBe(6);
    expect(pilotTeams()).toHaveLength(20);
    expect(PILOT_MATCHUPS).toHaveLength(100);
    for (const team of pilotTeams()) expect(isPilotTeam(team)).toBe(true);
    expect(isPilotTeam(['yuji', 'yuji', 'todo'])).toBe(false);
    expect(isPilotTeam(['yuji', 'yuta', 'todo'])).toBe(true);
    expect(draftOptions(['yuji','yuta'])).toHaveLength(4);
    expect(draftOptions(['yuji'])).not.toContain('yuji');
    expect(() => runPilot('seed', ['gojo', 'maki', 'todo'])).toThrow();
  });
  test('same inputs replay, including reordered team input', () => {
    const ids = ['yuji', 'megumi', 'todo'];
    expect(runPilot('repeat', ids)).toEqual(runPilot('repeat', [...ids].reverse()));
  });
  test('all 100 starting matchups have bounded, legal state transitions', () => {
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

test('successful Stop has one immediate, damaging follow-up before release', () => {
  const r = resolvePilotEncounter(['yuji','maki','inumaki'].map(id => initialCombatant(id as 'yuji' | 'maki' | 'inumaki')), initialCombatant('hanami'), 'stop-chain');
  const speech = r.events.find(e => e.kind === 'speech' && e.text.includes('holding'))!;
  expect(speech).toBeDefined();
  const follow = r.events[r.events.indexOf(speech) + 1];
  expect(follow.sourceEventId).toBe(speech.id);
  expect(follow.kind).toBe('hit');
  expect(follow.changes.some(c => c.id === 'hanami' && c.after.body < c.before.body)).toBe(true);
  expect(r.events.filter(e => e.sourceEventId === speech.id)).toHaveLength(1);
  expect(r.highlights?.some(h => h.includes('Stop') && (h.includes('Yuji') || h.includes('Maki')))).toBe(true);
  const attacks = r.events.filter(e => e.exchange === follow.exchange && e.actor === follow.actor && ['hit','evade'].includes(e.kind));
  expect(attacks).toHaveLength(1);
});

test('setup sequences vary, exhausted or fallen supports cannot create openings', () => {
  const starts = new Set<string>();
  for (let n = 0; n < 20; n++) {
    const r = resolvePilotEncounter(['yuji','megumi','inumaki'].map(id => initialCombatant(id as 'yuji' | 'megumi' | 'inumaki')), initialCombatant('hanami'), `sequence-${n}`);
    starts.add(r.events.find(e => ['speech','toad'].includes(e.kind))!.kind);
  }
  expect(starts.size).toBe(2);
  const dead = initialCombatant('inumaki'); dead.status = 'out'; dead.body = 0; dead.throat = 3;
  const r = resolvePilotEncounter([initialCombatant('yuji'),initialCombatant('maki'),dead], initialCombatant('hanami'), 'no-ghost');
  expect(r.events.some(e => e.actor === 'inumaki')).toBe(false);
  expect(r.highlights?.join(' ')).not.toMatch(/voice|throat|commands/);
  expect(r.end.find(s => s.id === 'inumaki')).toEqual(dead);
});

test('post-transit highlight agrees with the displayed survivor conditions', () => {
  const run = runPilot('transit-summary', ['yuji','todo','inumaki']);
  for (const round of run.rounds.filter(r => r.won && r.rung < 4)) {
    for (const survivor of round.combat.end.filter(s => s.status === 'active' && !round.enemyIds.includes(s.id))) {
      expect(round.combat.highlights?.at(-1)).toContain(combatCondition(survivor).toLowerCase());
    }
  }
});
