# Solo Gauntlet v2

The main `/gauntlet` experience asks how far one coherent character version can get through five opponents. It implements the smallest useful slice of the repository combat review: authored opportunities, prerequisites, interactions, consequences and terminal states instead of aggregate power totals.

## Encounter contract

- Every rung begins as a fresh encounter. Ordinary injury, cursed energy, burnout, summons and equipment reset.
- Death, terminal bodily collapse or inability to continue never resets. Defeating the current boss while paying such a cost ends the run without a surviving clear.
- Both combatants see each other at medium range in a neutral open arena. There is no ambush, prep or outside help.
- They fight in character with the declared version and loadout.
- The standard path is fixed and contains three causal beats: opening, interaction and consequence.
- A limit-break appears only where a distinct commitment creates a credible second path. Contested limit-breaks select between authored executions with a deterministic seed; there is no power-total roll or arbitrary upset.
- Every cross-matchup winner remains a game ruling. The interface separates depicted ability facts, inferred interactions and unresolved boundaries.

## Roster

The twelve selectable versions are finale Yuji, Shinjuku Yuta in his own body, pre-possession Culling Game Megumi, awakened Maki, two-hand Shibuya Todo, pre-arm-loss Shibuya Inumaki, fresh Shinjuku Gojo, Kashimo-fight Hakari, Culling Game Kashimo, Tomb-fight Yuki, Hidden Inventory Toji with his armory, and incarnated Yorozu.

Hakari begins in base. Restless Gambler must establish its rule procedure and award a jackpot before automatic RCT exists; jackpot is never a generic bonus. Kashimo begins in base. Mythical Beast Amber is an optional one-use bodily reconstruction whose terminal collapse prevents a later rung. Yuki’s black hole is likewise a terminal last act. Megumi’s uncontrolled Mahoraga ritual is not credited as a solo win.

## Standard-path matrix

| Fighter | Hanami | Jogo | Mahito | Kenjaku | Sukuna | Standard record |
|---|---|---|---|---|---|---|
| Yuji | win, decisive | win, favored | win, decisive | loss, favored | loss, decisive | 3–1 |
| Yuta | win, decisive | win, decisive | win, decisive | win, favored | loss, decisive | 4–1 |
| Megumi | loss, decisive | loss, decisive | loss, decisive | loss, decisive | loss, decisive | 0–1 |
| Maki | win, decisive | win, favored | win, decisive | loss, favored | loss, decisive | 3–1 |
| Todo | loss, decisive | loss, decisive | loss, decisive | loss, decisive | loss, decisive | 0–1 |
| Inumaki | loss, decisive | loss, decisive | loss, decisive | loss, decisive | loss, decisive | 0–1 |
| Gojo | win, decisive | win, decisive | win, decisive | win, decisive | loss, favored | 4–1 |
| Hakari | win, favored | win, favored | loss, favored | loss, favored | loss, decisive | 2–1 |
| Kashimo | win, favored | loss, favored | loss, favored | loss, decisive | loss, decisive | 1–1 |
| Yuki | win, decisive | win, favored | loss, favored | loss, favored | loss, decisive | 2–1 |
| Toji | win, decisive | win, favored | win, decisive | loss, favored | loss, decisive | 3–1 |
| Yorozu | win, decisive | win, favored | win, favored | loss, favored | loss, decisive | 3–1 |

## Limit-break scope

Twelve matchup-specific options are implemented: Yuji–Kenjaku, Yuta–Kenjaku, Maki–Jogo, Maki–Kenjaku, Inumaki–Hanami, Gojo–Sukuna, Hakari–Kenjaku, Kashimo–Hanami, Kashimo–Jogo, Yuki–Kenjaku, Toji–Kenjaku and Yorozu–Kenjaku.

Inumaki’s lethal-command route is deliberately unresolved. One authored branch lets “Die” exorcise Hanami during a specific Flower Field lull but terminally incapacitates Inumaki; the other has special-grade resistance return as backlash before the command completes. The manga does not establish that this wording kills Hanami, so the app labels the result as an uncertain game ruling. Neither branch advances the ladder.

Kashimo’s Amber win over Hanami is also a mutual stop. Yuki’s black hole against Kenjaku follows the demonstrated antigravity counter and ends in Yuki’s death. These outcomes distinguish defeating an opponent from surviving to pass a gauntlet rung.

## Replay compatibility

New share links use the `s2_` prefix and encode the selected fighter plus every revealed approach choice. The server rebuilds the same authored paths and deterministic branches. Existing `s1_` links use frozen copies of the original 30-ruling resolver. Existing `p1_`, `p2_` and stored legacy links retain their prior resolvers and results.
