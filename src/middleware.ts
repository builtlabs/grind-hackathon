import { type NextURL } from 'next/dist/server/web/next-url';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from './env.mjs';
import { type CspDirective } from './csp/types';
import { sources } from './csp';
import { buildCspHeader, mergeCsp } from './csp/utils';

async function cspHeader(nonce: string) {
  const base: CspDirective = {
    'default-src': ["'self'"],
    'script-src': ["'self'", `'nonce-${nonce}'`, 'strict-dynamic'],
    'connect-src': ["'self'", env.NEXT_PUBLIC_VERCEL_URL],
    'child-src': ["'self'"],
    'frame-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"], // TODO: remove unsafe-inline
    'img-src': ["'self'", 'blob:', 'data:'],
    'media-src': ["'self'", 'blob:', 'data:'],
    'font-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'"],
    'upgrade-insecure-requests': [],
  };

  const csp = mergeCsp([base, ...sources]);
  return buildCspHeader(csp);
}

async function nextWithCSP(req: NextRequest, nonce: string) {
  const cspHeaderValue = await cspHeader(nonce);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeaderValue);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Content-Security-Policy', cspHeaderValue);
  response.headers.set('X-Frame-Options', 'DENY');

  return response;
}

async function redirectWithCSP(nonce: string, redirectUrl: string | NextURL | URL) {
  const cspHeaderValue = await cspHeader(nonce);
  const response = NextResponse.redirect(redirectUrl);
  response.headers.set('Content-Security-Policy', cspHeaderValue);
  response.headers.set('X-Frame-Options', 'DENY');

  return response;
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sanitizeCallbackUrl(callbackUrl: string, origin: string): string {
  if (!callbackUrl.startsWith(origin)) {
    return `${origin}/`;
  }
  return callbackUrl;
}

export function middleware(req: NextRequest) {
  const { pathname, search, origin, basePath, searchParams } = req.nextUrl;
  const cookieAuthToken = req.cookies.get('privy-token');
  const cookieSession = req.cookies.get('privy-session');
  const nonce = generateNonce();

  if (searchParams.get('privy_oauth_code')) {
    // Bypass CSP for OAuth callback
    return nextWithCSP(req, nonce);
  }

  if (pathname === '/refresh') {
    // Prevent infinite redirect loop
    return nextWithCSP(req, nonce);
  }

  const definitelyAuthenticated = Boolean(cookieAuthToken);
  const maybeAuthenticated = Boolean(cookieSession);

  if (!definitelyAuthenticated && maybeAuthenticated) {
    const redirectUrl = new URL(`${basePath}/refresh`, origin);
    redirectUrl.searchParams.append('callbackUrl', `${basePath}${pathname}${search}`);
    return redirectWithCSP(nonce, redirectUrl);
  }

  const protectedPaths = ['/profile'];
  if (!definitelyAuthenticated && !maybeAuthenticated && protectedPaths.includes(pathname)) {
    const redirectUrl = new URL(`${basePath}/signin`, origin);
    redirectUrl.searchParams.append('callbackUrl', `${basePath}${pathname}${search}`);
    return redirectWithCSP(nonce, redirectUrl);
  }

  if (definitelyAuthenticated && pathname.startsWith('/signin')) {
    const callbackUrl = sanitizeCallbackUrl(searchParams.get('callbackUrl') ?? '', origin);
    return redirectWithCSP(nonce, new URL(callbackUrl));
  }

  return nextWithCSP(req, nonce);
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|logo.png|opengraph-image.png|twitter-image.png|icon.png).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
