import { chains } from '@/lib/chain';
import { type CspDirective } from './types';

const csp: CspDirective = {
  'connect-src': chains
    .map(chain => [
      ...chain.rpcUrls.default.http, // to support fallback rpc urls
      ...chain.rpcUrls.app.webSocket, // to support wss connections
    ])
    .flat()
    .map(src => new URL(src).origin),
  'img-src': ['https://*.llamao.fi'], // for chain icons
};

export default csp;
