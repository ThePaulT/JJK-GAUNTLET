'use client';

import { useEffect, useMemo, useState } from 'react';
import { battleBeats } from '@/lib/battle.ts';
import { character, DB, RULES } from '@/lib/data.ts';
import type { RunResult } from '@/lib/engine.ts';
import { Portrait } from './portrait.tsx';
import { RoundView } from './round-view.tsx';

export function BattleTheater({ run, stories, onComplete }: {
  run: RunResult; stories: Record<number, string>; onComplete: () => void;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const round = run.rounds[roundIndex];
  const beats = useMemo(() => battleBeats(round), [round]);
  const beat = beats[beatIndex];
  const final = beat.effect === 'result';
  const domainActive = beats.slice(0, beatIndex + 1).some((b) => b.effect === 'domain');
  const past = run.rounds.slice(0, roundIndex);
  const weakening = past.filter((r) => r.rung === round.rung && !r.won).length * RULES.loss_opponent_weaken;
  const out = new Set([...past.flatMap((r) => r.fellIds), ...(final ? round.fellIds : [])]);

  // Pause at each outcome so casualties and retries can be understood.
  useEffect(() => {
    if (!playing || final) return;
    const timer = window.setTimeout(() => setBeatIndex((i) => i + 1), 3500);
    return () => window.clearTimeout(timer);
  }, [playing, final, beatIndex, roundIndex]);

  function next() {
    if (!final) setBeatIndex((i) => i + 1);
    else if (roundIndex < run.rounds.length - 1) { setRoundIndex((i) => i + 1); setBeatIndex(0); }
    else onComplete();
  }

  return <section className="flex flex-col gap-4" aria-label="Battle playback">
    <ol className="grid grid-cols-5 gap-2" aria-label="Five boss ladder">
      {DB.ladders[run.side].rungs.map((id, i) => {
        const cleared = past.some((r) => r.rung === i && r.won) || (final && round.rung === i && round.won);
        return <li key={id} aria-current={round.rung === i ? 'step' : undefined} className={`boss-stop ${round.rung === i ? 'boss-current' : ''} ${cleared ? 'boss-cleared' : ''}`}>
          <Portrait id={id} className="mx-auto aspect-square w-full max-w-16" />
          <span className="mt-1 block text-[10px] sm:text-xs">{character(id).name}</span>
          <span className="eyebrow">{cleared ? 'Clear' : i + 1}</span>
        </li>;
      })}
    </ol>
    <div className="flex flex-wrap justify-between gap-2 text-xs text-ash">
      <span>Boss {round.rung + 1} / 5 · Encounter {roundIndex + 1}</span>
      <span>{weakening ? `Worn down: −${weakening} legacy boss rating` : 'First clash with this boss'}</span>
    </div>
    <div className={`battle-arena panel ${domainActive ? 'domain-active' : ''}`}>
      <div className="relative z-10 flex justify-between border-b border-sand p-3">
        <span className="eyebrow">Your squad</span><span className="eyebrow">{domainActive ? 'Inside the domain' : 'The challenger'}</span>
      </div>
      <div key={`${roundIndex}-${beatIndex}`} className={`battle-stage effect-${beat.effect}`}>
        <div className="battle-squad">
          {run.teamIds.map((id) => <div key={id} className={`battle-fighter ${out.has(id) ? 'fighter-out' : ''} ${beat.actors.includes(id) ? 'fighter-active' : ''}`}>
            <Portrait id={id} className="aspect-square w-full" />
            <div className="fighter-label">{character(id).name}<span>{out.has(id) ? 'Knocked out' : character(id).techniques[0]}</span></div>
          </div>)}
        </div>
        <span className="battle-vs" aria-hidden="true">VS</span>
        <div className={`battle-boss ${final && round.won ? 'fighter-out' : ''}`}>
          <Portrait key={round.enemyIds[0]} id={round.enemyIds[0]} className="aspect-square w-full" />
          <div className="fighter-label">{round.enemyLabel}<span>{final && round.won ? 'Defeated' : character(round.enemyIds[0]).techniques[0]}</span></div>
        </div>
        <div className="battle-impact" aria-hidden="true" />
      </div>
      <div className="relative z-10 border-t border-sand bg-panel p-4 sm:p-6" aria-live="polite" aria-atomic="true">
        <div className="mb-3 flex gap-2" aria-label={`Act ${beat.act} of 3`}>
          {['Opening', 'Turning point', 'Decisive exchange'].map((label, i) => <span key={label} className={`act-label ${beat.act === i + 1 ? 'act-current' : ''}`}>{i + 1}. {label}</span>)}
        </div>
        <h2 className="display text-2xl sm:text-4xl">{beat.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-bone/80">{beat.caption}</p>
        {final ? <p className="mt-3 font-mono text-xs text-ash">Combat score: {round.teamScore} — {round.enemyScore}{round.upset ? ' · Counter upset overrides score' : ''}</p> : null}
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn btn-primary" onClick={next}>{final ? roundIndex === run.rounds.length - 1 ? 'See run result' : round.won ? 'Next boss →' : 'Send survivors back →' : 'Next exchange →'}</button>
      {!final ? <><button type="button" className="btn" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Autoplay'}</button><button type="button" className="btn" onClick={() => setBeatIndex(beats.length - 1)}>Skip to outcome</button></> : null}
      <span className="ml-auto font-mono text-xs text-ash">{beatIndex + 1} / {beats.length}</span>
    </div>
    {final ? <details className="panel p-4"><summary className="cursor-pointer text-sm">Full battle recap & score breakdown</summary><div className="mt-4"><RoundView round={round} story={stories[roundIndex]} showBreakdown /></div></details> : null}
  </section>;
}
