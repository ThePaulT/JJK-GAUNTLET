/**
 * Authored solo rulings for the first supported ladder.
 *
 * These are game decisions under the declared encounter assumptions, not
 * claims that the manga depicts all thirty fights. Outcomes do not use a
 * power score or a hidden upset roll.
 */
export const SOLO_RULESET = 'solo-2';
export const SOLO_FIGHTERS = [
  'yuji', 'yuta', 'megumi', 'maki', 'todo', 'inumaki',
  'gojo', 'hakari', 'kashimo', 'yuki', 'toji', 'yorozu',
] as const;
export const SOLO_BOSSES = ['hanami', 'jogo', 'mahito', 'kenjaku', 'sukuna'] as const;

export type SoloFighterId = (typeof SOLO_FIGHTERS)[number];
export type SoloBossId = (typeof SOLO_BOSSES)[number];
export type SoloVerdict = 'decisive' | 'favored' | 'contested';
export type SoloWinner = 'fighter' | 'boss' | 'mutual';
export type SoloApproachId = 'measured' | 'limit-break';

export interface SoloProfile {
  version: string;
  loadout: string;
  boundary?: string;
}

export interface SoloRuling {
  fighterId: SoloFighterId;
  bossId: SoloBossId;
  winner: 'fighter' | 'boss';
  verdict: SoloVerdict;
  reasons: readonly [string, string, string];
  swing?: string;
}

export interface SoloPath {
  winner: SoloWinner;
  verdict: SoloVerdict;
  title: string;
  beats: readonly [string, string, string];
  cost: string;
  hinge: string;
  terminal?: boolean;
  uncertainty?: string;
}

export interface SoloGamble {
  label: string;
  commit: string;
  costHint: string;
  paths: readonly [SoloPath, ...SoloPath[]];
}

export interface SoloResolvedPath extends SoloPath {
  approachId: SoloApproachId;
  approachLabel: string;
  commit: string;
  branchIndex: number;
}

export const SOLO_ASSUMPTIONS = [
  'Each rung begins as a fresh encounter: ordinary wounds, cursed energy, burnout, summons and equipment reset. A fighter who dies or becomes unable to continue does not revive for the next rung.',
  'Both fighters begin aware of each other at medium range in a neutral, open arena. There is no ambush, prep time or outside help.',
  'They fight in character and may use the complete listed loadout. A win means incapacitation, death or exorcism; retreat is a loss.',
  'The standard line is fixed. A limit-break appears only where a distinct, credible commitment changes the fight; contested gambles use a replayable timing branch among authored outcomes.',
] as const;

const p = (
  winner: SoloWinner,
  verdict: SoloVerdict,
  title: string,
  beats: SoloPath['beats'],
  cost: string,
  hinge: string,
  extras: Pick<SoloPath, 'terminal' | 'uncertainty'> = {},
): SoloPath => ({ winner, verdict, title, beats, cost, hinge, ...extras });

const g = (
  label: string,
  commit: string,
  costHint: string,
  ...paths: [SoloPath, ...SoloPath[]]
): SoloGamble => ({ label, commit, costHint, paths });

