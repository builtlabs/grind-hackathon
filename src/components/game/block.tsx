'use client';

import { cn } from '@/lib/utils';
import { useGame } from '../providers/game';
import { useBlock } from '../providers/block';
import { ComponentProps, useEffect, useState } from 'react';
import { ContractState } from '@/app/api/game/types';
import { multipliers } from '@/lib/block-crash';
import { formatUnits } from 'viem';
import { Badge } from '../ui/badge';

interface BlockInfo {
  number: number;
  multiplier: bigint;
  result: 'ok' | 'crash' | 'none';
}

function createBlock(number: number, state?: ContractState): BlockInfo {
  if (!state) {
    return {
      number,
      multiplier: 0n,
      result: 'none',
    };
  }

  const end = state.end || state.start + multipliers.length;

  if (state.start <= number && number < end) {
    return {
      number,
      multiplier: multipliers[number - state.start],
      result: 'ok',
    };
  }

  if (number === end) {
    return {
      number,
      multiplier: multipliers[number - state.start],
      result: 'crash',
    };
  }

  return {
    number,
    multiplier: 0n,
    result: 'none',
  };
}

function multiplierVariant(multiplier: number): ComponentProps<typeof Badge>['variant'] {
  if (multiplier < 1) {
    return 'destructive';
  }

  // TODO: Add more variants
  return 'default';
}

export const GameBlock: React.FC = () => {
  const { number } = useBlock();
  const [blocks, setBlocks] = useState<BlockInfo[]>([]);
  const { state } = useGame();

  useEffect(() => {
    if (!number) {
      return;
    }

    setBlocks(() => {
      const newBlocks: BlockInfo[] = [];

      for (let i = 0; i < 5; i++) {
        const blockNumber = number + i - 3;
        newBlocks.push(createBlock(blockNumber, state));
      }

      return newBlocks;
    });
  }, [number, state]);

  return (
    <div className="flex flex-col items-center gap-11 py-5">
      <div className="flex flex-col items-center">
        <p className="text-base">Current Multiplier</p>
        <p className="text-7xl font-bold">{formatUnits(blocks[2]?.multiplier ?? 0n, 6)}x</p>
      </div>
      <div className="relative isolate mx-20 flex size-40 items-center lg:size-52">
        {blocks.map((block, index) => (
          <Block key={block.number} index={index} block={block} />
        ))}
      </div>
      <div className="flex flex-row-reverse items-center justify-center gap-3">
        {state?.history.map((result, index) => {
          const multiplier = formatUnits(BigInt(result), 6);
          const variant = multiplierVariant(Number(multiplier));

          return (
            <Badge key={index} variant={variant}>
              {multiplier}x
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

interface BlockProps {
  block: BlockInfo;
  index: number;
}

const Block: React.FC<BlockProps> = ({ block, index }) => {
  return (
    <div
      className={cn(
        'absolute flex size-full flex-none flex-col items-center rounded border-4 p-4',
        'transition-all duration-1000 ease-in-out',
        index === 0 && '-z-20 scale-0',
        index === 1 && '-z-10 -translate-x-1/2 scale-80',
        index === 2 && 'z-10 scale-100',
        index === 3 && '-z-10 translate-x-1/2 scale-80',
        index === 4 && '-z-20 scale-0',
        block.result === 'ok' && 'border-[#269418] bg-[#196622]',
        block.result === 'crash' && 'border-[#941818] bg-[#5E0C0D]',
        block.result === 'none' && 'bg-muted'
      )}
    >
      <p className="text-xl font-bold opacity-70">#{block.number}</p>
      <p className="absolute top-1/2 -translate-y-1/2 text-4xl font-bold">
        {formatUnits(block.multiplier, 6)}x
      </p>
    </div>
  );
};
