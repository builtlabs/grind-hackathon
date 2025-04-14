import { type CspDirective } from './types';

const csp: CspDirective = {
  'connect-src': ['https://*.rpc.privy.systems', 'https://auth.privy.io'],
  'frame-src': ['https://auth.privy.io'],
  'img-src': [
    'https://imagedelivery.net', // for abstract icon
  ],
};

export default csp;
