/**
 * Story generation.
 *
 * `rules.ai_role` in the DB: "Narrates the result it is given. Never decides
 * outcomes." The engine has already resolved the round when this runs; the
 * model receives the result as fact and writes 3-4 sentences about it. Nothing
 * it returns is fed back into the engine.
 */

import { character } from './data.ts';
import type { RoundResult } from './engine.ts';
import type { Side } from './types.ts';

export interface NarrationRequest {
  side: Side;
  round: RoundResult;
  /** Set on the last round of a run that ended. */
  runOver?: boolean;
  fullClear?: boolean;
}

const SYSTEM = `You narrate fights in a Jujutsu Kaisen fan game.

THE RESULT IS ALREADY DECIDED. You are given it as fact. You never change,
hedge, or contradict it: if the brief says a character fell, they fell; if it
says the team lost, they lost. Never invent a different winner, a survival, or
a "but then...". Never end on a reversal or a cliffhanger that undoes it.

Write 5 to 7 sentences of present-tense manga narration, in this shape:

1. Open on the exchange — who moves first and what they throw.
2. Work through the beats you are given, in the order they are listed. Name
   every technique by its actual name. If a domain is expanded, give it its
   full name and say what its sure-hit does. If Black Flash lands, it is the
   loudest moment on the page — treat it that way.
3. Land the result: who goes down, and what it cost the winner.

Rules for the prose:
- Name techniques, domains and characters exactly as the brief spells them.
- Be concrete and physical: what the technique does, where it lands, what
  breaks. Cursed energy is visible, loud and expensive.
- Vary your openings. Do not start every round the same way.
- Plain prose only: no markdown, no asterisks or underscores around words, no
  quotation marks around technique names, no emoji, no headings, no bullets.
- Never mention rolls, scores, numbers, percentages, probabilities, or the
  words engine, roll, dice, or simulation. The reader sees a fight, not a
  scoreboard.
- A beat marked "fan theory" is speculation — write it as something that
  surprises everyone watching, not as an established fact.`;

/** Everything the DB knows about a fighter that a narrator can use. */
const RUN_SYSTEM = `You write the fight commentary for a Jujutsu Kaisen fan game.

You are given a WHOLE RUN — every round, already decided by the game engine —
and you write all of it in one pass, as one continuous fight.

THE RESULTS ARE FACTS. Never change who won a round, who fell, or how it ended.
Never write a reversal, a survival, or a cliffhanger that undoes a result.

Write ONE PARAGRAPH PER ROUND, 4 to 6 sentences each. Start every paragraph
with its marker on its own, exactly like <<1>>, then the prose.

THIS IS A FIGHT, NOT A HIGHLIGHT REEL. The hard rules:

- PUSH AND PULL. The enemy is not a training dummy. In every round the enemy
  lands something, takes something away, or forces a change of plan — even in a
  round they lose. Give them the first half of the paragraph as often as not.
  A round the team wins should still cost them.
- NEVER REINTRODUCE. A domain, technique or transformation that appeared in an
  earlier round is already established. Do not re-expand it, do not re-explain
  its sure-hit, do not describe the same barrier twice. Later rounds reference
  it in passing: it is already up, or it failed last time, or they cannot afford
  it again.
- ESCALATE. Damage carries. Someone who bled in round two is still bleeding in
  round three. Cursed energy runs down. A domain costs its user something every
  time. By the last round everyone still standing should be wrecked.
- VARY THE CAMERA. No two paragraphs may open with the same character or the
  same sentence shape. Do not start consecutive paragraphs with a name. Some
  rounds open on the enemy, some mid-exchange, some on the aftermath of the
  last one.
- SPECIFIC OVER GRAND. Name the technique. Say what it does to a body or to
  the ground. "Cleaves the asphalt in a fan of thirty cuts" beats "unleashes
  devastating power".

Plain prose only: no markdown, no asterisks, no headings beyond the <<n>>
markers, no emoji, no bullets. Never mention rolls, scores, numbers,
percentages, odds, or the words engine, roll, dice, or simulation.`;

