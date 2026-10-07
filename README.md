# JJK Gauntlet

JJK Gauntlet is a `world-1` combat-simulation prototype. It resolves a fight as
a causal sequence of legal actions, counters and state changes instead of
choosing a winner from an aggregate power score.

The public prototype currently contains three focused encounters:

- Yuji vs Mahito — soul access, domain activation and Simple Domain erosion.
- Yuta vs Jogo — Rika pressure, domain clashes and contact-gated positive energy.
- Maki vs Hanami — zero-CE targeting, physical battlefield control and the
  Split Soul Katana.

Each run is deterministic from its matchup, tactical intent and seed. The same
input reproduces the same event log. Variation is limited to declared timing,
positioning and execution checks; hard interaction rules are never rolled away.

## Player experience

The current `/` and `/gauntlet` routes present one flow:

1. choose a matchup;
2. choose an opening intent;
3. simulate a legal branch;
4. read the three-part fight story and final state;
5. optionally inspect the mechanical event log.

Canon rules, matchup inferences and prototype assumptions are labeled
separately. The 48-seed outcome field shows the branches this prototype can
execute; it is not presented as canon probability.

Old Freestyle, Daily Draft and authored Solo screens are no longer part of the
player-facing product. Their routes redirect to `/gauntlet`. Their code and
replay families remain only so previously shared links can still be decoded.

## World model

`lib/world/` keeps the simulator separate from the frozen replay engines:

- `data.ts` declares exact character versions, legal abilities, domains and
  matchup conditions;
- `types.ts` models body condition, cursed energy, technique state, burnout,
  Simple Domain and soul damage independently;
- `engine.ts` applies hard gates and bounded seeded checks, emits causal events,
  and derives both the narrative and final result from those events.

Important prototype boundaries:

- Yuji's unnamed domain is withheld because its complete rules are not defined.
- Hanami's unrevealed domain is unavailable rather than invented.
- Yuta's positive-energy output only becomes decisive after contact is created.
- Maki's zero cursed energy defeats CE-drain targeting, not physical matter.
- Simple Domain suppresses a sure-hit temporarily; it does not erase a domain.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm test
npm run typecheck
npm run lint
npm run build
```

No environment variable is required to run the prototype. World-1 replay saving
is intentionally outside this prototype; the existing `/api/runs` route returns
`501` for that ruleset instead of passing it into an older resolver.

## Project layout

```text
app/                    public routes and API routes
components/             World-1 simulator UI plus frozen replay components
lib/world/              World-1 declarations, state model and resolver
lib/solo*.ts            preserved authored replay engines
lib/engine.ts           preserved score-engine replay compatibility
tests/world.test.ts     World-1 determinism and interaction invariants
```

Unofficial fan-made simulation. Jujutsu Kaisen belongs to its respective rights
holders. Results are hypothetical, not canon events.
