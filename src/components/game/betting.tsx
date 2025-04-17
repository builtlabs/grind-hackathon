'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { CrossAppAccountWithMetadata, usePrivy } from '@privy-io/react-auth';
import { Address, formatUnits } from 'viem';
import { abi, addresses } from '@/contracts/grind';
import { abstractTestnet } from 'viem/chains';
import { ABSTRACT_APP_ID } from '@/lib/abstract';
import { useReadContracts } from 'wagmi';
import { Mint } from '../mint';

export const Betting: React.FC = () => {
  const [autoCashOut, setAutoCashOut] = useState(false);
  const { user } = usePrivy();

  const account = user?.linkedAccounts.find(
    account => account.type === 'cross_app' && account.providerApp.id === ABSTRACT_APP_ID
  ) as CrossAppAccountWithMetadata | undefined;

  const grind = useReadContracts({
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
          symbol: data[2],
        };
      },
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = formData.get('amount');
    const multiplier = formData.get('multiplier');

    toast.info(`Betting ${amount} at ${multiplier}x`, {
      description: 'This is a placeholder for the betting action.',
      duration: 3000,
    });
  }

  return (
    <div className="flex flex-col">
      <form className="flex w-80 flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount" className="mb-1">
              Bet Amount
            </Label>

            <span className="text-sm text-gray-500">
              {grind.data?.formatted} {grind.data?.symbol}
            </span>
          </div>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="0.00"
            className="w-full"
            min={0}
            step={0.01}
          />
          <Mint onSuccess={grind.refetch} disabled={grind.data && grind.data?.value >= 500} />
        </div>

        <div className="flex items-center gap-2">
          <Switch id="auto-cashout" checked={autoCashOut} onCheckedChange={setAutoCashOut} />
          <Label htmlFor="auto-cashout">Auto Cashout</Label>
        </div>

        <div className="flex flex-col">
          <Label htmlFor="multiplier" className="mb-1">
            Multiplier
          </Label>
          <Input
            id="multiplier"
            name="multiplier"
            type="number"
            placeholder="1.00"
            className="w-full"
            min={1}
            step={0.01}
            disabled={!autoCashOut}
          />
        </div>

        <Button className="mt-4 w-full" type="submit">
          Place Bet
        </Button>
      </form>
    </div>
  );
};
