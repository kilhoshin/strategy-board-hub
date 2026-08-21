/* Engine smoke tests. Run with: npx tsx scripts/engine-smoke.ts */
import * as gomoku from '../lib/games/gomoku';
import * as reversi from '../lib/games/reversi';
import * as chess from '../lib/games/chess';
import * as janggi from '../lib/games/janggi';
import * as shogi from '../lib/games/shogi';
import * as go from '../lib/games/go';
import * as baghchal from '../lib/games/baghchal';
import type { Level } from '../lib/games/types';

let failures = 0;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
}

/* ------------------------------- chess perft ------------------------------ */

function perft(state: chess.ChessState, depth: number): number {
  if (depth === 0) return 1;
  let n = 0;
  for (const m of chess.legalMoves(state)) {
    n += perft(chess.apply(state, m), depth - 1);
  }
  return n;
}

console.log('--- chess perft (start position) ---');
const cs = chess.initial();
check('perft(1) = 20', perft(cs, 1) === 20, String(perft(cs, 1)));
check('perft(2) = 400', perft(cs, 2) === 400, String(perft(cs, 2)));
check('perft(3) = 8902', perft(cs, 3) === 8902, String(perft(cs, 3)));

console.log('--- chess perft (kiwipete) ---');
const kiwi = chess.fromFen('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
const k1 = perft(kiwi, 1);
const k2 = perft(kiwi, 2);
check('kiwipete perft(1) = 48', k1 === 48, String(k1));
check('kiwipete perft(2) = 2039', k2 === 2039, String(k2));

/* --------------------------------- go rules -------------------------------- */

console.log('--- go rules ---');
{
  let s = go.initial(9);
  // Black surrounds a white stone at the corner and captures it.
  s = go.apply(s, 1); // B b9
  s = go.apply(s, 0); // W a9
  s = go.apply(s, 9); // B a8
  check('white stone captured', s.board[0] === 0 && s.captured[1] === 1, JSON.stringify(s.captured));

  // Suicide is rejected.
  let t = go.initial(9);
  t = go.apply(t, 1);
  t = go.apply(t, 40);
  t = go.apply(t, 9);
  t = go.apply(t, 41);
  check('suicide at a9 refused', !go.isLegal(t, 0) || t.board[0] === 0);

  const scored = go.finalScore(go.initial(9), 40);
  check('empty board scores as a draw-ish estimate', Number.isFinite(scored.margin));
}

/* ---------------------------- AI self-play sanity --------------------------- */

function timed<T>(fn: () => T): [T, number] {
  const t0 = Date.now();
  const v = fn();
  return [v, Date.now() - t0];
}

console.log('--- AI self-play (level 3) ---');
const LEVEL: Level = 3;

{
  let s = gomoku.initial();
  let worst = 0;
  for (let i = 0; i < 12 && !gomoku.outcome(s).over; i++) {
    const [m, ms] = timed(() => gomoku.bestMove(s, LEVEL));
    worst = Math.max(worst, ms);
    if (m === null) break;
    s = gomoku.apply(s, m);
  }
  check('gomoku 12 plies', s.history.length >= 5, `worst ${worst}ms`);
}

{
  let s = reversi.initial();
  let worst = 0;
  let plies = 0;
  while (!reversi.outcome(s).over && plies < 70) {
    const [m, ms] = timed(() => reversi.bestMove(s, LEVEL));
    worst = Math.max(worst, ms);
    if (m === null) break;
    s = reversi.apply(s, m);
    plies++;
  }
  const c = reversi.counts(s.board);
  check('reversi full game', reversi.outcome(s).over, `${c.black}-${c.white}, worst ${worst}ms`);
}

{
  let s = chess.initial();
  let worst = 0;
  for (let i = 0; i < 16 && !chess.outcome(s).over; i++) {
    const [m, ms] = timed(() => chess.bestMove(s, LEVEL));
    worst = Math.max(worst, ms);
    if (!m) break;
    s = chess.apply(s, m);
  }
  check('chess 16 plies', s.san.length >= 10, `${s.san.join(' ')} | worst ${worst}ms`);
}

{
  let s = janggi.initial();
  let worst = 0;
  for (let i = 0; i < 16 && !janggi.outcome(s).over; i++) {
    const [m, ms] = timed(() => janggi.bestMove(s, LEVEL));
    worst = Math.max(worst, ms);
    if (!m) break;
    s = janggi.apply(s, m);
  }
  check('janggi 16 plies', s.log.length >= 10, `worst ${worst}ms`);
}

{
  let s = shogi.initial();
  let worst = 0;
  for (let i = 0; i < 16 && !shogi.outcome(s).over; i++) {
    const [m, ms] = timed(() => shogi.bestMove(s, LEVEL));
    worst = Math.max(worst, ms);
    if (!m) break;
    s = shogi.apply(s, m);
  }
  check('shogi 16 plies', s.log.length >= 10, `${s.log.slice(0, 8).join(' ')} | worst ${worst}ms`);
}

{
  let s = go.initial(9);
  let worst = 0;
  let plies = 0;
  while (!go.outcome(s).over && plies < 40) {
    const [m, ms] = timed(() => go.bestMove(s, LEVEL));
    worst = Math.max(worst, ms);
    s = go.apply(s, m);
    plies++;
  }
  const score = go.finalScore(s, 120);
  check('go 9x9 self-play', plies > 10, `${plies} plies, worst ${worst}ms, B${score.black}/W${score.white}`);
}

{
  let s = baghchal.initial();
  let worst = 0;
  let plies = 0;
  while (!baghchal.outcome(s).over && plies < 400) {
    const [m, ms] = timed(() => baghchal.bestMove(s, LEVEL));
    worst = Math.max(worst, ms);
    if (!m) break;
    s = baghchal.apply(s, m);
    plies++;
  }
  const o = baghchal.outcome(s);
  check(
    'baghchal full game',
    o.over,
    `${plies} plies, winner ${o.winner} (${o.reason}), goats captured ${s.goatsCaptured}, worst ${worst}ms`,
  );
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
