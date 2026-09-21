import { character, DB } from './data.ts';
import type { Breakdown, RoundResult, RunResult } from './engine.ts';
import { makeRng, type Rng } from './rng.ts';
import { isPilotTeam, PILOT_BOSSES, PILOT_PROFILES, PILOT_RULESET, type PilotId } from './pilot-data-v1.ts';
import { pilotPlan } from './pilot-plans-v1.ts';

export interface CombatState {
  id: PilotId; body: number; ce: number; soulDamage: number; throat: number;
  burnout: number; domain: number; expansions: number; rika: number; dog: boolean;
  status: 'active' | 'out'; contribution: number; shadowDomain: boolean; domainDamage: number;
}
export interface CombatEvent {
  id: string; exchange: number; kind: string; actor: PilotId; target?: PilotId;
  text: string; rule: string; important: boolean;
  changes: { id: PilotId; before: CombatState; after: CombatState }[];
}
export interface PilotEncounter {
  ruleset: typeof PILOT_RULESET;
  start: CombatState[]; end: CombatState[]; events: CombatEvent[];
  paragraphs: string[]; outcome: 'won' | 'casualty' | 'defeated' | 'stalemate';
}
export type PilotRound = RoundResult & { combat: PilotEncounter };
export type PilotRun = Omit<RunResult, 'rounds'> & { ruleset: typeof PILOT_RULESET; rounds: PilotRound[] };
const profile = (s: CombatState) => PILOT_PROFILES[s.id];
const name = (s: CombatState) => character(s.id).name;
const active = (s: CombatState) => s.status === 'active';
const copy = <T,>(x: T): T => structuredClone(x);
export function initialCombatant(id: PilotId): CombatState {
  const p = PILOT_PROFILES[id];
  return { id, body: p.body, ce: p.reserves, soulDamage: 0, throat: 0, burnout: 0, domain: 0, expansions: 0, rika: 10, dog: true, status: 'active', contribution: 0, shadowDomain: false, domainDamage: 0 };
}
export function combatCondition(s: CombatState): string {
  if (!active(s)) return 'Out of the run';
  const conditions = [s.body === profile(s).body ? s.throat > 0 ? 'Throat strained' : 'Uninjured' : s.body <= profile(s).body / 3 ? 'Badly injured' : 'Injured'];
  if (s.soulDamage > 0) conditions.push('soul damage');
  if (s.throat >= 3) conditions.push('voice exhausted');
  if (!profile(s).zeroCE && s.ce < 4) conditions.push('low energy');
  if (s.burnout) conditions.push('technique burnout');
  if (s.domain) conditions.push('domain active');
  return conditions.join(' · ');
}
const injuryPenalty = (s: CombatState) => s.body <= profile(s).body / 3 ? 2 : s.body <= profile(s).body * .6 ? 1 : 0;
const jitter = (rng: Rng) => rng.pick([-1, 0, 0, 1]);
const pay = (s: CombatState, cost: number) => { if (s.ce < cost) throw new Error('Insufficient reserves'); s.ce -= cost; };
function hurt(s: CombatState, amount: number, soul = false) {
  const damage = Math.min(s.body, Math.max(0, amount));
  s.body -= damage;
  if (s.domain) s.domainDamage += damage;
  if (soul) s.soulDamage += damage;
  if (s.body <= 0) s.status = 'out';
}
type Emit = (kind: string, actor: CombatState, target: CombatState | undefined, rule: string, important: boolean, mutate: () => string) => void;

