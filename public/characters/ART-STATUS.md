# Portrait coverage

46 of 48 roster portraits are installed as 512x512 WebP files (about 2 MB total).

Reggie and Haruta still use the procedural fallback. Add reggie.webp and haruta.webp here when available.

The Portrait component loads these files automatically in draft cards and avatars. The freestyle selector and the exported result cards (share card and OG image) now show them too.

One gotcha for the export path: next/og renders through satori, which decodes PNG, JPEG and SVG but NOT WebP — a WebP src renders as an empty box with no error. lib/portrait-url.ts fetches each portrait and converts it to a PNG data URI with sharp before handing it to the card.

Validation: filenames matched against all 48 database IDs; all 46 files decoded at 512x512; square thumbnails and 3:4 center crops visually reviewed. Gameplay code was not changed. Kurourushi uses the earlier portrait rather than the lost brightened revision.
