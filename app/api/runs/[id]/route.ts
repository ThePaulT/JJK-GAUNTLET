import { NextResponse } from 'next/server';

import { loadRun } from '@/lib/load-run.ts';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await loadRun(id);
  if (!run) return NextResponse.json({ error: 'No such run.' }, { status: 404 });
  return NextResponse.json(run);
}
