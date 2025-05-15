'use client';

import Image from 'next/image';
import { useGame } from '../providers/game';
import { multipliers, stillAlive, stillGrinding } from '@/lib/block-crash';
import { cn, formatNumber, shorthandHex } from '@/lib/utils';
import { formatUnits } from 'viem';
import { MultiplierBadge } from './multiplier';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface GameTableProps {
  className?: string;
}

export const GameTable: React.FC<GameTableProps> = ({ className }) => {
  const { state } = useGame();
  const parentRef = useRef(null);
  const bets = state?.bets.filter(bet => !bet.cancelled) ?? [];

  const virtualizer = useVirtualizer({
    count: bets.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    gap: 8,
    paddingStart: 24,
    paddingEnd: 16,
    overscan: 5,
  });

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
              {formatNumber(
                Number(
                  formatUnits(
                    state?.bets.reduce((a, b) => a + BigInt(b.amount), BigInt(0)) ?? 0n,
                    18
                  )
                )
              )}
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
            {state?.bets.filter(bet => stillGrinding(bet, state)).length}
          </span>
        </div>
      </div>

      <div
        ref={parentRef}
        className={cn(
          'bg-muted/20 scrollbar-hidden flex min-h-64 grow flex-col items-center overflow-y-auto rounded border p-4 pb-0 backdrop-blur-md'
        )}
      >
        <div
          className="relative isolate w-full flex-none grow overflow-visible"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          <div className="mb-2 flex items-center gap-5 px-2 text-xs">
            <span className="w-24">User</span>
            <span className="grow">Amount</span>
            <span className="w-20">Multiplier</span>
            <span className="grow">Profit</span>
          </div>
          {state
            ? virtualizer.getVirtualItems().map(virtualRow => {
                const bet = bets[virtualRow.index];
                const crashed = !stillAlive(bet, state);
                const bigAmount = BigInt(bet.amount);
                const multiplier = multipliers[bet.cashoutIndex];
                const profit = formatNumber(
                  Number(formatUnits((bigAmount * multiplier) / BigInt(1e6) - bigAmount, 18))
                );

                return (
                  <div
                    key={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={cn(
                      'border-foreground/10 z-10 flex w-full items-center gap-5 rounded border bg-[#4BAEB51A] px-2 text-xs backdrop-blur-lg',
                      state.start && state.current > state.start && crashed && 'bg-red-500/20',
                      state.start && state.current > state.start && !crashed && 'bg-green-500/20',
                      bet.cancelled && 'bg-muted text-muted-foreground line-through opacity-50'
                    )}
                  >
                    <span className="w-24">{shorthandHex(bet.user)}</span>
                    <span className="grow">{formatNumber(Number(formatUnits(bigAmount, 18)))}</span>
                    <span className="w-20">
                      <MultiplierBadge
                        multiplier={multiplier}
                        variant={bet.cancelled ? 'outline' : undefined}
                      />
                    </span>

                    <span
                      className={cn(
                        'grow',
                        crashed ? 'text-red-500' : 'text-green-500',
                        bet.cancelled && 'text-muted-foreground line-through'
                      )}
                    >
                      {profit}
                    </span>
                  </div>
                );
              })
            : null}
          {state?.bets.length === 0 && (
            <div className="text-muted-foreground z-10 flex h-10 w-full items-center justify-center rounded border bg-[#4BAEB51A] text-center text-xs backdrop-blur-lg">
              No bets placed yet
            </div>
          )}
          <Image
            src="https://grind.bearish.af/vibinghamster.gif"
            width={540}
            height={540}
            alt="vibinghamster"
            className="absolute bottom-0 left-1/2 -z-50 size-40 -translate-x-1/2"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
};
