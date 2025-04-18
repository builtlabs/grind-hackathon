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
import { formatMultiplier, multipliers } from '@/lib/block-crash';
import { cn, shorthandHex } from '@/lib/utils';
import { useBlock } from '../providers/block';
import { formatUnits } from 'viem';

function stillAlive(
  bet: { cashoutIndex: number },
  state: { start: number; end?: number }
): boolean {
  return !state.end || state.start + bet.cashoutIndex < state.end;
}

function stillGrinding(
  bet: { cashoutIndex: number },
  state: { start: number; end?: number },
  blockNumber?: number
): boolean {
  return !!blockNumber && !state.end && state.start + bet.cashoutIndex > blockNumber;
}

interface GameTableProps {
  className?: string;
}

export const GameTable: React.FC<GameTableProps> = ({ className }) => {
  const { number } = useBlock();
  const { state } = useGame();

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="flex items-center gap-6 font-semibold">
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
            <span className="text-muted-foreground">Grind Bet</span>
            <span>
              {formatUnits(state?.bets.reduce((a, b) => a + BigInt(b.amount), BigInt(0)) ?? 0n, 18)}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Bets</span>
          <span>{state?.bets.length}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Still Grinding</span>
          <span>{state?.bets.filter(bet => stillGrinding(bet, state, number)).length}</span>
        </div>
      </div>
      <div className="w-full max-w-sm overflow-hidden">
        <Table className="border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow className="*:data-[slot=table-head]:h-6">
              <TableHead>Wallet</TableHead>
              <TableHead>Bet</TableHead>
              <TableHead>X</TableHead>
              <TableHead>Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state?.bets.map((bet, i) => {
              const crashed = !stillAlive(bet, state);
              const bigAmount = BigInt(bet.amount);
              const multiplier = multipliers[bet.cashoutIndex];
              const formattedMultiplier = formatMultiplier(multiplier);
              const profit = formatUnits((bigAmount * multiplier) / BigInt(1e6), 18);
              return (
                <TableRow key={i}>
                  <TableCell>{shorthandHex(bet.user)}</TableCell>
                  <TableCell>{formatUnits(bigAmount, 18)}</TableCell>
                  <TableCell>{formattedMultiplier}x</TableCell>
                  <TableCell className={cn(crashed ? 'text-red-500' : 'text-green-500')}>
                    {profit}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
