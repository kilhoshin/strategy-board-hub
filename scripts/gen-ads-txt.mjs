/**
 * Writes public/ads.txt from NEXT_PUBLIC_ADSENSE_CLIENT.
 *
 * AdSense flags accounts whose sites have no ads.txt ("Earnings at risk"), and
 * the file has to sit at the domain root. Generating it from the same env var
 * that switches the ad script on keeps the two from drifting apart.
 *
 * With no publisher id configured the file is removed, so a pre-AdSense deploy
 * never ships a placeholder.
 */
import { writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const TARGET = join(process.cwd(), 'public', 'ads.txt');
const client = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '').trim();

if (!client) {
  if (existsSync(TARGET)) {
    rmSync(TARGET);
    console.log('ads.txt removed (NEXT_PUBLIC_ADSENSE_CLIENT is not set)');
  }
  process.exit(0);
}

// AdSense wants the bare publisher id, without the "ca-" prefix.
const publisherId = client.replace(/^ca-/, '');
if (!/^pub-\d+$/.test(publisherId)) {
  console.error(
    `NEXT_PUBLIC_ADSENSE_CLIENT should look like "ca-pub-1234567890123456", got "${client}"`,
  );
  process.exit(1);
}

writeFileSync(TARGET, `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, 'utf8');
console.log(`ads.txt written for ${publisherId}`);