function describe(c: ReturnType<typeof character>): string {
  const lines = [`- ${c.name} (${c.tier} tier${c.canon_grade !== '-' ? `, ${c.canon_grade}` : ''})`];
  lines.push(`  Who they are: ${c.story_hook}`);
  lines.push(`  Techniques: ${c.techniques.join('; ')}`);
  if (c.domain.name) {
    lines.push(
      `  Domain: ${c.domain.name} (${c.domain.type})` +
        (c.domain.sure_hit ? ` — sure hit: ${c.domain.sure_hit}` : ''),
    );
  }
  if (c.special) lines.push(`  Signature: ${c.special.description}`);
  return lines.join('\n');
}

/** The domain user on a side, if their domain actually mattered this round. */
function domainBeat(ids: string[], notes: { rule: string; value: number }[]): string | null {
  const expanded = notes.some(
    (n) => (n.rule === 'domain_pressure' || n.rule === 'domain_clash') && n.value > 0,
  );
  if (!expanded) return null;
  const user = ids
    .map((id) => character(id))
    .filter((c) => c.tags.includes('sure_hit_domain') && c.domain.name)
    .sort((a, b) => b.stats.dom - a.stats.dom)[0];
  if (!user) return null;
  return (
    `${user.name} expands ${user.domain.name}` +
    (user.domain.sure_hit ? ` — its sure hit is ${user.domain.sure_hit}` : '') +
    '. Put this on the page.'
  );
}



/** Canon context the DB assumes you already know. Attached to a beat when the
 *  engine fires the matching special, so the narration gets the details right
 *  rather than inventing them. */
const LORE: Record<string, string> = {
  Mahoraga:
    'Ten Shadows canon: Mahoraga — Eight-Handled Sword Divergent Sila Divine General ' +
    'Mahoraga — has never been subjugated by any user of the technique in its history. ' +
    'Summoning it is a ritual and a last resort, spoken aloud, and a user who cannot tame ' +
    'it is killed by it. The wheel above its head turns to adapt to any phenomenon it has ' +
    'already experienced: a technique, a domain, even Infinity. It has no loyalty here. ' +
    'Megumi calls it knowing it will finish him, and it does. Write the incantation, the ' +
    'wheel turning, and the fact that this is the last thing he ever does.',
  'spare core':
    "Panda is a Cursed Corpse with three cores, not one. The body breaking is not the end " +
    'of him; he switches to the gorilla core and keeps going.',
  'Black Flash':
    'Black Flash is cursed energy landing within a hundredth of a second of the physical ' +
    'hit, warping space at the point of impact in black and red. Sorcerers chase the feeling ' +
    'for the rest of their lives.',
  jackpot:
    "Hakari's Idle Death Gamble pays out in a pachinko jackpot: unlimited cursed energy and " +
    'automatic reversed cursed technique for four minutes and eleven seconds. While it runs, ' +
    'nothing put him down.',
  'black hole':
    "Yuki's Star Rage adds virtual mass. Her last move collapses that mass into a black hole, " +
    'and she does not walk away from using it.',
  Amber:
    "Kashimo's Mythical Beast Amber is a one-time transformation that burns his body out.",
};

function loreFor(text: string): string | null {
  for (const [key, note] of Object.entries(LORE)) {
    if (text.includes(key)) return note;
  }
  return null;
}

