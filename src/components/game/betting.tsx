'use client';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { abstractTestnet } from 'viem/chains';
import { Mint } from '../mint';
import { useSendTransaction } from '@/hooks/use-send-transaction';
import { useGrindBalance } from '@/hooks/use-grind-balance';
import { encodeFunctionData, formatUnits, parseUnits } from 'viem';
import { abi, addresses } from '@/contracts/block-crash';
import { abi as grindAbi, addresses as grindAddresses } from '@/contracts/grind';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatMultiplier, multipliers, stateCountdown, stillAlive } from '@/lib/block-crash';
import { useGame } from '../providers/game';
import { toast } from 'sonner';
import { useBlock } from '../providers/block';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import { MultiplierBadge } from './multiplier';

interface BettingProps {
  className?: string;
}

export const Betting: React.FC<BettingProps> = ({ className }) => {
  const { number } = useBlock();
  const { state, oldState } = useGame();
  const countdown = useMemo(
    () => (number && state ? stateCountdown(number, state) : null),
    [number, state]
  );
  const { data: client } = useAbstractClient();
  const myBets = useMemo(() => {
    if (!state || !client) return [];

    return state.bets.filter(bet => bet.user === client.account.address);
  }, [state, client]);
  const [ended, setEnded] = useState(false);
  const grind = useGrindBalance();
  const { sendTransaction } = useSendTransaction({
    key: 'place-bet',
    onSuccess: grind.refetch,
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!grind.data || !state) return;

    const formData = new FormData(e.currentTarget);
    const amount = formData.get('amount') as string;
    const multiplier = formData.get('multiplier') as string;

    if (!amount) {
      toast.error('Invalid bet', {
        description: `Please enter a valid amount.`,
      });
      return;
    }

    const bigAmount = parseUnits(amount, grind.data.decimals);
    if (bigAmount > grind.data.raw) {
      toast.error('Insufficient balance', {
        description: `You don't have enough ${grind.data.symbol} to place this bet.`,
      });
      return;
    }

    if (bigAmount > BigInt(state.liquidity)) {
      toast.error('Bet too large', {
        description: `Your bet amount is larger than the current liquidity of the game.`,
      });
      return;
    }

    sendTransaction([
      {
        to: grindAddresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi: grindAbi,
          functionName: 'approve',
          args: [addresses[abstractTestnet.id], bigAmount],
        }),
      },
      {
        to: addresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi,
          functionName: 'placeBet',
          args: [bigAmount, BigInt(multiplier)],
        }),
      },
    ]);
  }

  useEffect(() => {
    if (!state || !number) return;

    if (state.end === number - 1 || state.start + multipliers.length - 1 === number) {
      setEnded(true);
    }

    if (ended && state.start === 0 && state.end === 0) {
      // Game has been reset
      grind.refetch();
      setEnded(false);
    }
  }, [state, number, ended, grind]);

  return (
    <div className={cn('flex w-full flex-none flex-col gap-5 xl:w-xs', className)}>
      <div className="bg-muted/20 flex h-min flex-col items-center rounded border p-4 backdrop-blur-md">
        <h2 className="text-xl font-bold">Place a Bet</h2>

        <h3 className="text-muted-foreground text-xs">
          {!countdown && 'Place a bet to start the game'}
          {countdown?.type === 'starting' ? (
            <>
              Round Starting in <strong>{countdown.countdown}</strong> blocks ({countdown.target})
            </>
          ) : null}

          {countdown?.type === 'ending' ? (
            <>
              Round Ending in <strong>{countdown.countdown}</strong> blocks ({countdown.target})
            </>
          ) : null}

          {countdown?.type === 'ended' ? (
            <>
              Round ended at block <strong>{countdown.target}</strong>
            </>
          ) : null}
        </h3>

        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
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

          <div className="flex flex-col">
            <Label htmlFor="multiplier" className="mb-1">
              Auto Cashout
            </Label>
            <Select name="multiplier" defaultValue="49">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {multipliers.map((multiplier, index) => (
                  <SelectItem key={multiplier} value={index.toString()}>
                    {formatMultiplier(multiplier)}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="mt-4 w-full"
            type="submit"
            disabled={!oldState && state?.start && number ? state?.start <= number : false}
          >
            Place Bet
          </Button>
        </form>
      </div>
      <div
        className={cn(
          'bg-muted/20 flex h-min grow flex-col items-center gap-3 rounded border p-4 backdrop-blur-md',
          myBets.length === 0 && 'pb-0',
          className
        )}
      >
        <h2 className="text-xl font-bold">{oldState ? `Previous Round` : 'Your Bets'}</h2>
        {state && myBets.length > 0 && (
          <div className="flex w-full flex-col gap-2 text-xs">
            <div className="flex items-center justify-between px-1">
              <span className="text-muted-foreground text-xs">Amount</span>
              <span className="text-muted-foreground text-xs">Multiplier</span>
              <span className="text-muted-foreground text-xs">Profit</span>
            </div>
            {myBets.map((bet, index) => {
              const crashed = !stillAlive(bet, state);
              const bigAmount = BigInt(bet.amount);
              const multiplier = multipliers[bet.cashoutIndex];
              const profit = formatUnits((bigAmount * multiplier) / BigInt(1e6) - bigAmount, 18);

              return (
                <div
                  key={index}
                  className={cn(
                    'flex w-full items-center justify-between rounded border p-2',
                    crashed ? 'bg-red-500/20' : 'bg-green-500/20'
                  )}
                >
                  <span>{formatUnits(bigAmount, 18)}</span>
                  <MultiplierBadge
                    key={index}
                    multiplier={multiplier}
                    variant={crashed ? 'destructive' : undefined}
                  />
                  <span className={cn(crashed ? 'text-red-500' : 'text-green-500')}>{profit}</span>
                  {/* TODO: cancel/cash out */}
                </div>
              );
            })}
          </div>
        )}

        {!myBets.length && (
          <>
            <p className="text-muted-foreground text-xs">
              Your bets will be displayed here after placing them
            </p>
            <Image
              src="https://grind.bearish.af/GrindMath01.gif"
              alt="Grind Math"
              width={540}
              height={540}
              unoptimized
              className="mt-auto size-32"
            />
          </>
        )}
      </div>
    </div>
  );
};
