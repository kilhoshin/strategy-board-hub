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
check('home lists 6 game cards', (await page.locator('#games a[href]').count()) >= 6);
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
  { slug: 'gomoku', moves: ['H8'], probe: 'stones', want: 2 },
  { slug: 'reversi', moves: ['e3'], probe: 'stones', want: 6 },
  { slug: 'chess', moves: ['e2', 'e4'], probe: 'log', want: 1 },
  { slug: 'janggi', moves: ['14', '15'], probe: 'log', want: 2 },
  // 7七歩 -> 7六: files count right-to-left, ranks top-to-bottom.
  { slug: 'shogi', moves: ['77', '76'], probe: 'log', want: 2 },
  { slug: 'go', moves: ['E5'], probe: 'stones', want: 2 },
];

for (const { slug, moves, probe, want } of GAMES) {
  consoleErrors.length = 0;
  await page.goto(`${BASE}/${slug}/`, { waitUntil: 'networkidle' });

  // Wait for the deferred board bundle to mount.
  await page.waitForFunction(
    () => document.querySelectorAll('main button[aria-label]').length > 20,
    undefined,
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

  if (SHOTS) {
    // Let drop-in animations and scroll reveals settle before capturing.
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(SHOT_DIR, `${slug}.png`) });
  }
}

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
    await phone.screenshot({ path: join(SHOT_DIR, `mobile${path.replace(/\//g, '-')}png`) });
  }
}
await phone.close();

check('no 404 requests', missing.size === 0, [...missing].slice(0, 5).join(', '));

await browser.close();
server.close();

console.log(problems.length === 0 ? '\nAll UI checks passed.' : `\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
process.exit(problems.length === 0 ? 0 : 1);
