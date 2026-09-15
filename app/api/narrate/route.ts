import { NextResponse } from 'next/server';

import type { RoundResult } from '@/lib/engine.ts';
import { narrateRound, narrateRun } from '@/lib/narrate.ts';
import type { Side } from '@/lib/types.ts';

// A whole run in one pass takes a while, and a rate-limit retry can add more.
// Vercel's default function ceiling is well under that; Hobby allows 60s.
export const maxDuration = 60;

interface Body {
  side: Side;
  /** A whole run, narrated in one pass. Preferred. */
  rounds?: RoundResult[];
  fullClear?: boolean;
  /** A single round. Used by Freestyle, which has no ladder. */
  round?: RoundResult;
  runOver?: boolean;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 400 });
  }

  if (body?.side !== 'hero' && body?.side !== 'villain') {
    return NextResponse.json({ error: 'Missing side.' }, { status: 400 });
  }

  if (Array.isArray(body.rounds)) {
    if (body.rounds.length === 0 || body.rounds.length > 40) {
      return NextResponse.json({ error: 'Bad rounds.' }, { status: 400 });
    }
    if (body.rounds.some((r) => !Array.isArray(r?.teamIds) || !Array.isArray(r?.enemyIds))) {
      return NextResponse.json({ error: 'Malformed round.' }, { status: 400 });
    }
    const { stories, source } = await narrateRun({
      side: body.side,
      rounds: body.rounds,
      fullClear: Boolean(body.fullClear),
    });
    return NextResponse.json({ stories, source });
  }

  if (!body.round?.teamIds || !Array.isArray(body.round.teamIds)) {
    return NextResponse.json({ error: 'Missing round or rounds.' }, { status: 400 });
  }

  const { story, source } = await narrateRound({
    side: body.side,
    round: body.round,
    runOver: body.runOver,
  });
  return NextResponse.json({ story, source });
}
