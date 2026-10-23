// RFC 9116 security contact. Expires must be under a year out, so it's set at build time and renews with each deploy.
import type { APIRoute } from 'astro';
import { site } from '../../site.config';

export const GET: APIRoute = () => {
  const expires = new Date(Date.now() + 360 * 24 * 60 * 60 * 1000);

  const body = [
    `Contact: mailto:${site.email}`,
    `Expires: ${expires.toISOString()}`,
    'Preferred-Languages: en',
    `Canonical: ${new URL('/.well-known/security.txt', import.meta.env.SITE).href}`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
