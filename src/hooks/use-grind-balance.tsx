import { abi, addresses } from '@/contracts/grind';
import { addresses as blockCrashAddresses } from '@/contracts/block-crash';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import { Address, formatUnits } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { useReadContracts } from 'wagmi';

export function useGrindBalance(options?: { enabled?: boolean }) {
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
      {
        address: addresses[abstractTestnet.id],
        abi,
        functionName: 'allowance',
        args: [client?.account.address as Address, blockCrashAddresses[abstractTestnet.id]],
      },
    ],
    query: {
      enabled: Boolean(client) && options?.enabled !== undefined ? options.enabled : true,
      select(data) {
        const formatted = formatUnits(data[0], data[1]);

        return {
          formatted,
          value: Number(formatted),
          raw: data[0],
          decimals: data[1],
          symbol: data[2],
          allowance: data[3],
        };
      },
    },
  });
}
