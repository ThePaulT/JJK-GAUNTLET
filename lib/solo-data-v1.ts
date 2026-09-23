/**
 * Authored solo rulings for the first supported ladder.
 *
 * These are game decisions under the declared encounter assumptions, not
 * claims that the manga depicts all thirty fights. Outcomes do not use a
 * power score or a hidden upset roll.
 */
export const SOLO_RULESET = 'solo-1';
export const SOLO_FIGHTERS = ['yuji', 'yuta', 'megumi', 'maki', 'todo', 'inumaki'] as const;
export const SOLO_BOSSES = ['hanami', 'jogo', 'mahito', 'kenjaku', 'sukuna'] as const;

export type SoloFighterId = (typeof SOLO_FIGHTERS)[number];
export type SoloBossId = (typeof SOLO_BOSSES)[number];
export type SoloVerdict = 'decisive' | 'favored';

export interface SoloProfile {
  version: string;
  loadout: string;
}

export interface SoloRuling {
  fighterId: SoloFighterId;
  bossId: SoloBossId;
  winner: 'fighter' | 'boss';
  verdict: SoloVerdict;
  reasons: readonly [string, string, ...string[]];
  swing?: string;
}

export const SOLO_ASSUMPTIONS = [
  'Each rung is a fresh fight: health, cursed energy, techniques and equipment reset. Nothing carries over except the record.',
  'Both fighters begin aware of each other at medium range in a neutral, open arena. There is no ambush, prep time or outside help.',
  'They fight in character and may use the complete listed loadout. A win means incapacitation, death or exorcism; retreat is a loss.',
] as const;

export const SOLO_PROFILES: Record<SoloFighterId | SoloBossId, SoloProfile> = {
  yuji: {
    version: 'Finale, own body',
    loadout: 'Awakened physical ability, Shrine, Blood Manipulation, soul awareness, self-RCT, Simple Domain and his domain. No resident Sukuna protection; no guaranteed Black Flash.',
  },
  yuta: {
    version: 'Shinjuku, own body',
    loadout: 'Katana, fully manifested Rika, self-RCT and output, domain, and copied techniques he displays through Sendai and Shinjuku. No Gojo body.',
  },
  megumi: {
    version: 'Culling Game, before possession',
    loadout: 'Available Ten Shadows shikigami and incomplete Chimera Shadow Garden. Mahoraga is excluded because its hostile ritual is not a controlled solo win condition.',
  },
  maki: {
    version: 'Fully awakened, after Sakurajima',
    loadout: 'Complete Heavenly Restriction, sharpened senses and the Split Soul Katana. She starts with the sword in hand.',
  },
  todo: {
    version: 'Shibuya, two hands',
    loadout: 'Original Boogie Woogie, reinforced close combat and Simple Domain. No Vibraslap and no allied swap partner.',
  },
  inumaki: {
    version: 'Shibuya, before arm loss',
    loadout: 'Cursed Speech and ordinary reinforced close defense. Commands require audibility and impose recoil against stronger targets.',
  },
  hanami: {
    version: 'Goodwill Event',
    loadout: 'Roots, wooden constructs, cursed buds, Flower Field and extreme durability. No invented effect for the unrevealed domain.',
  },
  jogo: {
    version: 'Shibuya',
    loadout: 'Disaster Flames, ember insects, Maximum: Meteor, Domain Amplification and Coffin of the Iron Mountain.',
  },
  mahito: {
    version: 'Late Shibuya',
    loadout: 'Idle Transfiguration, soul-shape defense, transfigured humans, distorted killing form and Self-Embodiment of Perfection.',
  },
  kenjaku: {
    version: 'Geto body, Yuki fight',
    loadout: 'Cursed Spirit Manipulation, antigravity reversal, RCT and the open-barrier Womb Profusion. No pre-planted trap or outside ally.',
  },
  sukuna: {
    version: 'Meguna, start of the Gojo fight',
    loadout: 'Full reserves, Shrine, Malevolent Shrine, RCT and Ten Shadows. No world-cutting slash yet and no prior-battle depletion.',
  },
};

const r = (
  fighterId: SoloFighterId,
  bossId: SoloBossId,
  winner: SoloRuling['winner'],
  verdict: SoloVerdict,
  reasons: SoloRuling['reasons'],
  swing?: string,
): SoloRuling => ({ fighterId, bossId, winner, verdict, reasons, swing });