/** One round, compressed to the facts a narrator needs. */
function roundBrief(round: RoundResult, index: number): string {
  const enemies = round.enemyIds.map((id) => character(id).name).join(' and ');
  const lines = [
    `<<${index + 1}>> Round ${round.round}${round.rung >= 0 ? `, rung ${round.rung + 1}` : ''} — against ${enemies}.`,
    `  Standing for the team: ${round.teamIds.map((id) => character(id).name).join(', ')}.`,
    round.won
      ? `  RESULT: the team WINS. ${enemies} goes down.`
      : `  RESULT: the team LOSES. ${enemies} is still standing.`,
  ];

  const beats: string[] = [];
  const ourDomain = domainBeat(round.teamIds, round.team.domainNotes);
  const theirDomain = domainBeat(round.enemyIds, round.enemy.domainNotes);
  if (ourDomain) beats.push(ourDomain);
  if (theirDomain) beats.push(`Against them: ${theirDomain}`);
  for (const note of [...round.team.domainNotes, ...round.enemy.domainNotes]) {
    if (note.rule === 'zero_ce_immunity') {
      beats.push('A zero-cursed-energy fighter cannot be targeted by that closed domain.');
    }
    if (note.rule === 'anti_domain') beats.push('Simple Domain holds the sure hit off.');
    if (note.rule === 'open_domain_exception') {
      beats.push('That domain is barrierless — no walls, and it cuts everything in range.');
    }
  }
  if (round.team.blackFlash > 0) beats.push('BLACK FLASH lands for the team. Biggest beat of the round.');
  if (round.enemy.blackFlash > 0) beats.push('BLACK FLASH lands for the enemy.');
  for (const c of round.team.firedCounters) {
    beats.push(
      `${c.explanation}${c.canon_status === 'fan_theory' ? ' (fan theory — write it as a shock)' : ''}`,
    );
  }
  for (const c of round.enemy.firedCounters) beats.push(`Working against the team: ${c.explanation}`);
  for (const sy of round.team.firedSynergies) {
    beats.push(sy.bonus < 0 ? `${sy.label}: they will not cooperate. ${sy.explanation}` : `${sy.label}: ${sy.explanation}`);
  }
  for (const note of round.notes) {
    if (note.startsWith('UPSET')) continue;
    const clean = note.replace(/\s*\([+-]?\d+(?:\s[a-z]+)?\)/g, '').trim();
    beats.push(clean);
    const lore = loreFor(clean);
    if (lore) beats.push(`  CONTEXT: ${lore}`);
  }
  if (round.team.blackFlash > 0) {
    const lore = loreFor('Black Flash');
    if (lore) beats.push(`  CONTEXT: ${lore}`);
  }
  if (round.upset && round.upsetReason) {
    const reason = round.upsetReason.replace(/^UPSET — /, '');
    beats.push(
      round.upsetSide === 'team'
        ? `THE UPSET: they were losing this and steal it anyway. ${reason}`
        : `THE UPSET: they were ahead and lose it anyway. ${reason}`,
    );
  }
  if (round.narrowWin && round.won) beats.push('Won by a hair. It should feel that way.');
  if (round.fellIds.length) {
    beats.push(`OUT OF THE RUN: ${round.fellIds.map((id) => character(id).name).join(', ')}. Show how.`);
  }
  if (round.enemyFellIds.length) {
    beats.push(`Also down: ${round.enemyFellIds.map((id) => character(id).name).join(', ')}.`);
  }

  if (beats.length) lines.push(...beats.map((b) => `  - ${b}`));
  return lines.join('\n');
}

