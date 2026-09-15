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
    beats.push(note.replace(/\s*\([+-]?\d+(?:\s[a-z]+)?\)/g, '').trim());
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

/** Google AI Studio's free tier covers the Flash models. Override with
 *  GEMINI_MODEL if Google renames or retires this one — though when it does,
 *  the 404 names the replacement and `narrateWithGemini` follows it. */
const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
}

async function narrateWithGemini(system: string, userBrief: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  const body = (withThinkingOff: boolean) => ({
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: userBrief }] }],
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 1,
      // Flash models think by default, and thinking tokens come out of the
      // same budget. A 3-4 sentence narration does not need it.
      ...(withThinkingOff ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  });

  const send = (target: string, withThinkingOff: boolean) =>
    fetch(`${GEMINI_HOST}/${encodeURIComponent(target)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body(withThinkingOff)),
    });

  let used = model;
  let response = await send(used, true);
  let data = (await response.json()) as GeminiResponse;

  // A model that does not accept thinkingConfig rejects the whole request.
  // Retry once without it — but only for that, not for a bad key, which is
  // also a 400.
  if (!response.ok && /thinking/i.test(data.error?.message ?? '')) {
    response = await send(used, false);
    data = (await response.json()) as GeminiResponse;
  }

  // Free-tier quota is per-minute as well as per-day, and a burst of rounds can
  // trip it. Google returns the delay it wants in the error body; wait that
  // long once rather than dropping the round to the template.
  if (response.status === 429) {
    const seconds = Number(
      /retryDelay"?\s*:\s*"?(\d+(?:\.\d+)?)s/i.exec(JSON.stringify(data))?.[1] ?? 6,
    );
    const wait = Math.min(Math.max(seconds, 1), 12) * 1000;
    console.error(`narration: Gemini rate limit; retrying once in ${wait / 1000}s`);
    await new Promise((resolve) => setTimeout(resolve, wait));
    response = await send(used, true);
    data = (await response.json()) as GeminiResponse;
    if (response.status === 429) {
      console.error(
        'narration: still rate limited — this round falls back to the local narrator. ' +
          'Free tier allows roughly 15 requests a minute.',
      );
    }
  }

  // Google retires models, and says so in the 404: "This model models/X is no
  // longer available to new users. Please update your code to use models/Y".
  // Follow the pointer once rather than leaving every round on the template.
  if (!response.ok) {
    const replacement = /use\s+models\/([\w.-]+)/i.exec(data.error?.message ?? '')?.[1];
    if (replacement && replacement !== used) {
      console.error(
        `narration: ${used} is retired; Google points at ${replacement}. ` +
          `Using it for now — set GEMINI_MODEL=${replacement} to make it permanent.`,
      );
      used = replacement;
      response = await send(used, true);
      data = (await response.json()) as GeminiResponse;
      if (!response.ok && /thinking/i.test(data.error?.message ?? '')) {
        response = await send(used, false);
        data = (await response.json()) as GeminiResponse;
      }
    }
  }

  if (!response.ok) {
    const message = data.error?.message ?? 'unknown error';
    console.error(`narration: Gemini ${response.status} (${used}): ${message}`);
    if (/API key not valid|API_KEY_INVALID/i.test(message)) {
      console.error('narration: check GEMINI_API_KEY in .env.local');
    } else if (response.status === 404 || /not found|not supported/i.test(message)) {
      console.error(
        `narration: "${used}" is not available to this key. Set GEMINI_MODEL to one listed by ` +
          'https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY',
      );
    }
    return null;
  }
  if (data.promptFeedback?.blockReason) {
    console.error(`narration: Gemini blocked the prompt (${data.promptFeedback.blockReason})`);
    return null;
  }

  const candidate = data.candidates?.[0];
  if (candidate?.finishReason && !['STOP', 'MAX_TOKENS'].includes(candidate.finishReason)) {
    console.error(`narration: Gemini stopped early (${candidate.finishReason})`);
    return null;
  }

  const text = cleanStory((candidate?.content?.parts ?? []).map((part) => part.text ?? '').join(''));
  return text || null;
}

async function narrateWithClaude(system: string, userBrief: string): Promise<string | null> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1000,
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
