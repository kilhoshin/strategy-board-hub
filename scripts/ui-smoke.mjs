/**
 * Browser smoke test against the exported static site.
 * Serves ./out, then for each game clicks a legal move and waits for the AI to
 * reply, asserting that the Web Worker path actually works.
 *
 * Usage: node scripts/ui-smoke.mjs [--shots]
 */
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const OUT = resolve('out');
const SHOTS = process.argv.includes('--shots');
const SHOT_DIR = resolve('.screenshots');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2',
  '.ts': 'text/javascript; charset=utf-8',
};

async function tryFiles(pathname) {
  const candidates = [
    join(OUT, pathname),
    join(OUT, pathname, 'index.html'),
    join(OUT, `${pathname}.html`),
  ];
  for (const c of candidates) {
    try {
      const s = await stat(c);
      if (s.isFile()) return c;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = await tryFiles(pathname === '/' ? '/index.html' : pathname);
  if (!file) {
    if (process.env.DEBUG_404) console.log('404 raw=%s decoded=%s', req.url, pathname);
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  res.end(await readFile(file));
});

await new Promise((r) => server.listen(4321, r));
const BASE = 'http://127.0.0.1:4321';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

const problems = [];
const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('Failed to load resource')) {
    consoleErrors.push(m.text());
  }
});
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
const missing = new Set();
page.on('response', (r) => {
  if (r.status() === 404) missing.add(new URL(r.url()).pathname);
});

function check(name, ok, detail = '') {
  if (!ok) problems.push(`${name}${detail ? ` — ${detail}` : ''}`);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
}

if (SHOTS) await mkdir(SHOT_DIR, { recursive: true });

/* ------------------------------- home page -------------------------------- */

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
check('home renders hero', (await page.locator('h1').first().innerText()).length > 4);
check('home lists 9 game cards', (await page.locator('#games a[href]').count()) >= 9);
if (SHOTS) {
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(SHOT_DIR, 'home.png') });
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(SHOT_DIR, 'home-cards.png') });
  await page.evaluate(() => window.scrollTo(0, 0));
}

await page.goto(`${BASE}/ko/`, { waitUntil: 'networkidle' });
check('ko home html lang', (await page.getAttribute('html', 'lang')) === 'ko');
await page.goto(`${BASE}/zh/go/`, { waitUntil: 'networkidle' });
check('zh html lang is zh-Hant', (await page.getAttribute('html', 'lang')) === 'zh-Hant');

// Light theme must be legible too.
await page.goto(`${BASE}/reversi/`, { waitUntil: 'networkidle' });
await page.locator('header button[aria-label]').first().click();
check('light theme applied', (await page.getAttribute('html', 'data-theme')) === 'light');
if (SHOTS) {
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(SHOT_DIR, 'light-reversi.png') });
}
await page.locator('header button[aria-label]').first().click();

/* --------------------------- one move per game ---------------------------- */

/**
 * One concrete legal opening move per game (as aria-labels), plus how to tell
 * that a full round has been played. Stone games grow the board; piece games
 * keep the same piece count, so those are verified through the move log.
 */
const GAMES = [
  { slug: 'gomoku', moves: ['H8'], probe: 'stones', want: 2, hints: false },
  { slug: 'reversi', moves: ['e3'], probe: 'stones', want: 6, hints: false },
  { slug: 'chess', moves: ['e2', 'e4'], probe: 'log', want: 1, hints: true },
  { slug: 'janggi', moves: ['14', '15'], probe: 'log', want: 2, hints: true },
  // 7七歩 -> 7六: files count right-to-left, ranks top-to-bottom.
  { slug: 'shogi', moves: ['77', '76'], probe: 'log', want: 2, hints: true },
  { slug: 'go', moves: ['E5'], probe: 'stones', want: 2, hints: true },
  // Goat placement at the centre point (row 3, col 3); the tiger AI answers next.
  { slug: 'baghchal', moves: ['3-3'], probe: 'log', want: 2, hints: false },
  // Red cannon slides from file b to the centre file (no jump needed).
  { slug: 'xiangqi', moves: ['23', '53'], probe: 'log', want: 2, hints: true },
  // Sowing house A1 (4 seeds at the start) is always a legal opening move.
  // Oware has only 12 pits, well under the >20 threshold every other board clears.
  { slug: 'oware', moves: ['A1: 4'], probe: 'log', want: 2, hints: true, minButtons: 10 },
];

