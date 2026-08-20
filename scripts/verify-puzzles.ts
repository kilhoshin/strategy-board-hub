/**
 * Replays every puzzle's setup + solution through the real engine and
 * confirms it is legal and actually ends in checkmate for the solver. This is
 * the authoritative check — analyzeRoot's heuristic candidate search (used at
 * generation/import time) is a *finder*, not a source of truth.
 *
 * Run with: npx tsx scripts/verify-puzzles.ts
 */
import * as chess from '../lib/games/chess';
import * as janggi from '../lib/games/janggi';
import * as shogi from '../lib/games/shogi';
import type { Side } from '../lib/games/types';
import { CHESS_PUZZLES } from '../lib/puzzles/chess';
import { JANGGI_PUZZLES } from '../lib/puzzles/janggi';
import { SHOGI_PUZZLES } from '../lib/puzzles/shogi';

let failures = 0;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
}

interface Engine<S, M> {
  legalMoves: (s: S) => M[];
  apply: (s: S, m: M) => S;
  outcome: (s: S) => { over: boolean; winner?: 0 | Side; reason?: string };
  movesEqual: (a: M, b: M) => boolean;
}

function verify<S, M>(
  name: string,
  base: S,
  setupMoves: M[],
  solution: M[],
  sideToMove: Side,
  eng: Engine<S, M>,
) {
  let state = base;
  for (const m of [...setupMoves, ...solution]) {
    const legal = eng.legalMoves(state);
    const match = legal.find((x) => eng.movesEqual(x, m));
    if (!match) {
      check(name, false, 'illegal move in setup/solution');
      return;
    }
    state = eng.apply(state, match);
  }
  const outcome = eng.outcome(state);
  check(
    name,
    outcome.over && outcome.reason === 'checkmate' && outcome.winner === sideToMove,
    JSON.stringify(outcome),
  );
}

console.log(`--- chess (${CHESS_PUZZLES.length} puzzles) ---`);
for (const p of CHESS_PUZZLES) {
  verify(`chess ${p.id} (t${p.tier})`, chess.fromFen(p.fen), p.setupMoves, p.solution, p.sideToMove, {
    legalMoves: chess.legalMoves,
    apply: chess.apply,
    outcome: chess.outcome,
    movesEqual: (a, b) => a.from === b.from && a.to === b.to && (a.promo ?? 0) === (b.promo ?? 0),
  });
}

console.log(`--- janggi (${JANGGI_PUZZLES.length} puzzles) ---`);
for (const p of JANGGI_PUZZLES) {
  verify(`janggi ${p.id} (t${p.tier})`, janggi.initial(), p.setupMoves, p.solution, p.sideToMove, {
    legalMoves: janggi.legalMoves,
    apply: janggi.apply,
    outcome: janggi.outcome,
    movesEqual: (a, b) => a.from === b.from && a.to === b.to,
  });
}

console.log(`--- shogi (${SHOGI_PUZZLES.length} puzzles) ---`);
for (const p of SHOGI_PUZZLES) {
  verify(`shogi ${p.id} (t${p.tier})`, shogi.initial(), p.setupMoves, p.solution, p.sideToMove, {
    legalMoves: shogi.legalMoves,
    apply: shogi.apply,
    outcome: shogi.outcome,
    movesEqual: (a, b) =>
      a.from === b.from && a.to === b.to && !!a.promote === !!b.promote && a.drop === b.drop,
  });
}

console.log(failures === 0 ? '\nAll puzzles verified.' : `\n${failures} puzzle(s) failed verification.`);
process.exit(failures === 0 ? 0 : 1);