function brief(req: NarrationRequest): string {
  const { round, side } = req;
  const team = round.teamIds.map((id) => character(id));
  const enemies = round.enemyIds.map((id) => character(id));
  const fallen = round.fellIds.map((id) => character(id).name);
  const enemyFallen = round.enemyFellIds.map((id) => character(id).name);

  const lines = [
    `Side: ${side === 'hero' ? 'sorcerers' : 'curses and killers'}.`,
    `Round ${round.round}${round.rung >= 0 ? ` — rung ${round.rung + 1} of the ladder` : ''}.`,
    '',
    'THE TEAM',
    ...team.map(describe),
    '',
    'FACING',
    ...enemies.map(describe),
    '',
    'THE RESULT (fact — do not change it):',
    round.won
      ? `The team WINS. ${enemies.map((e) => e.name).join(' and ')} goes down.`
      : `The team LOSES. ${enemies.map((e) => e.name).join(' and ')} is still standing at the end.`,
  ];

  const beats: string[] = [];

  // Domains, named, on whichever side actually opened one.
  const ourDomain = domainBeat(round.teamIds, round.team.domainNotes);
  const theirDomain = domainBeat(round.enemyIds, round.enemy.domainNotes);
  if (ourDomain) beats.push(ourDomain);
  if (theirDomain) beats.push(theirDomain);
  for (const note of [...round.team.domainNotes, ...round.enemy.domainNotes]) {
    if (note.rule === 'zero_ce_immunity') {
      beats.push(
        'A fighter with zero cursed energy cannot be targeted by that closed domain — the ' +
          'sure hit passes straight through them. Show it failing on them.',
      );
    }
    if (note.rule === 'anti_domain') {
      beats.push(
        'Simple Domain holds the sure hit off — a thin shell of cursed energy carving out a ' +
          'space the domain cannot reach into.',
      );
    }
    if (note.rule === 'open_domain_exception') {
      beats.push(
        'This domain is barrierless: it has no walls to hide behind and it cuts everything ' +
          'in range.',
      );
    }
  }

  if (round.team.blackFlash > 0) {
    beats.push(
      'BLACK FLASH lands for the team — cursed energy and impact inside a hundredth of a ' +
        'second, the world going black-and-red around the hit. Make it the biggest beat.',
    );
  }
  if (round.enemy.blackFlash > 0) {
    beats.push('BLACK FLASH lands for the enemy. Make it hurt.');
  }

  for (const c of round.team.firedCounters) {
    beats.push(
      `${c.attacker_tag.replace(/_/g, ' ')} beats ${c.defender_tag.replace(/_/g, ' ')}: ` +
        `${c.explanation}${c.canon_status === 'fan_theory' ? ' (fan theory — write it as a shock)' : ''}`,
    );
  }
  for (const c of round.enemy.firedCounters) {
    beats.push(`Working against the team: ${c.explanation}`);
  }

  for (const s of round.team.firedSynergies) {
    beats.push(
      s.bonus < 0
        ? `${s.label}: these two will not cooperate. ${s.explanation}`
        : `${s.label}: ${s.explanation}`,
    );
  }

  // Specials the engine actually fired, described in the DB's own words.
  for (const note of round.notes) {
    if (note.startsWith('UPSET')) continue;
    const clean = note.replace(/\s*\([+-]?\d+(?:\s[a-z]+)?\)/g, '').trim();
    beats.push(clean);
    const lore = loreFor(clean);
    if (lore) beats.push(`CONTEXT: ${lore}`);
  }
  for (const c of team) {
    if (c.special && round.team.specialNotes.some((n) => n.startsWith(c.name))) {
      beats.push(`${c.name}'s signature fires: ${c.special.description}`);
    }
  }

  if (round.upset && round.upsetReason) {
    const reason = round.upsetReason.replace(/^UPSET — /, '');
    beats.push(
      round.upsetSide === 'team'
        ? `THE UPSET: the team was losing this and steals it anyway. ${reason}`
        : `THE UPSET: the team was ahead and loses anyway. ${reason}`,
    );
  }
  if (round.narrowWin && round.won) beats.push('It is won by a hair, not comfortably.');
  if (fallen.length) beats.push(`Knocked out of the run: ${fallen.join(', ')}. Show how.`);
  if (enemyFallen.length) beats.push(`Also down: ${enemyFallen.join(', ')}.`);

  if (beats.length) lines.push('', 'BEATS TO USE, IN THIS ORDER:', ...beats.map((b) => `- ${b}`));

  if (req.runOver) {
    lines.push(
      '',
      req.fullClear
        ? 'This is the last round and the team has cleared the entire ladder. End on that.'
        : 'This is the last round: the team is wiped out here. End on that.',
    );
  }

  return lines.join('\n');
}

/** Used when no API key is configured, and when the API call fails. The app is
 *  playable without a key; the story is just flatter. */
