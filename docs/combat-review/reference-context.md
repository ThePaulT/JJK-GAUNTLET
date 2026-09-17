# JJK Combat Context

## 1. Executive recommendation

### Decision

Use a **lightweight event/state resolver with small, local numeric checks**. Do not use one aggregate power total to choose the winner and then ask prose to justify it.

The resolver should work in this order:

1. Load one legal, versioned character record for every combatant.
2. Establish the current battlefield, knowledge, injuries, cursed-energy state, cooldowns, summons, tools, and domain availability.
3. Determine who can create an action opportunity under the present pressure.
4. Check whether the chosen ability is actually eligible.
5. Apply a reusable interaction rule: range, contact, barrier, soul, nullification, adaptation, immunity, and so on.
6. Resolve the response and update state.
7. Continue until a victory, defeat, retreat, sacrifice, or simultaneous-casualty condition is reached.
8. Render the already-resolved events as three connected paragraphs.

Numbers are useful for local questions—who creates space, whether an injured fighter can complete a hand sign, whether a defender can react—not for declaring that `power 92` defeats `power 88`.

### Why this is the smallest suitable system

| Approach | Strength | Failure mode | Recommendation |
|---|---|---|---|
| Weighted total plus matchup bonuses | Cheap and easy to tune | Double-counts feats, converts labels into actions, and decides outcomes before techniques are tested | Retain only as an internal rough encounter-band warning |
| Full event simulation | Strong causality and expressive interactions | Excessive authoring and balance cost if every motion is simulated | Do not build a physics simulator |
| **Restrained hybrid** | Auditable, reproducible, technique-aware, narratively coherent | Requires versioned abilities and a curated interaction library | **Use this** |

### Non-negotiable rules

- General combat ability creates or denies **opportunities**; it does not override ability prerequisites.
- A counter removes or reduces one advantage. It does not automatically erase the rest of a strength gap.
- A passive tag such as `heian_era`, `student`, or `clan_zenin` is never emitted as an attack.
- A domain is an action with timing, cost, targeting, counters, and aftermath—not a cinematic button.
- Team members contribute actions, setup, rescue, information, or pressure. Their ratings are never summed into one super-fighter.
- The event log is authoritative. Narration may compress events but may not invent new ones.
- Canon capability and encounter difficulty are separate layers. Artificial boss advantages must be labeled encounter rules.

### Roster status

No game roster, character database, exact IDs, ladders, or existing resolver source accompanied the supplied specification. Therefore this document deliberately does **not** invent production IDs or pretend to audit unavailable data. Section 4 defines the required record and versioning contract; the migration section identifies the exact roster-specific pass still required.

---

## 2. Scope, evidence standards, and terminology

### Scope

- Primary canon: *Jujutsu Kaisen* chapters 1–271 and *Jujutsu Kaisen 0*.
- Supplementary canon: *Jujutsu Kaisen Official Character Guide* / official fanbook where it directly clarifies the manga.
- Anime-only choreography is excluded from rules unless explicitly marked `ANIME_ONLY`.
- No sequel or spinoff capability is assumed.
- Full spoilers are present.

### Evidence labels

Every production character fact or interaction rule should carry one of these labels:

| Code | Meaning | Implementation use |
|---|---|---|
| `F` | Explicit canon fact shown or directly stated | Safe default |
| `I` | Strong inference supported by repeated or closely analogous canon evidence | Use conservatively and expose confidence |
| `U` | Unresolved, translation-sensitive, or genuinely disputed | Requires a declared game ruling |
| `G` | Game abstraction or balance rule, not a claim about canon | Safe only when visibly separated from lore |

References use `JJK ch. X`, a chapter range, or `JJK 0 ch. X`. A chapter reference supports the event or explanation occurring there; it is not a claim that the manga supplies a numeric rating.

### Core terms

| Term | Operational definition |
|---|---|
| Cursed-energy reserves | Total available quantity. Large reserves do not by themselves establish output, control, or efficiency. |
| Output | Amount/intensity that can be released or applied at once. Output may decline while reserves remain. |
| Efficiency | How little energy is wasted for a desired effect. This governs endurance but is not identical to reserves. |
| Reinforcement | Cursed energy used to strengthen body, offense, or defense. Its result depends on output, control, timing, and the underlying body. |
| Physical base | Unreinforced body and physical skill. Heavenly Restriction can make this exceptional. |
| Technique mastery | Reliability, application breadth, activation speed, targeting, and tactical use of a specific technique. |
| Barrier skill | Ability to create, modify, contest, or defend against barriers. It is related to but not interchangeable with innate-technique mastery. |
| Refinement | Canon's qualitative description of domain quality/control. There is no complete official universal ranking. |
| Knowledge | What a combatant actually knows at that version and in that encounter. Reader knowledge is not combatant knowledge. |
| Opportunity | A moment in which an actor can attempt an eligible action without being fully interrupted. |
| Pressure | Enemy action that reduces time, positioning, hand-sign freedom, chanting, concentration, or safe setup. |
| Persistent state | A wound, expenditure, loss, or learned fact deliberately carried into later encounters. |

### Version integrity

A character version is a legal configuration, not an all-time résumé. Never combine:

- teenage Gojo's pre-awakening state with later automatic Infinity, prison-realm experience, and Shinjuku domain feats;
- Yuta's original bound Rika from *JJK 0* with the later five-minute external Rika and every copied technique unless the selected time permits them;
- Sukuna's Yuji-vessel body, Megumi-vessel Ten Shadows access, original body advantages, and different finger counts as one profile;
- pre-awakening Maki's cursed-energy level, post-Mai Heavenly Restriction, and equipment she did not possess together;
- abilities merely stated as potential with techniques actually demonstrated by that version.

Store innate potential separately from usable capability. Statements such as “could rival Gojo,” an inherited technique's theoretical ceiling, or an unshown domain belong in `potential_notes`; they do not unlock actions or raise the selected version's demonstrated ratings. If “peak” is ambiguous, create separate legal alternatives—body, timeframe, equipment, and stock included—and state the tradeoff instead of merging them.

---

## 3. Canon mechanics

### 3.0 What determines combat effectiveness

JJK combat is a chain of gates, not one hierarchy. A fighter must survive long enough to create an opportunity, satisfy the technique's conditions, execute before interruption, pass the relevant interaction rule, and convert the effect into a win. A favorable interaction can open a gate without solving the others.

| Combat question | Main determinants | Representation |
|---|---|---|
| Can the fighter stay in the exchange? | body, reinforcement, reactions, recovery, current injury | Ordinal attributes plus injury state |
| Can the fighter create an opening? | speed, martial skill, tactics, range, teamwork, information | Local opportunity check |
| Can the technique be used now? | activation, body parts, tool/entity, stock, CE, setup | Hard eligibility conditions |
| Does it affect this target? | barrier, soul, nullification, physiology, adaptation, targeting | Explicit interaction rule |
| Can the effect be sustained? | reserves, efficiency, output, concentration, pressure | Resource and maintenance state |
| Does it end the fight? | effect type, target condition, counter, recovery, temperament | Consequence/terminal rule |

Numerically represent broad, repeatable capacities such as movement, reaction, output band, reserves, control, and tactical skill. Represent Infinity, soul access, domain targeting, adaptation, Copy conditions, nullification, vows, summons, and rule-based techniques with conditional rules. Do not turn an exceptional mechanic into a very large number.

### 3.1 Physical combat and cursed energy

#### Physical ability and reinforcement

Sorcerers generally reinforce their bodies with cursed energy. The result is not a single stat: a strong natural body, good martial skill, timely reinforcement, output, and control all contribute. Yuji's extraordinary body matters even before refined energy control; Yuta can compensate for a less exceptional natural physique with immense energy; Maki and Toji demonstrate a separate zero-cursed-energy physical route. **Evidence:** `F`, JJK ch. 12–15, 36–37, 140; JJK ch. 71–75, 148–149, 197–198.

**Game implication:** keep `physical_base`, `reinforcement`, `reaction`, and `martial_skill` separate. The same feat must not raise all four automatically.

#### Reserves, output, and efficiency

These concepts overlap in results but are not synonyms.

- Yuta is repeatedly identified by enormous reserves; Ryu is distinguished by extraordinary output. `F`, JJK ch. 140, 173–180.
- Gojo's Six Eyes allow exceptionally efficient use, meaning ordinary expenditure barely depletes him under normal conditions. This does not mean he has no limits or that every action has infinite output. `F`, JJK ch. 140; ch. 225–230.
- A fighter can retain cursed energy while suffering reduced output through injury, soul/body disruption, or overuse. `F/I`, especially JJK ch. 250–267.

**Game implication:**

- `ce_pool` pays costs and supports endurance.
- `ce_output` caps the force of an individual application.
- `ce_efficiency` informs the versioned net costs assigned during data authoring; the resolver does not apply it twice.
- `reinforcement` records the demonstrated effectiveness of placing and timing energy on the body; do not derive it automatically from raw output.

Do not award a large-reserve character automatic top damage or defense.

#### Exhaustion and injury

Injury can reduce mobility, concentration, output, hand use, breathing, or the ability to maintain a technique even before reserves reach zero. Reverse cursed technique can restore tissue where the user has the skill and output, but healing costs substantial energy and attention. Severe brain damage, poison, soul-related damage, lost output, and repeated domain use create special limits. `F`, JJK ch. 74–75, 117–119, 143, 188–190, 225–230, 251–258.

**Game implication:** do not represent health as one bar alone. Track injuries by consequence tags such as `left_arm_disabled`, `brain_strain_2`, `movement_impaired`, and `output_suppressed`.

#### Black Flash

Black Flash occurs when cursed energy is applied within an extremely small interval of a physical strike. No sorcerer can use it at will. Landing one places the user in an elevated state of understanding/performance, and consecutive occurrences are possible, but a player or AI cannot simply select a guaranteed Black Flash. `F`, JJK ch. 48–50; ch. 126–132; ch. 256–260.

**Game rule `G`:** Black Flash is an eligible low-probability event only on a successful cursed-energy melee hit by a capable user. Raise probability after exceptional focus, rhythm, or prior Black Flash, but never to certainty. It multiplies the resolved strike's effect and grants a temporary `zone` state; it does not permanently raise every attribute.

#### Reverse cursed technique

- RCT creates positive energy and can heal the user; healing others is rarer and not automatically equal in speed or quality. `F`, JJK ch. 74, 113, 143, 189, 258.
- Cursed spirits ordinarily repair their bodies with cursed energy rather than human-style RCT. Directly output positive energy is especially destructive to them. `F`, JJK ch. 16, 49; ch. 143, 174–175.
- RCT cannot be inferred for a character merely because they are strong.
- Automatic jackpot healing, ordinary conscious self-healing, and outputting RCT to heal another person are distinct capabilities.
- RCT does not justify resurrection after established death. It also does not freely erase soul damage, technique alteration, poison, or brain strain; capability depends on the demonstrated user and mechanic.

### 3.2 Cursed techniques

An innate technique should be stored as one or more **abilities**, not as a flat percentage bonus. Each ability needs:

