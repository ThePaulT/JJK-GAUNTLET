'use client';
import { useState } from 'react';
import Link from 'next/link';
import { character } from '@/lib/data.ts';
import { PILOT_BOSSES, PILOT_ENCOUNTER_RULES, PILOT_PICKS, PILOT_PROFILES, PILOT_RULESET } from '@/lib/pilot-data.ts';
import { runPilot, type PilotRun } from '@/lib/pilot.ts';
import { PilotRoundView } from './pilot-round.tsx';
import { Portrait } from './portrait.tsx';
import { ShareButtons } from './share-buttons.tsx';

export function PilotGauntlet({ seed, onExit }: { seed: string; onExit: () => void }) {
  const [picks, setPicks] = useState<string[]>([]);
  const [run, setRun] = useState<PilotRun | null>(null);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const group = PILOT_PICKS[picks.length];
  const round = run?.rounds[index];
  const done = run && !round;
  function pick(id: string) {
    if (!group || !(group.ids as readonly string[]).includes(id) || picks.includes(id)) return;
    const next = [...picks, id]; setPicks(next);
    if (next.length === 3) setRun(runPilot(seed, next));
  }
  async function save() {
    if (!run || saving) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ruleset: PILOT_RULESET, mode: 'gauntlet', side: 'hero', seed, teamIds: picks }) });
      const data = await response.json();
      if (!response.ok || !data.id) throw new Error(data.error ?? 'Could not save this run. Try again.');
      setSaved(data.id); setMessage(data.warning ?? '');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save. Try again.'); }
    finally { setSaving(false); }
  }
  return <section className="flex flex-col gap-6">
    <header className="border-b border-sand pb-4"><p className="eyebrow">Hero Gauntlet · Curated draft</p><h1 className="display mt-2 text-3xl">{run ? 'Five bosses. One squad.' : `${picks.length + 1} / 3 · ${group.label}`}</h1><p className="mt-2 max-w-2xl text-sm text-ash">{run ? 'Wounds and spent techniques carry forward. A retry continues the same fight.' : 'Choose one fighter from each pair. Six distinct choices, eight possible squads.'}</p></header>
    {!run ? <>
      {picks.length > 0 && <div className="flex gap-3">{picks.map(id => <div key={id} className="flex items-center gap-2 text-xs"><Portrait id={id} size={32} />{character(id).name}</div>)}</div>}
      <p className="text-sm text-ash">{group.hint}</p>
      <div className="grid gap-4 sm:grid-cols-2">{group.ids.map(id => <button key={id} onClick={() => pick(id)} type="button" className="panel cursor-pointer overflow-hidden text-left hover:border-bone focus-visible:outline-2 focus-visible:outline-curse">
        <Portrait id={id} className="aspect-[4/3] w-full" />
        <div className="flex flex-col gap-2 p-5"><h2 className="display text-2xl">{character(id).name}</h2><p className="eyebrow">{PILOT_PROFILES[id].version}</p><p className="text-sm leading-6 text-ash">{PILOT_PROFILES[id].kit}</p><span className="mt-2 text-sm text-curse">Draft {character(id).name} →</span></div>
      </button>)}</div>
    </> : <>
      <ol className="grid grid-cols-5 gap-2" aria-label="Boss progress">{PILOT_BOSSES.map((id, i) => { const cleared = done ? i < run.rungsCleared : run.rounds.slice(0, index).some(r => r.rung === i && r.won); return <li key={id} aria-current={round?.rung === i ? 'step' : undefined} className={`border p-2 text-center ${round?.rung === i ? 'border-curse' : 'border-sand'}`}><Portrait id={id} className={`mx-auto aspect-square w-full max-w-14 ${cleared ? 'opacity-40' : ''}`} /><p className="mt-1 text-[10px] sm:text-xs">{character(id).name}</p><p className="text-[10px] text-curse">{cleared ? 'Cleared' : i + 1}</p></li>; })}</ol>
      {round && <><PilotRoundView key={index} round={round} /><button className="btn btn-primary self-start" type="button" onClick={() => { setIndex(i => i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{index === run.rounds.length - 1 ? 'See run result' : round.won ? 'Next boss →' : 'Continue with survivors →'}</button></>}
      {done && <div className="panel flex flex-col gap-5 p-6"><h2 className="display text-5xl">{run.fullClear ? 'Full clear' : run.record}</h2><p>{run.fullClear ? 'Your squad clears the ladder.' : `Stopped by ${run.rounds.at(-1)?.enemyLabel}.`}</p><div className="grid grid-cols-3 gap-3">{run.teamIds.map(id => <div key={id}><Portrait id={id} className={`aspect-square w-full ${run.survivorIds.includes(id) ? '' : 'grayscale opacity-40'}`} /><p className="mt-2 text-xs">{character(id).name}</p><p className="text-[11px] text-ash">{run.survivorIds.includes(id) ? 'Still standing' : 'Out of the run'}{run.mvpId === id ? ' · Most contribution' : ''}</p></div>)}</div><p className="text-sm text-ash">{run.rankTitle} · {run.xp} mastery XP</p><div className="flex flex-wrap gap-2">{saved ? <><Link href={`/run/${saved}`} className="btn">Open saved run</Link><ShareButtons id={saved} text={`${run.record} with ${run.teamIds.map(id => character(id).name).join(', ')}.`} /></> : <button type="button" className="btn" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save & share'}</button>}<button type="button" className="btn btn-primary" onClick={onExit}>Draft again</button></div>{message && <p role="status" className="text-xs text-blood">{message}</p>}<details><summary className="cursor-pointer text-sm">Read the full run</summary><div className="mt-4 flex flex-col gap-4">{run.rounds.map((r, i) => <PilotRoundView key={i} round={r} />)}</div></details></div>}
    </>}
    <details className="border-t border-sand pt-4 text-xs leading-6 text-ash"><summary className="cursor-pointer">Loadouts & encounter rules</summary><p className="mt-3">{PILOT_ENCOUNTER_RULES}</p>{Object.entries(PILOT_PROFILES).map(([id, p]) => <p className="mt-3" key={id}><strong className="text-bone">{character(id).name} — {p.version}.</strong> {p.limits}</p>)}<p className="mt-3">Seed: {seed} · Rules: {PILOT_RULESET}. Narration follows recorded combat events.</p></details>
  </section>;
}
