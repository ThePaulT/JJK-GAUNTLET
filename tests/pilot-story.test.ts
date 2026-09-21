import { expect, test } from 'vitest';
import { transitText } from '../lib/pilot-story.ts';
import { initialCombatant } from '../lib/pilot.ts';
import { loadRun, pilotReplayId } from '../lib/load-run.ts';
import { runPilot as runPilotV1 } from '../lib/pilot-v1.ts';

test('transit names voice recovery only when living Inumaki actually recovers', () => {
  const before = initialCombatant('inumaki'); before.throat = 2;
  expect(transitText([{id:'inumaki',before,after:{...before,throat:1}}])).toContain('Inumaki’s throat strain eases');
  const dead = {...before,body:0,status:'out' as const};
  expect(transitText([{id:'inumaki',before:dead,after:{...dead,throat:1}}])).toBe('');
  const yuji = initialCombatant('yuji'); yuji.ce = 20;
  expect(transitText([{id:'yuji',before:yuji,after:{...yuji,ce:24}}])).not.toMatch(/voice|throat|burnout/);
});

test('previously shared v1 runs retain their original combat rules', async () => {
  const ids = ['yuta','megumi','todo'];
  const id = pilotReplayId('release-check',ids,'2026-09-18T08:17:39.961Z','curated-1');
  expect(id).toMatch(/^p1_/);
  const replay = await loadRun(id);
  expect(replay?.result).toEqual(runPilotV1('release-check',ids));
  expect(replay?.result.record).toBe('4/5');
});