- activation components: thought, gesture, hand sign, chant, gaze, contact, blood, tool, marked target, or external entity;
- minimum/maximum range and line-of-effect;
- setup time and whether pressure can interrupt it;
- valid targets and exclusions;
- energy/resource cost;
- maintained-state requirements;
- effect and failure conditions;
- known counter classes;
- aftermath: burnout, cooldown, recoil, consumed stock, or revealed information.

#### Conditions, restrictions, and binding vows

JJK techniques gain function or strength through restrictions and disclosed conditions, but the manga does not support a universal exchange-rate calculator. Binding vows can be personal or between parties; violating a self-imposed vow generally loses the gained benefit, while the consequences of breaking a vow with another party are treated as uncertain and dangerous. `F`, JJK ch. 11, 79, 119, 134, 227, 255–259.

**Game implication:** author named vow effects individually. Never allow the resolver to invent a convenient vow after the outcome is known.

#### Extensions, maximums, and reversals

- An extension technique is a developed application of an innate technique.
- A maximum technique is a high-level ultimate expression identified as such by canon; not every character has one.
- Cursed Technique Reversal feeds positive energy into a technique and is distinct from healing with RCT. It cannot be inferred from RCT alone. `F`, JJK ch. 74–75, 134.

Store each demonstrated application separately, sharing a parent technique and common restrictions.

#### Knowledge is not a counter

Knowing what a technique does can prevent surprise and enable a valid response. It does not grant the speed, tool, perception, resistance, or barrier method required to execute that response. Conversely, ignorance may be decisive for rule-based or setup-dependent abilities. The resolver should use:

`unknown -> observed -> partial_model -> confirmed_mechanic`

rather than a binary `knows_technique` flag.

### 3.3 Domains and barriers

#### Domain activation and timing

Domain Expansion manifests an innate domain, embeds a technique, and generally requires a sign or other activation. It is costly, reveals a decisive option, and normally leaves the innate technique difficult or impossible to use briefly afterward. Skilled characters can exploit the activation window, damage the caster, contest the barrier, or answer after expansion. `F`, JJK ch. 15, 29–31, 82, 108–109, 130, 164, 179, 225–230.

**Game implication:** a domain requires an opportunity and passes `can_domain_now`; it is never automatically selected because a meter filled.

#### Sure-hit, lethality, and rules

Not all domains are direct sure-kill attacks. Older or rule-based domains can enforce information, procedure, or a rule before punishment; modern lethal domains often combine sure-hit with destructive technique output. Higuruma and Hakari are important counterexamples to treating all expansions alike. `F`, JJK ch. 164–166, 182–189.

Store `domain_mode` as `lethal`, `rule_based`, `incomplete`, or `special`, plus the actual sure-hit/rule effect.

#### Clashes and refinement

When domains overlap, compatibility, barrier conditions, refinement, output, damage to the caster, and outside/inside barrier properties can matter. Canon does not give a universal numeric refinement table. The Gojo/Sukuna clashes are exceptional and should not become the default model. A three-way expansion can collapse through instability and outside interference, as in Sendai. `F`, JJK ch. 15, 179, 225–230.

**Game rule `G`:** resolve domain clashes using a small ordered comparison—`barrier_skill`, `domain_mastery`, current output, declared barrier conditions, and disruption—then choose `dominates`, `contested`, `mutual_collapse`, or `special_interaction`. Do not compare a single `domain_power` score.

#### Open and closed barriers

Sukuna and Kenjaku demonstrate domains whose effects operate without the ordinary sealed shell. This creates unusual reach and permits attacks on a closed barrier from outside. It is a rare capability and not a generic high-rank upgrade. `F`, JJK ch. 119, 206, 225–230.

#### Anti-domain methods

| Method | Canon function | Important limit | Game treatment |
|---|---|---|---|
| Simple Domain | Establishes a small domain that interferes with a domain's sure-hit; specific schools/users add other programmed functions | Can be stripped or collapse; does not erase the enemy, neutralize all ordinary attacks, or guarantee escape | Temporary anti-sure-hit state with stability and posture requirements |
| Hollow Wicker Basket | Older anti-domain barrier that prevents/neutralizes sure-hit targeting while maintained | Maintenance can occupy hands/signs; the user remains vulnerable to direct attacks | Strong maintained defense, severe action constraint unless that version demonstrates otherwise |
| Falling Blossom Emotion | Cursed energy automatically counters a sure-hit at contact | Best supported against attack-like sure-hits; does not remove the domain or all damage | Reactive damage mitigation, not immunity |
| Domain Amplification | Wraps the user in a domain-like layer that can neutralize/attenuate an opposing technique on contact | Normally prevents simultaneous use of the user's innate technique; contact and sufficient execution still matter | Contact-based technique contest mode with offense tradeoff |
| Incomplete domain | May improve environment or contest a barrier without a complete sure-hit | User-specific and structurally weaker/unfinished | Encode only demonstrated functions |

**Evidence:** `F`, JJK ch. 58–59, 82–84, 108, 130, 170–171, 225–227, 246, 249–251, 254–259.

These methods are not interchangeable “domain immunity.”

#### Burnout, recovery, and repetition

After a domain, the imbued innate technique normally burns out temporarily. Uro, Ryu, Mahito, and others show the vulnerability; Gojo and Sukuna's method of damaging and healing the relevant brain region to restore a technique is exceptional, dangerous, and causes accumulating strain. `F`, JJK ch. 130, 179–181, 225–230.

**Game implication:** ordinary records receive `technique_burnout`. Brain-reset recovery exists only on specifically demonstrated versions and adds `brain_strain`; it is not a universal RCT option.

#### Allies, targets, and collateral effects

Domains differ in target selection. Some affect everyone recognized inside; some users demonstrate precise selection or coordinate an ally who is exempt for a stated reason. Three or more expansions and external barrier damage can destabilize the situation. `F`, JJK ch. 15, 109, 179, 249–251.

No generic rule should assume allies are safe. Each domain record must state `ally_policy` and evidence.

#### Heavenly Restriction and barriers

Fully realized Maki, like Toji, has no cursed energy and can be treated by many barriers as an object/building rather than a normal target. She can enter and leave many barriers and is not automatically targeted by Naoya's sure-hit unless conditions change or she consents to enclosure. This is not blanket immunity to physical hazards or all domains: an effect that attacks matter or the environment may still threaten her. `F`, JJK ch. 73, 198; boundary inference from JJK ch. 119.

### 3.4 Other interaction systems

#### Soul mechanics

- Idle Transfiguration acts on the soul's shape, which changes the body; ordinary durability is not a complete defense. Mahito requires access/contact and can be resisted to some degree by awareness/protection and the target's soul strength. `F`, JJK ch. 22–31, 80–82, 126–132.
- Yuji can perceive/strike the soul boundary because of his vessel experience; later training and Shrine applications increase his relevance against an incarnated target. `F`, JJK ch. 27, 250–267.
- Split Soul Katana ignores ordinary toughness when wielded by someone capable of perceiving souls/inorganic souls as required. `F`, JJK ch. 198.
- Healing soul-related harm is not one universal rule. Later chapters support that a person who can perceive the soul's outline may heal relevant damage with RCT, but output and skill remain limiting. `F/I`, JJK ch. 252.

#### Shikigami and external assistance

Summons have their own positions, durability, commands, and destruction rules. They can create openings and protect a user but do not merge their full stats into the summoner. Ten Shadows has technique-specific inheritance and permanent-loss rules; Rika has version-specific manifestation and storage functions. `F`, JJK ch. 6–9, 47, 117–119, 178–180.

#### Adaptation

Mahoraga adapts after exposure and wheel progression; the process takes time and is specific to phenomena encountered. Adaptation does not mean pre-fight omniscience, instant immunity, or universal adaptation to the opponent. Destroying it before sufficient adaptation remains valid. Sukuna can bear the wheel in specific Ten Shadows use, but that configuration must be version-legal. `F`, JJK ch. 117–119, 217, 228–234.

#### Copy

Later Yuta's Copy requires Rika to consume a body part; the value required depends on the technique and intended uses, can be modified by restrictions, and can become invalid if the original user restores the consumed part. Copied techniques are accessed through full Rika manifestation or Yuta's domain, with version-specific stock. Output and understanding still limit results. *JJK 0* Yuta and later Yuta require separate records because Rika's status and shown conditions differ. `F`, JJK 0 ch. 4; JJK ch. 178–180, 249–251, 261–263, 267.

#### Cursed tools

Tools provide their demonstrated technique or property; possession, compatibility, hands, and loss matter. Inverted Spear of Heaven nullifies active techniques on contact; Black Rope disrupts techniques but is consumable; Split Soul Katana has a perception gate. Do not convert a tool into a permanent owner buff. `F`, JJK 0 ch. 4; JJK ch. 71–72, 145, 198.

#### Incarnated sorcerers and vessels

An incarnated sorcerer can suppress the host, but the soul/body relationship creates specific vulnerabilities. Technique Extinguishment/Jacob's Ladder threatens incarnated beings, and Yuji's soul-boundary attacks can separate Sukuna from Megumi. These are potent matchups, not universal one-hit kills: activation, target exposure, output, host survival, and interruption still matter. `F`, JJK ch. 145, 199, 213, 250–251, 263–268.

#### Exceptional abilities

Takaba's Comedian, Higuruma's courtroom, Hakari's jackpot, Yorozu's Perfect Sphere plus domain, Gojo's Limitless/Six Eyes, and Sukuna's open domain/world-targeting slash cannot be represented faithfully by ordinary damage ratings alone. Each needs an explicit state machine and conservative boundary rules.

---

## 4. Character records

### 4.1 Roster completion status

`BLOCKED_BY_MISSING_INPUT`: no supplied roster or game IDs. Production character records must be generated only after importing the actual roster. Preserve every existing ID exactly and add a `canon_version_id`; do not rename IDs during the research pass.

### 4.2 Required record schema

```json
{
  "game_id": "EXISTING_ID_REQUIRED",
  "name": "Character name",
  "canon_version_id": "slug__chapter_or_timeframe",
  "version_label": "Exact timeframe/body",
  "evidence_window": ["JJK ch. X-Y"],
  "species_body_vessel": {
    "species": "human|curse|incarnated|other",
    "body": "description",
    "host": null,
    "soul_notes": []
  },
  "demonstrated_combat_profile": [],
  "potential_notes": [],
  "equipment": [],
  "external_entities": [],
  "attributes": {
    "physical_base": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: ordinal abstraction"},
    "natural_durability": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: excludes active reinforcement"},
    "reinforcement": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: ordinal abstraction"},
    "ce_pool": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: ordinal abstraction"},
    "ce_output": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: ordinal abstraction"},
    "ce_efficiency": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: ordinal abstraction"},
    "movement_speed": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: ordinal abstraction"},
    "reaction": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: perception and response timing"},
    "martial_skill": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: ordinal abstraction"},
    "technique_mastery": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: ordinal abstraction"},
    "tactical_skill": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: ordinal abstraction"},
    "barrier_skill": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: ordinal abstraction"},
    "teamwork": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: ordinal abstraction"},
    "rct_skill": {"rating": 0, "evidence": [], "confidence": "F|I|U", "note": "G: zero if unavailable"}
  },
  "abilities": [
    {
      "ability_id": "stable_id",
      "name": "Ability",
      "canon_status": "F|I|U",
      "evidence": [],
      "requirements": [],
      "range_band": "self|contact|close|mid|long|battlefield",
      "targets": [],
      "setup": 0,
      "cost": {},
      "duration": "instant|maintained|timed|state_based",
      "effect_tags": [],
      "counterplay": [],
      "failure_conditions": [],
      "aftermath": []
    }
  ],
  "domain": {
    "domain_id": "stable_id_or_null",
    "name": "Name",
    "barrier_type": "closed|open|incomplete|special",
    "domain_mode": "lethal|rule_based|incomplete|special",
    "requirements": [],
    "sure_hit_or_rule": {},
    "target_filter": [],
    "ally_policy": "affected|excluded|conditional|unknown",
    "range": "author value",
    "known_counters": [],
    "aftermath": ["technique_burnout"],
    "evidence": [],
    "confidence": "F|I|U"
  },
  "anti_domain": [],
  "recovery": [],
  "soul_capabilities": [],
  "soul_vulnerabilities": [],
  "typical_tactics": [],
  "temperament": {"lethality": "", "risk_tolerance": "", "sacrifice_policy": ""},
  "strengths": [],
  "weaknesses": [],
  "matchup_dependencies": [],
  "team_utility": [],
  "ally_interference_risks": [],
  "persistent_state_fields": [],
  "prohibited_narration": [],
  "record_confidence": "high|medium|low"
}
```