export function fallbackNarration(req: NarrationRequest): string {
  const { round } = req;
  const enemy = round.enemyIds.map((id) => character(id).name).join(' and ');
  const team = round.teamIds.map((id) => character(id));
  const fallen = round.fellIds.map((id) => character(id).name);
  // Stable per round, so the same run always reads the same way.
  const pick = <T,>(options: T[]): T =>
    options[Math.abs(Math.round(round.teamScore * 10) + round.round) % options.length];

  const lead = team[0] ?? character('yuji');
  const anchor = team[team.length - 1] ?? lead;
  const parts: string[] = [];

  parts.push(
    round.won
      ? pick([
          `${lead.name} finds the opening first and does not give it back.`,
          `${enemy} sets the pace for about four seconds. ${lead.name} takes it after that.`,
          `It is ${anchor.name} who turns it, in the half-second ${enemy} spends deciding.`,
        ])
      : pick([
          `${enemy} never gives ${lead.name} the opening, and the exchange runs out of room.`,
          `${lead.name} gets close twice. ${enemy} makes sure there is no third time.`,
          `Every answer ${anchor.name} has, ${enemy} has already accounted for.`,
        ]),
  );

  // Ordered by what a reader would miss most if it were cut.
  const middles: string[] = [];
  if (fallen.length) {
    middles.push(
      `${fallen.join(' and ')} ${fallen.length > 1 ? 'are' : 'is'} carried out of it.`,
    );
  }
  if (round.upset && round.upsetReason) {
    const reason = round.upsetReason.replace(/^UPSET — /, '');
    middles.push(
      round.upsetSide === 'team'
        ? `Against every read of it: ${reason}`
        : `It should not have gone this way: ${reason}`,
    );
  }
  // round.notes are prose; specialNotes carry "+3"-style scoring text meant for
  // the breakdown panel, so they never go into a sentence.
  const beat = round.notes.find((n) => !n.startsWith('UPSET'));
  if (beat) middles.push(beat.endsWith('.') ? beat : `${beat}.`);
  const counter = round.team.firedCounters.find((c) => c.bonus > 0);
  if (counter) middles.push(counter.explanation);

  // The closer carries the result, so it is never the sentence that gets cut.
  const closer = round.won
    ? `${enemy} goes down.`
    : `${enemy} is still standing when the dust drops.`;

  const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean).length;
  let budget = 4 - sentences(parts[0]) - 1;
  for (const middle of middles) {
    const cost = sentences(middle);
    if (cost > budget) continue;
    parts.push(middle);
    budget -= cost;
  }
  parts.push(closer);

  return parts.join(' ');
}

/** Which model writes the story. Gemini first: it has a free tier, which is
 *  what this project runs on. Claude if that key is the one present. Neither
 *  is required — the template below keeps the app playable. */
export type NarrationSource = 'gemini' | 'claude' | 'fallback';

export function activeProvider(): NarrationSource {
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.ANTHROPIC_API_KEY) return 'claude';
  return 'fallback';
}

/** Models reach for markdown emphasis even when told not to, and the UI prints
 *  the story as plain text, so the asterisks would show up literally. */
export function cleanStory(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(?<!\w)[*_](\S(?:.*?\S)?)[*_](?!\w)/g, '$1')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/^\s*[-–—•]\s+/gm, '')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

const GEMINI_HOST = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * The free tier meters requests per day PER MODEL, and the allowance is small —
 * gemini-3.6-flash reports a quota of 20 a day. Quotas are separate per model,
 * so exhausting one is not the end of the story: this chain is tried in order,
 * and a daily-quota 429 moves to the next rather than dropping the run to the
 * template. Set GEMINI_MODEL to put your own choice at the front.
 */
const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.6-flash'];

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
}