/** Target-specific local checks. These bands and costs are explicit pilot abstractions. */
export function resolvePilotEncounter(teamInput: CombatState[], bossInput: CombatState, seed: string, attempt = 0): PilotEncounter {
  const team = copy(teamInput), boss = copy(bossInput), all = [...team, boss];
  const start = copy(all), rng = makeRng(`${PILOT_RULESET}:${seed}:${attempt}`);
  const plan = pilotPlan(team.map(s => s.id), boss.id);
  const events: CombatEvent[] = [];
  let exchange = 0, opening = 0, restrained = false, rescued = false, bossCommitted = false, pressure = 0;
  let interference = false;
  const emit: Emit = (kind, actor, target, rule, important, mutate) => {
    const before = copy(all);
    const text = mutate();
    const changes = all.flatMap((s, i) => JSON.stringify(s) === JSON.stringify(before[i]) ? [] : [{ id: s.id, before: before[i], after: copy(s) }]);
    events.push({ id: `a${attempt}-e${events.length + 1}`, exchange, kind, actor: actor.id, target: target?.id, text, rule, important, changes });
  };
  const endDomain = (caster: CombatState, why: string) => {
    if (!caster.domain) return;
    emit('domain_end', caster, undefined, 'domain-burnout', true, () => {
      caster.domain = 0; caster.burnout = 3;
      return `${name(caster)}’s domain ${why}; the collapse leaves the technique in burnout.`;
    });
  };
  const endDisabledDomains = () => {
    for (const s of all) if (!active(s)) endDomain(s, 'breaks as its caster falls');
    for (const s of team) if (s.shadowDomain && (!active(s) || !boss.domain || s.ce < 3)) {
      emit('domain_end', s, undefined, 'incomplete-domain-burnout', true, () => {
        s.shadowDomain = false; s.burnout = 3; interference = false;
        return 'Megumi’s incomplete domain falls away; Ten Shadows enters burnout after the barrier interference.';
      });
    }
  };
  const strike = (actor: CombatState, target: CombatState, boost = 0, forced = false, domainHit = false) => {
    if (!active(actor) || !active(target)) return;
    const p = profile(actor), t = profile(target);
    const isBoss = actor === boss;
    let cost = p.zeroCE ? 0 : 1;
    let label = 'a close strike', soul = actor.id === 'yuji' && actor.ce > 0 && ['mahito', 'sukuna'].includes(target.id), damageBonus = 0;
    if (!actor.burnout && actor.ce >= 2) {
      if (actor.id === 'yuji') { label = target.id === 'sukuna' ? 'a soul-boundary Dismantle' : 'a reinforced, soul-aware punch'; soul = ['mahito', 'sukuna'].includes(target.id); }
      if (actor.id === 'yuta' && t.curse) { label = 'positive energy delivered at close range'; cost = 2; damageBonus = 2; }
      else if (actor.id === 'yuta' && actor.rika > 0) { label = 'a sword attack with Rika closing the other side'; cost = 2; damageBonus = 1; }
      if (actor.id === 'megumi' && actor.dog) { label = 'Divine Dog: Totality’s attack from the flank'; cost = 2; damageBonus = 1; }
      if (actor.id === 'hanami') { label = 'a sweep of roots'; cost = 2; }
      if (actor.id === 'jogo') { label = 'Disaster Flames across the approach'; cost = 2; }
      if (actor.id === 'mahito') { label = 'Idle Transfiguration through palm contact'; cost = 2; soul = true; }
      if (actor.id === 'kenjaku') { label = exchange % 2 ? 'a released curse at close range' : 'a crushing gravity reversal'; cost = 2; }
      if (actor.id === 'sukuna') { label = 'a Shrine slash'; cost = 2; }
    }
    if (actor.id === 'maki') { label = 'the Split Soul Katana'; soul = true; }
    const depleted = actor.ce < cost;
    if (depleted) { cost = 0; label = 'an unreinforced physical strike'; soul = false; }
    const margin = p.speed + p.skill + boost - injuryPenalty(actor) - (t.speed + t.skill - injuryPenalty(target)) + jitter(rng);
    let hit = forced || margin >= -1;
    // Mahito's soul preservation is an interaction, not an enormous health bonus.
    const bodyOnlyMahito = target.id === 'mahito' && !soul && !(actor.id === 'yuta' && t.curse && cost === 2);
    let damage = depleted ? 1 : Math.max(1, p.output + damageBonus + Math.max(0, Math.floor(margin / 3)) - Math.floor(t.defense / 2));
    let actualTarget = target;
    if (isBoss && hit && !domainHit && target.id !== 'todo' && !t.zeroCE && !rescued) {
      const todo = team.find(s => s.id === 'todo' && active(s) && s.ce >= 2 && !s.burnout);
      if (todo && (target.id === 'megumi' || target.body <= damage + 3) && profile(todo).speed + 1 + jitter(rng) >= p.speed) {
        emit('rescue', todo, target, 'boogie-woogie-ce-targets', true, () => {
          pay(todo, 2); todo.contribution += 3; rescued = true;
          return `${name(todo)} claps, replacing ${name(target)} in the attack’s path; the rescue puts Todo himself in danger.`;
        });
        actualTarget = todo;
        const rescueMargin = p.speed + p.skill - injuryPenalty(actor) + jitter(rng) - (profile(todo).speed + profile(todo).skill - injuryPenalty(todo));
        hit = rescueMargin >= 0;
        damage = depleted ? 1 : Math.max(1, p.output + damageBonus + Math.max(0, Math.floor(rescueMargin / 3)) - Math.floor(profile(todo).defense / 2));
      }
    }
    emit(hit ? 'hit' : 'evade', actor, actualTarget, soul ? 'soul-contact' : 'local-attack', hit, () => {
      pay(actor, cost);
      if (actor.id === 'yuta' && label.includes('Rika')) actor.rika -= 1;
      if (!hit) return `${name(actor)} commits to ${label}, but ${name(actualTarget)} gets clear before it connects.`;
      if (depleted && profile(actualTarget).curse) return `${name(actor)} cannot reinforce the strike; ordinary physical contact does not damage the cursed spirit.`;
      if (bodyOnlyMahito) {
        const expenditure = Math.min(actualTarget.ce, 2); actualTarget.ce -= expenditure;
        if (expenditure) return `${name(actor)} lands ${label}; Mahito spends energy maintaining his shape, and the blow leaves no lasting soul wound.`;
      }
      hurt(actualTarget, damage, soul);
      actor.contribution += damage;
      if (actor.id === 'yuji' && actualTarget.id === 'sukuna' && soul) actualTarget.ce = Math.max(0, actualTarget.ce - 2);
      const victim = name(actualTarget);
      let action = `${name(actor)} drives ${label} through ${victim}’s defense`;
      if (label.includes('positive energy')) action = `Yuta reaches ${victim} at close range and pours positive energy into the cursed body`;
      else if (label.includes('Rika')) action = `Rika closes one side while Yuta’s blade catches ${victim} from the other`;
      else if (label.includes('Totality')) action = `Divine Dog: Totality reaches ${victim}’s exposed flank under Megumi’s direction`;
      else if (label.includes('Katana')) action = `Maki cuts through ${victim}’s guard with the Split Soul Katana`;
      else if (label.includes('Dismantle')) action = `Yuji closes on Sukuna and applies Dismantle at the boundary between the incarnated sorcerer and his vessel`;
      else if (label.includes('soul-aware')) action = `Yuji drives a reinforced punch into ${victim}${actualTarget.id === 'mahito' ? ', reaching the soul beneath the changing shape' : ''}`;
      else if (label.includes('roots')) action = `Hanami’s roots catch ${victim} before the defender clears their sweep`;
      else if (label.includes('Disaster Flames')) action = `Jogo sends Disaster Flames through ${victim}’s escape route and catches the defender in the fire`;
      else if (label.includes('Transfiguration')) action = `Mahito gets a palm onto ${victim} and applies Idle Transfiguration`;
      else if (label.includes('gravity')) action = `Kenjaku catches ${victim} inside the gravity reversal and crushes the defender toward the ground`;
      else if (label.includes('released curse')) action = `Kenjaku’s released curse reaches ${victim} before the defender can turn it aside`;
      else if (label.includes('Shrine')) action = `Sukuna’s Shrine slash catches ${victim} through the attempted defense`;
      return `${action}${!active(actualTarget) ? `, taking ${victim} out of the fight` : soul ? '; the damage reaches beyond an ordinary physical wound' : '. The hit leaves a wound that carries into the next exchange'}.`;
    });
    endDisabledDomains();
    if (actualTarget.domain && actualTarget.domainDamage >= (profile(actualTarget).domain?.refinement ?? 3) * 2) endDomain(actualTarget, 'breaks under the accumulated damage');
  };
  const heal = (s: CombatState): boolean => {
    const recoverable = profile(s).body - s.body - s.soulDamage;
    if (!profile(s).rct || s.ce < 4 || s.body > profile(s).body / 2 || recoverable < 3) return false;
    emit('heal', s, s, 'self-rct-cost', true, () => {
      pay(s, 4); s.body += Math.min(4, recoverable);
      return `${name(s)} gives up an attacking opportunity to repair physical injuries with reverse cursed technique; any soul damage remains.`;
    });
    return true;
  };
  const domainAction = (response = false) => {
    const d = profile(boss).domain;
    if (!d || boss.domain || boss.burnout || boss.ce < 10 || restrained || (!response && (exchange < 2 || (boss.body > profile(boss).body * .7 && exchange < 4)))) return false;
    emit('domain_start', boss, undefined, 'domain-activation-cost', true, () => {
      pay(boss, 10); boss.domain = 3; boss.domainDamage = 0; boss.expansions += 1;
      return `${name(boss)} takes the space to expand ${d.name}${d.barrier === 'open' ? ', extending its reach without a sealed outer shell' : ', closing the battlefield inside the barrier'}.`;
    });
    return true;
  };
  const heroDomain = (actor: CombatState) => {
    const d = profile(actor).domain;
    if (!d || actor.burnout || boss.domain || actor.domain || actor.ce < 14 || restrained || exchange < 3) return false;
    if (actor.id === 'yuji' && boss.id !== 'sukuna') return false;
    if (actor.id === 'yuta' && !['mahito', 'sukuna'].includes(boss.id)) return false;
    emit('domain_start', actor, boss, 'hero-domain-activation', true, () => {
      pay(actor, 10); actor.domain = 3; actor.domainDamage = 0; actor.expansions++;
      return `${name(actor)} expands ${d.name}, committing energy to a sure-hit aimed at ${name(boss)}.`;
    });
    // Domain response is a costly reaction; it also consumes the pending boss action.
    if (domainAction(true)) {
      bossCommitted = true;
      emit('domain_clash', boss, actor, 'barrier-contest', true, () => {
        if (profile(boss).domain!.refinement > d.refinement) actor.domain = 1;
        return `The answering domain contests the sure-hit${profile(boss).domain!.barrier === 'open' ? ' and attacks the closed barrier from outside' : ', forcing both fighters back into direct exchanges'}.`;
      });
    }
    return true;
  };
  const heroSureHit = () => {
    if (boss.domain || !active(boss)) return;
    for (const caster of team.filter(s => active(s) && s.domain > 0)) {
      const d = profile(caster).domain!;
      emit('hero_sure_hit', caster, boss, d.effect === 'extinguish' ? 'technique-extinguishment' : 'incarnation-separation', true, () => {
        hurt(boss, 4, d.effect === 'separation'); boss.ce = Math.max(0, boss.ce - 2); caster.contribution += 4;
        return `${d.effect === 'extinguish' ? 'Jacob’s Ladder' : 'Yuji’s soul-boundary Dismantle'} reaches ${name(boss)} through the unopposed sure-hit${active(boss) ? ', damaging the target and reducing the energy available to answer' : ', ending the opponent’s resistance'}.`;
      });
      endDisabledDomains();
    }
  };
  const domainPulse = () => {
    if (!boss.domain || !active(boss)) return;
    const d = profile(boss).domain!;
    const challenger = team.find(s => active(s) && profile(s).domain && !s.burnout && s.ce >= 10);
    let contested = team.some(s => active(s) && s.domain > 0);
    if (challenger && !contested) {
      const own = profile(challenger).domain!;
      emit('domain_clash', challenger, boss, 'barrier-contest', true, () => {
        pay(challenger, 10); challenger.expansions += 1; challenger.domainDamage = 0;
        const strong = own.refinement >= d.refinement;
        challenger.domain = strong ? 3 : 1;
        contested = true;
        return `${name(challenger)} answers with ${own.name}. The overlapping domains interrupt the sure-hit${strong ? ', leaving both casters exposed to direct attacks' : ', but the weaker barrier only buys a brief interval'}.`;
      });
    }
    interference = false;
    if (!contested && d.barrier === 'closed') {
      const megumi = team.find(s => s.id === 'megumi' && active(s) && !s.burnout && s.ce >= 3);
      if (megumi) emit('interference', megumi, boss, 'incomplete-domain-barrier-interference', true, () => {
        pay(megumi, 3); megumi.contribution += 2; interference = true; megumi.shadowDomain = true;
        return `Megumi spreads Chimera Shadow Garden into the barrier. Maintaining the interference temporarily interrupts the sure-hit, but leaves him committed to holding it.`;
      });
    }
    if (contested || interference) return;
    for (const target of team.filter(active)) {
      const p = profile(target);
      if (p.zeroCE && d.barrier === 'closed') {
        emit('target_excluded', boss, target, 'closed-domain-zero-ce-targeting', true, () => `The domain’s cursed-energy targeting does not recognize Maki; its sure-hit passes her by without protecting anyone else.`);
        continue;
      }
      let reduced = false;
      if (p.simple && target.ce >= 2) {
        emit('domain_defense', target, boss, 'simple-domain-local-defense', true, () => {
          pay(target, 2); reduced = true;
          return `${name(target)} holds a Simple Domain around himself; the defense buys time against the sure-hit, not protection for the whole squad.`;
        });
      }
      const attackName = { fire: 'the domain’s heat and sure-hit attack', soul: 'Idle Transfiguration’s sure-hit contact', gravity: 'Womb Profusion’s crushing sure-hit', slash: 'Malevolent Shrine’s slashes', extinguish: 'Technique Extinguishment', separation: 'soul-boundary Dismantle' }[d.effect];
      if (reduced && d.barrier === 'closed') continue;
      emit('domain_hit', boss, target, d.effect === 'soul' ? 'soul-sure-hit' : 'domain-targeted-effect', true, () => {
        const damage = reduced ? 1 : d.effect === 'soul' ? 6 : 4;
        hurt(target, damage, d.effect === 'soul'); boss.contribution += damage;
        return `${name(target)} is caught by ${attackName}${reduced ? ' as the defensive barrier erodes' : ''}${active(target) ? ', leaving a lasting wound' : ', taking the fighter out'}.`;
      });
    }
    endDisabledDomains();
  };
  const support = () => {
    const s = team.find(f => active(f) && (f.id === 'todo' || f.id === 'inumaki'));
    if (!s || s.burnout || s.ce < 2) return;
    if (s.id === 'todo') {
      const partner = team.find(f => f !== s && active(f) && !profile(f).zeroCE && f.ce > 0);
      if (partner) emit('setup', s, partner, 'boogie-woogie-ce-targets', false, () => {
        pay(s, 2); opening = 2; s.contribution += 1;
        return `Todo swaps with ${name(partner)}, forcing ${name(boss)} to turn before the next attack.`;
      });
    } else if (s.throat < 3) {
      const success = profile(s).skill + 2 + injuryPenalty(boss) + jitter(rng) >= profile(boss).skill;
      emit('speech', s, boss, 'cursed-speech-resistance-and-recoil', true, () => {
        pay(s, 2); s.throat = Math.min(3, s.throat + (profile(boss).output >= 5 ? 2 : 1));
        restrained = success; opening = success ? 2 : 0;
        if (success) s.contribution += 3;
        return `Inumaki commands ${name(boss)} to stop${success ? ', catching the opponent for a brief opening' : ', but the opponent resists the command'}. ${s.throat >= 3 ? 'The recoil exhausts his voice; further commands are unavailable.' : 'The command strains his throat.'}`;
      });
    }
  };
  const bossAction = () => {
    if (!active(boss) || !team.some(active) || bossCommitted) return;
    if (restrained) {
      emit('restraint', boss, undefined, 'brief-restraint-consumed', false, () => { restrained = false; return `${name(boss)} breaks free of the brief restraint, losing the chance to attack in that interval.`; });
      return;
    }
    if (domainAction()) return;
    if (heal(boss)) return;
    const targets = team.filter(active);
    const threatened = targets.find(s => s.id === 'megumi' && interference);
    const target = threatened ?? targets.slice().sort((a, b) => {
      // Tactical target policy: vulnerable support/setup, otherwise front-line pressure.
      const risk = (s: CombatState) => (s.body < profile(s).body / 2 ? 3 : 0) + (s.contribution > 0 ? 6 - plan.targetPriority.indexOf(s.id) : s.id === 'yuji' || s.id === 'yuta' ? 2 : 0);
      return risk(b) - risk(a) || a.id.localeCompare(b.id);
    })[0];
    strike(boss, target, (interference ? 1 : 0) - pressure);
  };
  const fallenAtStart = team.filter(s => !active(s)).length;
  let outcome: PilotEncounter['outcome'] = 'stalemate';
  for (exchange = 1; exchange <= 12; exchange++) {
    opening = 0; restrained = false; rescued = false; interference = false; bossCommitted = false; pressure = 0;
    const domainAtStart = boss.domain > 0;
    if (domainAtStart) domainPulse();
    support();
    const setter = team.find(s => s.id === 'megumi' && active(s) && !s.burnout && s.ce >= 2);
    if (setter && exchange % 2 === 1 && !boss.domain) {
      const holds = profile(setter).skill + opening + injuryPenalty(boss) + jitter(rng) >= profile(boss).speed;
      emit('toad', setter, boss, 'summon-restraint-opportunity', holds, () => {
        pay(setter, 2); if (holds) { opening = Math.min(3, opening + 2); pressure = 2; setter.contribution += 2; }
        return `Megumi sends Toad across ${name(boss)}’s approach${holds ? ', forcing the opponent to pull clear while an ally attacks the exposed angle' : ', but the opponent avoids the tongue without losing position'}.`;
      });
    }
    const fast = profile(boss).speed - injuryPenalty(boss) + jitter(rng) > Math.max(...team.filter(active).map(s => profile(s).speed - injuryPenalty(s)));
    if (fast) bossAction();
    if (!domainAtStart) domainPulse();
    heroSureHit();
    for (const actor of team.filter(active)) {
      if (!active(boss) || !active(actor)) break;
      if (actor.id === 'megumi' && (interference || events.some(e => e.exchange === exchange && e.kind === 'toad'))) continue;
      if (heal(actor)) continue;
      if (heroDomain(actor)) { heroSureHit(); continue; }
      if (actor.id === 'todo' && events.some(e => e.exchange === exchange && e.kind === 'setup')) {
        // A setup is Todo's primary action, not an extra free strike.
        continue;
      } else if (actor.id === 'inumaki' && events.some(e => e.exchange === exchange && e.kind === 'speech')) continue;
      else strike(actor, boss, opening);
    }
    if (!fast) {
      const beforeDomain = boss.domain;
      bossAction();
      if (!beforeDomain && boss.domain) domainPulse();
    }
    endDisabledDomains();
    // Holding a domain costs energy; endings and recovery are recorded transitions.
    for (const s of all.filter(active)) {
      if (s.domain) {
        if (s.domain <= 1 || s.ce <= 1) endDomain(s, 'reaches the end of its maintained window');
        else emit('maintenance', s, undefined, 'domain-maintenance', false, () => { pay(s, 1); s.domain--; return `${name(s)} spends energy maintaining the domain.`; });
      } else if (s.burnout && !events.some(e => e.exchange === exchange && e.actor === s.id && e.kind === 'domain_end')) {
        emit('recovery', s, undefined, 'burnout-time', false, () => { s.burnout--; return s.burnout ? `${name(s)}’s technique is still recovering.` : `${name(s)}’s technique becomes available again after burnout.`; });
      }
    }
    endDisabledDomains();
    if (!active(boss)) { outcome = 'won'; break; }
    if (!team.some(active)) { outcome = 'defeated'; break; }
    if (team.filter(s => !active(s)).length > fallenAtStart) { outcome = 'casualty'; break; }
  }
  if (outcome === 'won') for (const s of team) endDomain(s, 'ends with the encounter');
  const alive = team.filter(active);
  const summary = outcome === 'won'
    ? `${name(boss)} is defeated. ${alive.length ? alive.map(s => `${name(s)} is ${combatCondition(s).toLowerCase()}`).join('; ') + '.' : 'No squad member remains standing.'}`
    : outcome === 'stalemate' ? `The squad cannot finish ${name(boss)} before it has to withdraw. The run ends here; no victory is awarded for reaching the exchange limit.`
    : `${name(boss)} remains standing. ${alive.length ? `${alive.map(name).join(' and ')} can continue, carrying their injuries and spent energy into the next exchange.` : 'The squad has no one left to continue.'}`;
  // Keep all consequential events in the mechanics log; prose chooses causal units.
  const meaningful = events.filter(e => e.kind !== 'maintenance' && (e.kind !== 'recovery' || e.changes.some(c => c.before.burnout > 0 && c.after.burnout === 0)));
  const seen = new Set<string>();
  const selected = meaningful.filter((e, i) => {
    const terminal = e.changes.some(c => c.before.status === 'active' && c.after.status === 'out');
    const lifecycle = ['domain_start', 'domain_clash', 'domain_end', 'recovery'].includes(e.kind);
    const key = `${e.actor}:${e.target}:${e.kind}`;
    const first = !seen.has(key); seen.add(key);
    // A rescue and the ensuing attack response are a single causal unit.
    return lifecycle || terminal || i >= meaningful.length - 2 || (first && (e.important || i < 3)) || meaningful[i - 1]?.kind === 'rescue' || (e.kind === 'hit' && meaningful[i + 1]?.kind === 'domain_end');
  });
  const short = (text: string) => text.replaceAll('Yuta Okkotsu', 'Yuta').replaceAll('Yuji Itadori', 'Yuji').replaceAll('Megumi Fushiguro', 'Megumi').replaceAll('Aoi Todo', 'Todo').replaceAll('Toge Inumaki', 'Inumaki').replaceAll('Maki Zenin', 'Maki').replaceAll('Ryomen Sukuna', 'Sukuna');
  const firstCount = Math.min(3, Math.max(1, Math.floor(selected.length / 3)));
  const finalStart = Math.max(firstCount, selected.length - 2);
  const chunks = [selected.slice(0, firstCount), selected.slice(firstCount, finalStart), selected.slice(finalStart)];
  const paragraphs = chunks.map(es => es.map(e => short(e.text)).join(' '));
  paragraphs[2] = [paragraphs[2], short(summary)].filter(Boolean).join(' ');
  if (!paragraphs[0]) paragraphs[0] = `${team.filter(s => start.find(a => a.id === s.id)?.status === 'active').map(name).join(', ')} face ${name(boss)} with their current resources.`;
  if (!paragraphs[1]) paragraphs[1] = 'The exchange ends before either side can establish another technique.';
  if (attempt > 0) paragraphs[0] = `The survivors re-engage ${name(boss)}${start.at(-1)!.body < profile(boss).body ? ', still carrying the damage from the last exchange' : ''}${start.at(-1)!.burnout ? ' while the boss’s technique is still in burnout' : ''}. ${paragraphs[0]}`;
  return { ruleset: PILOT_RULESET, start, end: copy(all), events, paragraphs, outcome };
}

