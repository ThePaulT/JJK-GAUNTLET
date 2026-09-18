# Combat rebuild: review checkpoint

## Decision to review

Keep the three-pick draft and five-boss ladder. Replace score-first resolution with a small event/state resolver. Display the resulting fight as three connected paragraphs, immediately visible in one panel. One button continues to the next boss or survivor retry. Read [the three example fights](./example-fights.md) first; they define the intended experience.

This is a review package, not a deployed combat rewrite. It contains verified implementation findings, a proposed version/ability contract for every roster ID, and authored narrative fixtures. It does not claim to finish panel-level canon verification, calibrate replacement ratings, or simulate the examples.

Reviewed main commit: `cc72aaf750d5940e7b014ac54417fe576c06877d`. The earlier local checkout had uncommitted battle-screen work; this review uses an isolated worktree of current main and preserves that work.

## Confirmed setup

- Next.js app; pure seeded TypeScript resolver; JSON roster; optional Gemini/Claude narration with a template fallback.
- 48 characters: 28 heroes, 20 villains. Existing IDs and portraits remain usable.
- Hero ladder: Hanami → Jogo → Mahito → Kenjaku → Sukuna.
- Villain ladder: Nanami → Todo → Maki → Yuta → Gojo.
- Draft: three rounds, four options each, one reroll. Daily and freestyle also rely on the existing combat model.
- Rung bonuses currently add `[8, 11, 14, 17, 18]` for heroes and `[8, 11, 14, 17, 27]` for villains. These are game difficulty settings, not canon capability.

## Verified implementation findings

| ID | Finding and source | Consequence | Replacement |
|---|---|---|---|
| AUD-01 | `lib/engine.ts: scoreSide` uses power, DOM and tags; displayed `stats.ce`, `stats.phy`, `stats.tec` do not enter this score | Changing those stats alone cannot meaningfully rebuild combat | Separate reserves, output, physical/reaction ability, reinforcement and technique mastery; use each only for relevant checks |
| AUD-02 | `domainProfile` collapses all living members into booleans using `some` | One Maki or strong anti-domain user removes pressure for the whole team | Evaluate each target and each defender's specific response |
| AUD-03 | `copyTarget` selects an opposing tag before a round; copyable data includes Black Flash and anti-domain | Copy has no acquisition condition, stock, access window or caster action | Declared legal stock, acquisition event, manifestation/domain access and costs |
| AUD-04 | `COUNTER_CONDITIONS` allows Resonance on incarnated targets when `enemyChipped` is true | A retry substitutes for obtaining a body part | Track an actual link object and how it was acquired |
| AUD-05 | `tagsOf` merges every ally's tags; `counterTotal` lacks actor/target IDs | A favorable interaction can benefit an ally who cannot execute it | Actor-target eligibility before a local check; no team-wide copied capabilities |
| AUD-06 | `makeFighter` stores only `down` and special-use counters | No CE budget, injuries, ordinary cooldowns, domain lifecycle, tools or summon state | Versioned combatant state with explicit deltas |
| AUD-07 | `runGauntlet` recreates the boss on every attempt and restores only a flat retry penalty | No boss wound, resource or expended-special continuity | Keep the same boss instance through an immediate retry |
| AUD-08 | `chooseFaller` uses a weighted casualty lottery after score resolution | The character struck in the story need not be the one mechanically endangered | Incapacitation follows resolved target-specific damage |
| AUD-09 | `rollUpsets` can reverse the result on a flat underdog chance | Surprise has no required execution chain | Randomness only in authored uncertain local checks |
| AUD-10 | `specialBonuses` triggers Overtime from round number; specials are largely flat bonuses | Work-time conditions, transformation costs and concrete support are replaced by score edits | Named preconditions and effects with persistent cost |
| AUD-11 | `battleBeats` emits the first synergy as a special beat after domain/counter beats | Era/relationship text becomes a supposed combat action | Keep identity/relationship labels outside the action sequence |
| AUD-12 | `BattleTheater` starts paused, requires beat progression and hides the recap in final-only details | Repeated clicks delay the narrative the user wants | Narrative shown immediately; one continuation per encounter |
| AUD-13 | `domainActive` becomes true once any earlier domain beat exists | The arena remains in a domain without an ending event | Domain visuals follow actual active barrier state |
| AUD-14 | `RUN_SYSTEM` instructs persistent bleeding, declining CE and never re-expanding a prior domain | The model must invent untracked continuity and may preserve a domain between unrelated encounters | Supply start/end state and let events determine reuse or expiration |
| AUD-15 | `roundBrief` describes every anti-domain answer as Simple Domain and every open-domain exception as cutting everything | Different mechanics are collapsed into one narration template | Name actual defense and actual domain effect from the event |
| AUD-16 | Narration LORE includes broad Mahoraga/jackpot claims and a Black Flash timing claim inconsistent with supplied context | Even a better model receives misleading reference material | Replace free-floating lore with a versioned, reviewed ability glossary |

