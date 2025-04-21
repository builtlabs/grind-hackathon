'use client';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { abstractTestnet } from 'viem/chains';
import { Mint } from '../mint';
import { useSendTransaction } from '@/hooks/use-send-transaction';
import { useGrindBalance } from '@/hooks/use-grind-balance';
import {
  Account,
  Chain,
  encodeFunctionData,
  formatUnits,
  isAddressEqual,
  parseUnits,
  SendTransactionParameters,
} from 'viem';
import { abi, addresses } from '@/contracts/block-crash';
import { abi as grindAbi, addresses as grindAddresses } from '@/contracts/grind';
import { multipliers, stateCountdown, stillAlive } from '@/lib/block-crash';
import { useGame } from '../providers/game';
import { toast } from 'sonner';
import { useBlock } from '../providers/block';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import { MultiplierBadge } from './multiplier';
import { Turbo } from '../turbo';
import { ContractState } from '@/app/api/game/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MultiplierInput } from '../input/multiplier';
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

    // filter the bets but retain the original index
    return state.bets.reduce(
      (acc, bet, index) =>
        isAddressEqual(bet.user, client.account.address) ? [...acc, { ...bet, index }] : acc,
      [] as (ContractState['bets'][number] & { index: number })[]
    );
  }, [state, client]);
  const [ended, setEnded] = useState(false);
  const grind = useGrindBalance();
  const { sendTransaction, isPending } = useSendTransaction({
    key: 'bets',
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!client) {
      toast.error('Not connected', {
        description: `Please connect abstract before placing a bet.`,
      });
      return;
    }

    if (!grind.data || !state) return;

    const formData = new FormData(e.currentTarget);
    const amount = formData.get('amount') as string;
    const cashoutIndex = formData.get('multiplier') as string;
    const multiplier = multipliers[Number(cashoutIndex)];

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

    const profit = (bigAmount * multiplier) / BigInt(1e6);
    if (profit > BigInt(state.liquidity)) {
      toast.error('Bet too large', {
        description: `Your bet amount is larger than the current liquidity.`,
      });
      return;
    }

    const transaction: SendTransactionParameters<Chain, Account>[] = [
      {
        to: addresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi,
          functionName: 'placeBet',
          args: [bigAmount, BigInt(cashoutIndex)],
        }),
      },
    ];

    if (grind.data.allowance < bigAmount) {
      transaction.unshift({
        to: grindAddresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi: grindAbi,
          functionName: 'approve',
          args: [addresses[abstractTestnet.id], bigAmount],
        }),
      });
    }

    sendTransaction({ transaction, onSuccess: grind.refetch });
  }

  function handleCashout(index: number) {
    if (!state) return;

    const transaction: SendTransactionParameters<Chain, Account>[] = [
      {
        to: addresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi,
          functionName: 'cashEarly',
          args: [BigInt(index)],
        }),
      },
    ];

    sendTransaction({ transaction });
  }

  function handleCancel(index: number) {
    if (!state) return;

    const transaction: SendTransactionParameters<Chain, Account>[] = [
      {
        to: addresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi,
          functionName: 'cancelBet',
          args: [BigInt(index)],
        }),
      },
    ];

    sendTransaction({ transaction, onSuccess: grind.refetch });
  }

  useEffect(() => {
    if (!state || !number) return;

    if (state.end === number - 1) {
      // Game Crashed
      setEnded(true);
    } else if (!state.end && state.start + multipliers.length - 1 === number) {
      // Game reached 100x
      setEnded(true);
    } else if (ended && oldState) {
      // Game has been reset
      grind.refetch();
      setEnded(false);
    }
  }, [ended, grind, number, oldState, state]);

  return (
    <div className={cn('flex w-full flex-none flex-col gap-5 xl:w-[340px]', className)}>
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
            <MultiplierInput />
          </div>

          <div className="flex flex-col">
            <Button
              className="mt-4 w-full"
              type="submit"
              disabled={
                isPending || (!oldState && state?.start && number ? state?.start <= number : false)
              }
            >
              Place Bet
            </Button>
            <Turbo />
          </div>
        </form>
      </div>
      <div
        className={cn(
          'bg-muted/20 scrollbar-hidden flex h-min min-h-64 grow flex-col items-center gap-3 overflow-y-auto rounded border p-4 pb-0 backdrop-blur-md',
          className
        )}
      >
        <h2 className="text-xl font-bold">{oldState ? `Previous Round` : 'Your Bets'}</h2>
        {state && myBets.length > 0 && (
          <div className="w-full">
            <Table className="border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow className="bg-transparent text-[10px] backdrop-blur-none *:data-[slot=table-head]:h-6 sm:text-xs">
                  <TableHead>Amount</TableHead>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBets.map(bet => {
                  const crashed = !stillAlive(bet, state);
                  const bigAmount = BigInt(bet.amount);
                  const multiplier = multipliers[bet.cashoutIndex];
                  const profit = formatUnits(
                    (bigAmount * multiplier) / BigInt(1e6) - bigAmount,
                    18
                  );
                  return (
                    <TableRow
                      key={bet.index}
                      className={cn(
                        'text-xs',
                        number && state.start && number > state.start && crashed && 'bg-red-500/20',
                        number &&
                          state.start &&
                          number > state.start &&
                          !crashed &&
                          'bg-green-500/20',
                        bet.cancelled && 'bg-muted text-muted-foreground line-through opacity-50'
                      )}
                    >
                      <TableCell>{formatUnits(bigAmount, 18)}</TableCell>
                      <TableCell>
                        <MultiplierBadge
                          multiplier={multiplier}
                          variant={bet.cancelled ? 'outline' : undefined}
                        />
                      </TableCell>

                      <TableCell
                        className={cn(
                          crashed ? 'text-red-500' : 'text-green-500',
                          bet.cancelled && 'text-muted-foreground line-through'
                        )}
                      >
                        {profit}
                      </TableCell>
                      <TableCell>
                        {!bet.cancelled && number && state.start && number > state.start ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-min w-min p-0 text-xs"
                            onClick={handleCashout.bind(null, bet.index)}
                            disabled={
                              isPending ||
                              crashed ||
                              bet.cancelled ||
                              number > state.start + bet.cashoutIndex
                            }
                          >
                            Cash out
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-min w-min p-0 text-xs"
                            onClick={handleCancel.bind(null, bet.index)}
                            disabled={isPending || bet.cancelled}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {myBets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground text-center">
                      You have no bets placed
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {!myBets.length && (
          <p className="text-muted-foreground text-xs">
            Your bets will be displayed here after placing them
          </p>
        )}

        <div className="mt-auto">
          <Image
            src="https://grind.bearish.af/GrindMath01.gif"
            alt="Grind Math"
            width={540}
            height={540}
            unoptimized
            className="-mt-32 size-32"
          />
        </div>
      </div>
    </div>
  );
};