const blankBreakdown = (): Breakdown => ({ topPower: 0, others: 0, synergy: 0, counters: 0, domain: 0, specials: 0, blackFlash: 0, rng: 0, flat: 0, total: 0, firedCounters: [], firedSynergies: [], domainNotes: [], specialNotes: [] });
export function runPilot(seed: string, ids: string[]): PilotRun {
  if (!seed || seed.length > 128 || !isPilotTeam(ids)) throw new Error('Choose one fighter from each pilot pair.');
  // Canonical slot order makes input array order irrelevant to the seed and tactics.
  const teamIds = ['yuji', 'yuta', 'megumi', 'maki', 'todo', 'inumaki'].filter(id => ids.includes(id)) as PilotId[];
  let team = teamIds.map(initialCombatant);
  const rounds: PilotRound[] = [];
  let cleared = 0;
  for (const [rung, bossId] of PILOT_BOSSES.entries()) {
    let boss = initialCombatant(bossId);
    for (let attempt = 0; attempt < 4 && team.some(active); attempt++) {
      const combat = resolvePilotEncounter(team, boss, `${seed}:${teamIds.join(',')}:${rung}`, attempt);
      const won = combat.outcome === 'won';
      const fellIds = combat.end.filter(s => teamIds.includes(s.id) && !active(s) && combat.start.find(a => a.id === s.id)?.status === 'active').map(s => s.id);
      rounds.push({ round: rounds.length + 1, rung, teamIds: team.filter(active).map(s => s.id), enemyIds: [bossId], enemyLabel: character(bossId).name, teamScore: 0, enemyScore: 0, margin: 0, won, upset: false, upsetSide: null, upsetReason: null, fellIds, enemyFellIds: won ? [bossId] : [], narrowWin: won && fellIds.length > 0, notes: [], team: blankBreakdown(), enemy: blankBreakdown(), combat });
      team = combat.end.filter(s => teamIds.includes(s.id)); boss = combat.end.find(s => s.id === bossId)!;
      if (won) { cleared++; break; }
      if (combat.outcome !== 'casualty') break;
    }
    if (cleared <= rung || !team.some(active)) break;
    // Declared short transit. No healing, resurrection, spent summon or Rika reset.
    if (rung < 4) {
      const combat = rounds.at(-1)!.combat;
      const changes: CombatEvent['changes'] = [];
      team = team.map(s => {
        if (!active(s)) return s;
        const after = { ...s, ce: Math.min(profile(s).reserves, s.ce + 4), throat: Math.max(0, s.throat - 1), burnout: 0, domain: 0, shadowDomain: false };
        if (JSON.stringify(s) !== JSON.stringify(after)) changes.push({ id: s.id, before: copy(s), after: copy(after) });
        return after;
      });
      const transit = 'During the short transit, the survivors regain a little energy, voice strain eases and ordinary technique burnout ends. Their combat wounds remain.';
      combat.events.push({ id: `transit-${rung}`, exchange: (combat.events.at(-1)?.exchange ?? 0) + 1, kind: 'transit', actor: team.find(active)!.id, rule: 'declared-inter-encounter-recovery', important: false, text: transit, changes });
      combat.end = [...copy(team), copy(boss)];
      combat.paragraphs[2] += ` ${transit}`;
    }
  }
  const mvp = team.slice().sort((a,b) => b.contribution - a.contribution || a.id.localeCompare(b.id))[0];
  return { ruleset: PILOT_RULESET, seed, mode: 'gauntlet', side: 'hero', teamIds, rounds, rungsCleared: cleared, fullClear: cleared === 5, record: `${cleared}/5`, rankTitle: DB.rank_titles.hero[cleared], mvpId: mvp?.id ?? null, survivorIds: team.filter(active).map(s => s.id), xp: cleared * 10 + (cleared === 5 ? 50 : 0), hype: false, upsets: 0 };
}
