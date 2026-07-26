import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * `next/link` with prefetching switched off.
 *
 * Next 16's per-segment prefetch asks for dot-joined payload paths
 * (`/gomoku/__next.<id>.gomoku.txt`), but `output: 'export'` writes those
 * segments as nested directories (`/gomoku/__next.<id>/gomoku.txt`). Every
 * prefetch therefore 404s and is thrown away. Since the pages are static HTML
 * that load in a few milliseconds anyway, we skip the wasted round trips.
 */
export function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
