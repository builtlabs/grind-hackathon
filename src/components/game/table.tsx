'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { useGame } from '../providers/game';
import { multipliers, stillAlive, stillGrinding } from '@/lib/block-crash';
import { cn, shorthandHex } from '@/lib/utils';
import { useBlock } from '../providers/block';
import { formatUnits } from 'viem';
import { MultiplierBadge } from './multiplier';

interface GameTableProps {
  className?: string;
}

export const GameTable: React.FC<GameTableProps> = ({ className }) => {
  const { number } = useBlock();
  const { state } = useGame();

  return (
    <div className={cn('flex w-full flex-none flex-col gap-4 xl:w-sm', className)}>
      <div className="bg-muted/20 flex items-center justify-between gap-6 rounded border p-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Image
            src="https://grind.bearish.af/grindcoin.gif"
            width={540}
            height={540}
            alt="grindcoin"
            className="size-8"
            unoptimized
          />
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Grind Bet</span>
            <span className="text-sm font-medium">
              {formatUnits(state?.bets.reduce((a, b) => a + BigInt(b.amount), BigInt(0)) ?? 0n, 18)}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Bets</span>
          <span className="text-sm font-medium">{state?.bets.length}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Still Grinding</span>
          <span className="text-sm font-medium">
            {state?.bets.filter(bet => stillGrinding(bet, state, number)).length}
          </span>
        </div>
      </div>

      <div
        className={cn(
          'bg-muted/20 scrollbar-hidden flex grow flex-col items-center overflow-y-auto rounded border p-4 pb-0 backdrop-blur-md'
        )}
      >
        <div className="w-full">
          <Table className="border-separate border-spacing-y-2">
            <TableHeader>
              <TableRow className="text-xs *:data-[slot=table-head]:h-6">
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Multiplier</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state?.bets.map((bet, i) => {
                const crashed = !stillAlive(bet, state);
                const bigAmount = BigInt(bet.amount);
                const multiplier = multipliers[bet.cashoutIndex];
                const profit = formatUnits((bigAmount * multiplier) / BigInt(1e6) - bigAmount, 18);
                return (
                  <TableRow
                    key={i}
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
                    <TableCell>{shorthandHex(bet.user)}</TableCell>
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
                  </TableRow>
                );
              })}
              {state?.bets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground text-center">
                    No bets placed yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Image
          src="https://grind.bearish.af/vibinghamster.gif"
          width={540}
          height={540}
          alt="vibinghamster"
          className="mt-auto size-40"
          unoptimized
        />
      </div>
    </div>
  );
};
