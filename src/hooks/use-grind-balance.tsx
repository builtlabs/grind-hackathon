import { abi, addresses } from '@/contracts/grind';
import { useGlobalWalletSignerAccount } from '@abstract-foundation/agw-react';
import { Address, formatUnits } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { useReadContracts } from 'wagmi';

export function useGrindBalance() {
  const { address } = useGlobalWalletSignerAccount();

  return useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: addresses[abstractTestnet.id],
        abi,
        functionName: 'balanceOf',
        args: [address as Address],
      },
      {
        address: addresses[abstractTestnet.id],
        abi,
        functionName: 'decimals',
      },
      {
        address: addresses[abstractTestnet.id],
        abi,
        functionName: 'symbol',
      },
    ],
    query: {
      enabled: !!address,
      select(data) {
        const formatted = formatUnits(data[0], data[1]);

        return {
          formatted,
          value: Number(formatted),
          decimals: data[1],
          symbol: data[2],
        };
      },
    },
  });
}