async function narrateWithGemini(
  system: string,
  userBrief: string,
  maxOutputTokens = 1100,
): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const preferred = process.env.GEMINI_MODEL;
  const chain = preferred
    ? [preferred, ...GEMINI_MODELS.filter((m) => m !== preferred)]
    : [...GEMINI_MODELS];

  const body = (withThinkingOff: boolean) => ({
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: userBrief }] }],
    generationConfig: {
      maxOutputTokens,
      temperature: 1,
      // Flash models think by default and thinking comes out of the same
      // budget. A few paragraphs of narration do not need it.
      ...(withThinkingOff ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  });

  const send = (target: string, withThinkingOff: boolean) =>
    fetch(`${GEMINI_HOST}/${encodeURIComponent(target)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body(withThinkingOff)),
    });

  for (const [attempt, model] of chain.entries()) {
    let used = model;
    let response = await send(used, true);
    let data = (await response.json()) as GeminiResponse;

    // Some models reject thinkingConfig outright; retry once without it.
    if (!response.ok && /thinking/i.test(data.error?.message ?? '')) {
      response = await send(used, false);
      data = (await response.json()) as GeminiResponse;
    }

    // Google retires models and names the replacement in the 404.
    if (!response.ok) {
      const replacement = /use\s+models\/([\w.-]+)/i.exec(data.error?.message ?? '')?.[1];
      if (replacement && replacement !== used) {
        console.error(`narration: ${used} is retired; following Google's pointer to ${replacement}.`);
        used = replacement;
        response = await send(used, true);
        data = (await response.json()) as GeminiResponse;
      }
    }

    if (response.status === 429) {
      const perDay = JSON.stringify(data).includes('PerDay');
      const last = attempt === chain.length - 1;
      if (perDay) {
        console.error(
          `narration: ${used} is out of free-tier requests for today` +
            (last ? '.' : `; trying ${chain[attempt + 1]}.`),
        );
        continue;
      }
      // A per-minute limit is worth waiting out once.
      const seconds = Number(/retryDelay"?\s*:\s*"?(\d+(?:\.\d+)?)s/i.exec(JSON.stringify(data))?.[1] ?? 6);
      const wait = Math.min(Math.max(seconds, 1), 12) * 1000;
      console.error(`narration: ${used} rate limited; retrying once in ${wait / 1000}s`);
      await new Promise((resolve) => setTimeout(resolve, wait));
      response = await send(used, true);
      data = (await response.json()) as GeminiResponse;
      if (response.status === 429 && !last) continue;
    }

    if (!response.ok) {
      const message = data.error?.message ?? 'unknown error';
      console.error(`narration: Gemini ${response.status} (${used}): ${message}`);
      if (/API key not valid|API_KEY_INVALID/i.test(message)) {
        console.error('narration: check GEMINI_API_KEY');
        return null; // A bad key fails on every model; no point walking the chain.
      }
      continue;
    }

    if (data.promptFeedback?.blockReason) {
      console.error(`narration: Gemini blocked the prompt (${data.promptFeedback.blockReason})`);
      return null;
    }

    const candidate = data.candidates?.[0];
    if (candidate?.finishReason && !['STOP', 'MAX_TOKENS'].includes(candidate.finishReason)) {
      console.error(`narration: Gemini stopped early (${candidate.finishReason})`);
      continue;
    }

    const text = cleanStory((candidate?.content?.parts ?? []).map((part) => part.text ?? '').join(''));
    if (text) return text;
  }

  return null;
}

async function narrateWithClaude(
  system: string,
  userBrief: string,
  maxTokens = 1000,
): Promise<string | null> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: maxTokens,
      system,
      // Narration is a short, well-specified writing task: low effort keeps it
      // fast and cheap without turning thinking off.
      output_config: { effort: 'low' },
      messages: [{ role: 'user', content: userBrief }],
    });

    if (response.stop_reason === 'refusal') return null;

    return (
      cleanStory(
        response.content
          .filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
          .map((b) => b.text)
          .join('\n'),
      ) || null
    );
  } catch (error) {
    const Sdk = (await import('@anthropic-ai/sdk')).default;
    if (error instanceof Sdk.APIError) {
      console.error(`narration: Claude API error ${error.status}: ${error.message}`);
    } else {
      console.error('narration: Claude call failed', error);
    }
    return null;
  }
}

export interface RunNarrationRequest {
  side: Side;
  rounds: RoundResult[];
  fullClear: boolean;
}

