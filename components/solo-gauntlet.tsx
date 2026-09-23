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
  soloGamble,
  soloRuling,
  type SoloApproachId,
  type SoloFighterId,
} from '@/lib/solo-data.ts';
import type { RunResult } from '@/lib/engine.ts';

import { Portrait } from './portrait.tsx';
import { ShareButtons } from './share-buttons.tsx';
import { SoloRoundView } from './solo-round.tsx';

export function SoloGauntlet() {
  const [run, setRun] = useState<RunResult | null>(null);
  const [choices, setChoices] = useState<SoloApproachId[]>([]);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const round = run?.rounds[index];
  const revealed = choices.length > index;
  const finished = !!run && !!round && revealed && (!round.won || index === SOLO_BOSSES.length - 1);

  function start(fighterId: SoloFighterId) {
    setRun(runSolo(randomSeed(), fighterId));
    setChoices([]);
    setIndex(0);
    setSaved(null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function choose(approach: SoloApproachId) {
    if (!run || revealed) return;
    const nextChoices = [...choices, approach];
    setChoices(nextChoices);
    setRun(runSolo(run.seed, run.teamIds[0]!, nextChoices));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    if (!run || !finished || saving) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ruleset: SOLO_RULESET,
          mode: 'gauntlet',
          side: 'hero',
          seed: run.seed,
          teamIds: run.teamIds,
          soloChoices: choices,
        }),
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
          <p className="eyebrow">Solo Gauntlet · Authored combat paths</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">One fighter. Five bosses.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ash">
            Choose a coherent character version, then decide how they approach each fight. Every result follows an authored opening, interaction and consequence—never a hidden power score.
          </p>
          <button type="button" className="btn btn-primary mt-5" onClick={() => start(SOLO_FIGHTERS[Math.floor(Math.random() * SOLO_FIGHTERS.length)]!)}>Random fighter</button>
        </header>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="eyebrow">Choose your fighter</p><h2 className="display mt-1 text-2xl">Twelve reviewed versions</h2></div>
            <span className="text-xs text-ash">60 standard rulings · 12 scoped gambles</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOLO_FIGHTERS.map((id) => (
              <button key={id} type="button" onClick={() => start(id)} className="panel group cursor-pointer overflow-hidden text-left hover:border-bone focus-visible:outline-2 focus-visible:outline-curse">
                <Portrait id={id} className="aspect-[4/3] w-full" />
                <div className="p-5">
                  <h3 className="display text-2xl">{character(id).name}</h3>
                  <p className="eyebrow mt-1">{SOLO_PROFILES[id].version}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-ash">{SOLO_PROFILES[id].loadout}</p>
                  <span className="mt-4 block text-sm text-curse">Enter gauntlet →</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <details className="border-t border-sand pt-4 text-sm text-ash">
          <summary className="cursor-pointer text-bone">Rules for every fight</summary>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-6">{SOLO_ASSUMPTIONS.map(rule => <li key={rule}>{rule}</li>)}</ul>
          <p className="mt-4 text-xs">Canon facts, matchup inferences and game rulings are kept distinct. A seeded branch appears only when both listed executions are credible.</p>
        </details>

        <details className="border-t border-sand pt-4 text-sm text-ash">
          <summary className="cursor-pointer text-bone">Review the standard-path matrix</summary>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left text-xs">
              <thead><tr className="border-b border-sand"><th className="p-2 font-normal text-ash">Fighter</th>{SOLO_BOSSES.map(id => <th key={id} className="p-2 font-normal text-ash">{character(id).name}</th>)}</tr></thead>
              <tbody>{SOLO_FIGHTERS.map(fighterId => <tr key={fighterId} className="border-b border-sand"><th className="p-2 font-medium text-bone">{character(fighterId).name}</th>{SOLO_BOSSES.map(bossId => { const ruling = soloRuling(fighterId, bossId); const wins = ruling.winner === 'fighter'; return <td key={bossId} className={`p-2 ${wins ? 'text-curse' : 'text-blood'}`}>{wins ? 'Win' : 'Loss'} · {ruling.verdict}</td>; })}</tr>)}</tbody>
            </table>
          </div>
          <p className="mt-3 text-xs">Limit-break options are intentionally absent where a costly commitment would not create a distinct credible path.</p>
        </details>
      </div>
    );
  }

  const fighterId = run.teamIds[0] as SoloFighterId;
  const bossId = SOLO_BOSSES[index]!;
  const gamble = soloGamble(fighterId, bossId);
  const mutual = revealed && round?.solo?.winner === 'mutual';
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-sand pb-4">
        <div>
          <p className="eyebrow">Solo Gauntlet · {character(fighterId).name}</p>
          <h1 className="display mt-1 text-3xl">Choose the commitment.</h1>
          <p className="mt-2 max-w-2xl text-sm text-ash">Ordinary state resets between rungs. Death, terminal collapse or inability to continue ends the run even if the boss falls too.</p>
        </div>
        <button type="button" className="btn" onClick={() => setRun(null)}>Change fighter</button>
      </header>

      <ol className="grid grid-cols-5 gap-2" aria-label="Boss ladder">
        {SOLO_BOSSES.map((id, rungIndex) => {
          const cleared = rungIndex < run.rungsCleared;
          const current = rungIndex === round?.rung;
          const stopped = finished && current && !round.won;
          return <li key={id} aria-current={current ? 'step' : undefined} className={`border p-2 text-center ${current ? 'border-blood bg-panel-2' : 'border-sand'}`}><Portrait id={id} className={`mx-auto aspect-square w-full max-w-14 ${cleared ? 'opacity-40' : ''}`} /><p className="mt-1 truncate text-[10px] sm:text-xs">{character(id).name}</p><p className={`text-[10px] ${cleared ? 'text-curse' : stopped ? 'text-blood' : 'text-ash'}`}>{cleared ? 'Cleared' : stopped ? mutual ? 'Both fell' : 'Stopped' : rungIndex + 1}</p></li>;
        })}
      </ol>

      {!revealed ? (
        <section className="panel p-5 sm:p-7">
          <p className="eyebrow">Boss {index + 1} · {character(bossId).name}</p>
          <h2 className="display mt-2 text-3xl">How does {character(fighterId).name} commit?</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <button type="button" onClick={() => choose('measured')} className="border border-sand p-5 text-left hover:border-curse focus-visible:outline-2 focus-visible:outline-curse">
              <span className="eyebrow text-curse">Standard path</span>
              <strong className="mt-2 block text-lg">Fight the disciplined line</strong>
              <span className="mt-2 block text-sm leading-6 text-ash">Build the safest demonstrated opening and preserve extreme options unless the fight forces them.</span>
            </button>
            {gamble ? (
              <button type="button" onClick={() => choose('limit-break')} className="border border-blood p-5 text-left hover:border-bone focus-visible:outline-2 focus-visible:outline-blood">
                <span className="eyebrow text-blood">Limit-break</span>
                <strong className="mt-2 block text-lg">{gamble.label}</strong>
                <span className="mt-2 block text-sm leading-6 text-ash">{gamble.commit}</span>
                <span className="mt-3 block text-xs text-blood">Cost: {gamble.costHint}</span>
              </button>
            ) : (
              <div className="border border-sand p-5 text-sm leading-6 text-ash">
                <span className="eyebrow">No limit-break offered</span>
                <p className="mt-2">This matchup has no second commitment that is both meaningfully different and supported by the declared version.</p>
              </div>
            )}
          </div>
        </section>
      ) : round ? <SoloRoundView round={round} /> : null}

      {revealed && !finished && round?.won ? <button type="button" className="btn btn-primary self-start" onClick={() => { setIndex(value => value + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Next boss →</button> : null}

      {finished && round ? <section className="panel flex flex-col gap-5 border-l-4 border-l-blood p-6">
        <div>
          <p className="eyebrow">Final record</p>
          <h2 className="display mt-1 text-5xl">{run.fullClear ? 'Full clear' : run.record}</h2>
          <p className="mt-2 text-sm text-ash">{run.fullClear
            ? `${character(fighterId).name} clears the entire ladder.`
            : mutual
              ? `${character(fighterId).name} defeats ${round.enemyLabel}, but the terminal cost ends the run with ${run.rungsCleared} surviving clears.`
              : `${character(fighterId).name} clears ${run.rungsCleared} of 5 and stops at ${round.enemyLabel}.`}</p>
        </div>
        <div className="flex flex-wrap gap-2">{saved ? <><Link href={`/run/${saved}`} className="btn">Open replay</Link><ShareButtons id={saved} text={`${run.record} with ${character(fighterId).name} in the Solo Gauntlet.`} /></> : <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Creating link…' : 'Save & share'}</button>}<button type="button" className="btn" onClick={() => setRun(null)}>Try another fighter</button></div>
        {message ? <p role="status" className="text-xs text-ash">{message}</p> : null}
        {run.rungsCleared > 0 ? <details className="border-t border-sand pt-4"><summary className="cursor-pointer text-sm">Review cleared fights</summary><div className="mt-4 flex flex-col gap-4">{run.rounds.filter(r => r.won && r !== round).map(r => <SoloRoundView key={r.rung} round={r} />)}</div></details> : null}
      </section> : null}

      <details className="border-t border-sand pt-4 text-sm text-ash"><summary className="cursor-pointer text-bone">Run assumptions</summary><ul className="mt-4 list-disc space-y-2 pl-5">{SOLO_ASSUMPTIONS.map(rule => <li key={rule}>{rule}</li>)}</ul><p className="mt-3 text-xs">Ruleset {SOLO_RULESET} · run {run.seed}</p></details>
    </div>
  );
}
