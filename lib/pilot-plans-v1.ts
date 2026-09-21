import { pilotTeams, PILOT_BOSSES, type PilotId } from './pilot-data-v1.ts';

/** Forty starting playbooks, composed from authored interactions rather than fixed endings.
 * A playbook remains applicable to its surviving members; it never supplies a winner. */
export function pilotPlan(team: readonly PilotId[], boss: PilotId) {
  const has = (id: PilotId) => team.includes(id);
  const threatOrder: Record<string, PilotId[]> = {
    hanami: ['yuta', 'yuji', 'maki', 'megumi', 'todo', 'inumaki'],
    jogo: ['megumi', 'inumaki', 'yuta', 'yuji', 'maki', 'todo'],
    mahito: ['yuji', 'maki', 'yuta', 'megumi', 'todo', 'inumaki'],
    kenjaku: ['todo', 'yuta', 'yuji', 'megumi', 'maki', 'inumaki'],
    sukuna: ['yuta', 'yuji', 'maki', 'todo', 'megumi', 'inumaki'],
  };
  return {
    id: `${[...team].sort().join('+')}__${boss}`,
    targetPriority: (threatOrder[boss] ?? []).filter(id => has(id)),
    primaryPath: boss === 'mahito'
      ? has('yuji') ? 'Yuji must reach Mahito’s soul; other physical pressure can force resource expenditure.' : 'Yuta must reach the cursed body with positive energy; preserve resources for the domain response.'
      : boss === 'sukuna'
        ? has('yuji') ? 'Use earned openings for soul-boundary attacks; survive the open-domain interval.' : 'Create a close opening or an unopposed domain sure-hit after Sukuna spends his limited reserves.'
        : has('yuta') && ['hanami', 'jogo'].includes(boss) ? 'Create safe close contact for positive-energy output.' : 'Use restraint or repositioning to land repeated attacks without surrendering the support fighter.',
    secondPath: has('megumi') ? 'Toad can restrict the approach; Totality can exploit a flank. Closed-barrier interference commits Megumi and exposes him to direct attacks.' : 'Maki supplies sustained weapon pressure and soul damage. Her zero CE does not protect teammates or stop matter-targeting slashes.',
    supportPath: has('todo') ? 'Todo can create openings or rescue a CE-bearing ally, spending energy and accepting the replacement target’s risk.' : 'Inumaki can buy a short opening if his voice holds; resistance and accumulated recoil can shut the option down.',
    failurePath: 'If setup fails, the attack misses or the exposed fighter is hit. Incapacitation follows damage; no required casualty is written into the plan.',
  };
}
export const PILOT_MATCHUPS = pilotTeams().flatMap(team => PILOT_BOSSES.map(boss => pilotPlan(team, boss)));