Set `domain` to `null` when the selected version has no demonstrated domain. Never populate it from potential, fan terminology, or another version.

### 4.3 Attribute scale

Use a 0–5 ordinal scale, never percentages:

| Rating | Meaning |
|---:|---|
| 0 | Absent or unusable |
| 1 | Limited/basic |
| 2 | Competent sorcerer-level application |
| 3 | Advanced/high-grade capability |
| 4 | Elite, with clear top-tier evidence |
| 5 | Exceptional outlier demonstrated by this version |

Ratings compare capability bands; a `5` is not 25% stronger than a `4`. Rare abilities belong in tags/rules, not a hidden rating of 6–10.

### 4.4 Record authoring rules

1. Assign the narrowest defensible version window.
2. List equipment actually available in that window.
3. Rate demonstrated ability, not theoretical potential.
4. Cite at least one relevant feat or statement per nonzero advanced attribute.
5. Mark every rating as `G`; evidence supports the placement but does not make the number canon.
6. Write prohibited claims before writing flavor text.
7. Separate permanent capability from encounter loadout.
8. Keep personality tactical: willingness to reveal a technique, protect allies, gamble, kill, retreat, or sacrifice.

### 4.5 Illustrative record fragment—not a production roster ID

```json
{
  "game_id": "EXAMPLE_ONLY__YUTA_SENDAI",
  "name": "Yuta Okkotsu",
  "canon_version_id": "yuta__sendai_ch173_181",
  "version_label": "Sendai Colony, before later Shinjuku copy reveals",
  "equipment": ["katana", "ring"],
  "external_entities": ["current Rika; full manifestation limited to five minutes"],
  "abilities": [
    "high-level reinforcement and sword combat",
    "self-RCT and output of positive energy",
    "full Rika manifestation",
    "Copy stock demonstrated by the end of Sendai only",
    "domain expansion shown but effect unresolved at this version"
  ],
  "prohibited_narration": [
    "Do not use later-confirmed copied techniques unless the loadout version is changed.",
    "Do not describe the original JJK 0 Rika as still soul-bound.",
    "Do not assign the later-revealed domain mechanics to a strict Sendai-only knowledge state.",
    "Do not copy a technique mid-fight unless its condition is satisfied."
  ]
}
```

---
## 5. Technique interaction rules

These rules answer **what happens if an eligible action reaches a valid interaction**. They do not create the opportunity by themselves.

Production rules should also be serialized in this form:

```json
{
  "rule_id": "INT-DOM-004",
  "name": "Falling Blossom Emotion versus attack-like sure-hit",
  "attacker_prerequisites": ["completed_attack_like_sure_hit"],
  "defender_prerequisites": ["falling_blossom_emotion_available", "sufficient_control"],
  "battlefield_conditions": ["defender_inside_domain"],
  "knowledge_conditions": [],
  "trigger": "sure_hit_contacts_defender_energy",
  "effect": ["mitigate_or_destroy_incoming_attack_at_contact"],
  "costs": ["maintained_output", "stance_or_focus"],
  "duration": "while maintained",
  "counterplay": ["direct_attack", "overwhelm_volume", "non_attack_rule", "disrupt_user"],
  "resolution_class": "conditional",
  "canon_evidence": ["JJK ch. 108", "JJK ch. 227"],
  "canon_confidence": "F",
  "game_rule": "Resolve mitigation per sure-hit pulse; the domain remains active.",
  "example": "Naobito mitigates Dagon's shikigami sure-hit.",
  "boundary_case": "Effectiveness against information overload is unsupported."
}
```

Allowed `resolution_class` values are `absolute`, `conditional`, `probabilistic`, and `unknown`. Use `absolute` only for the narrow effect after every prerequisite has been satisfied—not for the overall matchup or victory.

### `INT-INF-001` — Contesting Infinity

- **Attacker prerequisites:** one supported method: Domain Expansion sure-hit; maintained Domain Amplification and contact; Inverted Spear of Heaven contact; functioning Black Rope contact; Mahoraga after relevant adaptation; Sukuna's demonstrated world-targeting Dismantle; or another explicitly evidenced nullification/spatial rule.
- **Defender prerequisites:** a version of Gojo with Infinity active; exact automation and fatigue depend on version.
- **Conditions/trigger:** the counter must be active, in range, and successfully executed. Possessing a counter tag is insufficient.
- **Effect:** bypasses, neutralizes, or contests Infinity only in the manner demonstrated by that method.
- **Costs/duration:** inherited from the counter—barrier cost, technique tradeoff, consumable rope, adaptation time, tool contact, or slash requirements.
- **Counterplay:** evade contact, interrupt activation, destroy/disarm tool, win the domain exchange, overwhelm the amplification user physically, or prevent adaptation.
- **Class:** conditional; never generic immunity.
- **Canon:** `F`, JJK 0 ch. 4; JJK ch. 15, 71–72, 84–85, 145, 228–236.
- **Game interpretation `G`:** Infinity blocks ordinary approach/impact automatically when valid. A bypass changes the hit gate from `impossible` to a normal contested action; it does not guarantee the attacker survives or wins.
- **Example:** Jogo and Hanami can touch through Domain Amplification, but must fight Gojo without freely using their innate techniques.
- **Boundary:** an attack being “very fast,” “very strong,” poisonous, or soul-affecting does not itself show that it crosses Infinity.

### `INT-DOM-001` — Sure-hit establishment

- **Attacker prerequisites:** completed domain activation, valid imbued technique/rule, target recognized by the domain.
- **Defender prerequisites:** inside the affected space/range and not protected by a currently valid counter.
- **Trigger/effect:** the domain establishes its sure-hit or rule. “Sure-hit” removes ordinary aiming/evasion, not every form of mitigation, counterattack, healing, or barrier response.
- **Costs/duration:** major energy use; maintained domain; usual post-domain burnout.
- **Counterplay:** own domain, anti-domain method, disrupt/damage caster, escape where possible, exploit targeting, or use a domain-specific rule answer.
- **Class:** conditional after activation.
- **Canon:** `F`, JJK ch. 15, 29–31, 82, 108–109, 164–166, 182–189.
- **Game `G`:** apply the specific sure-hit event, never generic `domain_damage`.
- **Example:** Unlimited Void's information effect is not resolved like Dagon's shikigami attack.
- **Boundary:** a rule-based domain may begin procedure rather than immediately injuring the target.

### `INT-DOM-002` — Domain clash

- **Attacker/defender prerequisites:** two eligible domains overlap before one side is conclusively disabled.
- **Conditions:** current output, barrier skill, domain mastery, declared barrier construction, damage, range, open/closed structure, and interference.
- **Trigger/effect:** resolve to `dominates`, `contested`, `mutual_collapse`, or a specifically authored special interaction.
- **Costs:** both sides pay activation; burnout occurs when their domain ends unless an evidenced exception applies.
- **Counterplay:** change barrier conditions, attack caster, break shell from the vulnerable side, reduce output, or introduce external interference.
- **Class:** conditional; often uncertain outside shown matchups.
- **Canon:** `F/U`, JJK ch. 15, 179, 225–230.
- **Game `G`:** no transitive ranking. If A edges B and B edges C, do not infer A automatically dominates C.
- **Example:** Sukuna's open domain can attack Gojo's closed barrier from outside; the subsequent altered barriers are a special elite exchange.
- **Boundary:** the Sendai three-way collapse does not prove every three-domain clash always collapses, but supports high instability.

### `INT-DOM-003` — Simple Domain / Hollow Wicker Basket

- **User prerequisites:** demonstrated method; activation posture/sign; enough output and concentration.
- **Conditions/trigger:** activate before or while surviving long enough under a sure-hit.
- **Effect:** suppresses/interferes with sure-hit targeting inside the defensive area while stable.
- **Costs/duration:** maintained concentration; Simple Domain can erode; HWB commonly occupies hands/signs when maintained.
- **Counterplay:** strip the barrier, attack directly, force movement/posture loss, outlast it, or exploit lack of offense.
- **Class:** temporary conditional defense.
- **Canon:** `F`, JJK ch. 82, 130, 171, 246, 249–251, 254–259.
- **Game `G`:** create `anti_sure_hit` with stability points; domain pressure can reduce stability each beat. Direct non-sure-hit attacks remain legal.
- **Example:** Reggie prevents Chimera Shadow Garden's guaranteed-style advantage from being assumed, but Megumi can still use the environment and direct attacks.
- **Boundary:** do not let Simple Domain erase all cursed techniques in an area.

### `INT-DOM-004` — Falling Blossom Emotion

- **User prerequisites:** demonstrated knowledge and enough cursed-energy control.
- **Trigger:** an attack-like sure-hit contacts the user's energy.
- **Effect:** automatic counter-energy reduces or destroys the incoming attack at contact.
- **Costs/duration:** maintained stance/output; residual damage may remain.
- **Counterplay:** direct physical attack, non-attack rule effect, overwhelming volume, or disrupt user.
- **Class:** conditional mitigation.
- **Canon:** `F`, JJK ch. 108, 227.
- **Game `G`:** apply mitigation per sure-hit pulse; never mark the domain inactive.
- **Example:** Naobito answers Dagon's shikigami sure-hit but is not safe from Dagon himself.
- **Boundary:** effectiveness against Unlimited Void-like information is unsupported; use `U` and default to ineffective unless a design ruling says otherwise.

### `INT-DOM-005` — Domain Amplification

- **User prerequisites:** demonstrated amplification, active technique available to suppress, contact opportunity.
- **Trigger/effect:** amplification can absorb/neutralize technique effects sufficiently to permit contact or reduce effect.
- **Costs:** innate technique normally cannot be used simultaneously; switching creates timing windows.
- **Counterplay:** physical superiority, disengagement, punish switching, stronger technique output, or domain response.
- **Class:** conditional contact contest.
- **Canon:** `F`, JJK ch. 84–85, 171, 224–230.
- **Game `G`:** set `innate_technique_locked=true` while amplification is active unless the exact version demonstrates a supported exception/control feat.
- **Example:** disaster curses contest Infinity through amplification but lose access to their easiest innate-technique offense during contact.
- **Boundary:** amplification is not proof the user can neutralize every technique regardless of output and time.

