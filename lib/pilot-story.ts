import type { CombatEvent } from './pilot.ts';
import { character } from './data.ts';

const short = (text: string) => text.replaceAll('Yuta Okkotsu', 'Yuta').replaceAll('Yuji Itadori', 'Yuji').replaceAll('Megumi Fushiguro', 'Megumi').replaceAll('Aoi Todo', 'Todo').replaceAll('Toge Inumaki', 'Inumaki').replaceAll('Maki Zenin', 'Maki').replaceAll('Ryomen Sukuna', 'Sukuna');
const sentence = (text: string) => short(text).split(/(?<=[.!?])\s+/)[0];

/** Only real, linked events become a combination highlight. No imagined follow-up. */
export function battleHighlights(events: CombatEvent[], summary: string): string[] {
  const beats: { index: number; text: string; rank: number; key: string }[] = [];
  for (const [index, event] of events.entries()) {
    if (event.sourceEventId) {
      const source = events.find(e => e.id === event.sourceEventId);
      if (source) beats.push({ index, text: `${sentence(source.text)} ${sentence(event.text)}`, rank: 4, key: `combo:${source.kind}:${event.actor}` });
    } else if (event.kind === 'domain_start') {
      const response = events.slice(index + 1).find(e => e.exchange === event.exchange && ['domain_clash', 'interference', 'domain_hit'].includes(e.kind));
      beats.push({ index, text: `${sentence(event.text)}${response ? ' ' + sentence(response.text) : ''}`, rank: 5, key: 'domain' });
    } else if (event.kind === 'rescue') {
      const hit = events[index + 1];
      beats.push({ index, text: `${sentence(event.text)}${hit && hit.exchange === event.exchange ? ' ' + sentence(hit.text) : ''}`, rank: 4, key: 'rescue' });
    } else if (event.kind === 'speech' && !events.some(e => e.sourceEventId === event.id)) {
      beats.push({ index, text: sentence(event.text), rank: 2, key: 'resisted' });
    } else if (event.kind === 'hit' && !event.sourceEventId) {
      beats.push({ index, text: sentence(event.text), rank: 1, key: `attack:${event.actor}` });
    }
  }
  const chosen = new Map<string, typeof beats[number]>();
  for (const beat of beats.sort((a, b) => b.rank - a.rank || a.index - b.index)) {
    if (!chosen.has(beat.key) && chosen.size < 3) chosen.set(beat.key, beat);
  }
  const highlights = [...chosen.values()].sort((a, b) => a.index - b.index).map(b => b.text);
  const fallen = [...new Set(events.flatMap(e => e.changes.filter(c => c.before.status === 'active' && c.after.status === 'out').map(c => c.id)))];
  const heroes = fallen.filter(id => ['yuji','yuta','megumi','maki','todo','inumaki'].includes(id));
  if (heroes.length) highlights.push(short(`${heroes.map(id => character(id).name).join(' and ')} ${heroes.length === 1 ? 'is' : 'are'} taken out of the fight. Their techniques are no longer available to the squad.`));
  highlights.push(short(summary));
  return highlights;
}

export function transitText(changes: CombatEvent['changes']): string {
  const alive = changes.filter(c => c.after.status === 'active');
  const parts: string[] = [];
  if (alive.some(c => c.after.ce > c.before.ce)) parts.push('The surviving fighters recover a little energy');
  const voice = alive.find(c => c.id === 'inumaki' && c.after.throat < c.before.throat);
  if (voice) parts.push('Inumaki’s throat strain eases');
  const recovered = alive.filter(c => c.before.burnout > 0 && c.after.burnout === 0);
  if (recovered.length) parts.push(`${recovered.map(c => short(character(c.id).name)).join(' and ')} ${recovered.length === 1 ? 'recovers' : 'recover'} technique access`);
  return parts.length ? `${parts.join('; ')} during transit. Existing wounds remain.` : '';
}
