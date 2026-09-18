import { getStore } from './store.ts';
import { runPilot } from './pilot.ts';
import type { SavedRun } from './share.ts';

/** Versioned replay links survive cold starts without storing client results. */
export function pilotReplayId(seed: string, teamIds: string[], createdAt: string): string {
  return `p1_${Buffer.from(JSON.stringify([seed, teamIds, createdAt])).toString('base64url')}`;
}
export async function loadRun(id: string): Promise<SavedRun | null> {
  if (!id.startsWith('p1_')) return getStore().get(id);
  if (id.length > 1600 || !/^p1_[A-Za-z0-9_-]+$/.test(id)) return null;
  try {
    const payload: unknown = JSON.parse(Buffer.from(id.slice(3), 'base64url').toString('utf8'));
    if (!Array.isArray(payload) || payload.length !== 3) return null;
    const [seed, teamIds, createdAt] = payload;
    if (typeof seed !== 'string' || !Array.isArray(teamIds) || typeof createdAt !== 'string' || !Number.isFinite(Date.parse(createdAt))) return null;
    const result = runPilot(seed, teamIds);
    return { id, createdAt, mode: 'gauntlet', side: 'hero', seed, teamIds: result.teamIds, result, stories: result.rounds.map(r => r.combat.paragraphs.join('\n\n')) };
  } catch { return null; }
}