### `INT-SOUL-001` — Soul access, damage, and defense

- **Attacker prerequisites:** technique/weapon that explicitly targets the soul or demonstrated perception of soul boundaries; satisfy contact/tool/range conditions.
- **Defender prerequisites:** body/soul state, awareness, reinforcement, RCT, vessel status, or soul plurality as relevant.
- **Trigger/effect:** apply the specific soul effect, which may bypass ordinary bodily durability or separate an incarnated soul.
- **Costs:** ability-specific; some require touch, precise perception, or repeated hits.
- **Counterplay:** prevent contact, protect/recognize the soul, interrupt, heal if capable, or exploit attacker risk.
- **Class:** conditional; not a universal durability ignore.
- **Canon:** `F/I`, JJK ch. 22–31, 80–82, 126–132, 198, 250–267.
- **Game `G`:** use separate tiered `body_state`, `soul_state`, and `incarnation_control_state` tracks only in fights where a soul rule is present.
- **Example:** Yuji can meaningfully damage Mahito where ordinary blunt-force fighters cannot achieve the same lasting effect.
- **Boundary:** soul awareness alone does not grant Idle Transfiguration immunity or automatic soul healing.

### `INT-HR-001` — Zero-cursed-energy Heavenly Restriction

- **User prerequisites:** fully realized zero-CE profile such as Toji or post-Mai Maki, not partial restriction.
- **Conditions:** barrier/targeting logic that detects cursed energy or categorizes objects.
- **Effect:** user may be unrecognized by certain barriers/sure-hits and can interact with colony/domain boundaries unusually.
- **Costs:** no ordinary cursed-energy reinforcement or innate technique; equipment matters.
- **Counterplay:** direct perception, physical/environmental attacks, attacks against matter, manually aimed actions, or barrier conditions that include objects/consent.
- **Class:** conditional exception.
- **Canon:** `F`, JJK ch. 73, 149, 197–198.
- **Game `G`:** set `ce_signature=none`; every domain specifies `target_filter` and `environment_damage`, rather than granting `domain_immune`.
- **Example:** Naoya's domain fails to recognize/auto-target Maki.
- **Boundary:** Malevolent Shrine's stated attacks on inanimate matter create a materially different case; do not copy Naoya's failure to all domains.

### `INT-ADAPT-001` — Mahoraga adaptation

- **Attacker prerequisites:** Mahoraga summoned/controlled as version permits; wheel active; phenomenon exposure survived.
- **Trigger/effect:** after sufficient wheel progression, Mahoraga gains an answer to the encountered phenomenon. Further adaptation may develop different answers.
- **Costs/duration:** exposure time, survival, summon risk; if summoner bears the wheel, configuration must be canon-legal.
- **Counterplay:** one-shot before adaptation, vary phenomena, remove summoner/summon, deny exposure, overwhelm new defense.
- **Class:** conditional state progression.
- **Canon:** `F`, JJK ch. 117–119, 217, 228–234.
- **Game `G`:** maintain adaptation by `phenomenon_id`, stage `0..3`; stage thresholds are balance values, not canon measurements.
- **Example:** exposure to Infinity eventually permits a method of bypass; this does not pre-adapt Mahoraga to Hollow Purple.
- **Boundary:** broad labels such as `slashing` must not erase meaningful differences unless the authored rule groups them.

### `INT-NULL-001` — Technique extinguishment/nullification

- **Attacker prerequisites:** Angel/Hana/Yuta with available Technique Extinguishment, or a specific nullifying tool/method; activation and target exposure.
- **Trigger/effect:** extinguish curses/techniques as demonstrated; Jacob's Ladder is especially dangerous to incarnated beings.
- **Costs:** output, charge/chant/setup, user cooperation, line/range, copied-technique access where relevant.
- **Counterplay:** interrupt, evade, deceive the host, break line, attack low-output user, or survive incomplete exposure.
- **Class:** conditional, potentially overwhelming after successful setup.
- **Canon:** `F`, JJK ch. 145, 199, 213, 249–251, 263–264.
- **Game `G`:** apply escalating `extinguishment` and `incarnation_separation`; do not make the technique a passive aura.
- **Example:** Jacob's Ladder can threaten Sukuna's incarnation but does not remove the need to expose and hold him in the effect.
- **Boundary:** do not assume it permanently deletes every innate technique after a glancing hit.

### `INT-COPY-001` — Copy acquisition and access

- **Attacker prerequisites:** exact Yuta version; Rika consumes a qualifying body part; copied technique stored; access through full manifestation or domain.
- **Conditions:** value of part, intended use count, restoration of consumed part, understanding/output, and stock at selected timeframe.
- **Effect:** makes a copied technique eligible with its underlying restrictions.
- **Costs:** acquisition, possible use vow, five-minute manifestation or domain cost, copied ability's own cost.
- **Counterplay:** deny condition, restore part where canon rule invalidates value, outlast manifestation, force burnout, exploit unfamiliarity/output.
- **Class:** conditional capability access.
- **Canon:** `F`, JJK ch. 178–180, 249–251, 261–263, 267; separate JJK 0 record.
- **Game `G`:** copied abilities are explicit loadout entries. Never generate a convenient copy mid-resolution.
- **Example:** copied Cursed Speech retains backlash/target-gap considerations.
- **Boundary:** Copy does not grant Six Eyes, body traits, or perfect mastery not supplied by the technique itself.

### `INT-CS-001` — Cursed Speech

- **Attacker prerequisites:** functioning speech, Cursed Speech access, target able to hear/receive command, chosen command.
- **Trigger/effect:** command compels affected target; cost/recoil scales with command and target resistance/gap.
- **Costs:** throat damage and cursed-energy strain; stronger targets/commands are riskier.
- **Counterplay:** pre-reinforce ears/brain when aware, disrupt speech, block hearing/transmission, force risky wording, or resist through gap at high recoil to user.
- **Class:** conditional/probabilistic by gap.
- **Canon:** `F`, JJK 0; JJK ch. 43, 178–180, 249–251.
- **Game `G`:** command has `severity`; compare against target resistance to calculate both effect and backlash. Knowledge enables defense but consumes attention/output.
- **Example:** “Don't move” creates a short opening rather than guaranteed victory against a much stronger target.
- **Boundary:** ordinary hearing protection is not automatically proven sufficient against every delivery; encode only supported defensive preparation.

### `INT-BLD-001` — Blood, poison, and physiology

- **Attacker prerequisites:** relevant blood technique/toxin reaches target by wound, ingestion, or stated route.
- **Defender prerequisites:** species/body traits and demonstrated resistance.
- **Effect:** apply blood loss, poison, rot, thrombosis, or contamination as the specific ability states.
- **Costs:** blood stock, conversion energy, self-harm, range, concentration.
- **Counterplay:** evade, heal/detox if capable, stop exposure, pressure source, use compatible physiology.
- **Class:** conditional; species-sensitive.
- **Canon:** `F`, JJK ch. 55–61, 101–105, 142–143, 194.
- **Game `G`:** toxins are named statuses with onset and severity, not generic damage-over-time. Cursed-spirit, Death Painting, vessel, and human physiology require separate compatibility tags.
- **Example:** Choso's blood introduces a poisonous complication for an ordinary human target.
- **Boundary:** Yuji's resistance to a specific poison/context does not establish immunity to all toxins.

### `INT-SUM-001` — Shikigami and summons

- **Summoner prerequisites:** summon available, not permanently lost, correct medium/gesture, capacity to maintain/control.
- **Trigger/effect:** create an independent actor with commands and linked rules.
- **Costs:** energy, attention, manifestation window, destruction/loss conditions.
- **Counterplay:** attack summon, summoner, medium, command link, or exploit divided attention.
- **Class:** conditional external actor.
- **Canon:** `F`, JJK ch. 6–9, 47, 117–119, 178–180.
- **Game `G`:** summon receives its own turn opportunities but shares command bandwidth; it is not an additive stat buff.
- **Example:** Divine Dog pressures a flank while Megumi acts, but its destruction changes later availability.
- **Boundary:** do not import anime-only summon feats into manga records.

### `INT-TOOL-001` — Cursed tools

- **User prerequisites:** possession, compatible skill/perception, free limb or control method.
- **Trigger/effect:** on eligible use/contact, apply the tool's specific property.
- **Costs:** item durability/stock, disarm risk, opportunity cost, user gate.
- **Counterplay:** disarm, destroy, steal, deny contact, exploit incompatibility.
- **Class:** conditional equipment interaction.
- **Canon:** `F`, JJK 0 ch. 4; JJK ch. 71–72, 145, 148–149, 198.
- **Game `G`:** equipment is stateful and can be lost across a gauntlet.
- **Example:** Inverted Spear of Heaven can stop an active technique at contact; Toji still has to land it.
- **Boundary:** owning a special-grade tool does not confer its famous prior owner's physical feats.

### `INT-SPAT-001` — Spatial manipulation and world-targeting attacks

- **Attacker prerequisites:** exact spatial ability and its setup; valid target definition.
- **Trigger/effect:** alter space/sky or target the occupied space according to demonstrated mechanics.
- **Costs:** ability-specific signs, chants, aim, output, cooldown, or binding vow.
- **Counterplay:** anticipation, prevent setup, movement before targeting locks, technique neutralization, domain response, or surviving output where applicable.
- **Class:** exceptional conditional interaction.
- **Canon:** `F/U`, JJK ch. 176–181, 234–238, 255–264.
- **Game `G`:** author each spatial action directly. Never use a generic `space_hax=true` that bypasses all defenses.
- **Example:** world-targeting Dismantle has a supported Infinity interaction but still obeys its version's post-vow activation requirements.
- **Boundary:** Uro's sky manipulation and Sukuna's world-targeting slash are not interchangeable.

### `INT-RULE-001` — Rule-based and reality-adjacent techniques

- **Attacker prerequisites:** complete technique-specific activation.
- **Conditions:** knowledge, target participation, domain procedure, psychological state, or humor/confidence as appropriate.
- **Effect:** enter the authored technique state machine.
- **Costs:** technique-specific; may not map cleanly to damage or reserves.
- **Counterplay:** obey/exploit rules, disrupt user, win procedure, manipulate confidence, or use evidenced nullification.
- **Class:** exceptional; often uncertain at cross-technique boundaries.
- **Canon:** `F/U`, JJK ch. 164–166, 182–189, 239–243.
- **Game `G`:** every such technique gets a dedicated mini-resolver. When two exceptional rules collide without canon evidence, use a declared conservative ruling and surface `uncertain_interaction=true`.
- **Example:** Higuruma's domain begins adjudication and possible confiscation rather than ordinary sure-hit damage.
- **Boundary:** Takaba's Comedian has no canon-tested answer to many top-tier domains; do not invent certainty.

---

## 6. Proposed combat system

### 6.1 Architecture

Use four layers:

