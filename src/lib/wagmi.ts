import { createConfig } from 'wagmi';
import { chains } from './chain';
import { transports } from './viem';

export const config = createConfig({
  chains,
  transports,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
