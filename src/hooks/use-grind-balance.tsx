import { abi, addresses } from '@/contracts/grind';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import { Address, formatUnits } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { useReadContracts } from 'wagmi';

export function useGrindBalance() {
  const { data: client } = useAbstractClient();

  return useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: addresses[abstractTestnet.id],
        abi,
        functionName: 'balanceOf',
        args: [client?.account.address as Address],
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
      enabled: !!client,
      select(data) {
        const formatted = formatUnits(data[0], data[1]);

        return {
          formatted,
          value: Number(formatted),
          raw: data[0],
          decimals: data[1],
          symbol: data[2],
        };
      },
    },
  });
}
