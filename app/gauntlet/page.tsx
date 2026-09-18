import { GauntletGame } from '@/components/gauntlet-game.tsx';

export const metadata = { title: 'Gauntlet — JJK Gauntlet' };

export default function GauntletPage() {
  return (
    <GauntletGame
      mode="gauntlet"
      intro={
        <header className="flex flex-col gap-2 border-b border-sand pb-4">
          <span className="eyebrow">Gauntlet</span>
          <h1 className="display text-3xl">Pick a side.</h1>
          <p className="max-w-2xl text-sm text-ash">
            Draft your trio and face five bosses. Try the new curated Hero Gauntlet,
            with connected fight narratives and injuries that carry forward.
          </p>
        </header>
      }
    />
  );
}
