import { NextResponse } from 'next/server';

import { runGauntlet } from '@/lib/engine.ts';
import { getStore, newRunId } from '@/lib/store.ts';
import type { SavedRun } from '@/lib/share.ts';
import type { Mode, Side } from '@/lib/types.ts';
import { runPilot as runPilotV1 } from '@/lib/pilot-v1.ts';
import { runPilot } from '@/lib/pilot.ts';
import { pilotReplayId } from '@/lib/load-run.ts';
import { PILOT_RULESET } from '@/lib/pilot-data.ts';

interface Body {
  ruleset?: string;
  mode: Mode;
  side: Side;
  seed: string;
  teamIds: string[];
  stories?: string[];
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 400 });
  }

  const { mode, side, seed, teamIds } = body ?? {};
  if (
    (side !== 'hero' && side !== 'villain') ||
    typeof seed !== 'string' ||
    !seed ||
    !Array.isArray(teamIds) ||
    teamIds.length === 0 ||
    teamIds.length > 3
  ) {
    return NextResponse.json({ error: 'Bad run.' }, { status: 400 });
  }

  // The client sends what it played; the server replays the seed and stores its
  // own result, so a shared link can never show a run the engine did not make.
  let result;
  try {
    if (body.ruleset && body.ruleset !== PILOT_RULESET && body.ruleset !== 'curated-1') throw new Error('Unknown ruleset');
    if (body.ruleset && (side !== 'hero' || mode !== 'gauntlet')) throw new Error('Invalid pilot mode');
    result = body.ruleset === PILOT_RULESET ? runPilot(seed, teamIds) : body.ruleset === 'curated-1' ? runPilotV1(seed, teamIds) : runGauntlet(seed, side, teamIds, mode === 'daily' ? 'daily' : 'gauntlet');
  } catch {
    return NextResponse.json({ error: 'Invalid team or combat ruleset.' }, { status: 400 });
  }

  const store = getStore();
  const run: SavedRun = {
    id: newRunId(),
    createdAt: new Date().toISOString(),
    mode: mode === 'daily' ? 'daily' : 'gauntlet',
    side,
    seed,
    teamIds,
    result,
    stories: body.ruleset ? result.rounds.map(r => r.combat!.paragraphs.join('\n\n')) : (body.stories ?? []).slice(0, result.rounds.length).map((s) => String(s).slice(0, 2000)),
  };

  const replayLink = store.kind === 'memory' && !!body.ruleset;
  if (replayLink) run.id = pilotReplayId(seed, result.teamIds, run.createdAt, body.ruleset);
  await store.save(run);
  return NextResponse.json({
    id: run.id,
    url: `/run/${run.id}`,
    storage: store.kind,
    warning:
      replayLink
        ? 'Replay link ready. This link recreates your run without needing a saved database record.'
        : store.kind === 'memory'
        ? 'No DATABASE_URL set: this run is held in memory and will not survive a restart.'
        : undefined,
  });
}

export async function GET() {
  const store = getStore();
  const runs = await store.recent(12);
  return NextResponse.json({
    storage: store.kind,
    runs: runs.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      side: r.side,
      record: r.result.record,
      rankTitle: r.result.rankTitle,
      teamIds: r.teamIds,
    })),
  });
}
