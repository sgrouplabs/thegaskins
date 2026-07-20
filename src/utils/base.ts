/**
 * base.ts — Base path utility for subpath deployment.
 *
 * Astro's `import.meta.env.BASE_URL` returns the configured `base` value,
 * but the trailing slash is inconsistent across Astro versions. This module
 * normalizes it so path concatenation always produces clean URLs:
 *   /tg/  +  vault  →  /tg/vault
 *   /tg/  +  /vault →  /tg/vault
 *   /tg/  +  /      →  /tg/
 *
 * Usage:
 *   import { withBase, BASE_URL } from '../utils/base';
 *   <a href={withBase('/vault')}>Vault</a>
 *   <link href={`${BASE_URL}favicon.svg`} />
 */

const RAW_BASE = import.meta.env.BASE_URL as string;
export const BASE_URL: string = RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`;

/**
 * Prefix a site-internal path with the configured base path.
 * Handles paths with or without leading slashes.
 */
export function withBase(path: string): string {
  if (path === '/' || path === '') return BASE_URL;
  return `${BASE_URL}${path.replace(/^\//, '')}`;
}