const SOLO_GAMBLES = new Map<string, SoloGamble>([
  ['yuji:kenjaku', g(
    'Stake everything on the domain',
    'Yuji forces his own expansion before Kenjaku can dictate the barrier sequence.',
    'Severe cursed-energy drain and burnout; failure leaves him inside an open domain.',
    p('fighter', 'contested', 'The soul boundary opens first', [
      'Yuji accepts the curse screen’s damage and establishes his domain before Womb Profusion is complete.',
      'The sure-hit attacks the boundary between Kenjaku and Geto’s body, creating an inferred separation problem ordinary RCT does not simply erase.',
      'Yuji keeps Kenjaku under physical pressure through the stagger and finishes before his own technique burns out.',
    ], 'Yuji wins exhausted and burned out, but alive; the next fresh rung may begin.', 'Yuji must establish first and convert an inferred soul interaction that canon never tests.', { uncertainty: 'A replayable timing branch decides which domain is established first.' }),
    p('boss', 'contested', 'The open barrier establishes first', [
      'Yuji drives through the curse screen and begins his expansion at the first close opening.',
      'Kenjaku establishes Womb Profusion outside the closed barrier and attacks its structure while gravity stalls Yuji.',
      'Yuji’s domain collapses into burnout; the open sure-hit resumes before he can rebuild Simple Domain.',
    ], 'Yuji loses after spending the domain and most of his recovery budget.', 'Open-barrier experience and establishment order decide the branch.', { uncertainty: 'A replayable timing branch decides which domain is established first.' }),
  )],
  ['yuta:kenjaku', g(
    'Burn the full five minutes at once',
    'Yuta manifests Rika, expands his domain and commits Jacob’s Ladder in one compressed sequence.',
    'If the conversion misses, Rika’s window and the domain are both spent.',
    p('fighter', 'contested', 'The extinguishment lane holds', [
      'Yuta and Rika accept gravity’s first interruption and keep two bodies on Kenjaku’s casting line.',
      'Jacob’s Ladder suppresses technique access long enough for the domain pressure to matter rather than claiming permanent nullification.',
      'Yuta lands the sword finish before the open barrier regains control.',
    ], 'Yuta wins at the edge of Rika’s timer, burned out and depleted but alive.', 'Extinguishment must overlap the physical finish.', { uncertainty: 'A replayable timing branch decides whether conversion beats the barrier break.' }),
    p('boss', 'contested', 'The five-minute window breaks', [
      'Yuta exposes his full plan and Kenjaku spends curses to keep Rika one beat away.',
      'Womb Profusion attacks the domain from outside while gravity interrupts Yuta’s finishing contact.',
      'Complete manifestation expires into burnout and Kenjaku finishes the isolated sorcerer.',
    ], 'Yuta loses after spending Rika, his domain and his highest-output line.', 'Kenjaku wins by buying one more beat than the manifestation permits.', { uncertainty: 'A replayable timing branch decides whether conversion beats the barrier break.' }),
  )],
  ['maki:jogo', g(
    'Run through the fire line',
    'Maki accepts a direct burn lane to take the shortest path to Jogo.',
    'A failed read means incapacitating burns before sword contact.',
    p('fighter', 'contested', 'The shortest line reaches Jogo', [
      'Maki enters through the eruption’s edge instead of circling its expanding front.',
      'Her body survives the brief exposure and the committed angle denies Jogo a second ranged reset.',
      'The Split Soul Katana lands once and ends the curse.',
    ], 'Maki wins with material burns that reset only because the next rung is a fresh fight.', 'She must cross before the heat becomes sustained.', { uncertainty: 'A replayable timing branch resolves whether body or flame reaches its consequence first.' }),
    p('boss', 'contested', 'The heat closes first', [
      'Maki chooses the shortest route and Jogo collapses several fire lanes onto it.',
      'Zero cursed energy prevents ordinary sure-hit recognition, but does not erase the physical blast.',
      'Accumulated burns stop her just outside sword range.',
    ], 'Maki is incapacitated before contact.', 'The gamble fails on environmental damage, not magical recognition.', { uncertainty: 'A replayable timing branch resolves whether body or flame reaches its consequence first.' }),
  )],
  ['maki:kenjaku', g(
    'Use the curse screen as cover',
    'Maki enters the swarm instead of clearing it, gambling that Kenjaku loses her physical line.',
    'One mistimed gravity pulse leaves her surrounded inside domain range.',
    p('fighter', 'contested', 'The screen hides the blade', [
      'Maki lets curse bodies block Kenjaku’s direct read instead of treating each as a target.',
      'She changes level through the blind spot before gravity can center on her path.',
      'The Split Soul Katana reaches Geto’s body before Womb Profusion establishes.',
    ], 'Maki wins with the cursed tool still in hand.', 'The exact blind spot is a tactical inference, not a canon-tested interaction.', { uncertainty: 'A replayable read branch decides whether Kenjaku locates the zero-CE entry.' }),
    p('boss', 'contested', 'Gravity catches the hidden entry', [
      'Maki uses the curse swarm to conceal the first half of her approach.',
      'Kenjaku sacrifices the screen and centers gravity on the only physical exit.',
      'The interruption gives Womb Profusion enough time to end the attempt.',
    ], 'Maki is incapacitated after committing her only hidden route.', 'Kenjaku reads terrain rather than magically sensing zero cursed energy.', { uncertainty: 'A replayable read branch decides whether Kenjaku locates the zero-CE entry.' }),
  )],
  ['inumaki:hanami', g(
    'Spend everything on “Die”',
    'Inumaki waits for Flower Field to lower active pressure, then commits all remaining output to one lethal command.',
    'Terminal throat and cursed-energy backlash. Even success leaves him unable to continue.',
    p('mutual', 'contested', 'The command takes both fighters out', [
      'Inumaki survives the root screen long enough to speak into the brief Flower Field lull.',
      '“Die” catches Hanami without a second action available to break delivery and forces exorcism in this authored branch.',
      'The resistance gap returns as catastrophic recoil; Inumaki collapses too, so the ladder ends here.',
    ], 'Hanami is exorcised and Inumaki is terminally incapacitated. This is not a surviving clear.', 'Canon shows severe recoil scaling and lethal words on weaker targets, but never proves this command kills Hanami.', { terminal: true, uncertainty: 'A replayable resistance branch resolves whether the command completes before backlash disables the speaker.' }),
    p('boss', 'contested', 'Backlash breaks the command first', [
      'Inumaki finds the same lull and pours every remaining reserve into “Die.”',
      'Hanami’s special-grade resistance blunts the lethal instruction before it completes.',
      'Reflected strain destroys Inumaki’s voice and drops him while Hanami remains damaged but active.',
    ], 'Inumaki is incapacitated by his own command; Hanami survives.', 'Spending more energy does not prove any wording can cross any target gap.', { uncertainty: 'A replayable resistance branch resolves whether the command completes before backlash disables the speaker.' }),
  )],
  ['gojo:sukuna', g(
    'Force Unlimited Void’s narrow lead',
    'Gojo repeatedly changes barrier conditions and restores his technique, accepting escalating brain strain for one decisive Void interval.',
    'Failure removes his domain while adaptation continues.',
    p('fighter', 'contested', 'Unlimited Void holds long enough', [
      'Gojo accepts another dangerous brain reset and changes the barrier before the next external attack stabilizes.',
      'Unlimited Void reaches Sukuna for a narrow interval before Mahoraga completes adaptation.',
      'Gojo destroys Mahoraga during the stun and finishes Sukuna before a world-targeting model exists.',
    ], 'Gojo survives with severe brain strain and his domain unavailable.', 'This is a credible unconverted branch of the canon clash, not a universal Void win.', { uncertainty: 'A replayable clash branch resolves the last barrier interval.' }),
    p('boss', 'contested', 'The last barrier breaks outside-in', [
      'Gojo spends another brain reset to force the same narrow Unlimited Void route.',
      'Malevolent Shrine breaks the closed barrier before the sure-hit can hold Sukuna.',
      'The failed expansion leaves Gojo strained while Mahoraga completes the adaptation path.',
    ], 'Gojo loses after exceeding the safe domain-recovery sequence.', 'Barrier timing and accumulated brain strain decide the failure.', { uncertainty: 'A replayable clash branch resolves the last barrier interval.' }),
  )],
  ['hakari:kenjaku', g(
    'Chain the domain on the timer edge',
    'Hakari re-expands the instant jackpot ends, gambling his base-state life on another roll.',
    'Miss the transition and automatic RCT ends inside an open domain.',
    p('fighter', 'contested', 'The second jackpot arrives in time', [
      'Hakari drives Kenjaku backward through the final seconds of the first jackpot.',
      'He re-expands before gravity separates them and the rule sequence reaches another jackpot.',
      'Renewed healing carries him through the first open-domain punishment and he finishes at close range.',
    ], 'Hakari survives because the second jackpot begins before damage becomes terminal.', 'This follows the domain state machine, not a generic luck bonus.', { uncertainty: 'A replayable transition branch decides whether jackpot arrives before terminal damage.' }),
    p('boss', 'contested', 'Base Hakari is caught between rolls', [
      'Hakari stays committed as the first timer expires and begins Restless Gambler again.',
      'Gravity steals the pressure beat, then Womb Profusion attacks the new barrier.',
      'The second jackpot does not arrive before base Hakari takes terminal damage.',
    ], 'Hakari dies with the second domain committed.', 'Prior automatic healing does not persist after the timer.', { uncertainty: 'A replayable transition branch decides whether jackpot arrives before terminal damage.' }),
  )],
  ['kashimo:hanami', g(
    'Activate Mythical Beast Amber',
    'Kashimo reconstructs his body for maximum electrical phenomena immediately.',
    'Terminal bodily collapse after the technique; there is no ladder advance even if Hanami falls.',
    p('mutual', 'decisive', 'Amber annihilates the rung and its user', [
      'Kashimo activates before Hanami can build the root field.',
      'The transformed attacks overwhelm the curse and complete the exorcism.',
      'Kashimo’s reconstructed flesh collapses when the one-use technique ends.',
    ], 'Hanami is exorcised and Kashimo dies. The result is a mutual stop, not a clear.', 'MBA’s terminal aftermath is unavoidable in this ruleset.', { terminal: true }),
  )],
  ['kashimo:jogo', g(
    'Activate Mythical Beast Amber',
    'Kashimo trades his future body for speed and electromagnetic attacks that can contest Jogo’s range.',
    'Terminal bodily collapse whether or not the boss falls.',
    p('mutual', 'contested', 'Amber reaches through the flame', [
      'Kashimo activates before Coffin closes and matches Jogo’s range with transformed phenomena.',
      'He crosses the disrupted fire line and destroys the curse.',
      'MBA then consumes his body, ending the run with both fighters down.',
    ], 'Jogo is exorcised; Kashimo dies and cannot advance.', 'Transformation must complete before the lethal domain.', { terminal: true, uncertainty: 'A replayable activation branch decides whether Amber transforms before Coffin closes.' }),
    p('boss', 'contested', 'Coffin closes during transformation', [
      'Kashimo commits to Amber as Jogo begins his expansion.',
      'The domain establishes first and forces Hollow Wicker Basket before transformed offense takes over.',
      'Jogo burns through the maintained defense and Kashimo collapses without an exorcism.',
    ], 'Kashimo dies after spending his one-use technique; Jogo remains active.', 'Amber does not retroactively cancel an established domain.', { terminal: true, uncertainty: 'A replayable activation branch decides whether Amber transforms before Coffin closes.' }),
  )],
  ['yuki:kenjaku', g(
    'Collapse into a black hole',
    'Only after terminal injury, Yuki pushes Star Rage past safe mass and gives up survival to engulf Kenjaku.',
    'Certain death for Yuki and catastrophic battlefield destruction.',
    p('boss', 'decisive', 'Antigravity survives the sacrifice', [
      'Mortally wounded, Yuki turns her own body into the black-hole singularity.',
      'Kenjaku reveals the specific antigravity application that answers the phenomenon long enough to survive.',
      'Yuki dies and the contained arena is destroyed; Kenjaku remains active.',
    ], 'Yuki dies. The technique neither earns a clear nor preserves the arena.', 'Kenjaku owns the demonstrated specific counter; this is not generic durability.', { terminal: true }),
  )],
  ['toji:kenjaku', g(
    'Extend the Inverted Spear with the Chain',
    'Toji commits both signature tools to one long nullifying line, then follows with the soul blade.',
    'If the line is caught, Toji loses his only nullification route.',
    p('fighter', 'contested', 'The spear clears the gravity beat', [
      'Toji hides the Chain’s extension behind the first curse body.',
      'Inverted Spear contact interrupts gravity for one beat without claiming permanent nullification.',
      'He follows the collapsing chain and lands the Split Soul Katana before Womb Profusion establishes.',
    ], 'Toji wins with the tools physically recoverable.', 'Nullifying contact must precede gravity.', { uncertainty: 'A replayable tool-line branch decides which contact lands first.' }),
    p('boss', 'contested', 'The curse screen catches the chain', [
      'Toji commits the Inverted Spear and Chain through the first curse layer.',
      'Kenjaku sacrifices another curse to foul the line, then applies gravity to the predictable follow-up.',
      'Separated from the nullifying tool, Toji is caught by Womb Profusion.',
    ], 'Toji loses the committed tool line and is incapacitated.', 'Inventory breadth provides a physical interception that does not require sensing Toji.', { uncertainty: 'A replayable tool-line branch decides which contact lands first.' }),
  )],
  ['yorozu:kenjaku', g(
    'Prebuild Perfect Sphere',
    'Yorozu spends most reserves on the sphere first, then expands only long enough to assign the sure-hit.',
    'Failure means extreme Construction depletion plus burnout.',
    p('fighter', 'contested', 'The sphere is ready when the barrier closes', [
      'Yorozu forms Perfect Sphere behind liquid metal before Kenjaku identifies the commitment.',
      'Threefold Affliction opens only after the projectile is positioned for its sure-hit.',
      'The abbreviated domain window lands the sphere before Womb Profusion breaks the barrier.',
    ], 'Yorozu wins nearly empty and burned out but alive.', 'The prebuilt sphere shortens the barrier’s required survival time.', { uncertainty: 'A replayable barrier branch decides whether delivery beats the outside break.' }),
    p('boss', 'contested', 'Womb Profusion breaks the delivery', [
      'The early sphere reveals Yorozu’s commitment and Kenjaku pressures its caster with curses and gravity.',
      'Threefold Affliction closes, but Womb Profusion attacks the shell before the sure-hit completes.',
      'The sphere remains lethal but unguided; Kenjaku evades it and finishes the exhausted constructor.',
    ], 'Yorozu loses after spending the sphere and domain.', 'The gamble fails at delivery, not because Kenjaku can endure contact.', { uncertainty: 'A replayable barrier branch decides whether delivery beats the outside break.' }),
  )],
]);

