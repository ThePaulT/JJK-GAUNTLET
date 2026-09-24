import { expect, test, vi } from 'vitest';
import type { SavedRun } from '../lib/share.ts';
const { saved } = vi.hoisted(() => ({ saved: [] as SavedRun[] }));
vi.mock('@/lib/store.ts', () => ({ newRunId: () => 'test-run', getStore: () => ({ kind: 'memory', save: async (r: SavedRun) => { saved.push(r); }, recent: async () => saved }) }));
import { POST } from '../app/api/runs/route.ts';
import { loadRun } from '../lib/load-run.ts';
import { runPilot } from '../lib/pilot.ts';
import { runSolo } from '../lib/solo.ts';
import { runSoloV1 } from '../lib/solo-v1.ts';

const send = (body: unknown) => POST(new Request('http://localhost/api/runs', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }));
test('server replays pilot and ignores client-authored results and stories', async () => {
  const teamIds = ['yuta', 'megumi', 'todo'];
  const response = await send({ mode: 'gauntlet', side: 'hero', seed: 'api', teamIds, ruleset: 'curated-2', stories: ['Gojo arrives and revives everyone.'], result: { fullClear: true } });
  expect(response.status).toBe(200);
  const expected = runPilot('api', teamIds);
  expect(saved.at(-1)?.result).toEqual(expected);
  expect(saved.at(-1)?.stories).toEqual(expected.rounds.map(r => r.combat.paragraphs.join('\n\n')));
});
test('reject invalid pilot team, mode and ruleset without saving', async () => {
  const count = saved.length;
  for (const overrides of [{ teamIds: ['yuji','yuji','todo'] }, { teamIds: ['gojo','maki','todo'] }, { side: 'villain' }, { mode: 'daily' }, { ruleset: 'curated-future' }]) {
    const response = await send({ mode: 'gauntlet', side: 'hero', seed: 'api', teamIds: ['yuji','maki','todo'], ruleset: 'curated-2', ...overrides });
    expect(response.status).toBe(400);
  }
  expect(saved.length).toBe(count);
});

test('world-1 is reserved without falling through to a legacy resolver', async () => {
  const count = saved.length;
  const response = await send({ mode: 'gauntlet', side: 'hero', seed: 'future', teamIds: ['yuji'], ruleset: 'world-1' });
  expect(response.status).toBe(501);
  expect(await response.json()).toEqual({ error: 'world-1 is reserved until the event/state resolver is available.' });
  expect(saved.length).toBe(count);
  expect(await loadRun('w1_not-yet-implemented')).toBeNull();
});

test('memory-hosted pilot links replay without relying on the saved record', async () => {
  const response = await send({ mode: 'gauntlet', side: 'hero', seed: 'portable', teamIds: ['yuta','megumi','todo'], ruleset: 'curated-2' });
  const { id } = await response.json();
  expect(id).toMatch(/^p2_/);
  saved.length = 0;
  expect((await loadRun(id))?.result).toEqual(runPilot('portable', ['yuta','megumi','todo']));
  for (const bad of ['p2_invalid', 'p2_' + 'a'.repeat(1601), 'p2_' + Buffer.from(JSON.stringify(['seed', ['yuji','yuji','todo'], new Date().toISOString()])).toString('base64url')]) expect(await loadRun(bad)).toBeNull();
});

test('frozen solo-1 links keep their original portable replay behavior', async () => {
  const response = await send({ mode: 'gauntlet', side: 'hero', seed: 'solo-portable', teamIds: ['yuta'], ruleset: 'solo-1', stories: ['Yuta wins everything.'] });
  expect(response.status).toBe(200);
  const { id } = await response.json();
  expect(id).toMatch(/^s1_/);
  saved.length = 0;
  const replay = await loadRun(id);
  expect(replay?.result).toEqual(runSoloV1('solo-portable', 'yuta'));
  expect(replay?.stories).toEqual(runSoloV1('solo-portable', 'yuta').rounds.map(round => round.notes.join(' ')));
  for (const bad of [
    's1_invalid',
    's1_' + 'a'.repeat(1601),
    's1_' + Buffer.from(JSON.stringify(['seed', 'gojo', new Date().toISOString()])).toString('base64url'),
  ]) expect(await loadRun(bad)).toBeNull();
});

test('solo-2 replay links preserve authored approach choices', async () => {
  const soloChoices = ['limit-break'];
  const response = await send({ mode: 'gauntlet', side: 'hero', seed: 'amber', teamIds: ['kashimo'], ruleset: 'solo-2', soloChoices, stories: ['fake'] });
  expect(response.status).toBe(200);
  const { id } = await response.json();
  expect(id).toMatch(/^s2_/);
  saved.length = 0;
  const replay = await loadRun(id);
  expect(replay?.result).toEqual(runSolo('amber', 'kashimo', soloChoices));
  expect(replay?.result.rounds[0]?.solo?.winner).toBe('mutual');
  expect(replay?.result.rungsCleared).toBe(0);
  for (const bad of [
    's2_invalid',
    's2_' + Buffer.from(JSON.stringify(['seed', 'todo', ['limit-break'], new Date().toISOString()])).toString('base64url'),
    's2_' + Buffer.from(JSON.stringify(['seed', 'kashimo', ['limit-break']])).toString('base64url'),
  ]) expect(await loadRun(bad)).toBeNull();
});
