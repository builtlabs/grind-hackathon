import { abi, addresses } from '@/contracts/grind';
import { ABSTRACT_APP_ID } from '@/lib/abstract';
import { CrossAppAccountWithMetadata, usePrivy } from '@privy-io/react-auth';
import { Address, formatUnits } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { useReadContracts } from 'wagmi';

export function useGrindBalance() {
  const { user } = usePrivy();
  const account = user?.linkedAccounts.find(
    account => account.type === 'cross_app' && account.providerApp.id === ABSTRACT_APP_ID
  ) as CrossAppAccountWithMetadata | undefined;

  return useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: addresses[abstractTestnet.id],
        abi,
        functionName: 'balanceOf',
        args: [account?.embeddedWallets[0].address as Address],
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
      enabled: !!account,
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
