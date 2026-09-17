/**
 * Portraits for the OG and share-card renderers.
 *
 * next/og renders through satori, which decodes PNG, JPEG and SVG — but not
 * WebP, and the installed portraits are WebP. A WebP src renders as an empty
 * box with no error, so each one is fetched, converted with sharp and inlined
 * as a PNG data URI. Fetching over HTTP rather than reading from disk because
 * public/ assets are served from the CDN and are not reliably on the function's
 * filesystem.
 */

const EXTENSIONS = ['webp', 'png', 'jpg'];

/** Small enough to keep the data URI cheap, large enough for a 190px tile. */
const EDGE = 240;

async function loadOne(origin: string, id: string): Promise<string | null> {
  for (const ext of EXTENSIONS) {
    try {
      const response = await fetch(`${origin}/characters/${id}.${ext}`);
      if (!response.ok) continue;
      const input = Buffer.from(await response.arrayBuffer());
      const { default: sharp } = await import('sharp');
      const png = await sharp(input)
        .resize(EDGE, EDGE, { fit: 'cover', position: 'top' })
        .png()
        .toBuffer();
      return `data:image/png;base64,${png.toString('base64')}`;
    } catch {
      // Missing, unreachable, or undecodable: try the next extension, then
      // fall through to the lettered plate.
    }
  }
  return null;
}

export async function portraitUrls(origin: string, ids: string[]): Promise<(string | null)[]> {
  return Promise.all(ids.map((id) => loadOne(origin, id)));
}
