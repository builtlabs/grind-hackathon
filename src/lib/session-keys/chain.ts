import { abstractTestnet } from 'viem/chains';

const chain = abstractTestnet;

export type SupportedChain = typeof chain;

export default chain;
