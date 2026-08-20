/**
 * Offline puzzle generator for janggi and shogi (no public puzzle DB exists
 * for either, unlike chess — see scripts/import-chess-puzzles.ts).
 *
 * Strategy: self-play many games with the engine's own `bestMove`, which
 * naturally ends in checkmate more often than not (the engines are shallow
 * search, no draw-avoidance heuristics beyond the rules). The position right
 * before the final move is *always* a free mate-in-1 puzzle (that move is
 * literally what was just played). Walking further back, a position is kept
 * as a mate-in-2/3 puzzle only when a *deep* re-analysis (`analyzeRoot`)
 * independently confirms the move actually played is uniquely the engine's
 * top choice and delivers forced mate within that many of the winner's own
 * moves — this guards against just canonising a self-play blunder.
 *
 * Run: npx tsx scripts/gen-puzzles.ts
 */
import * as janggi from '../lib/games/janggi';
import * as shogi from '../lib/games/shogi';
import { makeRng, type Level, type Side } from '../lib/games/types';
import type { JanggiPuzzle, ShogiPuzzle, PuzzleTier } from '../lib/puzzles/types';
import * as fs from 'node:fs';
import * as path from 'node:path';

const QUOTA_PER_TIER = 10;
const MAX_ATTEMPTS = 400;
const MAX_PLIES = 150;
const PER_GAME_BUDGET_MS = 6 * 60 * 1000;
const DRIVE_LEVEL: Level = 2;
const ANALYZE_LEVEL: Level = 4;
const RANDOM_MOVE_CHANCE = 0.12;

interface Engine<S, M> {
  initial: () => S;
  legalMoves: (s: S) => M[];
  apply: (s: S, m: M) => S;
  outcome: (s: S) => { over: boolean; winner?: 0 | Side; reason?: string };
  bestMove: (s: S, level: Level) => M | null;
  analyzeRoot: (s: S, level: Level) => { move: M; score: number; mateIn?: number }[];
  turn: (s: S) => Side;
  fingerprint: (s: S) => string;
  movesEqual: (a: M, b: M) => boolean;
}

function playSelfPlay<S, M>(eng: Engine<S, M>, rng: () => number): { states: S[]; moves: M[] } {
  const states: S[] = [eng.initial()];
  const moves: M[] = [];
  for (let ply = 0; ply < MAX_PLIES; ply++) {
    const s = states[states.length - 1];
    if (eng.outcome(s).over) break;
    const legal = eng.legalMoves(s);
    let mv: M | null = null;
    if (legal.length > 0 && rng() < RANDOM_MOVE_CHANCE) {
      mv = legal[Math.floor(rng() * legal.length)];
    } else {
      mv = eng.bestMove(s, DRIVE_LEVEL);
    }
    if (mv === null) break;
    const next = eng.apply(s, mv);
    if (eng.fingerprint(next) === eng.fingerprint(s)) break; // stuck (e.g. forced pass loop)
    states.push(next);
    moves.push(mv);
  }
  return { states, moves };
}

function tryExtractPuzzle<S, M>(
  eng: Engine<S, M>,
  states: S[],
  moves: M[],
  winner: Side,
  tier: PuzzleTier,
): { start: number; solution: M[] } | null {
  const neededPlies = 2 * tier - 1;
  const n = states.length - 1; // total plies played
  if (n < neededPlies) return null;
  const startIndex = n - neededPlies;
  const puzzleState = states[startIndex];
  if (eng.turn(puzzleState) !== winner) return null;

  const solution = moves.slice(startIndex);
  const analysis = eng.analyzeRoot(puzzleState, ANALYZE_LEVEL);
  if (analysis.length === 0) return null;
  const [best, second] = analysis;
  if (!eng.movesEqual(best.move, solution[0])) return null;
  if (best.mateIn === undefined || best.mateIn > tier) return null;
  if (second && second.mateIn !== undefined && second.mateIn <= best.mateIn) return null;

  // Authoritative check: replay the whole line for real and confirm it mates.
  let sim = puzzleState;
  for (const mv of solution) {
    const legal = eng.legalMoves(sim);
    if (!legal.some((m) => eng.movesEqual(m, mv))) return null;
    sim = eng.apply(sim, mv);
  }
  const final = eng.outcome(sim);
  if (!final.over || final.winner !== winner || final.reason !== 'checkmate') return null;

  return { start: startIndex, solution };
}

