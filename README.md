# Strategy Board Hub

Nine abstract strategy games — Gomoku, Reversi, Janggi, chess, shogi, Go, Bagh-Chal, Xiangqi
and Oware — each with a playable board and an AI opponent that runs entirely in the browser.
No server, no accounts, no database. Built as a static export so it can sit on any free static host.

Implements the plan in [`abstract-strategy-hub-dev-doc.md`](./abstract-strategy-hub-dev-doc.md).

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export into ./out
npm start            # serve ./out locally
```

## Tests

```bash
npm run test:engines   # rules + AI: chess perft, Go rules, self-play timing
npm run test:ui        # headless browser: plays one move per game against the worker AI
npm run test:ui:shots  # same, but writes screenshots to ./.screenshots
npm test               # engines -> build -> UI
```

`test:ui` needs a build first (it serves `./out`) and a Chromium download
(`npx playwright install chromium`).

---

## How it is put together

### Engines (`lib/games/`)

Every engine is a self-contained TypeScript module with the same shape: `initial()`,
`legalMoves()`, `apply()`, `outcome()` and `bestMove(state, level)`. State is plain JSON so
it can be posted to a worker.

| Game | Search | Notes |
|---|---|---|
| `gomoku.ts` | Alpha-beta over threat windows | Incremental evaluation: every 5-in-a-row window keeps live stone counts, so make/unmake is ~20 integer ops and scoring is O(1). Freestyle rules (no forbidden moves). |
| `reversi.ts` | Alpha-beta + exact endgame solve | Positional table, mobility and edge-stability terms; solves the last 12–18 empty squares to the final disc. |
| `chess.ts` | Alpha-beta + quiescence | 0x88 mailbox, full rules (castling, en passant, under-promotion, stalemate, threefold, fifty-move, insufficient material). MVV-LVA ordering, killer moves, capped check extensions. Verified against perft. |
| `janggi.ts` | Alpha-beta | Palace diagonals for general/guard/chariot/cannon/soldier, horse and elephant blocking, cannon screens (no cannon-over-cannon, no cannon-takes-cannon), passing, bikjang draw, four opening setups. |
| `shogi.ts` | Alpha-beta | Drops with nifu, last-rank and uchifuzume restrictions; optional and forced promotion; sennichite. Attack detection scans outward from the king via precomputed direction masks. |
| `go.ts` | Monte-Carlo tree search | UCT with eye-avoiding random playouts. Chinese area scoring, and dead stones are resolved by simulating the finished position a few hundred times rather than asking the player to mark them. |

All searches are **iterative deepening under a wall-clock budget**
(`TIME_BUDGET` in `lib/games/types.ts`), so a difficulty level is "how long may it think"
rather than a fixed depth — the engine always answers in bounded time regardless of device.

Difficulty 1 is deliberately weak (shallow plus noise); difficulty 4 spends ~4s per move.
Expect: strong club level in Reversi/Gomoku, decent amateur in chess/shogi/janggi, mid-kyu on
a 9×9 Go board. It is a browser, not a data centre.

### AI execution (`lib/ai/`)

`solve.ts` is the single dispatch entry point. `engine.worker.ts` wraps it in a Web Worker;
`useEngine.ts` posts positions to that worker and falls back to the main thread (after
yielding a frame) if the worker cannot be created. This keeps a four-second Go ponder from
freezing the page.

### AI hints

Chess, Janggi, shogi and Go carry an on-demand **AI suggestion** panel. Asking for one runs
the same bounded search that plays the opponent, at the player's current difficulty, and draws
the answer straight onto the board: a pulsing ring on the destination, a fainter dashed ring on
the origin, and a gold arrow between them. Drops (shogi) and passes (Go) mark only the target.

Two deliberate choices:

- **It can be switched off.** A toggle in the panel hides the control entirely and clears any
  visible suggestion; the preference persists in `localStorage`, so a player who does not want
  help never sees it again.
- **It says it can be wrong.** The disclaimer sits under the button in every locale and is not
  hedging — this is a few seconds of shallow browser search, so it is useful often and wrong
  regularly. It is presented as a second opinion, never as the answer.

Hints run with `silent: true` so the status line still reads "your move" rather than pretending
the opponent is thinking, and a suggestion is discarded if the player moves on before it lands.
The easy boards (Gomoku, Reversi) deliberately have no hint — they do not need one.

### Janggi for players who have never seen it

Janggi is the hardest of the six to pick up cold, because the pieces are hanja and two of them
(horse and elephant) can be shut down by a single blocker in a way chess has no equivalent for.
So the board is presentable three ways, chosen from the control panel and remembered per
browser:

| Mode | What you see | Who it is for |
|---|---|---|
| 漢字 | 楚漢 士象馬車包卒兵 | Players who already read the traditional set |
| Icons | crown, shield, tower, cannon, horse, elephant, pawn | Newcomers — each symbol is the most obvious picture of what the piece does |
| K G R | K G R C N E P | Board-game players who prefer chess-style initials (N for kNight, so nothing collides) |

Colours switch between **Cho / Han** (green vs red, as on a real set) and **White / Black**,
where Cho takes white because Cho moves first — the convention a chess player expects.

Two things are deliberately kept from the physical game. The **discs stay different sizes**
(general largest, then chariot/cannon, then horse/elephant, then guard/soldier) because that
hierarchy is a genuine playing aid, not decoration. And legal destinations are always dotted,
with capture targets ringed.

On top of that, selecting a horse or elephant marks the piece **blocking its leg** (멱) with a
red ✕ badge in the corner of that point — the badge sits in the corner rather than over the
piece, so you can still see what is doing the blocking. `blockedLegs()` in the engine only
reports legs that would otherwise have led somewhere, so the board never marks a direction that
ran off the edge anyway. A piece guide in the sidebar lists all seven pieces with a one-line
description of how each moves.

The icon mode is the default for English; the other locales default to hanja.

### Boards (`components/game/`)

`useMatch.ts` holds position history, drives the AI whenever it is its turn, and keeps undo
aligned to whole rounds. `shell.tsx` has the shared chrome (board frame, difficulty picker,
side picker, status bar, result overlay, move log). Each game then only implements its own
board rendering and input handling.

Boards are `container-type: inline-size`, so piece glyphs are sized in `cqw` — they scale
with the board rather than with the inherited font size.

`GameStage.tsx` defers every board and engine bundle via `next/dynamic`, so first paint is
markup and CSS only.

### i18n (`lib/i18n/`)

Four locales: English at the root, `ko` / `ja` / `zh` (Traditional) behind a path prefix.

Each locale is its own App Router **route group with its own root layout**
(`app/(en)`, `app/(ko)`, …), which is what makes `<html lang>` statically correct per locale
without a middleware rewrite. Those route files are generated:

```bash
npm run gen:routes    # edit scripts/gen-routes.mjs, not app/**/page.tsx
```

Content is not machine-translated boilerplate: each locale's rules, strategy and history text
is written for that audience's search intent (English leans tutorial, Japanese leans
"play now", Chinese targets Traditional-reading readers in TW/HK/SG).

### SEO (`lib/seo.ts`)

Per page: canonical URL, full `hreflang` set plus `x-default`, Open Graph, and JSON-LD —
`WebSite` + `ItemList` on the hub, `Game` + `FAQPage` + `BreadcrumbList` on each game page.
`app/sitemap.ts` emits every locale × page with alternates; `app/robots.ts` emits robots.txt.

Every game page carries rules, strategy, history and FAQ below the board, which is what keeps
it clear of "thin content" both for ranking and for AdSense review.

---

## Configuration

Set these before deploying (`.env.local`, or your host's env settings):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Origin used for canonical/hreflang/sitemap. **Set this** — it defaults to a placeholder. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-…`. Until set, no ad script loads and no slots render. |
| `NEXT_PUBLIC_AD_SLOT_TOP` | Hub, below the hero. |
| `NEXT_PUBLIC_AD_SLOT_MID` | Hub, between sections. |
| `NEXT_PUBLIC_AD_SLOT_UNDER_BOARD` | Game page, below the board. |
| `NEXT_PUBLIC_AD_SLOT_IN_ARTICLE` | Game page, inside the rules/strategy text. |

