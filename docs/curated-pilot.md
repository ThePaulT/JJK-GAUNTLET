# Curated Hero Gauntlet — ruleset curated-1

Three fixed pairs offer six distinct characters: Yuji/Yuta, Megumi/Maki, Todo/Inumaki. One pick per pair creates eight legal teams without repeated offers or characters. Across Hanami, Jogo, Mahito, Kenjaku and Sukuna, this is 40 starting matchup plans. These are branching playbooks, not 40 predetermined results or prewritten full fights.

`pilot-data.ts` owns explicit character versions, permitted kits, excluded abilities and game resource bands. `pilot-plans.ts` owns target priorities and team-specific paths. `pilot.ts` resolves local exchanges into before/after state events and derives three narrative paragraphs from those events. Identical seed, team and ruleset replay identically. Different seeds change local opportunities, not a final casualty lottery. Megumi can finish the same matchup injured or uninjured.

Injuries, soul damage, reserves, Rika assistance uses and casualties persist. Survivor retries carry the exact encounter state. Between defeated bosses, transit restores four energy (capped), eases one throat strain and ends ordinary burnout; wounds remain. Domain activation, maintenance, barrier contests, incomplete-domain interference and burnout have explicit transitions. Todo cannot swap zero-energy Maki. Closed-domain targeting immunity does not exempt Maki from open-domain environmental attacks.

Numbers are game abstractions. Rika has a ten-assisted-attack budget, not a simulated five-minute clock. Sukuna uses the declared reduced-reserve encounter preset. These scoped profiles are not a claim of complete canon simulation; official chapter verification of the provisional research notes remains outstanding. Balance is deliberately observable: teams differ materially, and every team is not guaranteed to clear the ladder. The wider roster, villain ladder, Daily and Freestyle retain the previous resolver.

The browser immediately displays the resolved story with one continuation button. Expandable details expose loadouts and the actual event log. Saving sends only seed, team and ruleset; the server replays and stores the authoritative result, ignoring submitted prose or scores.

Validation covers all 40 matchups over ten seeds with event-by-event replay and resource bounds, draft uniqueness, deterministic input normalization, both Megumi injury outcomes, exact survivor continuity, domain target eligibility, Todo/Maki restrictions and server validation. Existing engine tests also remain in place.

Without a configured database, pilot sharing uses a versioned replay link carrying only seed, team and creation time. Run pages, JSON and image routes validate and recompute it, so links survive serverless cold starts. Legacy memory-backed runs still require a database for durable storage.


## Revision curated-2

The default view now shows up to five concise highlights, with the full narrative and event log collapsed. Highlights group a setup with its recorded follow-up; they never invent an attack. Recovery prose is generated from actual living-state changes, so fallen Inumaki never receives voice recovery.

Draft any three of the six supported heroes: six, five and four available choices, twenty unique teams and one hundred starting matchups. Each exchange chooses a legal setup from the surviving, funded supports, alternating eligible setters where possible. Inumaki restrains, Todo repositions a valid partner, or Megumi creates a flank. One immediate follow-up consumes the opening and the partner’s primary action. A successful Stop lands before the target breaks free. Failed setups provide no free follow-up. Resource depletion, injuries and domain commitments remove options rather than being narrated away.

The new rules use p2 replay links. Archived curated-1 code keeps existing p1 links and old clients reproducible. The new regression cases cover immediate follow-up order and damage, one-use openings, setup variance, no actions by fallen support, conditional voice recovery, and legacy replay compatibility. All one hundred matchups are checked over ten seeds.
