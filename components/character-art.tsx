import { artFor } from '@/lib/art.ts';
import type { Art, Motif } from '@/lib/art.ts';
import { character } from '@/lib/data.ts';

/**
 * The generated poster for one character. Flat, two colours plus paper, drawn
 * as a screenprint would be: one silhouette, one effect layer, one frame.
 */

const W = 120;
const H = 160;

/** The body: a crest, not a portrait. Shape follows the character's role. */
function figure(role: string, accent: string, art: Art) {
  const stroke = { stroke: accent, strokeWidth: 2, fill: 'none' } as const;
  switch (role) {
    case 'frontliner':
      return (
        <g>
          <polygon points="60,44 88,66 82,124 38,124 32,66" fill={accent} fillOpacity="0.16" />
          <polygon points="60,44 88,66 82,124 38,124 32,66" {...stroke} />
          <line x1="60" y1="52" x2="60" y2="124" stroke={accent} strokeWidth="1" opacity="0.5" />
        </g>
      );
    case 'assassin':
      return (
        <g>
          <polygon points="60,30 70,74 64,128 56,128 50,74" fill={accent} fillOpacity="0.16" />
          <polygon points="60,30 70,74 64,128 56,128 50,74" {...stroke} />
          <line x1="88" y1="34" x2="34" y2="126" stroke="var(--color-bone)" strokeWidth="1.25" opacity="0.7" />
        </g>
      );
    case 'domain_user':
      return (
        <g>
          <circle cx="60" cy="86" r="34" {...stroke} />
          <circle cx="60" cy="86" r="24" stroke={accent} strokeWidth="1" fill={accent} fillOpacity="0.14" />
          <polygon points="60,58 78,86 60,114 42,86" fill={accent} fillOpacity="0.3" stroke={accent} strokeWidth="1.5" />
        </g>
      );
    case 'summoner':
      return (
        <g>
          <polygon points="60,56 76,86 60,116 44,86" {...stroke} fill={accent} fillOpacity="0.2" />
          {[0, 1, 2, 3].map((i) => {
            const angle = (art.rng.range(0, 360) * Math.PI) / 180;
            const r = 40 + i * 3;
            return (
              <polygon
                key={i}
                points={`${60 + r * Math.cos(angle)},${86 + r * Math.sin(angle) - 7} ${
                  60 + r * Math.cos(angle) + 7
                },${86 + r * Math.sin(angle) + 5} ${60 + r * Math.cos(angle) - 7},${
                  86 + r * Math.sin(angle) + 5
                }`}
                fill="var(--color-bone)"
                opacity="0.75"
              />
            );
          })}
        </g>
      );
    case 'controller':
      return (
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const angle = ((i / 9) * Math.PI * 2) - Math.PI / 2;
            return (
              <line
                key={i}
                x1={60 + 18 * Math.cos(angle)}
                y1={86 + 18 * Math.sin(angle)}
                x2={60 + 46 * Math.cos(angle)}
                y2={86 + 46 * Math.sin(angle)}
                stroke={accent}
                strokeWidth="1.25"
                opacity="0.65"
              />
            );
          })}
          <circle cx="60" cy="86" r="17" {...stroke} fill={accent} fillOpacity="0.2" />
        </g>
      );
    default: // support
      return (
        <g>
          <polygon points="52,50 76,72 70,122 34,122 30,72" {...stroke} fill={accent} fillOpacity="0.14" />
          <polygon
            points="76,64 92,80 88,122 68,122 66,80"
            stroke="var(--color-bone)"
            strokeWidth="1"
            fill="none"
            opacity="0.55"
          />
        </g>
      );
  }
}