export const SOLO_PROFILES: Record<SoloFighterId | SoloBossId, SoloProfile> = {
  yuji: {
    version: 'Finale, own body',
    loadout: 'Awakened physical ability, Shrine, Blood Manipulation, soul awareness, self-RCT, Simple Domain and his domain. No resident Sukuna protection; no guaranteed Black Flash.',
  },
  yuta: {
    version: 'Shinjuku, own body',
    loadout: 'Katana, fully manifested Rika, self-RCT and positive-energy output, domain, and copied techniques he displays through Sendai and Shinjuku. No Gojo body.',
    boundary: 'Complete manifestation and copied-technique access remain bound to the demonstrated five-minute window.',
  },
  megumi: {
    version: 'Culling Game, before possession',
    loadout: 'Available Ten Shadows shikigami and incomplete Chimera Shadow Garden.',
    boundary: 'Mahoraga is an uncontrolled exorcism ritual that threatens Megumi too, so it is not scored as a solo win or ladder advance.',
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
    loadout: 'Cursed Speech and ordinary reinforced close defense. Commands require viable delivery; wording and target resistance determine recoil.',
    boundary: 'A lethal command is not an unconditional kill. The target gap, delivery, resistance and backlash all resolve before the outcome.',
  },
  gojo: {
    version: 'Shinjuku, start of the Sukuna fight',
    loadout: 'Six Eyes, automatic Infinity, Blue, Red, Hollow Purple, Unlimited Void, RCT, Simple Domain and Falling Blossom Emotion. Fresh brain and output.',
  },
  hakari: {
    version: 'Culling Game, Kashimo fight',
    loadout: 'Private Pure Love Train and reinforced close combat. He starts in base and must establish his rule-based domain to earn jackpot.',
    boundary: 'Jackpot grants 4 minutes 11 seconds of overflowing energy and automatic RCT. It is neither preloaded nor a generic damage bonus, and soul repair is not assumed.',
  },
  kashimo: {
    version: 'Culling Game incarnate',
    loadout: 'Staff, elite close combat, electrified cursed-energy trait, charge separation and Hollow Wicker Basket.',
    boundary: 'Mythical Beast Amber is optional and one-use. It reconstructs his flesh and ends in bodily collapse; defeating a boss with it leaves no survivor for the next rung.',
  },
  yuki: {
    version: 'Tomb of the Star fight',
    loadout: 'Star Rage, Garuda, self-RCT and Simple Domain. She begins uninjured and without Tengen’s assistance.',
    boundary: 'The black-hole application is a terminal last act with catastrophic collateral, not a routine maximum or a surviving ladder clear.',
  },
  toji: {
    version: 'Hidden Inventory, armory loaded',
    loadout: 'Zero cursed energy, armory curse, Split Soul Katana, Inverted Spear of Heaven and Chain of a Thousand Miles. Neutral start; no ambush.',
  },
  yorozu: {
    version: 'Incarnated in Tsumiki, Sukuna fight',
    loadout: 'Construction, liquid metal, insect armor, Threefold Affliction and Perfect Sphere.',
    boundary: 'Perfect Sphere becomes a reliable contact through the domain’s sure-hit; Construction remains extremely expensive.',
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

  r('gojo', 'hanami', 'fighter', 'decisive', [
    'Hanami can fill the field with roots, but none is a demonstrated Infinity bypass.',
    'Blue fixes the curse’s position and prevents Flower Field from becoming a protected reset.',
    'Red or Hollow Purple destroys Hanami without inventing an effect for its unrevealed domain.',
  ]),
  r('gojo', 'jogo', 'fighter', 'decisive', [
    'Domain Amplification creates a real contact route but costs Jogo simultaneous use of Disaster Flames while maintained.',
    'Gojo wins the close timing, breaks contact and restores the full Limitless threat.',
    'Unlimited Void or Hollow Purple finishes before Jogo can rebuild range.',
  ]),
  r('gojo', 'mahito', 'fighter', 'decisive', [
    'Infinity denies the manual soul touch Mahito needs outside a sure-hit.',
    'Unlimited Void forces a barrier contest instead of letting Self-Embodiment land automatically.',
    'Gojo overwhelms that contest and destroys the immobilized curse with Limitless output.',
  ]),
  r('gojo', 'kenjaku', 'fighter', 'decisive', [
    'Kenjaku has an open domain, but no prepared Prison Realm, allies or psychological trap under this start.',
    'Blue and Red clear the curse screen while Infinity denies ordinary contact.',
    'Kenjaku cannot keep Womb Profusion active long enough to survive Gojo’s direct pressure.',
  ]),
  r('gojo', 'sukuna', 'boss', 'favored', [
    'Their domain changes, close exchanges and brain strain create a long contest rather than a one-number clash.',
    'Ten Shadows lets Mahoraga survive exposures and develop a model that crosses Infinity.',
    'Sukuna converts that model into the fatal world-targeting slash after the adaptation is learned.',
  ], 'Gojo wins if Unlimited Void holds long enough to destroy Mahoraga and Sukuna before the spatial model is completed.'),

  r('hakari', 'hanami', 'fighter', 'favored', [
    'Hakari starts in base and must survive the root field long enough to establish his nonlethal rule-based domain.',
    'The fast sure-hit communicates rules rather than damage, and the sequence reaches jackpot before cursed buds drain him.',
    'Automatic RCT and overflowing energy sustain the close pressure that finally breaks Hanami’s durability.',
  ], 'Hanami wins by stopping the first domain sequence before a jackpot is earned.'),
  r('hakari', 'jogo', 'fighter', 'favored', [
    'Jogo can kill base Hakari, so Restless Gambler must begin before Hakari accepts a long fire exchange.',
    'The rule sequence reaches jackpot while Jogo’s ordinary attacks continue to matter inside it.',
    'Hakari heals the accumulated burns and forces a prolonged close fight Jogo cannot finish before the next roll.',
  ], 'Jogo wins if terminal fire lands before the first jackpot or between jackpot cycles.'),
  r('hakari', 'mahito', 'boss', 'favored', [
    'Hakari can earn jackpot and automatically repair bodily damage while pressuring Mahito.',
    'No demonstrated rule makes that RCT restore a soul whose shape Idle Transfiguration has changed.',
    'Mahito accepts ordinary blows to create one meaningful palm contact and ends the jackpot momentum.',
  ], 'Hakari wins if his close pressure exhausts Mahito before any soul contact.'),
  r('hakari', 'kenjaku', 'boss', 'favored', [
    'Hakari’s fast domain can reach a first jackpot before the curse inventory overwhelms base form.',
    'Kenjaku spends curses and gravity to run down the 4 minute 11 second window without conceding a finish.',
    'Womb Profusion catches Hakari between cycles, before another jackpot can restore automatic RCT.',
  ], 'Hakari wins if he carries pressure through the timer boundary and lands the next jackpot before the open domain establishes.'),
  r('hakari', 'sukuna', 'boss', 'decisive', [
    'Sukuna can attack Restless Gambler’s barrier and Hakari’s body simultaneously with Shrine and Ten Shadows.',
    'Even an earned jackpot has a fixed timer while Malevolent Shrine keeps producing damage.',
    'Sukuna waits for the base interval or destroys Hakari’s head faster than automatic RCT can answer.',
  ]),

  r('kashimo', 'hanami', 'fighter', 'favored', [
    'Kashimo accepts close contact long enough to place opposing charges while his staff covers retreat.',
    'Hanami’s durability blunts ordinary strikes but does not erase a completed lightning discharge.',
    'The sure-hit-like bolt tears through the curse’s core before cursed buds turn Kashimo’s output against him.',
  ], 'Hanami wins if cursed buds stop the charge sequence before the discharge.'),
  r('kashimo', 'jogo', 'boss', 'favored', [
    'Kashimo needs repeated contact or a staff line to complete charge separation while Jogo begins at destructive range.',
    'Wide-area fire keeps him defending without RCT and denies a clean series of tagged blows.',
    'Coffin of the Iron Mountain forces Hollow Wicker Basket, occupying the posture his lightning route needs.',
  ], 'Kashimo wins if he completes charge separation before Jogo establishes the domain.'),
  r('kashimo', 'mahito', 'boss', 'favored', [
    'Kashimo’s lightning can repeatedly destroy Mahito’s manifested body.',
    'It has no demonstrated soul-targeting property, so Mahito can preserve his soul and rebuild at cursed-energy cost.',
    'Hollow Wicker Basket occupies Kashimo’s hands until Mahito earns the contact that ends the fight.',
  ], 'Kashimo wins only if repeated destruction exhausts Mahito before any meaningful soul touch.'),
  r('kashimo', 'kenjaku', 'boss', 'decisive', [
    'Kashimo tears through individual curses and tries to tag Kenjaku enough times for a lethal discharge.',
    'Gravity interrupts close contact while the inventory attacks staff and body from separate lanes.',
    'Womb Profusion forces Hollow Wicker Basket and ends the setup before charge can be converted on Kenjaku.',
  ]),
  r('kashimo', 'sukuna', 'boss', 'decisive', [
    'Base Kashimo cannot force repeated charge contact through Shrine and Ten Shadows.',
    'Mythical Beast Amber expands his speed and attack vocabulary, but fresh Sukuna reads and answers the transformed body.',
    'Malevolent Shrine ends the exchange; Amber’s terminal cost removes a surviving route regardless.',
  ]),

  r('yuki', 'hanami', 'fighter', 'decisive', [
    'Hanami braces for reinforcement and root control rather than the virtual mass Star Rage adds to contact.',
    'Garuda fixes the curse’s retreat while Yuki crosses the defensive shell.',
    'One clean Star Rage sequence destroys the core without invoking the terminal black-hole application.',
  ]),
  r('yuki', 'jogo', 'fighter', 'favored', [
    'Jogo uses range and speed to avoid Yuki’s catastrophic close power.',
    'Garuda attacks the movement lane independently and forces him to split the fire screen.',
    'Yuki heals one non-terminal burn, enters once and finishes with Star Rage before Meteor can land.',
  ], 'Jogo wins if sustained fire destroys Garuda and keeps Yuki outside one-hit range.'),
  r('yuki', 'mahito', 'boss', 'favored', [
    'Yuki pulverizes Mahito’s body whenever Garuda fixes his movement.',
    'No shown Star Rage property makes those hits damage the soul, so Mahito can rebuild at continuing energy cost.',
    'Self-Embodiment strips Simple Domain and creates the touch that decides the fight.',
  ], 'Yuki wins if repeated destruction exhausts Mahito before the domain sequence.'),
  r('yuki', 'kenjaku', 'boss', 'favored', [
    'Yuki and Garuda can break Kenjaku’s limbs and force RCT whenever they reach him.',
    'Womb Profusion strips Simple Domain and creates the severe injury that lowers Yuki’s output.',
    'Without Tengen or Choso, gravity and curses finish the wounded sorcerer before she reopens the lane.',
  ], 'Yuki can turn terminal injury into a black hole, but Kenjaku possesses the demonstrated antigravity answer.'),
  r('yuki', 'sukuna', 'boss', 'decisive', [
    'Yuki’s close hit remains catastrophic, so Sukuna uses Shrine and Ten Shadows to make contact scarce.',
    'Malevolent Shrine attacks through Simple Domain while shikigami stop Garuda from fixing him in place.',
    'Yuki cannot establish the Star Rage finish before the open domain becomes terminal.',
  ]),

  r('toji', 'hanami', 'fighter', 'decisive', [
    'Hanami cannot track Toji by cursed energy and covers the physical approaches with roots instead.',
    'The Chain and Inverted Spear interrupt the active technique line long enough for a sword entry.',
    'The Split Soul Katana bypasses the durability contest and exorcises Hanami.',
  ]),
  r('toji', 'jogo', 'fighter', 'favored', [
    'Jogo’s physical fire and heat remain dangerous despite Toji’s zero cursed energy.',
    'The Chain extends the Inverted Spear through one eruption, nullifying contact rather than the whole arena.',
    'That opening puts Toji inside the next cast and the Split Soul Katana finishes.',
  ], 'Jogo wins if broad fire separates Toji from his armory or forces sustained exposure.'),
  r('toji', 'mahito', 'fighter', 'decisive', [
    'Mahito must seek manual contact because Toji is unreliable as a standard closed-domain target.',
    'The Inverted Spear interrupts active technique contact while the longer soul blade controls reach.',
    'A clean Split Soul Katana hit creates the terminal wound before another palm line opens.',
  ]),
  r('toji', 'kenjaku', 'boss', 'favored', [
    'The mutual-awareness start lets Kenjaku see the armory instead of conceding an assassination opening.',
    'Expendable curses occupy the Inverted Spear while gravity centers on Toji’s physical exit.',
    'Womb Profusion affects the field and ends the stalled approach without relying on cursed-energy recognition.',
  ], 'Toji wins if the extended Inverted Spear clears gravity for one Split Soul Katana entry.'),
  r('toji', 'sukuna', 'boss', 'decisive', [
    'Sukuna tracks physical movement and recognizes the tools without relying only on cursed-energy sensing.',
    'Shrine cuts the chain while Ten Shadows denies sustained Inverted Spear or soul-blade contact.',
    'Malevolent Shrine attacks physical matter across the open field and overwhelms Toji.',
  ]),

  r('yorozu', 'hanami', 'fighter', 'decisive', [
    'Liquid metal changes shape around Hanami’s root guard while insect armor keeps Yorozu ahead of its targeting.',
    'Hanami’s durability survives ordinary construction, so Yorozu establishes Threefold Affliction.',
    'The sure-hit delivers Perfect Sphere and destroys the curse instead of treating an unguided sphere as guaranteed.',
  ]),
  r('yorozu', 'jogo', 'fighter', 'favored', [
    'Jogo forces early Construction by filling medium range with fire.',
    'Insect armor stays mobile while liquid metal attacks from angles one eruption cannot cover.',
    'Threefold Affliction establishes first and assigns Perfect Sphere as the finishing sure-hit.',
  ], 'Jogo wins if Coffin of the Iron Mountain establishes before the sphere is built and assigned.'),
  r('yorozu', 'mahito', 'fighter', 'favored', [
    'Insect armor and liquid metal deny manual touch while ordinary construction pressures Mahito’s body.',
    'Yorozu expands when Mahito commits to his own barrier rather than chasing reshaped bodies forever.',
    'Perfect Sphere’s sure-hit destroys the manifestation continuously enough to complete exorcism.',
  ], 'This total-destruction interaction is inferred; the manga never tests Perfect Sphere against Idle Transfiguration.'),
  r('yorozu', 'kenjaku', 'boss', 'favored', [
    'Liquid metal and insect armor break through individual curses and threaten Kenjaku’s body.',
    'Gravity disrupts the precise sphere setup while Womb Profusion attacks Threefold Affliction from outside.',
    'The closed barrier breaks, guaranteed delivery ends and Construction exhaustion catches Yorozu.',
  ], 'Yorozu wins if she prebuilds the sphere and lands its sure-hit before the outside barrier break.'),
  r('yorozu', 'sukuna', 'boss', 'decisive', [
    'Insect armor and liquid metal force Sukuna to respect Yorozu’s speed and constructed angles.',
    'Ten Shadows absorbs information without exposing Sukuna to an unguided Perfect Sphere.',
    'Mahoraga breaks the domain interaction and removes the sphere’s route before Sukuna finishes her.',
  ]),
] as const;

const rulingMap = new Map(SOLO_RULINGS.map((ruling) => [`${ruling.fighterId}:${ruling.bossId}`, ruling]));

export function isSoloFighter(id: string): id is SoloFighterId {
  return (SOLO_FIGHTERS as readonly string[]).includes(id);
}

export function isSoloApproach(value: string): value is SoloApproachId {
  return value === 'measured' || value === 'limit-break';
}

export function soloRuling(fighterId: SoloFighterId, bossId: SoloBossId): SoloRuling {
  const ruling = rulingMap.get(`${fighterId}:${bossId}`);
  if (!ruling) throw new Error(`Missing solo ruling: ${fighterId} vs ${bossId}`);
  return ruling;
}

export function soloGamble(fighterId: SoloFighterId, bossId: SoloBossId): SoloGamble | undefined {
  return SOLO_GAMBLES.get(`${fighterId}:${bossId}`);
}

function stableIndex(key: string, length: number): number {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

export function resolveSoloPath(
  fighterId: SoloFighterId,
  bossId: SoloBossId,
  approachId: SoloApproachId,
  seed: string,
): SoloResolvedPath {
  const ruling = soloRuling(fighterId, bossId);
  if (approachId === 'measured') {
    return {
      winner: ruling.winner,
      verdict: ruling.verdict,
      title: ruling.reasons[0],
      beats: ruling.reasons,
      cost: ruling.winner === 'fighter'
        ? 'The fighter survives; ordinary fight expenditure resets before the next fresh rung.'
        : 'The fighter is incapacitated or killed and cannot continue the ladder.',
      hinge: ruling.swing ?? ruling.reasons[2],
      approachId,
      approachLabel: 'Fight the disciplined line',
      commit: 'Build the safest demonstrated opening and preserve extreme options unless the fight forces them.',
      branchIndex: 0,
    };
  }
  const option = soloGamble(fighterId, bossId);
  if (!option) throw new Error(`No limit-break path: ${fighterId} vs ${bossId}`);
  const branchIndex = option.paths.length === 1
    ? 0
    : stableIndex(`${seed}:${fighterId}:${bossId}:${approachId}`, option.paths.length);
  return {
    ...option.paths[branchIndex]!,
    approachId,
    approachLabel: option.label,
    commit: option.commit,
    branchIndex,
  };
}
