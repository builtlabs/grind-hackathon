import { fallback, http, createPublicClient as cpc } from 'viem';
import type { Chain, FallbackTransport, PublicClient } from 'viem';
import { chains } from './chain';

export const transports = chains.reduce<Record<number, FallbackTransport>>((acc, chain) => {
  acc[chain.id] = fallback([
    http(chain.rpcUrls.app.http[0]),
    http(chain.rpcUrls.alchemy.http[0]),
    http(),
  ]);
  return acc;
}, {});

export function createPublicClient<T extends Chain>(chain: T): PublicClient<FallbackTransport, T> {
  return cpc({
    chain,
    transport: transports[chain.id],
  });
}