/** The cursed technique, as an effect layer behind and over the figure. */
function effect(motif: Motif, art: Art) {
  const { accent, rng, intensity } = art;
  const n = (base: number) => Math.round(base * (0.6 + intensity * 0.8));

  switch (motif) {
    case 'void':
      return (
        <g>
          {[46, 36, 26, 16].map((r, i) => (
            <circle key={r} cx="60" cy="80" r={r} stroke={accent} strokeWidth={i === 0 ? 2 : 1} fill="none" opacity="0.8" />
          ))}
          <circle cx="60" cy="80" r="11" fill="var(--color-ink)" stroke="var(--color-bone)" strokeWidth="1" />
        </g>
      );
    case 'slash':
      return (
        <g>
          {Array.from({ length: n(5) }, (_, i) => {
            const y = 26 + rng.range(0, 110);
            const skew = rng.range(-26, 26);
            return (
              <line key={i} x1="4" y1={y} x2={W - 4} y2={y + skew} stroke={accent} strokeWidth={rng.range(0.8, 2.4)} opacity="0.85" />
            );
          })}
        </g>
      );
    case 'flame':
      return (
        <g>
          {Array.from({ length: n(6) }, (_, i) => {
            const x = 12 + (i * (W - 24)) / n(6);
            const h = rng.range(30, 70);
            return (
              <polygon
                key={i}
                points={`${x},${H - 8} ${x + 9},${H - 8 - h} ${x + 18},${H - 8}`}
                fill={accent}
                fillOpacity={0.5}
              />
            );
          })}
        </g>
      );
    case 'ice':
      return (
        <g>
          {Array.from({ length: n(7) }, (_, i) => {
            const angle = (i / n(7)) * Math.PI * 2;
            return (
              <polygon
                key={i}
                points={`60,80 ${60 + 58 * Math.cos(angle)},${80 + 58 * Math.sin(angle)} ${
                  60 + 12 * Math.cos(angle + 0.28)
                },${80 + 12 * Math.sin(angle + 0.28)}`}
                fill="var(--color-bone)"
                fillOpacity="0.14"
                stroke={accent}
                strokeWidth="0.75"
              />
            );
          })}
        </g>
      );
    case 'plant':
      return (
        <g>
          {Array.from({ length: n(4) }, (_, i) => {
            const x = 16 + i * 26;
            return (
              <g key={i}>
                <path d={`M${x},${H - 6} C${x + 10},${H - 50} ${x - 12},${H - 80} ${x + 6},${H - 120}`} stroke={accent} strokeWidth="1.5" fill="none" opacity="0.8" />
                {[0, 1, 2].map((k) => (
                  <polygon key={k} points={`${x + 4},${H - 40 - k * 26} ${x + 16},${H - 46 - k * 26} ${x + 5},${H - 52 - k * 26}`} fill={accent} fillOpacity="0.5" />
                ))}
              </g>
            );
          })}
        </g>
      );
    case 'blood':
      return (
        <g>
          {Array.from({ length: n(9) }, (_, i) => (
            <circle key={i} cx={rng.range(10, W - 10)} cy={rng.range(16, H - 16)} r={rng.range(2, 8)} fill={accent} fillOpacity="0.55" />
          ))}
        </g>
      );
    case 'electric':
      return (
        <g>
          {Array.from({ length: n(3) }, (_, i) => {
            let d = `M${rng.range(4, 30)},6`;
            for (let y = 6; y < H; y += 18) d += ` L${rng.range(10, W - 10)},${y + 18}`;
            return <path key={i} d={d} stroke={accent} strokeWidth="1.5" fill="none" opacity="0.9" />;
          })}
        </g>
      );
    case 'shikigami':
      return (
        <g>
          {Array.from({ length: n(5) }, (_, i) => {
            const x = rng.range(10, W - 30);
            const y = rng.range(16, H - 30);
            return (
              <polygon key={i} points={`${x},${y} ${x + 20},${y + 7} ${x + 4},${y + 16}`} fill="var(--color-bone)" fillOpacity="0.6" stroke={accent} strokeWidth="0.75" />
            );
          })}
        </g>
      );
    case 'soul':
      return (
        <g>
          {[52, 42, 32, 22, 12].map((r, i) => (
            <ellipse key={r} cx="60" cy="82" rx={r} ry={r * 0.78} stroke={accent} strokeWidth={i % 2 ? 0.75 : 1.5} fill="none" opacity="0.7" />
          ))}
        </g>
      );
    case 'speech':
      return (
        <g>
          {Array.from({ length: n(9) }, (_, i) => {
            const y = 20 + i * 13;
            const w = rng.range(24, W - 20);
            return <rect key={i} x={(W - w) / 2} y={y} width={w} height="3" fill={accent} fillOpacity="0.55" />;
          })}
        </g>
      );
    case 'swarm':
      return (
        <g>
          {Array.from({ length: n(40) }, (_, i) => (
            <circle key={i} cx={rng.range(6, W - 6)} cy={rng.range(10, H - 10)} r={rng.range(0.7, 2.1)} fill={accent} fillOpacity="0.8" />
          ))}
        </g>
      );
    case 'construct':
      return (
        <g>
          {Array.from({ length: n(16) }, (_, i) => (
            <rect key={i} x={10 + (i % 5) * 21} y={20 + Math.floor(i / 5) * 32} width={rng.range(7, 17)} height={rng.range(7, 17)} stroke={accent} strokeWidth="1" fill="none" opacity="0.75" />
          ))}
        </g>
      );
    case 'zero':
      return (
        <g>
          <rect x="44" y="0" width="32" height={H} fill="var(--color-ink)" />
          <line x1="44" y1="0" x2="44" y2={H} stroke="var(--color-bone)" strokeWidth="1" />
          <line x1="76" y1="0" x2="76" y2={H} stroke="var(--color-bone)" strokeWidth="1" />
        </g>
      );
    case 'luck':
      return (
        <g>
          {Array.from({ length: n(10) }, (_, i) => {
            const angle = (i / n(10)) * Math.PI * 2;
            return (
              <line key={i} x1="60" y1="80" x2={60 + 60 * Math.cos(angle)} y2={80 + 60 * Math.sin(angle)} stroke={accent} strokeWidth={i % 2 ? 0.75 : 2} opacity="0.8" />
            );
          })}
        </g>
      );
    default: // domain
      return (
        <g>
          {art.openDomain ? (
            <>
              <path d="M8,118 L60,24 L112,118" stroke={accent} strokeWidth="2" fill="none" />
              <path d="M20,140 L60,60 L100,140" stroke={accent} strokeWidth="1" fill="none" opacity="0.6" />
            </>
          ) : (
            <>
              <circle cx="60" cy="80" r="50" stroke={accent} strokeWidth="2" fill="none" />
              <circle cx="60" cy="80" r="40" stroke={accent} strokeWidth="0.75" fill="none" opacity="0.6" />
            </>
          )}
        </g>
      );
  }
}

