'use client';

import Link from 'next/link';
import { useState } from 'react';

import { character } from '@/lib/data.ts';
import { randomSeed } from '@/lib/rng.ts';
import { runSolo } from '@/lib/solo.ts';
import {
  SOLO_ASSUMPTIONS,
  SOLO_BOSSES,
  SOLO_FIGHTERS,
  SOLO_PROFILES,
  SOLO_RULESET,
  soloRuling,
  type SoloFighterId,
} from '@/lib/solo-data.ts';
import type { RunResult } from '@/lib/engine.ts';

import { Portrait } from './portrait.tsx';
import { ShareButtons } from './share-buttons.tsx';
import { SoloRoundView } from './solo-round.tsx';

export function SoloGauntlet() {
  const [run, setRun] = useState<RunResult | null>(null);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const round = run?.rounds[index];
  const finished = !!run && !!round && (!round.won || index === run.rounds.length - 1);

  function start(fighterId: SoloFighterId) {
    setRun(runSolo(randomSeed(), fighterId));
    setIndex(0);
    setSaved(null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    if (!run || saving) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ruleset: SOLO_RULESET, mode: 'gauntlet', side: 'hero', seed: run.seed, teamIds: run.teamIds }),
      });
      const data = await response.json() as { id?: string; error?: string; warning?: string };
      if (!response.ok || !data.id) throw new Error(data.error ?? 'Could not create the replay link.');
      setSaved(data.id);
      setMessage(data.warning ?? 'Replay link ready.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create the replay link.');
    } finally {
      setSaving(false);
    }
  }

  if (!run) {
    return (
      <div className="flex flex-col gap-7">
        <header className="border-b border-sand pb-5">
          <p className="eyebrow">Solo Gauntlet · Authored matchups</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">One fighter. Five bosses.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ash">Choose a sorcerer or draw one at random. Every matchup has a reviewed default result with a short explanation. Keep climbing until your fighter loses.</p>
          <button type="button" className="btn btn-primary mt-5" onClick={() => start(SOLO_FIGHTERS[Math.floor(Math.random() * SOLO_FIGHTERS.length)]!)}>Random fighter</button>
        </header>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="eyebrow">Choose your fighter</p><h2 className="display mt-1 text-2xl">Six reviewed versions</h2></div><span className="text-xs text-ash">30 authored rulings</span></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOLO_FIGHTERS.map((id) => <button key={id} type="button" onClick={() => start(id)} className="panel group cursor-pointer overflow-hidden text-left hover:border-bone focus-visible:outline-2 focus-visible:outline-curse">
              <Portrait id={id} className="aspect-[4/3] w-full" />
              <div className="p-5"><h3 className="display text-2xl">{character(id).name}</h3><p className="eyebrow mt-1">{SOLO_PROFILES[id].version}</p><p className="mt-3 line-clamp-3 text-sm leading-6 text-ash">{SOLO_PROFILES[id].loadout}</p><span className="mt-4 block text-sm text-curse">Enter gauntlet →</span></div>
            </button>)}
          </div>
        </section>

        <details className="border-t border-sand pt-4 text-sm text-ash">
          <summary className="cursor-pointer text-bone">Rules for every fight</summary>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-6">{SOLO_ASSUMPTIONS.map(rule => <li key={rule}>{rule}</li>)}</ul>
          <p className="mt-4 text-xs">Results are transparent game rulings, not canon facts or simulated win percentages. Close alternatives appear only where a specific condition could plausibly change the default.</p>
        </details>

        <details className="border-t border-sand pt-4 text-sm text-ash">
          <summary className="cursor-pointer text-bone">Review the complete default matrix</summary>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left text-xs">
              <thead><tr className="border-b border-sand"><th className="p-2 font-normal text-ash">Fighter</th>{SOLO_BOSSES.map(id => <th key={id} className="p-2 font-normal text-ash">{character(id).name}</th>)}</tr></thead>
              <tbody>{SOLO_FIGHTERS.map(fighterId => <tr key={fighterId} className="border-b border-sand"><th className="p-2 font-medium text-bone">{character(fighterId).name}</th>{SOLO_BOSSES.map(bossId => { const ruling = soloRuling(fighterId, bossId); const wins = ruling.winner === 'fighter'; return <td key={bossId} className={`p-2 ${wins ? 'text-curse' : 'text-blood'}`}>{wins ? 'Win' : 'Loss'} · {ruling.verdict}</td>; })}</tr>)}</tbody>
            </table>
          </div>
          <p className="mt-3 text-xs">The run stops at the first loss. Later matchups are still authored and covered by the same ruleset.</p>
        </details>
      </div>
    );
  }

  const fighterId = run.teamIds[0] as SoloFighterId;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-sand pb-4">
        <div><p className="eyebrow">Solo Gauntlet · {character(fighterId).name}</p><h1 className="display mt-1 text-3xl">How far can one fighter go?</h1><p className="mt-2 text-sm text-ash">Every round starts fresh. The ruling stays fixed unless the declared conditions change.</p></div>
        <button type="button" className="btn" onClick={() => setRun(null)}>Change fighter</button>
      </header>

      <ol className="grid grid-cols-5 gap-2" aria-label="Boss ladder">
        {SOLO_BOSSES.map((id, i) => {
          const cleared = i < run.rungsCleared;
          const current = i === round?.rung;
          const stopped = finished && current && !round.won;
          return <li key={id} aria-current={current ? 'step' : undefined} className={`border p-2 text-center ${current ? 'border-blood bg-panel-2' : 'border-sand'}`}><Portrait id={id} className={`mx-auto aspect-square w-full max-w-14 ${cleared ? 'opacity-40' : ''}`} /><p className="mt-1 truncate text-[10px] sm:text-xs">{character(id).name}</p><p className={`text-[10px] ${cleared ? 'text-curse' : stopped ? 'text-blood' : 'text-ash'}`}>{cleared ? 'Cleared' : stopped ? 'Stopped' : i + 1}</p></li>;
        })}
      </ol>

      {round ? <SoloRoundView round={round} /> : null}

      {!finished && round?.won ? <button type="button" className="btn btn-primary self-start" onClick={() => { setIndex(value => value + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Next boss →</button> : null}

      {finished ? <section className="panel flex flex-col gap-5 border-l-4 border-l-blood p-6">
        <div><p className="eyebrow">Final record</p><h2 className="display mt-1 text-5xl">{run.fullClear ? 'Full clear' : run.record}</h2><p className="mt-2 text-sm text-ash">{run.fullClear ? `${character(fighterId).name} clears the entire ladder.` : `${character(fighterId).name} clears ${run.rungsCleared} of 5 and stops at ${round.enemyLabel}.`}</p></div>
        <div className="flex flex-wrap gap-2">{saved ? <><Link href={`/run/${saved}`} className="btn">Open replay</Link><ShareButtons id={saved} text={`${run.record} with ${character(fighterId).name} in the Solo Gauntlet.`} /></> : <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Creating link…' : 'Save & share'}</button>}<button type="button" className="btn" onClick={() => setRun(null)}>Try another fighter</button></div>
        {message ? <p role="status" className="text-xs text-ash">{message}</p> : null}
        {run.rungsCleared > 0 ? <details className="border-t border-sand pt-4"><summary className="cursor-pointer text-sm">Review cleared fights</summary><div className="mt-4 flex flex-col gap-4">{run.rounds.filter(r => r.won && r !== round).map(r => <SoloRoundView key={r.rung} round={r} />)}</div></details> : null}
      </section> : null}

      <details className="border-t border-sand pt-4 text-sm text-ash"><summary className="cursor-pointer text-bone">Run assumptions</summary><ul className="mt-4 list-disc space-y-2 pl-5">{SOLO_ASSUMPTIONS.map(rule => <li key={rule}>{rule}</li>)}</ul><p className="mt-3 text-xs">Ruleset {SOLO_RULESET} · run {run.seed}</p></details>
    </div>
  );
}