### Diagnostic evidence

A temporary Vitest diagnostic was executed against the unchanged main engine. It passed its assertions of current behavior; it was removed afterward rather than turning known defects into permanent expected behavior tests.

| Experiment | Observed result |
|---|---|
| Inumaki vs Jogo | Jogo domain score: 8.6 |
| Inumaki + Maki vs Jogo | Jogo domain score: 0 |
| Inumaki + Kusakabe vs Jogo | Jogo domain score: 0 |
| Nanami vs Hanami, normal displayed stats | Nanami total: 78 |
| Same matchup after temporarily setting CE/PHY/TEC to zero | Nanami total: 78; complete explanation unchanged |
| Nobara vs Sukuna, first encounter | Resonance/incarnated counter absent |
| Same matchup with only `chipped: true` | Counter appears: +3, 5% upset chance; no link inventory exists |

Yuta-vs-Geto did not produce a copied *counter* in this diagnostic. That does not disprove automatic Copy: `resolveRound` emits its copied-tag note independently of whether a counter pair fires. AUD-03 is a source-code finding, not a claimed reproduced counter in that matchup.

## Roster decisions

[The readable roster review](./roster-review.md) and [matching JSON](./roster-review.json) cover all 48 exact IDs with current power/version, proposed version, ability contract, prohibited/unresolved actions, persistent state and chapter-review targets. This is an authoring plan, deliberately not imported by the application. All records have `production_ready: false` pending complete ability records and evidence checks.

The largest corrections are:

| Character | Proposed configuration | Why |
|---|---|---|
| Yuta | Own body, Authentic Mutual Love encounter | Current record includes both own-body kit and Gojo-body abilities |
| Sukuna | Reincarnated body, post-transformation; starting impairment explicit | Current record combines Heian body, Ten Shadows/Mahoraga and broadly healthy domain assumptions |
| Todo | Two-handed Shibuya version | Current record also lists Shinjuku Vibraslap |
| Maki | Post-Sakurajima, Mai-created katana | Current kit is an all-era armory without the intended precise state |
| Miwa | Goodwill before sword vow | Current Culling Game version lists sword actions without resolving the vow |
| Uro | Sendai with unrevealed domain effect | The database calls it incomplete; absence of revealed effect needs a different representation |
| Gojo | Shinjuku capability, solo loadout | Current 200% Purple lacks required external setup; later knowledge must be a declared policy |

Versions and starting condition are separate. For the first release, recommend clearly labeled **rested capability presets** for most fighters: restore ordinary health/CE, retain selected body, equipment, permanent losses and legal technique access. Sukuna's post-Gojo brain/domain impairment is not ordinary fatigue; a restored-domain boss would be an explicit alternate encounter preset, not falsely presented as the exact ch. 238 state. No such preset is implemented here.

Later revelations may clarify how an already-existing ability works; they must not automatically grant later acquisitions or knowledge. For example, an unknown Sendai domain effect is a research boundary, not proof the character lacks a completed domain.

## Proposed first implementation contract

