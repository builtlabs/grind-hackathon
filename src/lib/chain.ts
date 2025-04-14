import { abstractTestnet as absT } from 'viem/chains';
import { type Chain } from 'viem';
import { Network } from 'alchemy-sdk';
import { env } from '@/env.mjs';

function rpcUrl(chainId: number) {
  if (typeof window !== 'undefined') {
    return `${window.origin}/api/rpc/${chainId}`;
  }

  return `${env.NEXT_PUBLIC_VERCEL_URL}/api/rpc/${chainId}?x-vercel-protection-bypass=${env.VERCEL_AUTOMATION_BYPASS_SECRET}`;
}

function defineAlchemyChain(chain: Chain, network: Network) {
  return {
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      alchemy: {
        http: [`https://${network}.g.alchemy.com/v2`],
      },
    },
  };
}

function iconName(chain: Chain) {
  switch (chain.name) {
    case 'Abstract Testnet':
      return 'Abstract';
    default:
      return chain.name;
  }
}

export function chainIconUrl(chain: Chain) {
  return `https://icons.llamao.fi/icons/chains/rsz_${iconName(chain)}`;
}

function defineAppChain(chain: Chain): Chain {
  return {
    ...chain,
    rpcUrls: {
      default: chain.rpcUrls.default,
      alchemy: chain.rpcUrls.alchemy,
      app: {
        http: [rpcUrl(chain.id)],
      },
    },
  };
}

export const abstractTestnet = defineAppChain(defineAlchemyChain(absT, Network.ABSTRACT_TESTNET));

export const chains = [abstractTestnet] as const;