1. **Canon capability layer:** versioned attributes, abilities, equipment, personality, evidence, prohibited claims.
2. **Interaction layer:** stable rules from section 5 and technique-specific mini-resolvers.
3. **Encounter layer:** arena, boss tuning, starting knowledge, artificial phases, retry policy, victory conditions.
4. **Presentation layer:** event log, concise narration, optional mechanics panel.

Only layer 3 may deliberately adjust difficulty. Example: `encounter_rule: boss_output_elevated_until_phase_break` is acceptable if labeled as noncanon tuning; quietly raising Sukuna's canonical capability is not.

### 6.2 Minimal state

```json
{
  "run_id": "seeded-run-id",
  "seed": 418220,
  "ruleset_version": "jjk-resolver-0.1.0",
  "encounter_id": "boss_03",
  "beat": 0,
  "battlefield": {
    "range_bands": {},
    "cover": [],
    "barriers": [],
    "hazards": [],
    "escape_routes": []
  },
  "combatants": {
    "existing_game_id": {
      "canon_version_id": "version",
      "status": "active",
      "position": "mid",
      "body_state": "uninjured",
      "injury_burden": 0,
      "ce_capacity_units": 9,
      "ce_current_units": 9,
      "output_state": "normal",
      "injuries": [],
      "conditions": [],
      "technique_state": "ready",
      "domain_state": "ready",
      "anti_domain_state": null,
      "brain_strain": 0,
      "summons": [],
      "equipment": [],
      "one_time_resources": [],
      "knowledge": {},
      "adaptations": {},
      "morale_intent": "committed"
    }
  },
  "persistent_boss_state": {},
  "event_log": []
}
```

`body_state` and `injury_burden` are summaries; consequence-bearing injury tags remain authoritative. There is no faux-precise 0–100 health model.

### 6.2.1 Cursed-energy accounting

Use a small game budget so eligibility and attrition are auditable. These are explicitly `G` values, not canon measurements.

| `ce_pool` rating | Default capacity units |
|---:|---:|
| 0 | 0 |
| 1 | 3 |
| 2 | 5 |
| 3 | 7 |
| 4 | 9 |
| 5 | 12 |

Typical net costs are `0` passive/negligible, `1` minor, `2` material, `3` major, and `5` extreme. Author the **net cost on the versioned ability after considering that user's efficiency**; do not apply `ce_efficiency` a second time during resolution. Exceptional mechanics—Six Eyes efficiency, jackpot replenishment, external reserves, binding-vow costs—use named overrides rather than pushing the scale above 12.

Capacity is not output. A fighter with many units may still have modest single-action force, while a high-output fighter can spend a large fraction of a smaller pool quickly.

### 6.3 Attribute use and anti-double-counting

Never sum all attributes. Each check names at most three actor attributes and at most three opposing factors.

| Question | Primary inputs | Inputs deliberately excluded |
|---|---|---|
| Can actor obtain a clean melee opportunity? | movement/reaction, martial skill, positioning or pressure; physical force only when relevant | reserves unless exhaustion matters; technique mastery unless technique used |
| Can actor complete a complex activation? | reaction, technique mastery, tactical setup | raw physical power |
| Can defender survive a hit? | reinforcement, current output, body, relevant resistance | total reserves except sustained defense |
| Can actor sustain a technique? | pool, efficiency, injury, maintenance | speed unless disrupted |
| Can actor recognize a trap? | tactical skill, observed knowledge, sensory capability | domain skill unless barrier clue involved |
| Can domain hold? | barrier skill, mastery, current output, construction | ordinary melee reputation |

One feat should have one principal home. If a feat shows both speed and tactics, document why; do not inflate reserves, output, reinforcement, and mastery from the same exchange.

### 6.4 Opportunity check

Attributes use `0..5`; situational modifiers are normally `-2..+2`.

```text
actor_control = relevant_attribute_A
              + relevant_attribute_B
              + setup
              + knowledge
              + ally_assist
              - injury
              - enemy_pressure

defender_control = relevant_defense_A
                 + relevant_defense_B
                 + positioning
                 + prepared_counter

margin = actor_control - defender_control
```

Resolution:

| Margin | Result |
|---:|---|
| `>= +4` | Clean opportunity; deterministic unless an explicit rule intervenes |
| `+2 to +3` | Strong opportunity; defender can spend a reaction/resource to contest |
| `-1 to +1` | Contested; use one seeded uncertainty draw |
| `-2 to -3` | Poor opportunity; succeeds only with risk, sacrifice, or defender error |
| `<= -4` | No credible opportunity; choose another action |

For contested checks only, draw `jitter` from `[-1, 0, +1]` with weights `[20%, 60%, 20%]`. Generate it from `seed + encounter + beat + event_id`. Show the resulting factor as “timing uncertainty,” “read,” or another grounded label. Never roll to decide an impossibility.

### 6.5 Threat bands without winner totals

Assign an optional `baseline_threat_band` from 1–7 for encounter composition and sanity checks only:

1. low-grade threat
2. competent sorcerer
3. strong grade-level fighter
4. elite grade 1 / comparable specialist
5. special-grade-level combatant
6. apex combatant
7. exceptional system-breaking apex

Bands are broad and version-specific. They enforce **overwhelming-gap guardrails**:

- A team two or more bands below cannot win merely from a `favorable` tag.
- It must possess an executable win condition, credible survival time, and enough opportunity creation.
- A bypass may turn “cannot affect target” into “can attempt to affect target”; it does not normalize speed, durability, output, or tactical skill.
- Three weak fighters do not add to one apex fighter. Their advantage comes from extra action lanes, rescue, information, and setup.

### 6.6 Ability eligibility

```pseudo
function eligible(actor, ability, state):
    require actor.status == ACTIVE
    require ability unlocked by actor.canon_version_id
    require actor.technique_state compatible with ability
    require all body parts / signs / voice / tools required
    require ability target is valid and in range
    require actor has required CE and consumables
    require ability not exhausted, destroyed, or permanently lost
    require setup and knowledge gates satisfied
    require no condition explicitly forbids it
    return true
```

Failed eligibility creates no attack event. It may create an `attempt_interrupted` event only if the attempt itself plausibly occurred.

### 6.7 Action selection

Each active combatant scores only eligible action **goals**:

1. prevent immediate defeat;
2. protect or rescue a required ally;
3. interrupt an enemy win condition;
4. execute an available win condition;
5. create setup/knowledge;
6. inflict sustainable damage or attrition;
7. recover/reposition;
8. retreat or sacrifice if temperament and encounter rules permit.

Within the chosen goal, tactics and temperament select an action. A conservative fighter should not open with a suicidal maximum; a ruthless informed fighter may target the support character; an unaware fighter cannot counter a secret mechanic.

### 6.8 Beat resolution

```pseudo
while no_terminal_state:
    refresh_beat_limited_reactions()
    candidates = active_combatants_with_opportunities()
    actor = choose_next_actor_by_pressure_and_initiative(candidates)
    goal = choose_tactical_goal(actor, visible_state, actor.knowledge)
    action = choose_eligible_action(goal)

    if action.requires_opportunity:
        opportunity = resolve_local_check(action)
        if opportunity == NONE:
            emit(reposition_or_failed_setup)
            continue

    response = defender_choose_eligible_response(action)
    interaction = find_specific_rule(action, response, targets, battlefield)
    result = resolve(interaction, local_check_if_needed, seed)
    spend_costs_and_apply_aftermath(result)
    emit_atomic_events(result)
    validate_invariants()
    evaluate_terminal_and_phase_conditions()
```

Resolve simultaneous declared actions only when the timing model supports both completing. Otherwise, interruption changes or cancels the later action.

Initiative and action-choice ties must use a stable ordering first (`phase priority`, `reaction before fresh action`, then character ID) and the seeded draw only if the authored rules still leave a real uncertainty. Never rely on runtime object order or an unseeded random call.

### 6.9 Damage and consequences

Use five consequence tiers rather than faux-precise damage physics:

| Tier | Meaning | Common state change |
|---:|---|---|
| 0 | Avoided/negated | resource or positioning only |
| 1 | Minor | fatigue, shallow injury, information revealed |
| 2 | Material | output/reaction penalty, bleeding, damaged tool |
| 3 | Severe | disabled limb, major output loss, summon destroyed |
| 4 | Critical | incapacitation imminent without immediate answer |
| 5 | Terminal | death/exorcism/irreversible defeat if not explicitly prevented |

The ability and interaction rule set the plausible tier range; margin, output, defense, and state select within it. A soul or nullification effect may change another track instead of body integrity.

### 6.10 Domain decision and resolution

```pseudo
function consider_domain(actor, state):
    if not eligible(actor, actor.domain, state): return false
    if actor lacks an action opportunity: return false

    value = target_count_value
          + enemy_win_condition_denial
          + domain_specific_matchup
          + desperation
          - ally_collateral
          - expected_counter
          - burnout_risk
          - later_gauntlet_cost

    return value >= actor.temperament.domain_threshold
```

On activation:

1. emit `domain_attempt`;
2. permit interruption if timing allows;
3. establish barrier/range and target filter;
4. gather simultaneous domain or anti-domain responses;
5. resolve `INT-DOM-*`;
6. emit the actual sure-hit/rule events;
7. track barrier damage and caster injury;
8. on collapse/end, apply burnout and other aftermath.

Not every fight warrants a domain. A domain that produces no tactical effect should not appear for spectacle.

For implementation, distinguish `activation_started`, `domain_established`, and `domain_ended`. A pre-establishment interruption pays only the ability's authored commitment cost and does not apply technique burnout by default; once the domain is established, ending or breaking it applies the normal full cost and burnout unless the exact ability says otherwise. This timing split is a `G` rule used for consistency, not a universal canon measurement of activation frames.

### 6.11 Teamwork

Each fighter retains independent actions and risk. Team contributions use these channels:

| Contribution | Mechanical effect |
|---|---|
| Pressure | Reduces enemy setup or available reactions |
| Setup | Adds a bounded modifier to one ally's specific action |
| Reposition | Changes range/target through a demonstrated ability |
| Restraint | Temporarily satisfies another fighter's hit condition |
| Information | Advances team knowledge state |
| Protection | Spends reaction to intercept/mitigate an event |
| Recovery | Removes a supported condition at cost |
| Resource transfer | Only if explicitly demonstrated |
| Sacrifice | Creates a major opening at irreversible cost |

An assist is capped at `+2` and must name the action that created it. Multiple assists usually create separate effects—one draws a reaction, another fixes position—rather than stacking unlimited bonuses.

Support AI should measure `openings_created`, `fatal_events_prevented`, `knowledge_unlocked`, `enemy_resources_forced`, and `conditions_removed`, not only damage.

### 6.12 Attrition and persistence

#### Persist between bosses in one run

- dead, exorcised, captured, or retreated status;
- consequence-bearing wounds and soul damage;
- current cursed-energy band;
- brain strain and unrecovered burnout when the next fight is immediate;
- consumed vows/resources, destroyed summons, lost tools, copy use limits;
- revealed/learned information retained by surviving characters;
- boss wounds explicitly marked persistent.

#### Reset between encounters by default