for (const { slug, moves, probe, want, hints, minButtons = 20 } of GAMES) {
  consoleErrors.length = 0;
  await page.goto(`${BASE}/${slug}/`, { waitUntil: 'networkidle' });

  // Wait for the deferred board bundle to mount.
  await page.waitForFunction(
    (min) => document.querySelectorAll('main button[aria-label]').length > min,
    minButtons,
    { timeout: 20000 },
  );
  check(`${slug}: board mounted`, true);

  for (const label of moves) {
    await page.locator(`main button[aria-label="${label}"]`).click({ timeout: 10000 });
  }

  // The AI answers on the worker thread; the position must advance within 25s.
  const responded = await page
    .waitForFunction(
      ({ probe, want }) => {
        if (probe === 'log') return document.querySelectorAll('aside ol li').length >= want;
        return (
          document.querySelectorAll('main button[aria-label] > span.rounded-full').length >= want
        );
      },
      { probe, want },
      { timeout: 25000 },
    )
    .then(() => true)
    .catch(() => false);

  check(`${slug}: AI responded`, responded);
  check(
    `${slug}: no console errors`,
    consoleErrors.length === 0,
    consoleErrors.slice(0, 2).join(' | '),
  );

  if (hints) {
    const panel = page.locator('aside section', { has: page.locator('button[role="switch"]') });
    check(`${slug}: hint panel present`, (await panel.count()) === 1);

    // Wait for our turn again, then ask for a suggestion.
    await page
      .waitForFunction(() => {
        const b = document.querySelector('aside button.btn-primary');
        return b instanceof HTMLButtonElement && !b.disabled;
      }, undefined, { timeout: 25000 })
      .catch(() => {});
    await panel.locator('button.btn-primary').click();

    const shown = await page
      .waitForSelector('main svg[role="img"]', { timeout: 25000 })
      .then(() => true)
      .catch(() => false);
    check(`${slug}: hint drawn on board`, shown);

    // The caveat must be visible whenever a suggestion is.
    const caveat = await panel.locator('p', { hasText: /.{40,}/ }).last().innerText();
    check(`${slug}: hint disclaimer shown`, caveat.length > 40);

    if (SHOTS) {
      await page.waitForTimeout(600);
      await page.screenshot({ path: join(SHOT_DIR, `hint-${slug}.png`) });
    }

    // Changing the position while a suggestion is on screen must not blow up:
    // the hint still points at a square the piece has just left.
    consoleErrors.length = 0;
    await page.getByRole('button', { name: /undo|무르기|待った|悔棋/i }).click();
    await page.waitForTimeout(700);
    check(
      `${slug}: position change with a hint shown is safe`,
      consoleErrors.length === 0,
      consoleErrors.slice(0, 2).join(' | '),
    );
    check(
      `${slug}: hint cleared once the position changes`,
      (await page.locator('main svg[role="img"]').count()) === 0,
    );

    // The toggle knob must sit inside its track in both positions.
    const knobFits = async () =>
      panel.locator('button[role="switch"]').evaluate((track) => {
        const knob = track.firstElementChild;
        const t = track.getBoundingClientRect();
        const k = knob.getBoundingClientRect();
        return k.left >= t.left - 0.5 && k.right <= t.right + 0.5;
      });
    check(`${slug}: hint toggle knob inside track (on)`, await knobFits());

    // Switching hints off must remove both the control and the overlay.
    await panel.locator('button[role="switch"]').click();
    check(`${slug}: hint toggle knob inside track (off)`, await knobFits());
    const gone =
      (await panel.locator('button.btn-primary').count()) === 0 &&
      (await page.locator('main svg[role="img"]').count()) === 0;
    check(`${slug}: hints can be turned off`, gone);
    await panel.locator('button[role="switch"]').click();
  }

  if (SHOTS) {
    // Let drop-in animations and scroll reveals settle before capturing.
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(SHOT_DIR, `${slug}.png`) });
  }
}

