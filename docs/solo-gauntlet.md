# Solo Gauntlet v1

The main `/gauntlet` experience now asks one question: how far can one selected character get through five opponents in sequence?

## Encounter contract

- Every rung is a fresh fight. Health, cursed energy, techniques, summons and equipment reset.
- Both fighters see each other at medium range in a neutral open arena. There is no ambush, prep or outside help.
- They fight in character with the complete loadout declared in `lib/solo-data.ts`.
- Incapacitation, death or exorcism wins. Retreat loses.
- Every default winner is authored. There is no aggregate power score, win-percentage roll or random upset.
- `favored` rulings name a concrete condition that can credibly reverse the default. `decisive` rulings do not invent an alternate merely to add suspense.

## Scope and evidence labels

The first release covers six playable characters against the existing five-boss ladder: 30 rulings total. Each ruling is a game decision based on depicted abilities and matchup inference. It is not presented as a canon event or a verified author statement. The repository combat review remains the verification backlog for chapter-level sourcing.

The Sukuna rung uses a coherent, fresh version: Meguna at the start of the Gojo fight, with full reserves, Shrine, Ten Shadows, Malevolent Shrine and RCT. The world-cutting slash is excluded because he had not learned it. This replaces the old curated team's reduced-resource preset for new solo runs only.

## Default matrix

| Fighter | Hanami | Jogo | Mahito | Kenjaku | Sukuna | Run record |
|---|---|---|---|---|---|---|
| Yuji | win, decisive | win, favored | win, decisive | loss, favored | loss, decisive | 3–1 |
| Yuta | win, decisive | win, decisive | win, decisive | win, favored | loss, decisive | 4–1 |
| Megumi | loss, decisive | loss, decisive | loss, decisive | loss, decisive | loss, decisive | 0–1 |
| Maki | win, decisive | win, favored | win, decisive | loss, favored | loss, decisive | 3–1 |
| Todo | loss, decisive | loss, decisive | loss, decisive | loss, decisive | loss, decisive | 0–1 |
| Inumaki | loss, decisive | loss, decisive | loss, decisive | loss, decisive | loss, decisive | 0–1 |

Runs stop at the first loss, but all 30 rulings remain authored and tested so the matrix can be reviewed independently of ladder progress.

## Replay compatibility

New share links use the `s1_` prefix and rebuild the server-authoritative solo result from the selected fighter. Existing `p1_`, `p2_` and stored legacy links keep their original resolvers and results.
