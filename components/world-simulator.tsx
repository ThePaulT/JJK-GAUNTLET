'use client';

import { useMemo, useState } from 'react';

import { randomSeed } from '@/lib/rng.ts';
import { WORLD_APPROACHES, WORLD_MATCHUPS, worldCharacter, worldMatchup } from '@/lib/world/data.ts';
import { simulateWorldFight, worldOutcomeDistribution } from '@/lib/world/engine.ts';
import type { WorldApproach, WorldMatchupId, WorldSimulationResult } from '@/lib/world/types.ts';

import { Portrait } from './portrait.tsx';

const APPROACHES = Object.keys(WORLD_APPROACHES) as WorldApproach[];
const CONFIDENCE = { canon: 'Canon rule', inferred: 'Matchup inference', prototype: 'Prototype rule' } as const;

export function WorldSimulator() {
  const [matchupId, setMatchupId] = useState<WorldMatchupId>('yuji-mahito');
  const [approach, setApproach] = useState<WorldApproach>('adaptive');
  const [seed, setSeed] = useState('WORLD001');
  const [result, setResult] = useState<WorldSimulationResult | null>(null);
  const matchup = worldMatchup(matchupId);
  const fighter = worldCharacter(matchup.fighterId);
  const opponent = worldCharacter(matchup.opponentId);
  const distribution = useMemo(
    () => result ? worldOutcomeDistribution({ matchupId, approach, seed: result.seed, sampleSize: 48 }) : null,
    [result, matchupId, approach],
  );

  function chooseMatchup(id: WorldMatchupId) {
    setMatchupId(id);
    setResult(null);
  }

  function run(nextSeed = seed) {
    const normalized = nextSeed.trim().toUpperCase() || randomSeed();
    setSeed(normalized);
    setResult(simulateWorldFight({ matchupId, approach, seed: normalized }));
    window.setTimeout(() => document.getElementById('world-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  function runAnother() {
    run(randomSeed());
  }

  return (
    <div className="world-shell">
      <section className="world-hero">
        <div>
          <p className="eyebrow text-curse">World-1 prototype</p>
          <h1 className="display mt-3 max-w-3xl text-5xl leading-[0.95] sm:text-7xl">The fight obeys the world.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ash sm:text-lg">
            Choose the encounter and the opening intent. The engine resolves legal actions, counters,
            domains and consequences—then the story reports what actually happened.
          </p>
        </div>
        <div className="world-principles" aria-label="Simulation principles">
          <span>Hard lore gates</span><span>Bounded variation</span><span>Replayable seed</span>
        </div>
      </section>

      <section className="world-step" aria-labelledby="matchup-heading">
        <div className="world-step-heading"><span>01</span><div><p className="eyebrow">Choose the test</p><h2 id="matchup-heading" className="display text-3xl">Three fights. Three rule systems.</h2></div></div>
        <div className="matchup-grid">
          {WORLD_MATCHUPS.map((item) => {
            const a = worldCharacter(item.fighterId);
            const b = worldCharacter(item.opponentId);
            const active = item.id === matchupId;
            return (
              <button key={item.id} type="button" aria-pressed={active} onClick={() => chooseMatchup(item.id)} className={`matchup-card ${active ? 'matchup-card-active' : ''}`}>
                <div className="matchup-art"><Portrait id={a.id} className="h-full w-1/2" /><Portrait id={b.id} className="h-full w-1/2" /></div>
                <div className="p-4 sm:p-5">
                  <p className="eyebrow">{item.mechanic}</p>
                  <h3 className="display mt-2 text-2xl">{a.shortName} <span className="text-ash">vs</span> {b.shortName}</h3>
                  <p className="mt-3 text-sm leading-6 text-ash">{item.promise}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="world-step" aria-labelledby="intent-heading">
        <div className="world-step-heading"><span>02</span><div><p className="eyebrow">Set the opening intent</p><h2 id="intent-heading" className="display text-3xl">Guide the tactic, not the outcome.</h2></div></div>
        <div className="intent-grid">
          {APPROACHES.map((id) => {
            const item = WORLD_APPROACHES[id];
            return <button key={id} type="button" aria-pressed={approach === id} onClick={() => { setApproach(id); setResult(null); }} className={`intent-card ${approach === id ? 'intent-card-active' : ''}`}><strong>{item.label}</strong><span>{item.description}</span></button>;
          })}
        </div>
      </section>

      <section className="launch-panel">
        <div className="min-w-0">
          <p className="eyebrow">Locked encounter</p>
          <p className="mt-2 text-sm leading-6 text-bone">{matchup.lockedConditions.join(' · ')}</p>
          <details className="mt-3 text-xs leading-5 text-ash">
            <summary className="cursor-pointer text-curse">Versions and loadouts</summary>
            <p className="mt-3"><strong className="text-bone">{fighter.name} — {fighter.version}.</strong> {fighter.loadout}</p>
            <p className="mt-2"><strong className="text-bone">{opponent.name} — {opponent.version}.</strong> {opponent.loadout}</p>
          </details>
        </div>
        <button type="button" className="world-launch" onClick={() => run()}>Simulate fight <span aria-hidden="true">→</span></button>
      </section>

      {result && distribution ? (
        <section id="world-result" className="result-shell" aria-live="polite">
          <header className="result-header">
            <div>
              <p className="eyebrow">Resolved by {result.decisiveRule}</p>
              <h2 className="display mt-2 text-4xl sm:text-6xl">{worldCharacter(result.winnerId).shortName} wins.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ash">{result.verdict} This is one legal branch—not a fixed matchup verdict.</p>
            </div>
            <div className="result-winner"><Portrait id={result.winnerId} className="h-full w-full" /><span>Winner</span></div>
          </header>

          <div className="result-meta"><span><b>Seed</b> {result.seed}</span><span><b>Intent</b> {WORLD_APPROACHES[result.approach].label}</span><span><b>Fight form</b> {result.fightForm}</span></div>

          <section className="story-grid" aria-label="Fight story">
            {result.story.map((beat, index) => <article key={beat.phase}><span className="story-number">0{index + 1}</span><p className="eyebrow">{beat.label}</p><p className="mt-3 text-sm leading-7">{beat.text}</p><p className="mt-4 text-[10px] tracking-widest text-ash">{beat.eventIds.join(' · ')}</p></article>)}
          </section>

          <div className="result-grid">
            <section className="result-panel">
              <p className="eyebrow">Final state</p>
              <div className="mt-4 space-y-4">
                {result.finalStates.map((finalState) => <div key={finalState.id} className="state-row"><Portrait id={finalState.id} size={48} /><div><strong>{worldCharacter(finalState.id).shortName}</strong><p>{finalState.conditionLabel} · CE {finalState.ceLabel} · {finalState.technique.replace('-', ' ')}</p>{finalState.effects.length ? <p>{finalState.effects.join(' · ')}</p> : null}</div></div>)}
              </div>
            </section>
            <section className="result-panel">
              <p className="eyebrow">Outcome field · 48 legal seeds</p>
              <div className="mt-5 space-y-5">
                {distribution.outcomes.map((outcome) => <div key={outcome.winnerId}><div className="flex justify-between gap-4 text-sm"><span>{worldCharacter(outcome.winnerId).shortName} wins</span><span className="text-ash">{outcome.count} / {distribution.sampleSize}</span></div><div className="outcome-track"><span style={{ width: `${(outcome.count / distribution.sampleSize) * 100}%` }} /></div></div>)}
              </div>
              <p className="mt-5 text-xs leading-5 text-ash">This is a prototype branch distribution, not a claim of canon probability. Every branch still needs an executable win condition.</p>
            </section>
          </div>

          <details className="mechanics-drawer">
            <summary>Why this happened <span>View {result.events.length} resolved events</span></summary>
            <ol className="event-log">
              {result.events.map((event) => <li key={event.id}><div className="event-index">{event.id}</div><div><div className="flex flex-wrap items-center gap-2"><strong>{event.title}</strong><span className={`confidence confidence-${event.confidence}`}>{CONFIDENCE[event.confidence]}</span></div><p className="mt-2 text-sm leading-6 text-ash">{event.basis}</p><div className="mt-3 flex flex-wrap gap-2">{event.changes.map((change) => <span key={change}>{change}</span>)}</div>{event.uncertainty ? <p className="mt-3 text-xs text-curse">Seeded only here: {event.uncertainty.label}.</p> : null}</div></li>)}
            </ol>
          </details>

          <div className="result-actions"><button type="button" className="world-launch" onClick={runAnother}>Run another branch</button><button type="button" className="btn" onClick={() => run(result.seed)}>Replay exact seed</button></div>
        </section>
      ) : null}

      <section id="system-rules" className="system-rules">
        <p className="eyebrow">What the engine will never do</p>
        <div><p>Give a fighter an unavailable technique.</p><p>Ignore a domain without a legal response.</p><p>Turn randomness into unexplained power.</p><p>Let narration change the resolved events.</p></div>
      </section>
    </div>
  );
}
