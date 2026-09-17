import { ImageResponse } from 'next/og';

import { ResultCard } from '@/lib/card.tsx';
import { portraitUrls } from '@/lib/portrait-url.ts';
import { cardFacts } from '@/lib/share.ts';
import { getStore } from '@/lib/store.ts';

/** The vertical card behind "Save image" — phone-story shaped. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await getStore().get(id);
  if (!run) return new Response('No such run.', { status: 404 });

  const { origin, host } = new URL(request.url);
  const teamImages = await portraitUrls(origin, run.teamIds);

  return new ImageResponse(
    (
      <ResultCard
        {...cardFacts(run)}
        width={1080}
        height={1920}
        url={`${host}/run/${id}`}
        fullClear={run.result.fullClear}
        teamImages={teamImages}
      />
    ),
    { width: 1080, height: 1920 },
  );
}
