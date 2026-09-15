import { character } from '@/lib/data.ts';

import { Portrait } from './portrait.tsx';

const SIDE_ACCENT: Record<string, string> = {
  hero: 'text-curse',
  villain: 'text-blood',
};

export function Tag({ label }: { label: string }) {
  return (
    <span className="border border-sand px-1.5 py-0.5 text-[10px] tracking-[0.08em] text-ash">
      {label.replace(/_/g, ' ')}
    </span>
  );
}

export function CharacterCard({
  id,
  selected = false,
  disabled = false,
  compact = false,
  onPick,
  footer,
}: {
  id: string;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onPick?: () => void;
  footer?: React.ReactNode;
}) {
  const c = character(id);
  const Wrapper = onPick ? 'button' : 'div';

  return (
    <Wrapper
      {...(onPick ? { onClick: onPick, disabled, type: 'button' as const } : {})}
      className={[
        'panel flex w-full flex-col gap-2 p-4 text-left',
        selected ? 'border-bone' : '',
        onPick && !disabled ? 'hover:border-ash cursor-pointer' : '',
        disabled ? 'opacity-40' : '',
      ].join(' ')}
    >
      {compact ? (
        <div className="flex items-start gap-3">
          <Portrait id={id} size={44} className="shrink-0 border border-sand" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="display text-lg leading-tight">{c.name}</span>
              <span className={`shrink-0 whitespace-nowrap text-xs ${SIDE_ACCENT[c.side]}`}>
                {c.tier} · {c.power}
              </span>
            </div>
            <div className="eyebrow">{c.role.replace(/_/g, ' ')}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative aspect-[3/4] w-full border border-sand">
            <Portrait id={id} className="h-full w-full" />
            <span
              className={`absolute top-0 right-0 bg-ink/85 px-1.5 py-0.5 text-xs ${SIDE_ACCENT[c.side]}`}
            >
              {c.tier} · {c.power}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="display text-lg leading-tight">{c.name}</span>
            <span className="eyebrow">
              {c.role.replace(/_/g, ' ')}
              {c.rarity !== 'common' ? ` · ${c.rarity}` : ''}
            </span>
          </div>
        </>
      )}

      {!compact ? (
        <>
          <p className="text-xs leading-relaxed text-bone">{c.story_hook}</p>
          <div className="grid grid-cols-4 gap-1 text-[10px] text-ash">
            {(['ce', 'phy', 'tec', 'dom'] as const).map((k) => (
              <span key={k} className="flex justify-between border-t border-sand pt-1">
                <span className="uppercase">{k}</span>
                <span className="text-bone">{c.stats[k]}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {c.tags.slice(0, 5).map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
          {c.special ? (
            <p className="border-l-2 border-blood pl-2 text-[11px] leading-relaxed text-ash">
              {c.special.description}
            </p>
          ) : null}
        </>
      ) : null}
      {footer}
    </Wrapper>
  );
}
