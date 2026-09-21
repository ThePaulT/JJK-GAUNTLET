/** Authored game abstractions, not canonical measurements. No legacy power scores. */
export const PILOT_RULESET = 'curated-1';
export const PILOT_PICKS = [
  { label: 'Lead the fight', ids: ['yuji', 'yuta'], hint: 'Soul pressure or Rika and a declared Copy loadout.' },
  { label: 'Create the opening', ids: ['megumi', 'maki'], hint: 'Shadows and barrier interference or direct pursuit with the Split Soul Katana.' },
  { label: 'Support the squad', ids: ['todo', 'inumaki'], hint: 'Reposition a valid ally or risk your voice to hold the opponent.' },
] as const;
export const PILOT_BOSSES = ['hanami', 'jogo', 'mahito', 'kenjaku', 'sukuna'] as const;
export type PilotId = 'yuji' | 'yuta' | 'megumi' | 'maki' | 'todo' | 'inumaki' | typeof PILOT_BOSSES[number];
export interface PilotProfile {
  version: string; kit: string; limits: string;
  body: number; reserves: number; speed: number; skill: number; output: number; defense: number;
  soul?: boolean; zeroCE?: boolean; rct?: boolean; curse?: boolean; simple?: boolean;
  domain?: { name: string; barrier: 'closed' | 'open'; refinement: number; effect: 'fire' | 'soul' | 'gravity' | 'slash' | 'extinguish' | 'separation' };
}
export const PILOT_PROFILES: Record<PilotId, PilotProfile> = {
  yuji: { version: 'Finale, own body', kit: 'Melee, soul-boundary Dismantle, self-RCT, Simple Domain, unnamed domain.', limits: 'No resident Sukuna protection; no guaranteed Black Flash. Blood Manipulation is outside this pilot loadout.', body: 24, reserves: 48, speed: 4, skill: 4, output: 4, defense: 4, soul: true, rct: true, simple: true, domain: { name: "Yuji’s unnamed domain", barrier: 'closed', refinement: 2, effect: 'separation' } },
  yuta: { version: 'Shinjuku, own body', kit: 'Katana, Rika, self-RCT, positive-energy output; Jacob’s Ladder selected as the domain sure-hit.', limits: 'No Gojo body or free mid-fight Copy. Rika has a finite manifestation budget; other copied techniques are outside this pilot.', body: 22, reserves: 72, speed: 4, skill: 4, output: 5, defense: 4, rct: true, domain: { name: 'Authentic Mutual Love', barrier: 'closed', refinement: 4, effect: 'extinguish' } },
  megumi: { version: 'Culling Game, before possession', kit: 'Divine Dog: Totality, Toad restraint, incomplete-domain barrier interference.', limits: 'No loyal Mahoraga; the hostile ritual is outside this pilot. An incomplete domain does not cancel an open-domain attack.', body: 16, reserves: 36, speed: 3, skill: 4, output: 3, defense: 3 },
  maki: { version: 'After Sakurajima awakening', kit: 'Complete Heavenly Restriction and the Split Soul Katana.', limits: 'Zero CE only exempts her from supported CE-targeting rules; matter-targeting attacks still reach her. Todo cannot swap her body.', body: 24, reserves: 0, speed: 5, skill: 4, output: 5, defense: 5, soul: true, zeroCE: true },
  todo: { version: 'Two-handed Shibuya', kit: 'Boogie Woogie, reinforced melee, Simple Domain.', limits: 'No Vibraslap; swapping requires active hands and a valid CE-bearing partner. A rescue puts Todo in the line of attack.', body: 20, reserves: 36, speed: 4, skill: 4, output: 3, defense: 4, simple: true },
  inumaki: { version: 'Shibuya before arm loss', kit: 'Audible Cursed Speech; ordinary close defense.', limits: 'Strong targets can resist. Recoil accumulates and can remove voice access; a command does not confer permanent restraint.', body: 14, reserves: 20, speed: 3, skill: 3, output: 2, defense: 2 },
  hanami: { version: 'Goodwill, before Purple', kit: 'Roots, cursed buds and durable curse body.', limits: 'No invented unshown domain effect.', body: 30, reserves: 25, speed: 3, skill: 3, output: 4, defense: 4, curse: true },
  jogo: { version: 'Shibuya', kit: 'Disaster Flames and Coffin of the Iron Mountain.', limits: 'No automatic domain at encounter start. Domain Amplification and Maximum Meteor are outside this pilot.', body: 25, reserves: 28, speed: 5, skill: 4, output: 5, defense: 3, curse: true, domain: { name: 'Coffin of the Iron Mountain', barrier: 'closed', refinement: 3, effect: 'fire' } },
  mahito: { version: 'Late Shibuya', kit: 'Idle Transfiguration, shaped limbs and Self-Embodiment of Perfection.', limits: 'Soul-aware attacks matter. No free soul repair from a polymorph bonus; transfigured armies are outside this pilot.', body: 28, reserves: 28, speed: 4, skill: 4, output: 4, defense: 4, curse: true, soul: true, domain: { name: 'Self-Embodiment of Perfection', barrier: 'closed', refinement: 3, effect: 'soul' } },
  kenjaku: { version: 'Geto body, Yuki encounter', kit: 'Declared curse pressure, close gravity reversal, Womb Profusion.', limits: 'Body-hopping is not the incarnated-object vulnerability. Only the declared gravity/curse kit is simulated.', body: 32, reserves: 32, speed: 4, skill: 5, output: 5, defense: 4, rct: true, domain: { name: 'Womb Profusion', barrier: 'open', refinement: 5, effect: 'gravity' } },
  sukuna: { version: 'Reincarnated-body encounter preset', kit: 'Shrine slashes, four-arm close pressure, Malevolent Shrine, self-RCT.', limits: 'Explicit game preset: restored domain access, reduced starting reserves after a prior battle. No Ten Shadows, Mahoraga, world slash, Kamutoke or Furnace in this pilot.', body: 42, reserves: 20, speed: 5, skill: 5, output: 6, defense: 5, rct: true, domain: { name: 'Malevolent Shrine', barrier: 'open', refinement: 5, effect: 'slash' } },
};
export function isPilotTeam(ids: readonly string[]): boolean {
  return ids.length === 3 && new Set(ids).size === 3 && PILOT_PICKS.every(p => p.ids.filter(id => ids.includes(id)).length === 1);
}
export function pilotTeams(): PilotId[][] {
  return PILOT_PICKS[0].ids.flatMap(a => PILOT_PICKS[1].ids.flatMap(b => PILOT_PICKS[2].ids.map(c => [a, b, c])));
}
export const PILOT_ENCOUNTER_RULES = 'Curated loadouts; no outside helpers. Reserves, output and damage units are game abstractions. A short transit restores four reserve units, eases one level of voice strain and ends ordinary burnout, but never erases wounds or soul damage. Rika is limited to ten assisted sword attacks per run in this pilot; this is a use budget, not a literal five-minute clock. Sukuna uses a declared reduced-reserve, domain-restored encounter preset.';
