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
import { multipliers } from '@/lib/block-crash';
import { cn } from '@/lib/utils';
import { useBlock } from '../providers/block';

function stillAlive(
  bet: { cashoutIndex: number },
  state: { start: number; end?: number }
): boolean {
  return !state.end || state.start + bet.cashoutIndex < state.end;
}

function stillGrinding(
  bet: { cashoutIndex: number },
  state: { start: number; end?: number },
  blockNumber: number
): boolean {
  return !state.end && state.start + bet.cashoutIndex > blockNumber;
}

export const GameTable: React.FC = () => {
  const { number } = useBlock();
  const { state } = useGame();

  return (
    <div className="flex flex-col">
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
            <span>{state?.bets.reduce((a, b) => a + BigInt(b.amount), BigInt(0))}</span>
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
      <div className="w-full overflow-hidden">
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
              const profit = BigInt(bet.amount) * BigInt(multipliers[bet.cashoutIndex]);
              const crashed = !stillAlive(bet, state);
              return (
                <TableRow key={i}>
                  <TableCell>{bet.user}</TableCell>
                  <TableCell>{bet.amount}</TableCell>
                  <TableCell>{multipliers[bet.cashoutIndex]}x</TableCell>
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
