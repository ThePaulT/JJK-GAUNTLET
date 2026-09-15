import { character } from '@/lib/data.ts';
import { makeRng } from '@/lib/rng.ts';

/**
 * A character's mark, drawn from their own stats rather than from artwork.
 *
 * The four axes are CE / PHY / TEC / DOM, so the shape says something true:
 * Maki (PHY 99, CE 0) is a spike to one side, Gojo (100/90/100/99) nearly
 * fills the frame, Mechamaru is all cursed energy and no body. The ticks
 * around the ring are seeded from the character id, so every mark is stable
 * and distinct without being random noise.
 */

const AXES = [
  { key: 'ce', angle: -90 },
  { key: 'phy', angle: 0 },
  { key: 'tec', angle: 90 },
  { key: 'dom', angle: 180 },
] as const;

const R = 38;
const CENTRE = 50;

function point(value: number, angle: number, radius = R): [number, number] {
  const rad = (angle * Math.PI) / 180;
  const r = (Math.max(value, 0) / 100) * radius;
  return [CENTRE + r * Math.cos(rad), CENTRE + r * Math.sin(rad)];
}

export function Sigil({
  id,
  size = 56,
  className = '',
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const c = character(id);
  const accent = c.side === 'hero' ? 'var(--color-curse)' : 'var(--color-blood)';

  const polygon = AXES.map(({ key, angle }) => point(c.stats[key], angle).join(',')).join(' ');

  // Ticks around the ring: a stable signature for the character, denser for
  // the ones with more going on.
  const rng = makeRng(`sigil:${c.id}`);
  const tickCount = 5 + Math.min(c.tags.length, 7);
  const ticks = Array.from({ length: tickCount }, () => {
    const angle = rng.range(0, 360);
    const len = rng.range(3, 7);
    const [x1, y1] = point(100, angle, R + 4);
    const [x2, y2] = point(100, angle, R + 4 + len);
    return { x1, y1, x2, y2 };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${c.name}: cursed energy ${c.stats.ce}, physical ${c.stats.phy}, technique ${c.stats.tec}, domain ${c.stats.dom}`}
    >
      <rect width="100" height="100" fill="var(--color-panel)" />
      <circle cx={CENTRE} cy={CENTRE} r={R} fill="none" stroke="var(--color-sand)" strokeWidth="1" />
      {AXES.map(({ angle }) => {
        const [x, y] = point(100, angle);
        return (
          <line
            key={angle}
            x1={CENTRE}
            y1={CENTRE}
            x2={x}
            y2={y}
            stroke="var(--color-sand)"
            strokeWidth="0.5"
          />
        );
      })}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={accent}
          strokeWidth="1"
          opacity="0.55"
        />
      ))}
      <polygon points={polygon} fill={accent} fillOpacity="0.2" stroke={accent} strokeWidth="1.75" />
      {AXES.map(({ key, angle }) => {
        const [x, y] = point(c.stats[key], angle);
        return c.stats[key] > 0 ? <circle key={key} cx={x} cy={y} r="1.8" fill={accent} /> : null;
      })}
    </svg>
  );
}