function generateFor<S, M>(
  name: string,
  eng: Engine<S, M>,
  toPuzzle: (id: string, setupMoves: M[], solution: M[], sideToMove: Side, tier: PuzzleTier) => JanggiPuzzle | ShogiPuzzle,
): (JanggiPuzzle | ShogiPuzzle)[] {
  const quotas: Record<PuzzleTier, number> = { 1: QUOTA_PER_TIER, 2: QUOTA_PER_TIER, 3: QUOTA_PER_TIER };
  const results: (JanggiPuzzle | ShogiPuzzle)[] = [];
  const seen = new Set<string>();
  const started = Date.now();
  let attempt = 0;

  while (
    (quotas[1] > 0 || quotas[2] > 0 || quotas[3] > 0) &&
    attempt < MAX_ATTEMPTS &&
    Date.now() - started < PER_GAME_BUDGET_MS
  ) {
    attempt++;
    const rng = makeRng(0x9e3779b9 ^ (attempt * 2654435761));
    const { states, moves } = playSelfPlay(eng, rng);
    const finalOutcome = eng.outcome(states[states.length - 1]);
    if (!finalOutcome.over || finalOutcome.reason !== 'checkmate' || !finalOutcome.winner) continue;
    const winner = finalOutcome.winner as Side;

    for (const tier of [1, 2, 3] as PuzzleTier[]) {
      if (quotas[tier] <= 0) continue;
      const found = tryExtractPuzzle(eng, states, moves, winner, tier);
      if (!found) continue;
      const fp = eng.fingerprint(states[found.start]);
      if (seen.has(fp)) continue;
      seen.add(fp);
      quotas[tier]--;
      const id = `${name}-t${tier}-${results.length + 1}`;
      results.push(toPuzzle(id, moves.slice(0, found.start), found.solution, eng.turn(states[found.start]), tier));
      console.log(
        `[${name}] tier ${tier} puzzle #${QUOTA_PER_TIER - quotas[tier]}/${QUOTA_PER_TIER} (attempt ${attempt})`,
      );
    }
  }

  console.log(
    `[${name}] done: ${results.length} puzzles (t1=${QUOTA_PER_TIER - quotas[1]} t2=${QUOTA_PER_TIER - quotas[2]} t3=${QUOTA_PER_TIER - quotas[3]}) after ${attempt} attempts, ${((Date.now() - started) / 1000).toFixed(0)}s`,
  );
  return results;
}

function writeModule(file: string, typeName: string, varName: string, data: unknown[]) {
  const body = `// Auto-generated by scripts/gen-puzzles.ts — do not hand-edit.\nimport type { ${typeName} } from './types';\n\nexport const ${varName}: ${typeName}[] = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(file, body);
  console.log(`wrote ${file} (${data.length} puzzles)`);
}

/* --------------------------------- janggi -------------------------------- */

const janggiEngine: Engine<janggi.JanggiState, janggi.JanggiMove> = {
  initial: janggi.initial,
  legalMoves: (s) => janggi.legalMoves(s).filter((m) => m.from >= 0),
  apply: janggi.apply,
  outcome: janggi.outcome,
  bestMove: janggi.bestMove,
  analyzeRoot: janggi.analyzeRoot,
  turn: (s) => s.turn,
  fingerprint: (s) => `${s.board.join(',')}|${s.turn}`,
  movesEqual: (a, b) => a.from === b.from && a.to === b.to,
};

const janggiPuzzles = generateFor('janggi', janggiEngine, (id, setupMoves, solution, sideToMove, tier) => ({
  id,
  sideToMove,
  solution,
  setupMoves,
  tier,
  source: 'generated',
})) as JanggiPuzzle[];

/* --------------------------------- shogi --------------------------------- */

const shogiEngine: Engine<shogi.ShogiState, shogi.ShogiMove> = {
  initial: shogi.initial,
  legalMoves: shogi.legalMoves,
  apply: shogi.apply,
  outcome: shogi.outcome,
  bestMove: shogi.bestMove,
  analyzeRoot: shogi.analyzeRoot,
  turn: (s) => s.turn,
  fingerprint: (s) => `${s.board.join(',')}|${s.hands[1].join(',')}|${s.hands[2].join(',')}|${s.turn}`,
  movesEqual: (a, b) => a.from === b.from && a.to === b.to && !!a.promote === !!b.promote && a.drop === b.drop,
};

const shogiPuzzles = generateFor('shogi', shogiEngine, (id, setupMoves, solution, sideToMove, tier) => ({
  id,
  sideToMove,
  solution,
  setupMoves,
  tier,
  source: 'generated',
})) as ShogiPuzzle[];

/* ---------------------------------- write --------------------------------- */

const outDir = path.join(__dirname, '..', 'lib', 'puzzles');
writeModule(path.join(outDir, 'janggi.ts'), 'JanggiPuzzle', 'JANGGI_PUZZLES', janggiPuzzles);
writeModule(path.join(outDir, 'shogi.ts'), 'ShogiPuzzle', 'SHOGI_PUZZLES', shogiPuzzles);
