import { type CspDirective } from './types';

const csp: CspDirective = {
  'connect-src': [
    'https://*.walletconnect.com',
    'https://*.walletconnect.org',
    'https://api.web3modal.org',
    'wss://relay.walletconnect.org',
  ],
  'frame-src': ['https://verify.walletconnect.org'],
  'img-src': ['https://explorer-api.walletconnect.com'],
};

export default csp;