export function CharacterArt({
  id,
  className = '',
  showName = false,
}: {
  id: string;
  className?: string;
  showName?: boolean;
}) {
  const c = character(id);
  const art = artFor(id);

  // Halftone, drawn once per character and stable.
  const dots = Array.from({ length: 150 }, (_, i) => ({
    cx: 4 + (i % 15) * 8,
    cy: 6 + Math.floor(i / 15) * 16,
    r: art.rng.range(0.25, 1.15),
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${c.name}, ${c.role.replace(/_/g, ' ')}`}
    >
      <rect width={W} height={H} fill="var(--color-panel)" />
      <g fill="var(--color-bone)" opacity="0.10">
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} />
        ))}
      </g>

      <text
        x="60"
        y="112"
        textAnchor="middle"
        fontSize="104"
        fontFamily="ui-serif, Georgia, serif"
        fill="var(--color-bone)"
        opacity="0.07"
      >
        {art.initial}
      </text>

      <g opacity="0.85">{effect(art.motif, art)}</g>
      {figure(art.role, art.accent, art)}

      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} fill="none" stroke="var(--color-sand)" />
      <line x1="0" y1="10" x2="10" y2="0" stroke={art.accent} strokeWidth="2" />
      <line x1={W} y1={H - 10} x2={W - 10} y2={H} stroke={art.accent} strokeWidth="2" />

      {showName ? (
        <>
          <rect x="0" y={H - 22} width={W} height="22" fill="var(--color-ink)" opacity="0.82" />
          <text x="7" y={H - 7} fontSize="10" fontFamily="ui-serif, Georgia, serif" fill="var(--color-bone)">
            {c.name.length > 19 ? `${c.name.slice(0, 18)}…` : c.name}
          </text>
        </>
      ) : null}
    </svg>
  );
}
