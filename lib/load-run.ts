import { getStore } from './store.ts';
import { runPilot as runPilotV1 } from './pilot-v1.ts';
import { runPilot } from './pilot.ts';
import { runSolo } from './solo.ts';
import type { SavedRun } from './share.ts';

/** Versioned replay links survive cold starts without storing client results. */
export function pilotReplayId(seed: string, teamIds: string[], createdAt: string, ruleset = 'curated-2'): string {
  return `${ruleset === 'curated-1' ? 'p1' : 'p2'}_${Buffer.from(JSON.stringify([seed, teamIds, createdAt])).toString('base64url')}`;
}
export function soloReplayId(seed: string, fighterId: string, createdAt: string): string {
  return `s1_${Buffer.from(JSON.stringify([seed, fighterId, createdAt])).toString('base64url')}`;
}
export async function loadRun(id: string): Promise<SavedRun | null> {
  if (!/^(?:p[12]|s1)_/.test(id)) return getStore().get(id);
  if (id.length > 1600 || !/^(?:p[12]|s1)_[A-Za-z0-9_-]+$/.test(id)) return null;
  try {
    const payload: unknown = JSON.parse(Buffer.from(id.slice(3), 'base64url').toString('utf8'));
    if (!Array.isArray(payload) || payload.length !== 3) return null;
    const [seed, selection, createdAt] = payload;
    if (typeof seed !== 'string' || typeof createdAt !== 'string' || !Number.isFinite(Date.parse(createdAt))) return null;
    if (id.startsWith('s1_')) {
      if (typeof selection !== 'string') return null;
      const result = runSolo(seed, selection);
      return { id, createdAt, mode: 'gauntlet', side: 'hero', seed, teamIds: result.teamIds, result, stories: result.rounds.map(round => round.notes.join(' ')) };
    }
    if (!Array.isArray(selection)) return null;
    const result = id.startsWith('p1_') ? runPilotV1(seed, selection) : runPilot(seed, selection);
    return { id, createdAt, mode: 'gauntlet', side: 'hero', seed, teamIds: result.teamIds, result, stories: result.rounds.map(r => r.combat.paragraphs.join('\n\n')) };
  } catch { return null; }
}
