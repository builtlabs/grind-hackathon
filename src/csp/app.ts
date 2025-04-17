import { type CspDirective } from './types';

const csp: CspDirective = {
  'connect-src': [], // TODO: add our domain
  'img-src': ['https://cdn.simpleicons.org', 'https://grind.bearish.af'], // TODO: add our domain
};

export default csp;
