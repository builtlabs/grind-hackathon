import { env } from '@/env.mjs';
import { type CspDirective } from './types';

const csp: CspDirective =
  env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
    ? {
        'script-src': ['https://vercel.live'],
        'connect-src': ['https://vercel.live'],
        'frame-src': ['https://vercel.live'],
        'style-src': ['https://vercel.live'],
        'img-src': ['https://vercel.com'],
      }
    : {};

export default csp;