/* -------------------- janggi presentation for newcomers -------------------- */

await page.goto(`${BASE}/janggi/`, { waitUntil: 'networkidle' });
// A previous run may have persisted a preference; the default is what we test.
await page.evaluate(() => {
  localStorage.removeItem('sbh-janggi-style');
  localStorage.removeItem('sbh-janggi-colors');
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('main button[aria-label="14"]');

const iconCount = await page.locator('main button[aria-label="11"] span span svg').count();
check('janggi: english defaults to icons', iconCount === 1, String(iconCount));

await page.getByRole('radio', { name: 'K G R' }).click();
const letter = await page.locator('main button[aria-label="11"]').innerText();
check('janggi: letter mode shows chess initials', letter.trim() === 'R', letter.trim());

await page.getByRole('radio', { name: '漢字' }).click();
const hanja = await page.locator('main button[aria-label="11"]').innerText();
check('janggi: hanja mode restored', hanja.trim() === '車', hanja.trim());

// Selecting a horse must flag the piece blocking its leg (멱).
await page.locator('main button[aria-label="21"]').click();
const badges = await page.locator('main button[aria-label="31"] svg circle[fill="#cf5540"]').count();
check('janggi: blocked leg is marked', badges === 1);
// ...and the piece underneath must remain visible.
const stillThere = await page.locator('main button[aria-label="31"] > span.placed').count();
check('janggi: blocker piece still visible', stillThere === 1);

const legendRows = await page
  .locator('aside section', { hasText: 'Piece guide' })
  .locator('li')
  .count();
check('janggi: legend lists all seven pieces', legendRows === 7, String(legendRows));

// Regression: asking for a suggestion and then actually playing it used to
// crash, because the board rendered the new position for one frame while the
// hint still pointed at the square the piece had left.
await page.getByRole('radio', { name: 'Icons' }).click();
await page.locator('body').click({ position: { x: 5, y: 5 } });
consoleErrors.length = 0;
await page.locator('aside button.btn-primary').click();
await page.waitForSelector('main svg[role="img"]', { timeout: 25000 });
const suggested = await page.locator('aside p.display').first().innerText();
const coords = suggested.match(/(\d+)\s*→\s*(\d+)/);
check('janggi: suggestion is readable', !!coords, suggested);
if (coords) {
  await page.locator(`main button[aria-label="${coords[1]}"]`).click();
  await page.locator(`main button[aria-label="${coords[2]}"]`).click();
  await page.waitForTimeout(900);
  check(
    'janggi: playing the suggested move does not crash',
    consoleErrors.length === 0,
    consoleErrors.slice(0, 2).join(' | '),
  );
}

await page.getByRole('radio', { name: 'White / Black' }).click();
const persisted = await page.evaluate(() => [
  localStorage.getItem('sbh-janggi-style'),
  localStorage.getItem('sbh-janggi-colors'),
]);
check(
  'janggi: presentation choices persist',
  persisted[0] === 'icon' && persisted[1] === 'mono',
  persisted.join('/'),
);
if (SHOTS) {
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(SHOT_DIR, 'janggi-western.png') });
}
// Leave storage clean so the next run tests the real default again.
await page.evaluate(() => {
  localStorage.removeItem('sbh-janggi-style');
  localStorage.removeItem('sbh-janggi-colors');
});

/* ------------------------------ mobile layout ----------------------------- */

const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
for (const path of ['/ja/', '/ko/janggi/', '/zh/go/']) {
  await phone.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await phone.waitForTimeout(800);
  const overflows = await phone.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  check(`mobile ${path}: no horizontal overflow`, !overflows);
  if (SHOTS) {
    await phone.waitForTimeout(1200);
    const name = path.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
    await phone.screenshot({ path: join(SHOT_DIR, `mobile-${name}.png`) });
  }
}
await phone.close();

check('no 404 requests', missing.size === 0, [...missing].slice(0, 5).join(', '));

await browser.close();
server.close();

console.log(problems.length === 0 ? '\nAll UI checks passed.' : `\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
process.exit(problems.length === 0 ? 0 : 1);
