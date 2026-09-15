'use client';

import { useState } from 'react';

import { Sigil } from './sigil.tsx';

/**
 * Real artwork if you have the rights to some, the generated mark otherwise.
 *
 * Drop a file at public/characters/<id>.webp (or .png / .jpg) and it is used
 * automatically — no code change, no manifest. Anything missing falls back to
 * the sigil, which is why the repo ships with no images at all.
 */
const EXTENSIONS = ['webp', 'png', 'jpg'];

export function Portrait({
  id,
  size = 56,
  className = '',
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const [attempt, setAttempt] = useState(0);

  if (attempt >= EXTENSIONS.length) {
    return <Sigil id={id} size={size} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/characters/${id}.${EXTENSIONS[attempt]}`}
      alt=""
      width={size}
      height={size}
      className={`${className} object-cover`}
      style={{ width: size, height: size }}
      onError={() => setAttempt((n) => n + 1)}
    />
  );
}
