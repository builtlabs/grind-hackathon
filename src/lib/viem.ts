import { fallback, http, createPublicClient as cpc, createWalletClient as cwc } from 'viem';
import type { Account, Chain, FallbackTransport, PublicClient, WalletClient } from 'viem';
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

export function createWalletClient<T extends Chain>(
  chain: T,
  account: Account
): WalletClient<FallbackTransport, T, Account> {
  return cwc({
    chain,
    transport: transports[chain.id],
    account,
  });
}