Ad slots deliberately never sit over or beside a board — misclick-prone placement next to
interactive content is a policy risk. In development, unconfigured slots render as a faint
dashed outline so the placements stay visible; in production they render nothing.

`public/ads.txt` is generated at build time from `NEXT_PUBLIC_ADSENSE_CLIENT` (see
`scripts/gen-ads-txt.mjs`) and is git-ignored. With no publisher id set, no file ships.

## Deploying, then AdSense — in that order

AdSense reviews a **live** site, so the site has to be up before you can apply. That makes it
two deploys:

1. **Deploy with ads off.** Point a domain you own at the site and set `NEXT_PUBLIC_SITE_URL`
   to it. Leave every AdSense variable blank — no ad script loads and no slots render. Submit
   `sitemap.xml` in Google Search Console.
2. **Let it gather some traffic.** A brand-new domain with no visitors is the most common
   rejection. The plan's advice holds: get the Gomoku page earning real search traffic first.
3. **Add the site in AdSense.** Google issues your `ca-pub-…` publisher id and asks you to put
   its snippet on the site to verify ownership.
4. **Set `NEXT_PUBLIC_ADSENSE_CLIENT` and redeploy.** That single variable turns on the
   AdSense script (which is the verification snippet) and generates `ads.txt`. Leave the four
   slot ids blank — during review there is nothing to show yet, and that is fine.
5. **Wait for the review.** Days to a few weeks.
6. **Once approved, create ad units,** then set the four `NEXT_PUBLIC_AD_SLOT_*` ids and
   redeploy. Ads appear.

Two things worth knowing before step 1: use a custom domain, because free platform subdomains
(`*.vercel.app`, `*.pages.dev`) are generally not accepted as AdSense sites; and the `/about`
and `/privacy` pages are review requirements, which is why they exist in all four locales.

## Hosting

`output: 'export'` writes a fully static `./out`. Any static host works:

- **Cloudflare Pages** — build `npm run build`, output directory `out`
- **Vercel** — auto-detected
- **Netlify** — publish directory `out`
- **GitHub Pages** — push `out/`

`trailingSlash: true` is on so directory-style URLs resolve on hosts without rewrite rules.

## Known limitations

- **Link prefetch is disabled** (`components/site/Link.tsx`). Next 16's per-segment prefetch
  asks for dot-joined payload paths that `output: 'export'` writes as nested directories, so
  every prefetch 404s. The pages are static HTML, so the cost of skipping prefetch is
  negligible.
- Gomoku is freestyle, not Renju — Black has no forbidden moves and keeps its first-move
  advantage.
- Go on 19×19 is much weaker than on 9×9; MCTS without a policy network does not scale to the
  full board in a browser time budget.
- Janggi scoring by point count (the 한 handicap) is not implemented; games end by checkmate,
  bikjang or the quiet-move limit.