- position and ordinary battlefield objects;
- momentary buffs such as `zone`, short stuns, or active Simple Domain;
- technique burnout after sufficient downtime;
- temporary domain/barrier structures;
- short-lived adaptation unless the same summon/entity and continuous timeframe persist;
- ordinary boss attention/target selection.

Every ladder defines `inter_encounter_time`. Recovery is then applied by capability, not by a blanket full heal.

### 6.13 Boss weakening and retries

Define two retry types:

1. **Immediate continuation:** surviving/depleted squad re-engages. All short-term states persist, including burnout, position if applicable, adaptation, and current CE.
2. **Successor attempt:** a new surviving squad attacks later. Persistent anatomical wounds, destroyed external resources, incarnation separation, and learned intelligence may remain; temporary barriers, short buffs, and ordinary burnout reset after credible time.

A boss is weakened only by logged causes:

- `persistent_wound`
- `output_suppression`
- `domain_unavailable` or `brain_strain`
- `tool_lost`
- `summon_destroyed`
- `incarnation_control_reduced`
- `technique_revealed` (knowledge advantage, not bodily damage)

Never use a hidden generic `boss_weakened: 20%` without mapping it to these states.

### 6.14 Victory and terminal states

- **Victory:** all hostile win conditions are disabled, defeated, exorcised, surrendered, sealed, or escaped as scenario specifies.
- **Defeat:** team has no active combatant able/willing to pursue the objective.
- **Retreat:** a legal escape action succeeds; retreating actors preserve their state.
- **Sacrifice:** actor knowingly pays a terminal/permanent cost and the resulting event resolves; success is not guaranteed unless mechanics make it so.
- **Simultaneous casualty:** both terminal events were already irrevocably committed before either incapacitation could interrupt the other.
- **Capture/seal:** distinct from death; requires scenario-supported containment.

No one acts after `incapacitated`, `dead`, `exorcised`, or `sealed` unless an explicit posthumous/independent mechanic is already active.

### 6.15 Extreme abilities

An exceptional ability must supply:

```json
{
  "exception_id": "EXC_*",
  "ordinary_checks_replaced": [],
  "entry_conditions": [],
  "state_machine": [],
  "known_counters": [],
  "unknown_boundaries": [],
  "conservative_default": "",
  "encounter_bans_or_limits": []
}
```

For unresolved boundaries, select one documented design policy:

- `canon_conservative`: ability gets only explicitly demonstrated reach;
- `symmetric_unknown`: neither side receives an assumed absolute interaction;
- `balance_override`: encounter declares a noncanon ruling visibly.

### 6.16 Auditable outcome explanation

Every resolved fight should be able to answer:

1. What was each side's executable win condition?
2. What created the decisive opportunity?
3. Which interaction rule resolved it?
4. What counter existed, and why did it succeed or fail?
5. Which resources and injuries changed?
6. Which uncertainty draw occurred, if any?
7. What persists to the next encounter?

### 6.17 Explicit simplifications and their cost

| Simplification | Why it is used | What it sacrifices |
|---|---|---|
| Range bands instead of coordinates | Keeps positioning legible and cheap | Fine geometry, exact travel distance, complex line-of-sight |
| Beats instead of real-time frames | Makes interruption and logs deterministic | Precise animation timing |
| 0–5 attributes | Avoids fake canon measurements | Small differences inside the same band |
| Small CE-unit budget | Makes attrition testable | Literal energy quantities and some extreme endurance nuance |
| Consequence tiers instead of hit-point damage | Preserves meaningful wounds | Granular chip damage |
| One primary action and bounded reactions per opportunity | Prevents action explosion | Some simultaneous micro-actions |
| Curated interaction rules | Produces canon-like causality | Unsupported matchups require a declared ruling |
| Tactical behavior profiles | Keeps characters recognizable | Full human improvisation |
| Three-paragraph visible narrative | Restores pace and readability | Most low-impact exchanges remain in the optional log |

These simplifications are acceptable only while exceptional abilities can replace the ordinary check that misrepresents them. If a technique cannot be expressed without breaking its core premise, give it a mini-resolver rather than forcing it into damage math.

---

## 7. Narrative contract

### 7.1 Authority

The event log decides what happened. The narrator may:

- combine adjacent low-level events;
- choose sensory language consistent with the ability;
- report tactical intent already recorded;
- omit inconsequential bookkeeping from the main prose.

The narrator may not:

- introduce a new move, immunity, heal, domain, vow, tool, or resurrection;
- turn a passive tag or bonus into an action;
- change targets, timing, knowledge, survivors, or causal order;
- make a failed action successful for drama;
- have an incapacitated character act;
- describe a domain without its logged consequence or response.

### 7.2 Event schema

```json
{
  "event_id": "E014",
  "beat": 6,
  "type": "ability_attempt|response|interaction|effect|state_change|terminal",
  "actor_id": "existing_id",
  "target_ids": ["existing_id"],
  "action_id": "ability_id",
  "intent": "interrupt_domain",
  "prerequisites": [
    {"id": "voice_available", "satisfied": true},
    {"id": "target_in_range", "satisfied": true}
  ],
  "response": {
    "actor_id": "defender_id",
    "action_id": "reinforce_hearing",
    "eligible": true
  },
  "interaction_rule_id": "INT-CS-001",
  "resolution": "partial_success",
  "effects": [
    {"target": "defender_id", "add": "staggered_1"},
    {"target": "existing_id", "add": "throat_strain_2"}
  ],
  "resource_delta": [
    {"target": "existing_id", "ce_current_units": -2}
  ],
  "why_it_matters": "Consumes the boss reaction and opens a contact attempt.",
  "knowledge": {
    "known_to_actor": true,
    "known_to_targets": true,
    "reader_only": false
  },
  "canon_confidence": "F",
  "uncertainty_draw": 0
}
```

### 7.3 Three-paragraph transformation

1. **Opening — establish the problem.** Use the first meaningful approach, knowledge gap, initial technique interaction, and each relevant participant's role. Do not list every strike.
2. **Escalation — change the fight.** Use one genuine adaptation, combination, counter, reveal, major wound, or domain. State the answer and its cost.
3. **Finish — resolve causally.** The final action must exploit a logged opening or accumulated state. End with survivors, decisive injuries, depleted resources, lost summons/tools, and any boss state that persists.

Recommended length: 170–320 words for the visible fight story. Put numbers, rolls, and detailed rules behind an optional “Why this happened” panel.

### 7.4 Style constraints

- Use connected paragraphs, not card-by-card screens.
- Prefer concrete mechanics over “their cursed energy surged overwhelmingly.”
- Mention signature attacks only when eligible and consequential.
- Do not give equal word count to all allies; give each a plausible contribution.
- Historical affiliation may inform recognition, habits, or knowledge only when supported. “Heian Era” can never strike, interrupt, or cause damage.
- Preserve uncertainty in ambiguous interactions: “the barrier began to strip the defense” is valid when the outcome is partial; “canon proves immunity” is not.
- Never announce a winner and then reverse it without a logged counter-event between those statements.

### 7.5 Sample structured outline

**Hypothetical validation fight, not a claim that it occurred in canon:** Shibuya Yuji, intact-technique Shibuya Todo, and pre-injury Shibuya Nobara versus Mahito after he has learned to split a double but before his `0.2-second` Domain Expansion realization. Starting knowledge reflects what each knew by those versions. Mahito begins healthy; no transfigured-human stock is granted.

```json
[
  {
    "event_id": "E001",
    "beat": 1,
    "actor_id": "todo_shibuya",
    "target_ids": ["todo_shibuya", "yuji_shibuya"],
    "action_id": "boogie_woogie_reposition",
    "interaction_rule_id": null,
    "resolution": "success",
    "effects": ["mahito_attack_misses", "yuji_contact_opening"],
    "why_it_matters": "Todo spends an action to create Yuji's lane rather than adding his power to Yuji's."
  },
  {
    "event_id": "E002",
    "beat": 1,
    "actor_id": "yuji_shibuya",
    "target_ids": ["mahito_shibuya"],
    "action_id": "soul_aware_melee",
    "interaction_rule_id": "INT-SOUL-001",
    "resolution": "material_hit",
    "effects": ["mahito_soul_integrity_down"],
    "why_it_matters": "Yuji's hits cannot be dismissed as ordinary body damage."
  },
  {
    "event_id": "E003",
    "beat": 2,
    "actor_id": "mahito_shibuya",
    "target_ids": ["nobara_shibuya"],
    "action_id": "split_soul_double",
    "interaction_rule_id": "INT-SUM-001",
    "resolution": "success",
    "effects": ["separated_double_active", "resonance_link_valid"],
    "why_it_matters": "Mahito creates a flank against Nobara but also creates the exact soul-linked target her technique requires."
  },
  {
    "event_id": "E004",
    "beat": 3,
    "actor_id": "nobara_shibuya",
    "target_ids": ["mahito_separated_double", "mahito_shibuya"],
    "action_id": "resonance_via_separated_double",
    "interaction_rule_id": "INT-SOUL-001",
    "resolution": "success",
    "effects": ["mahito_staggered", "mahito_soul_integrity_down"],
    "why_it_matters": "Ranged soul interference interrupts Mahito's counterattack."
  },
  {
    "event_id": "E005",
    "beat": 4,
    "actor_id": "mahito_shibuya",
    "target_ids": ["team"],
    "action_id": "domain_attempt",
    "resolution": "pending_response",
    "effects": ["domain_activation_started"],
    "why_it_matters": "Mahito escalates, but the event log does not decide interruption before the response occurs."
  },
  {
    "event_id": "E006",
    "beat": 4,
    "actor_id": "todo_shibuya",
    "target_ids": ["todo_shibuya", "yuji_shibuya"],
    "action_id": "boogie_woogie_reposition",
    "resolution": "success",
    "effects": ["yuji_domain_interrupt_opening", "todo_pattern_revealed"],
    "why_it_matters": "Todo uses Mahito's Resonance stagger to close distance, then exchanges his own position with Yuji inside the activation window."
  },
  {
    "event_id": "E007",
    "beat": 4,
    "actor_id": "yuji_shibuya",
    "target_ids": ["mahito_shibuya"],
    "action_id": "soul_aware_domain_interrupt",
    "interaction_rule_id": "INT-SOUL-001",
    "resolution": "severe",
    "effects": ["domain_attempt_interrupted", "no_domain_established", "no_domain_burnout", "mahito_critical"],
    "why_it_matters": "The domain fails because a logged team action creates a strike before establishment; it is not retroactively declared interrupted."
  },
  {
    "event_id": "E008",
    "beat": 5,
    "actor_id": "yuji_shibuya",
    "target_ids": ["mahito_shibuya"],
    "action_id": "soul_aware_finisher",
    "interaction_rule_id": "INT-SOUL-001",
    "resolution": "critical",
    "effects": ["mahito_incapacitated"],
    "why_it_matters": "The finish follows two soul-damage events, a failed escalation, and an independently created opening."
  }
]
```

### 7.6 Corresponding final narrative

Todo refused to give Mahito a stable target. His first clap exchanged him with Yuji after Mahito had committed to the wrong body, placing Yuji on the curse's open side. Yuji's fist landed with the kind of impact Mahito could not simply reshape away. Mahito answered by splitting off a double to flank Nobara, gaining another attack lane but exposing a second body tied to the same soul.

