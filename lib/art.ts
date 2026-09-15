/**
 * Generated character art.
 *
 * Jujutsu Kaisen artwork is copyrighted, so none ships here. Instead every
 * character gets an original composition built from what the database already
 * says about them: the silhouette comes from their `role`, the effect layer
 * from their highest-priority `tag`, and the density from their `power`. The
 * result is deterministic — the same character is always the same picture —
 * and distinct enough that you learn to recognise them.
 *
 * Real art, if you have the rights to any, overrides all of this: see
 * public/characters/README.md.
 */

import { character } from './data.ts';
import { makeRng } from './rng.ts';
import type { Rng } from './rng.ts';

export type Motif =
  | 'void'
  | 'slash'
  | 'flame'
  | 'ice'
  | 'plant'
  | 'blood'
  | 'electric'
  | 'shikigami'
  | 'soul'
  | 'speech'
  | 'swarm'
  | 'construct'
  | 'zero'
  | 'luck'
  | 'domain';

/** First match wins, so the most defining tag decides the picture. */
const MOTIF_BY_TAG: [string, Motif][] = [
  ['infinity', 'void'],
  ['six_eyes', 'void'],
  ['antigravity', 'void'],
  ['spatial_manipulation', 'void'],
  ['world_cutting_slash', 'slash'],
  ['shrine', 'slash'],
  ['soul_strike', 'slash'],
  ['ratio_crit', 'slash'],
  ['zero_ce', 'zero'],
  ['tech_nullify', 'zero'],
  ['barrier_ignore', 'zero'],
  ['flame', 'flame'],
  ['ice', 'ice'],
  ['plant', 'plant'],
  ['poison_blood', 'blood'],
  ['blood_manipulation', 'blood'],
  ['rot', 'blood'],
  ['electric_ce', 'electric'],
  ['mahoraga', 'shikigami'],
  ['shikigami', 'shikigami'],
  ['rika', 'shikigami'],
  ['multi_core', 'shikigami'],
  ['curse_manipulation', 'shikigami'],
  ['soul_manipulation', 'soul'],
  ['soul_damage', 'soul'],
  ['resonance', 'soul'],
  ['shapeshift', 'soul'],
  ['cursed_speech', 'speech'],
  ['swarm', 'swarm'],
  ['scout', 'swarm'],
  ['ranged', 'swarm'],
  ['construction', 'construct'],
  ['jackpot', 'luck'],
  ['luck', 'luck'],
  ['comedian', 'luck'],
  ['sure_hit_domain', 'domain'],
  ['open_domain', 'domain'],
  ['incomplete_domain', 'domain'],
  ['anti_domain', 'domain'],
];

export interface Art {
  motif: Motif;
  role: string;
  accent: string;
  /** 0-1, from power: how dense and loud the effect layer is. */
  intensity: number;
  openDomain: boolean;
  rng: Rng;
  initial: string;
}

export function artFor(id: string): Art {
  const c = character(id);
  const motif = MOTIF_BY_TAG.find(([tag]) => c.tags.includes(tag))?.[1] ?? 'slash';
  return {
    motif,
    role: c.role,
    accent: c.side === 'hero' ? 'var(--color-curse)' : 'var(--color-blood)',
    intensity: Math.min(1, Math.max(0.25, (c.power - 40) / 60)),
    openDomain: c.domain.type === 'open',
    rng: makeRng(`art:${c.id}`),
    initial: c.name.replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase(),
  };
}
