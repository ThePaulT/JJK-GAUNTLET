import { expect, test, vi } from 'vitest';
import type { SavedRun } from '../lib/share.ts';
const { saved } = vi.hoisted(() => ({ saved: [] as SavedRun[] }));
vi.mock('@/lib/store.ts', () => ({ newRunId: () => 'test-run', getStore: () => ({ kind: 'memory', save: async (r: SavedRun) => { saved.push(r); }, recent: async () => saved }) }));
import { POST } from '../app/api/runs/route.ts';
import { runPilot } from '../lib/pilot.ts';

const send = (body: unknown) => POST(new Request('http://localhost/api/runs', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }));
test('server replays pilot and ignores client-authored results and stories', async () => {
  const teamIds = ['yuta', 'megumi', 'todo'];
  const response = await send({ mode: 'gauntlet', side: 'hero', seed: 'api', teamIds, ruleset: 'curated-1', stories: ['Gojo arrives and revives everyone.'], result: { fullClear: true } });
  expect(response.status).toBe(200);
  const expected = runPilot('api', teamIds);
  expect(saved.at(-1)?.result).toEqual(expected);
  expect(saved.at(-1)?.stories).toEqual(expected.rounds.map(r => r.combat.paragraphs.join('\n\n')));
});
test('reject invalid pilot team, mode and ruleset without saving', async () => {
  const count = saved.length;
  for (const overrides of [{ teamIds: ['yuji','yuji','todo'] }, { teamIds: ['gojo','maki','todo'] }, { side: 'villain' }, { mode: 'daily' }, { ruleset: 'curated-future' }]) {
    const response = await send({ mode: 'gauntlet', side: 'hero', seed: 'api', teamIds: ['yuji','maki','todo'], ruleset: 'curated-1', ...overrides });
    expect(response.status).toBe(400);
  }
  expect(saved.length).toBe(count);
});