Nobara drove a nail into the double and fired Resonance through that link, staggering the original while Yuji's earlier soul damage still held. Todo used that pause to close distance. When Mahito began the sign for his domain, Todo did not somehow overpower the barrier after it formed: he clapped before establishment and exchanged his own position with Yuji. Yuji arrived inside the activation window and struck before the barrier or sure-hit existed.

The interruption left Mahito critical rather than burned out—the domain had never completed. Yuji's follow-up struck a soul already damaged by his first hit and Resonance, dropping the curse before it could rebuild momentum. Yuji and Todo remained able to continue, though both had spent meaningful cursed energy; Nobara survived with her nail stock reduced and the separated double gone with Mahito's defeat. The victory came from three distinct contributions, not a combined team power score.

---

## 8. Worked examples and validation

These are resolver tests. Canonical encounters are used where they cleanly demonstrate a rule; hypothetical tests are labeled.

### `VAL-01` — Straightforward strength advantage

- **Scenario:** Nanami at the start of his Shibuya encounter versus Haruta Shigemo with remaining Miracle marks as shown. `JJK ch. 100–101` versions.
- **Starting conditions:** Nanami is materially combat-ready and enraged; Haruta has his hand-sword and the remaining stored miracles shown by his technique but is badly outclassed in direct combat.
- **Plausible path:** Nanami repeatedly wins melee opportunities through reinforcement, physical control, and experience. Miracle can prevent otherwise terminal bad outcomes while stock remains; it does not grant Haruta equal offense.
- **Determining rules:** overwhelming-gap guardrail, equipment state, one-time resource consumption, consequence tiers.
- **Expected family of outcomes:** Nanami dominates; exact survival timing depends on Miracle stock and external interruption.
- **Contradiction:** Haruta wins an even exchange because three remaining miracles are treated as `+30 power`, or Nanami narratively forgets he can reach him.

### `VAL-02` — Favorable technique matchup overturns a gap

- **Scenario:** Hana/Angel at the moment of using Jacob's Ladder against newly incarnated Meguna, `JJK ch. 213`.
- **Starting conditions:** target is an incarnated sorcerer in Megumi's body; Angel's Technique Extinguishment is available; target is exposed, but deception remains possible.
- **Plausible path:** successful exposure seriously threatens the incarnation despite Sukuna's otherwise overwhelming general threat. The favorable interaction can reverse the immediate exchange, but Hana's psychology and the target's deception can interrupt the win condition.
- **Determining rules:** `INT-NULL-001`, incarnation state, knowledge/temperament.
- **Expected family:** Ladder is genuinely dangerous; victory is not automatic after first contact.
- **Contradiction:** either “Sukuna's higher power score ignores Jacob's Ladder” or “anti-incarnation tag instantly deletes Sukuna without setup.”

### `VAL-03` — A real counter still fails on execution

- **Scenario:** Jogo using Domain Amplification against Gojo during Shibuya, `JJK ch. 84–85`.
- **Starting conditions:** amplification can contest Infinity; Gojo remains dramatically superior in close combat and reactions; civilians and Hanami affect choices.
- **Plausible path:** Jogo creates theoretical contact eligibility but cannot turn that into a decisive hit under Gojo's pressure. Suppressing his innate technique further narrows his offense.
- **Determining rules:** `INT-INF-001`, `INT-DOM-005`, threat-gap guardrail, opportunity checks.
- **Expected family:** counter matters locally but fails to erase the matchup.
- **Contradiction:** “Domain Amplification bypasses Infinity, therefore Jogo wins.”

### `VAL-04` — Domain clash

- **Scenario:** Gojo and Sukuna's first Shinjuku domain exchange, `JJK ch. 225–226` versions and starting condition.
- **Starting conditions:** both fresh enough to expand; Sukuna uses Malevolent Shrine without a closed shell; Gojo uses Unlimited Void.
- **Plausible path:** equalized sure-hits inside the overlap do not end the interaction. Malevolent Shrine's external range attacks Unlimited Void's barrier from outside, where it is vulnerable, causing collapse; Gojo must survive the sure-hit and respond.
- **Determining rules:** `INT-DOM-001`, `INT-DOM-002`, open/closed barrier structure, RCT, burnout.
- **Expected family:** structural interaction decides this phase, not a generic declaration that one domain “has more power.”
- **Contradiction:** Unlimited Void hits Sukuna normally while the clash is unresolved, or Gojo casts again immediately without the exceptional recovery process and strain.

### `VAL-05` — Domain answered without another full domain

- **Scenario:** Naobito inside Dagon's domain, `JJK ch. 108–109`.
- **Starting conditions:** Dagon's sure-hit shikigami attack is active; Naobito has Falling Blossom Emotion.
- **Plausible path:** FBE automatically counters the attack-like sure-hit at contact and reduces danger. Dagon remains physically present and can attack; Naobito is not immune to the encounter.
- **Determining rules:** `INT-DOM-001`, `INT-DOM-004`.
- **Expected family:** temporary mitigation, followed by continued tactical pressure.
- **Contradiction:** FBE dispels Dagon's domain or protects every ally.

### `VAL-06` — Three-person team with measurable support

- **Scenario:** hypothetical fight from section 7: Shibuya Yuji, intact-technique Shibuya Todo, and pre-injury Shibuya Nobara versus Mahito after learning to split a double but before his `0.2-second` domain realization.
- **Starting conditions:** exact capabilities are limited to those versions; the event log must show Mahito generating the separated double before Nobara can use it as a Resonance link; Mahito knows Yuji threatens his soul.
- **Plausible paths:** Todo spends reactions and repositions; Nobara exploits a valid link or otherwise uses nails/setup; Yuji supplies primary lasting damage. Mahito may target support first or attempt a domain when pressure justifies it.
- **Determining rules:** `INT-SOUL-001`, independent action lanes, assist cap, domain opportunity.
- **Support metrics:** Todo's swaps create openings/deny hits; Nobara advances soul damage or forces Mahito not to split freely.
- **Contradiction:** simply add all three ratings, give Nobara Resonance without a valid link, or force each character to land a signature move.

### `VAL-07` — Sacrifice with consequences

- **Scenario:** Yuki Tsukumo's final black-hole action against Kenjaku, `JJK ch. 208`.
- **Starting conditions:** Yuki is terminally wounded; Tengen's barrier and Kenjaku's capabilities are present as shown; Yuki pushes Star Rage (`Bom Ba Ye`) beyond its ordinary safe mass limit.
- **Plausible path:** sacrifice creates a catastrophic win condition and kills Yuki. Kenjaku's survival depends on his specific anti-gravity response plus surrounding containment, not on a generic durability roll.
- **Determining rules:** terminal sacrifice, exceptional ability, specific counter, simultaneous environmental effects.
- **Expected family:** Yuki cannot continue afterward regardless of whether the opponent survives.
- **Contradiction:** Yuki acts again, is healed after the singularity, or Kenjaku survives because his total score is higher without logging anti-gravity.

### `VAL-08` — Depleted squad retries a weakened boss

- **Scenario:** hypothetical immediate continuation during Shinjuku. Yuji (`post-awakening, ch. 257–260`), Maki (`post-Soul Split Katana, Shinjuku`), and Choso (`Shinjuku before terminal sacrifice`) re-engage Sukuna after a prior squad has reduced his output, damaged his heart, limited RCT, and forced domain use.
- **Starting conditions:** every injury/resource comes from explicit prior events; no abilities from later chapters are back-ported into an earlier beat. The retry is immediate, so Sukuna's output suppression and brain/domain state persist; the new attackers begin at their own logged condition.
- **Plausible paths:** Yuji pressures the soul boundary/incarnation control; Maki exploits low signature and Soul Split Katana but is still vulnerable to direct/environment attacks; Choso creates restraint, blood pressure, or a rescue. Sukuna remains the stronger general combatant and can target the support lane.
- **Determining rules:** persistence list, `INT-SOUL-001`, `INT-HR-001`, `INT-BLD-001`, boss weakening causes.
- **Expected family:** the team can create a credible win condition because prior damage changes concrete capabilities—not because retries grant a morale bonus.
- **Contradiction:** Sukuna begins inexplicably full, or loses a flat percentage unrelated to injuries; Choso acts after death; Maki is called immune to Malevolent Shrine without checking matter-targeting.

### `VAL-09` — Ambiguous interaction without false certainty

- **Scenario:** hypothetical Takaba (`confident Comedian state, ch. 239–243`) caught by Gojo's Unlimited Void (`Shinjuku version`).
- **Starting conditions:** both abilities available; neither canon nor official supplementary material directly resolves this interaction.
- **Plausible paths:** (A) Unlimited Void establishes before Comedian reframes the event and incapacitates Takaba; (B) Comedian alters the situation before/while the domain resolves; (C) confidence/awareness conditions cause partial or unstable behavior.
- **Determining rules:** `INT-DOM-001`, `INT-RULE-001`, explicit `U` flag.
- **Recommended game ruling `G`:** use `canon_conservative`: a completed Unlimited Void affects Takaba unless a Comedian event was already resolved to interrupt or prevent activation. Mark the result as a chosen game ruling, not canon.
- **Contradiction:** “Comedian definitely beats every domain” or “domains canonically shut off Comedian,” absent evidence.

### 8.1 Automated invariants

Run after every event and at encounter completion.

```text
INV-001 Active actor: event.actor.status was ACTIVE at attempt time.
INV-002 Legal version: action exists in actor's selected canon_version_id.
INV-003 Eligibility: every hard prerequisite is recorded true.
INV-004 Resource floor: CE, stock, uses, and items never fall below zero.
INV-005 One-time use: exhausted abilities/resources cannot recur.
INV-006 No resurrection: dead/exorcised cannot become active without a pre-authored supported mechanic.
INV-007 Knowledge isolation: action choice reads actor/team knowledge, not global truth.
INV-008 Seed replay: identical input + ruleset version + seed produces identical event log.
INV-009 Counter scope: a matchup counter modifies only interactions it actually addresses.
INV-010 Support trace: every assist names its contributor, beneficiary, action, and effect.
INV-011 Domain aftermath: completed expansion ends with appropriate burnout/exception state.
INV-012 Target legality: sure-hit and technique target filters are respected.
INV-013 Summon continuity: destroyed/permanently lost summon cannot return illegally.
INV-014 Tool continuity: lost/destroyed/consumed equipment remains unavailable.
INV-015 Persistence: next encounter starts from declared carryover fields.
INV-016 Narrative agreement: every narrated decisive claim maps to one or more event IDs.
INV-017 Terminal order: no ordinary action after terminal status.
INV-018 Boss provenance: every boss modifier names canon state or explicit encounter rule.
INV-019 No label-actions: taxonomy/synergy tags cannot be emitted as abilities.
INV-020 Uncertainty limit: random draw occurs only in an authored uncertain check.
```

### 8.2 Balance telemetry

Across seeded batches, track:

- win rate by team, boss, seed set, and starting state;
- action opportunities obtained/denied per fighter;
- support openings and prevented fatal events;
- technique eligibility failure reasons;
- domain attempts, completions, counters, and burnouts;
- matchup-rule activation and actual outcome impact;
- persistent wounds/resources entering each boss;
- decisive-event diversity;
- narration-rule violations;
- upset rate by threat-band gap and whether an executable win condition existed.

