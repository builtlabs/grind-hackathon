import { env } from '@/env.mjs';
import { type CspDirective } from './types';

const csp: CspDirective =
  env.NEXT_PUBLIC_VERCEL_ENV === 'development'
    ? {
        'script-src': ["'unsafe-eval'"],
      }
    : {};

export default csp;
