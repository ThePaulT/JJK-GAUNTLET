'use client';

import { useState } from 'react';

import { CharacterArt } from './character-art.tsx';

/**
 * Real artwork if you have the rights to some, the generated poster otherwise.
 *
 * Drop a file at public/characters/<id>.webp (or .png / .jpg) and it is used
 * automatically — no code change, no manifest. Anything missing falls back to
 * the generated art, which is why the repo ships with no images at all.
 */
const EXTENSIONS = ['webp', 'png', 'jpg'];

export function Portrait({
  id,
  size,
  ratio = 'square',
  className = '',
  showName = false,
}: {
  id: string;
  /** Pixel size of the short edge. Omit to fill the parent. */
  size?: number;
  ratio?: 'square' | 'poster';
  className?: string;
  showName?: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const style = size
    ? ratio === 'poster'
      ? { width: size, height: Math.round((size * 4) / 3) }
      : { width: size, height: size }
    : undefined;

  return (
    <span
      className={`block overflow-hidden ${className}`}
      style={style}
      // Fills the parent when no size is given.
      data-portrait={id}
    >
      {attempt >= EXTENSIONS.length ? (
        <CharacterArt id={id} className="h-full w-full" showName={showName} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/characters/${id}.${EXTENSIONS[attempt]}`}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setAttempt((n) => n + 1)}
        />
      )}
    </span>
  );
}