Warning signals:

- one interaction rule changes nearly every fight it appears in;
- support characters contribute only damage or extra health;
- domains appear in most encounters regardless of tactics;
- a favorable tag predicts victory better than opportunity/execution;
- higher threat band never loses even with a canonical hard vulnerability;
- lower threat band wins through randomness without a logged win condition;
- the same three finishing events dominate most seeds.

---

## 9. Migration plan from the existing implementation

Because the current source/database was not supplied, this is a deterministic migration procedure rather than a claim about exact file names.

### Phase 0 — Freeze and observe

1. Version the existing resolver and keep 50–100 representative seeded fight outputs.
2. Record current roster IDs, versions, abilities, boss ladders, bonuses, and result distribution.
3. Add an event log adapter around the old resolver before changing outcomes. This exposes where narration presently invents causality.

### Phase 1 — Separate data concepts

Split current fields into:

| Existing concept | Destination |
|---|---|
| overall power | optional `baseline_threat_band`; never direct winner formula |
| strength/speed/endurance | specific ordinal attributes with evidence |
| technique name | one or more abilities with requirements/effects |
| domain yes/no | structured domain object |
| matchup bonus | interaction rule reference or delete |
| era/clan/team tag | taxonomy, knowledge, or authored relationship only |
| synergy bonus | concrete assist action or starting coordination state |
| boss multiplier | explicit encounter modifier |
| flavor text | narrator templates keyed to events |

The “Heian Era” problem is fixed here: `era: heian` may give two historically informed characters a knowledge entry if supported, but it cannot enter the action queue.

### Phase 2 — Version and audit the roster

For every existing game ID:

1. Preserve the ID.
2. name the selected canon version and evidence window;
3. remove composite abilities/equipment;
4. populate attributes with evidence and confidence;
5. split techniques into eligible actions;
6. encode domain, anti-domain, RCT, soul, summon, and tool states;
7. list prohibited narration;
8. flag unresolved decisions.

Reject the record if an ability cannot be assigned to that body/timeframe.

### Phase 3 — Build the interaction kernel

Implement, in order:

1. eligibility and state machine;
2. ordinary contact/ranged opportunity;
3. domains and anti-domain responses;
4. Infinity methods;
5. soul interactions;
6. summons/tools;
7. incarnation/nullification;
8. adaptation and Copy;
9. exceptional rule-based techniques.

Use stable IDs from section 5. Technique-specific rules may extend them but must not silently override their scope.

### Phase 4 — Independent teams and attrition

- Give each member an action lane and reaction budget.
- Replace team-total strength with pressure, setup, protection, information, and recovery actions.
- Introduce consequence-bearing injuries and resource persistence.
- Define each ladder's time between bosses and retry type.
- Migrate boss weakening from a percent to named persistent states.

### Phase 5 — Narration from events

1. Produce battle outline from decisive event IDs.
2. Group into opening/escalation/finish.
3. Render one connected narrative with an optional mechanics drawer.
4. Validate every ability and state claim against the event log.

Do not let a language model choose the winner. It receives a resolved outline plus character voice/style constraints.

### Phase 6 — Calibrate, do not rewrite canon

Run fixed seed suites. Tune:

- encounter starting distance/terrain;
- boss behavior and target priorities;
- explicit artificial phase rules;
- bounded setup and pressure modifiers;
- recovery time between fights;
- probability only for genuinely uncertain checks.

Do not tune by granting unsupported abilities or changing canon version records. If an encounter needs a stronger boss, expose the modifier.

### Suggested compatibility adapter

During transition, retain the old score only for an initial sanity signal:

```pseudo
old_score_gap = old_team_score - old_boss_score
new_result = event_resolver(...)

if abs(old_score_gap) is extreme and new_result is upset:
    require audit:
        executable_win_condition == true
        decisive_interaction_rule != null
        opportunity_chain.length >= 1
```

The old score never vetoes a valid result; it asks for an audit when the new system produces a surprising upset.

---

## 10. Sources, unresolved questions, and research gaps

### 10.1 Primary source index

The canonical foundation is Gege Akutami's *Jujutsu Kaisen* manga, including *Jujutsu Kaisen 0*, through chapter 271. Use the Shueisha Japanese edition or VIZ Media's licensed English edition when checking production wording. The supplementary source is Akutami's *Jujutsu Kaisen: The Official Character Guide* / official fanbook; it may clarify profiles and author commentary but cannot supply later feats absent from its publication window. Secondary summaries were used only as navigation aids during audit, never as canon authority.

Key reading clusters used for mechanics:

| Topic | Primary chapter clusters |
|---|---|
| Basic cursed energy, reinforcement, techniques, first domain explanation | JJK ch. 8–15 |
| Mahito, soul/body relation, early domain | ch. 22–31 |
| Black Flash | ch. 48–50; 126–132; 256–260 |
| Toji/Gojo, RCT awakening, Infinity counters | ch. 66–76 |
| Simple Domain and Domain Amplification | ch. 82–85 |
| Dagon, Falling Blossom Emotion, group domain combat | ch. 106–111 |
| Mahoraga and Malevolent Shrine | ch. 117–120 |
| Mahito domain timing and burnout | ch. 129–132 |
| Yuta's reserves/RCT; positive energy versus curses | ch. 140–143; 173–181 |
| Higuruma rule-based domain | ch. 159–166 |
| Hollow Wicker Basket and incomplete-domain combat | ch. 168–173 |
| Sendai output, Copy, three-way domain failure, burnout | ch. 173–181 |
| Hakari rule-based domain and automatic RCT | ch. 182–190 |
| Fully realized Maki, domain targeting, Split Soul Katana | ch. 191–198 |
| Angel, incarnation, Technique Extinguishment | ch. 199; 213–215 |
| Kenjaku open domain and Yuki sacrifice | ch. 205–208 |
| Ten Shadows adaptation and Yorozu | ch. 217–219 |
| Gojo/Sukuna domains, amplification, adaptation, world-targeting slash | ch. 223–238 |
| Takaba's Comedian | ch. 239–243 |
| Yuta's domain and coordinated anti-Sukuna plan | ch. 248–251 |
| Soul healing/attacks, Simple Domain, binding vows, late Shinjuku mechanics | ch. 252–260 |
| Copy limitations and final incarnation separation | ch. 261–268 |

Use the licensed English release for implementation review. Translation-sensitive language—especially “nullify,” “neutralize,” “output,” “refinement,” and barrier explanations—should be checked against the licensed volume containing the chapter before finalizing production text.

### 10.2 Canon-confidence cautions

- Exact energy quantities, speeds, durability values, and domain refinement numbers do not exist canonically. Any ratings are `G`.
- Many cross-technique matchups never occurred. Absence of evidence is not immunity.
- Domain rules evolve through increasingly exceptional fights; Gojo and Sukuna should not define ordinary recovery or clash behavior.
- Technique explanations can depend on translation. Store the chapter/panel context, not an isolated fan paraphrase.
- Character statements may be incomplete, tactical, or later clarified. Prefer demonstrated mechanics and narrator statements, while recording contradictions.
- Anime choreography may add scale, timing, or attacks; do not import it silently.

### 10.3 Unresolved design questions

The project owner must choose:

1. Exact roster and legal version for every ID.
2. Whether duplicates of one character/version can appear in a draft.
3. Starting knowledge: canonical at that time, full player-visible knowledge, or encounter-authored knowledge.
4. Standard arena size, range bands, cover, civilians, and escape rules.
5. Time between bosses and between retries.
6. Whether a defeated boss remains wounded for a successor attempt and which wound classes persist.
7. Whether domains may affect allies by strict canon targeting or a simplified friendly-fire policy.
8. Conservative rulings for unsupported exceptional matchups.
9. How much explicit randomness the player should see.
10. Whether sacrificial/self-terminal actions require player draft-level consent or may be selected by AI temperament.
11. Whether unavailable manga details must be hidden for spoiler modes.
12. Which boss difficulty modifiers are acceptable as openly noncanon encounter rules.

### 10.4 Roster research gaps

Once the roster is supplied, the following must be completed before production:

- exact game ID ↔ canon version map;
- every technique application and prerequisite;
- domain/anti-domain legality;
- equipment and external-entity loadout;
- behavior/temperament thresholds;
- evidence and confidence per rating;
- prohibited narration list;
- pair-independent interaction tags;
- persistent resource definitions;
- at least three seeded regression fights per character.

### 10.5 Completion checklist for this document

- [x] Canon mechanics framework through chapter 271 scope
- [x] Evidence/uncertainty standard
- [x] Reusable character schema and version rules
- [x] Core technique interaction library
- [x] Replacement resolver and pseudocode
- [x] Teamwork, attrition, retries, and boss weakening
- [x] Narrative event contract and sample
- [x] Representative validation suite
- [x] Automated invariants and balance telemetry
- [x] Migration plan
- [ ] Production roster records—blocked by absent roster/source files
- [ ] Audit of existing mechanics—blocked by absent implementation

---

## What is safe to implement now

1. The state and event schemas.
2. Ability eligibility checks.
3. Independent team action lanes and bounded assists.
4. The 0–5 ordinal attribute scale and local opportunity margins.
5. Seeded uncertainty only for close checks.
6. Consequence-tier injuries and named persistence.
7. Domain lifecycle: attempt, response, sure-hit/rule, collapse, burnout.
8. Stable interaction-rule dispatch.
9. Three-paragraph narration generated from event IDs.
10. All invariants in section 8.1.

## What requires an explicit design decision

- The exact roster versions and ratings.
- Unsupported cross-technique rulings.
- Inter-encounter recovery time.
- Retry/persistent-boss policy.
- Friendly fire and battlefield defaults.
- Visible randomness level.
- Noncanon boss advantages.

## What remains insufficiently supported

- A universal numerical ranking of domains or refinement.
- Exact cursed-energy quantities or output ratios for most characters.
- Universal answers for Comedian against domains/nullification.
- Blanket rules for soul healing and all soul-targeting interactions.
- Any unshown domain, maximum, reversal, RCT, or hypothetical future mastery.
- Cross-version composite “peak” loadouts.
- Production character records without the game's exact roster.

## Recommended first playable implementation, in order

1. Select 12–16 characters with unambiguous versions and no more than four exceptional mini-resolvers.
2. Implement state, eligibility, direct combat opportunities, injuries, CE bands, and equipment.
3. Add five core interactions: ordinary domain, Simple Domain/HWB, Domain Amplification/Infinity, soul damage, and summons.
4. Build three-person team actions: pressure, setup, protection, information, and recovery.
5. Implement one five-boss ladder with explicit starting terrain and recovery time.
6. Generate authoritative event logs and only then add the three-paragraph renderer.
7. Run the nine validation families plus invariant tests across fixed seeds.
8. Add adaptation, Copy, incarnation/nullification, and rule-based exceptional techniques one at a time with regression tests.
9. Migrate the remaining roster only after the first ladder produces coherent, explainable outcomes.

This sequence produces a playable system early while protecting the central promise: surprising outcomes may occur, but every outcome must be mechanically possible, causally earned, and recognizably Jujutsu Kaisen.