/** Split the model's single answer back into one story per round. */
export function splitRunStories(text: string, count: number): (string | null)[] {
  const out: (string | null)[] = Array.from({ length: count }, () => null);
  // Markers look like <<3>>; tolerate the model dropping the angle brackets.
  const pattern = /(?:<<|\[\[)\s*(\d+)\s*(?:>>|\]\])/g;
  const marks: { index: number; at: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text))) {
    marks.push({ index: Number(m[1]) - 1, at: m.index, end: m.index + m[0].length });
  }
  for (const [i, mark] of marks.entries()) {
    if (mark.index < 0 || mark.index >= count) continue;
    const body = text.slice(mark.end, marks[i + 1]?.at ?? text.length);
    const cleaned = cleanStory(body);
    if (cleaned) out[mark.index] = cleaned;
  }
  return out;
}

function runBrief(req: RunNarrationRequest): string {
  const cast = new Map<string, ReturnType<typeof character>>();
  for (const round of req.rounds) {
    for (const id of [...round.teamIds, ...round.enemyIds]) cast.set(id, character(id));
  }
  return [
    `Side: ${req.side === 'hero' ? 'sorcerers' : 'curses and killers'}.`,
    `${req.rounds.length} rounds, written as one continuous fight.`,
    '',
    'EVERYONE INVOLVED',
    ...[...cast.values()].map(describe),
    '',
    'THE ROUNDS',
    ...req.rounds.map((r, i) => roundBrief(r, i)),
    '',
    req.fullClear
      ? 'The team clears the entire ladder. The last paragraph lands that.'
      : 'The team is wiped out in the last round. The last paragraph lands that.',
    '',
    `Write exactly ${req.rounds.length} paragraphs, each starting with its <<n>> marker.`,
  ].join('\n');
}

/**
 * Narrate a whole run in one request.
 *
 * One call instead of one per round: the free tier's per-minute quota cannot
 * keep up with a fast clicker, and — more importantly — a model that can only
 * see one round re-expands the same domain every time. Seeing the whole fight
 * is what lets it vary the camera, carry damage forward, and let the enemy
 * push back.
 */
export async function narrateRun(req: RunNarrationRequest): Promise<{
  stories: string[];
  source: NarrationSource;
}> {
  const fallback = (i: number) =>
    fallbackNarration({
      side: req.side,
      round: req.rounds[i],
      runOver: i === req.rounds.length - 1,
      fullClear: req.fullClear,
    });

  const provider = activeProvider();
  if (provider === 'fallback' || req.rounds.length === 0) {
    return { stories: req.rounds.map((_, i) => fallback(i)), source: 'fallback' };
  }

  let raw: string | null = null;
  try {
    const userBrief = runBrief(req);
    raw =
      provider === 'gemini'
        // Sized to the job: seven paragraphs of six sentences is well under
        // 1,600 tokens. The free tier meters tokens per minute and counts
        // maxOutputTokens as a reservation, so asking for headroom you never
        // use is what trips the limit.
        ? await narrateWithGemini(RUN_SYSTEM, userBrief, 1600)
        : await narrateWithClaude(RUN_SYSTEM, userBrief, 2000);
  } catch (error) {
    console.error('run narration failed', error);
  }

  if (!raw) return { stories: req.rounds.map((_, i) => fallback(i)), source: 'fallback' };

  const split = splitRunStories(raw, req.rounds.length);
  const missing = split.filter((s) => !s).length;
  if (missing) console.error(`narration: ${missing} of ${req.rounds.length} rounds came back unparsed`);

  return {
    stories: split.map((story, i) => story ?? fallback(i)),
    source: missing === req.rounds.length ? 'fallback' : provider,
  };
}

export async function narrateRound(req: NarrationRequest): Promise<{
  story: string;
  source: NarrationSource;
}> {
  const provider = activeProvider();
  if (provider === 'fallback') return { story: fallbackNarration(req), source: 'fallback' };

  const userBrief = brief(req);
  let story: string | null = null;
  try {
    story =
      provider === 'gemini'
        ? await narrateWithGemini(SYSTEM, userBrief)
        : await narrateWithClaude(SYSTEM, userBrief);
  } catch (error) {
    console.error('narration failed', error);
  }

  // Any failure — bad key, quota, safety block, empty answer — lands here, and
  // the round still gets a story.
  return story ? { story, source: provider } : { story: fallbackNarration(req), source: 'fallback' };
}
