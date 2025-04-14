import { type CspDirective } from './types';

const csp: CspDirective = {
  'img-src': ['https://static.alchemyapi.io'], // for the simulation result token icons
  'connect-src': ['https://*.g.alchemy.com'], // rpc
};

export default csp;