1. **One ruleset identity:** store `combat_ruleset_version` and version/loadout IDs with seed and run. Preserve old saved runs. Include ruleset version in daily identity/cache keys; do not compare old and new daily results as if equivalent.
2. **Minimal state:** status, resource pool, effective output, consequence-bearing injuries, technique availability, domain state, tool/summon stock, actor knowledge and active timed effects.
3. **Opportunity before technique:** each fighter selects a legal goal and action. An assist names its contributor and beneficiary. Strong opponents retain their speed and durability after a bypass becomes available.
4. **Costs at commitment:** an activation may be interrupted; its authored commitment cost still applies. Full establishment, maintenance and burnout are distinct transitions.
5. **Per-target domain resolution:** domain attempt → response → established effect → maintenance → end/burnout. Simple Domain, HWB, FBE and DA remain separate.
6. **No score-based winner reversal:** local uncertainty can influence timing or execution; it cannot make an impossible attack land.
7. **Same boss on retries:** injuries, resources, tools, knowledge and burnout persist. Display the concrete weakness that matters. A retry is a continuation, not a free recovery turn.
8. **One visible story:** about 140–200 words, three paragraphs. Opening, escalation and finish are prose structure. Support characters need a causal contribution when they can make one; equal spotlight is not compulsory.
9. **Simple presentation:** roster portraits, boss progress, narrative and actual condition chips; one Next boss/Continue with survivors action. Keep mechanics expandable and optional. No forced animation playback.
10. **Narrative safety:** structured decisive-event IDs and end state; grounded template fallback. Prompting alone cannot guarantee a freeform model never invents a detail. Reject/replace unsupported abilities, actors, resources and outcomes; treat any model validator as additional review, not proof.

### Defaults proposed for this checkpoint

- Neutral arena with range bands; no civilians or off-roster helpers; explicit starting inventory.
- Fighters have version-appropriate personal knowledge, plus observations they actually share during combat. No narrator omniscience in AI decisions.
- One primary action per scheduling opportunity and a bounded reaction budget. Refresh reactions by a defined exchange, not after every atomic event.
- Short declared transit between bosses may end transient effects and ordinary burnout; no universal full heal. Exact time/cost calibration remains open.
- Domain collateral follows the authored technique. Unknown ally protection is not assumed.
- Terminal sacrifice must arise from temperament and a credible objective; no automatic black hole whenever a score is behind. Collateral and surviving summons must resolve before terminal result.
- Stalemate/escape needs an explicit terminal policy and bounded resolver steps. Do not let the event loop run forever when no one can land a valid hit.
- Two draft picks of the same unique character are disallowed unless a future mode declares duplicates explicitly.

## Build sequence after the narrative checkpoint

1. Complete ability and evidence records for the five-boss ladder plus an internal representative test set; keep all 48 portraits and draft records intact.
2. Implement the state kernel, eligibility, direct attacks, interruptions and persistence. Do not expose a mixed old/new resolver to one public run.
3. Add domains/defenses, Infinity, soul targeting and concrete support.
4. Implement Copy, adaptation, court/jackpot and other exceptional abilities with individual rule tests.
5. Migrate every selectable character before enabling the new public ruleset. If a character remains unsupported, retain the old public ruleset; do not silently route that character through the old score system inside a new run.
6. Feed resolved events into narration; simplify UI; preserve seeded replay and old run rendering.
7. Run fixed-seed balance batches, deterministic event replay, legality invariants and full gauntlet/daily/freestyle flows. Deploy only after these gates pass.

## Evidence limits and remaining work

The supplied `JJK_COMBAT_CONTEXT(1).md`, preserved as [reference-context.md](./reference-context.md), is design input, not automatically verified canon. The [licensed VIZ chapter index](https://www.viz.com/shonenjump/chapters/jujutsu-kaisen) was accessible and lists relevant chapters as membership reading; it did not expose their panels for this audit. The character chapter targets are therefore verification tasks, not claims that those panels were inspected here.

Validation completed: all 48 unique roster IDs match the production database; side counts are 28/20; all authoring records are explicitly provisional; the unchanged existing suite passes all 67 tests across five files. This checks coverage and baseline integrity, not the correctness of a new combat implementation.

Still outstanding: panel-level verification; complete per-ability schemas and costs; calibrated attributes; exceptional-matchup rulings; actual resolver; narrative validation; UI changes; deployment. No claims of simulated win odds are made for the authored examples.