export const SOLO_RULINGS: readonly SoloRuling[] = [
  r('yuji', 'hanami', 'fighter', 'decisive', [
    'Finale Yuji is far beyond the Goodwill fighter who could already damage Hanami in close combat.',
    'Shrine adds a reliable cutting route while RCT lets Yuji survive damage that once forced his team to rotate out.',
    'Hanami’s unrevealed domain receives no invented sure-hit that could reverse the matchup.',
  ]),
  r('yuji', 'jogo', 'fighter', 'favored', [
    'Yuji’s finale durability, RCT and close pressure give him a credible route through Jogo’s ranged fire.',
    'Simple Domain and Yuji’s own expansion keep Coffin of the Iron Mountain from being an automatic ending.',
    'Jogo remains dangerous at range, so this is a favored ruling rather than a clean mismatch.',
  ], 'Jogo wins if he keeps separation long enough to force Yuji’s anti-domain defense before Yuji establishes close pressure.'),
  r('yuji', 'mahito', 'fighter', 'decisive', [
    'Yuji can perceive and strike the soul, so Mahito cannot rely on reshaping his body to erase the damage.',
    'The finale version is substantially stronger and has both Simple Domain and a domain of his own.',
    'Mahito’s touch is still dangerous, but the neutral start does not grant him a free contact or sure-hit.',
  ]),
  r('yuji', 'kenjaku', 'boss', 'favored', [
    'Kenjaku can layer curse pressure, gravity and high-level barrier control instead of meeting Yuji in a pure melee exchange.',
    'Womb Profusion attacks from an open barrier, while Yuji’s Simple Domain is temporary protection rather than a win condition.',
    'Yuji can hurt Kenjaku if he closes, but Kenjaku has more ways to deny that route in the declared arena.',
  ], 'Yuji wins if he survives the first domain sequence with enough output to trap Kenjaku in sustained close combat.'),
  r('yuji', 'sukuna', 'boss', 'decisive', [
    'This Sukuna starts fresh at full reserves instead of carrying the damage and restrictions of the final raid.',
    'Shrine, Ten Shadows and an open domain give him several independent answers to Yuji’s approach and domain defense.',
    'Yuji’s late solo progress against a heavily worn Sukuna does not establish a win over this version.',
  ]),

  r('yuta', 'hanami', 'fighter', 'decisive', [
    'Yuta and fully manifested Rika can pressure from two angles and exceed Hanami’s demonstrated defensive pace.',
    'A direct positive-energy output is a decisive exorcism threat to a cursed spirit once Yuta creates contact.',
    'His domain and copied techniques give him multiple ways to create that opening without inventing a Hanami domain.',
  ]),
  r('yuta', 'jogo', 'fighter', 'decisive', [
    'Rika prevents Jogo from controlling every approach lane while Yuta can heal through non-terminal burns.',
    'Yuta’s domain can force a response and his positive-energy output can finish a curse on successful delivery.',
    'Jogo’s speed and fire are real threats, but they do not deny all of Yuta’s independent closing tools.',
  ]),
  r('yuta', 'mahito', 'fighter', 'decisive', [
    'Yuta can force Mahito to defend against Rika, a domain and copied techniques at the same time.',
    'Positive-energy output supplies a direct exorcism route without assuming ordinary damage automatically harms the soul.',
    'Mahito must land a meaningful soul touch before Yuta or Rika creates the finishing contact.',
  ]),
  r('yuta', 'kenjaku', 'fighter', 'favored', [
    'Fully manifested Rika makes this a two-body assault and stops Kenjaku from answering Yuta with one defensive line.',
    'Positive-energy output can erase deployed curses, while Jacob’s Ladder and Yuta’s domain threaten technique use directly.',
    'Kenjaku’s open domain is the strongest counterargument, so the ruling is close rather than decisive.',
  ], 'Kenjaku wins if Womb Profusion breaks Yuta’s barrier before Yuta and Rika convert their opening into a finish.'),
  r('yuta', 'sukuna', 'boss', 'decisive', [
    'A fresh full-reserve Sukuna is much stronger than the already damaged version Yuta fought with Yuji’s help.',
    'Malevolent Shrine can attack Yuta’s barrier from outside while Ten Shadows divides Yuta and Rika’s attention.',
    'Yuta has dangerous tools, but no solo sequence shown against Sukuna supports overcoming all three layers here.',
  ]),

  r('megumi', 'hanami', 'boss', 'decisive', [
    'Hanami endured coordinated attacks from several Goodwill fighters; Megumi alone lacks a comparable finishing sequence.',
    'Megumi’s incomplete domain improves his options but does not supply a sealed sure-hit or a guaranteed escape.',
    'His shikigami can delay and reposition, while Hanami’s roots and buds keep taxing that limited space.',
  ]),
  r('megumi', 'jogo', 'boss', 'decisive', [
    'Jogo’s speed and wide-area fire can remove shikigami before Megumi builds a layered setup.',
    'An incomplete Chimera Shadow Garden does not neutralize Jogo’s completed domain.',
    'Mahoraga is excluded as an uncontrolled ritual, so Megumi has no credible solo reversal.',
  ]),
  r('megumi', 'mahito', 'boss', 'decisive', [
    'Megumi has no established soul-targeting attack to bypass Mahito’s shape-based defense efficiently.',
    'Shikigami create distance but also give Mahito material and time to pressure Megumi from several angles.',
    'Megumi’s incomplete domain can contest space, not reliably defeat Self-Embodiment of Perfection.',
  ]),
  r('megumi', 'kenjaku', 'boss', 'decisive', [
    'Kenjaku commands a much larger curse inventory and can overwhelm Megumi’s smaller summon set.',
    'Gravity punishes close shadow entries, while an open domain bypasses Megumi’s incomplete barrier answer.',
    'Megumi has clever survival routes but no controlled finisher for this version of Kenjaku.',
  ]),
  r('megumi', 'sukuna', 'boss', 'decisive', [
    'Sukuna knows Ten Shadows intimately and fields the stronger version of the same technique in this matchup.',
    'Malevolent Shrine denies Megumi the stable space needed to build Chimera Shadow Garden.',
    'The excluded Mahoraga ritual would threaten Megumi as well and is not treated as a win button.',
  ]),

  r('maki', 'hanami', 'fighter', 'decisive', [
    'Awakened Maki can cross Hanami’s root pressure with speed and senses far beyond her Goodwill version.',
    'The Split Soul Katana cuts the soul rather than asking Maki to grind through Hanami’s exceptional outer durability.',
    'Starting with the sword removes the equipment ambiguity from her finishing route.',
  ]),
  r('maki', 'jogo', 'fighter', 'favored', [
    'Maki’s physical speed and perception give her a credible path through Jogo’s ranged attacks to one lethal sword exchange.',
    'Her lack of cursed energy complicates a closed barrier’s normal targeting, though ambient heat and physical fire still matter.',
    'Jogo can win by maintaining distance; the ruling favors Maki because the neutral arena offers no prepared screen to keep her out.',
  ], 'Jogo wins if wide-area fire keeps Maki outside sword range long enough for environmental heat and repeated attacks to accumulate.'),
  r('maki', 'mahito', 'fighter', 'decisive', [
    'Maki’s awakened perception and Split Soul Katana give her a direct attack on the soul Mahito is preserving.',
    'Zero cursed energy makes trapping and automatically targeting her with a standard closed domain unreliable.',
    'Mahito can still transfigure by manual touch, but Maki’s speed and armed reach make that the less credible first finish.',
  ]),
  r('maki', 'kenjaku', 'boss', 'favored', [
    'The visible neutral start removes the surprise that makes Maki especially dangerous as an assassin.',
    'Kenjaku can fill space with curses and use gravity to interrupt the straight closing route her sword needs.',
    'Maki can still end the fight on a clean soul-cutting hit, so Kenjaku is favored rather than guaranteed.',
  ], 'Maki wins if she uses the curse screen to hide one approach and lands the Split Soul Katana before Kenjaku establishes domain control.'),
  r('maki', 'sukuna', 'boss', 'decisive', [
    'A fresh Sukuna has the perception and speed to track Maki without relying only on cursed-energy sensing.',
    'Open-domain slashes affect the physical environment and do not depend on a closed barrier recognizing her cursed energy.',
    'Ten Shadows and full reserves deny the narrow close-range exchange Maki needs for a sword finish.',
  ]),

  r('todo', 'hanami', 'boss', 'decisive', [
    'Todo can swap with Hanami and cursed objects, but without an ally those swaps do not create a second attacker.',
    'His reinforced blows lack the demonstrated output to finish Hanami’s exceptional durability alone.',
    'Hanami can keep producing roots and buds until one disrupted approach becomes a losing exchange.',
  ]),
  r('todo', 'jogo', 'boss', 'decisive', [
    'Solo Boogie Woogie changes positions but does not remove Jogo’s wide-area fire from the arena.',
    'Todo’s Simple Domain buys time against a sure-hit; it does not stop ordinary flames while maintained.',
    'Jogo’s speed and output leave Todo without a credible solo finishing route.',
  ]),
  r('todo', 'mahito', 'boss', 'decisive', [
    'Todo has no established way to damage Mahito’s soul, so even successful melee exchanges do not provide a reliable finish.',
    'Boogie Woogie is much less punishing without Yuji present to attack from the swapped angle.',
    'Simple Domain can interrupt the domain threat briefly, but a later touch still decides the fight for Mahito.',
  ]),
  r('todo', 'kenjaku', 'boss', 'decisive', [
    'Kenjaku can seed the arena with many cursed-energy swap targets and make solo Boogie Woogie harder to convert into damage.',
    'Gravity controls the close range where Todo must fight, while curse pressure occupies his defense.',
    'Simple Domain cannot by itself solve an open barrier or produce a finish.',
  ]),
  r('todo', 'sukuna', 'boss', 'decisive', [
    'Boogie Woogie can create momentary misdirection, but Todo has no allied attack to make the swapped angle lethal.',
    'Sukuna’s area slashes, Ten Shadows and open domain cover positions rather than depending on one target line.',
    'The physical and output gap makes a prolonged close fight decisively favor Sukuna.',
  ]),

  r('inumaki', 'hanami', 'boss', 'decisive', [
    'Cursed Speech can move or stagger Hanami, but the recoil rises sharply against a durable special-grade target.',
    'Inumaki has no teammate to turn a brief command into the heavy follow-up Hanami required at Goodwill.',
    'Once his voice degrades, Hanami’s roots and buds decide the ordinary combat exchange.',
  ]),
  r('inumaki', 'jogo', 'boss', 'decisive', [
    'An audible command may interrupt one action, but stronger commands risk disabling Inumaki’s own voice.',
    'Jogo can attack across the arena and does not need to enter Inumaki’s limited close offense.',
    'Cursed Speech alone does not supply a supported finishing route before fire pressure resumes.',
  ]),
  r('inumaki', 'mahito', 'boss', 'decisive', [
    'A command can restrain Mahito briefly, but Inumaki has no established soul attack to capitalize on that window.',
    'Repeated commands worsen recoil while Mahito can preserve his soul through ordinary body damage.',
    'One eventual touch or domain opening gives Mahito the decisive condition.',
  ]),
  r('inumaki', 'kenjaku', 'boss', 'decisive', [
    'Kenjaku can place curses between himself and the speaker while attacking from several directions.',
    'A high-output command against Kenjaku risks severe recoil without guaranteeing a finish.',
    'Gravity and an open domain remain available after any brief interruption.',
  ]),
  r('inumaki', 'sukuna', 'boss', 'decisive', [
    'Even if Cursed Speech causes a brief hitch, the strength gap makes a fight-ending command catastrophically costly to Inumaki.',
    'Sukuna can answer from range with Shrine and cover the arena with Malevolent Shrine or Ten Shadows.',
    'Inumaki has no solo follow-up that turns one interrupted action into a credible finish.',
  ]),
] as const;

const rulingMap = new Map(SOLO_RULINGS.map((ruling) => [`${ruling.fighterId}:${ruling.bossId}`, ruling]));

export function isSoloFighter(id: string): id is SoloFighterId {
  return (SOLO_FIGHTERS as readonly string[]).includes(id);
}

export function soloRuling(fighterId: SoloFighterId, bossId: SoloBossId): SoloRuling {
  const ruling = rulingMap.get(`${fighterId}:${bossId}`);
  if (!ruling) throw new Error(`Missing solo ruling: ${fighterId} vs ${bossId}`);
  return ruling;
}
