import { type CspDirective } from './types';

const csp: CspDirective = {
  'connect-src': ['https://www.hashcrash.xyz/'],
  'img-src': [
    'https://www.hashcrash.xyz/',
    'https://cdn.simpleicons.org',
    'https://grind.bearish.af',
  ],
};

export default csp;
