'use client';

import { cn } from '@/lib/utils';
import { useGame } from '../providers/game';
import { useBlock } from '../providers/block';
import { useEffect, useState } from 'react';
import { BlockInfo, createBlock, formatMultiplier } from '@/lib/block-crash';
import Image from 'next/image';
import { MultiplierBadge } from './multiplier';

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
    <div className="flex flex-col items-center justify-between gap-5">
      <div className="flex h-28 flex-col items-center">
        <p className="text-base">Current Multiplier</p>

        <p className="text-7xl font-bold">
          {blocks[2]?.result === 'none' && '--'}
          {blocks[2]?.result === 'ok' && <>{formatMultiplier(blocks[2].multiplier)}x</>}
          {blocks[2]?.result === 'crash' && <span className="text-[#941818]">CRASH</span>}
        </p>
      </div>
      <div className="relative isolate mx-16 flex size-40 items-center lg:mx-28 lg:size-64">
        {blocks.map((block, index) => (
          <Block key={block.number} index={index} block={block} />
        ))}
      </div>
      <div className="flex w-full flex-col gap-2">
        <p className="text-muted-foreground text-xs">Multiplier History</p>
        <div className="bg-muted/20 flex h-10 items-center justify-between gap-3 overflow-hidden rounded border p-2 backdrop-blur-md">
          {state?.history.map((result, index) => (
            <MultiplierBadge key={index} multiplier={BigInt(result)} />
          ))}
        </div>
      </div>

      {number && state?.start && !state?.end && number - state.start > 11 ? (
        <Image
          src="https://grind.bearish.af/grindjetpack.gif"
          width={540}
          height={540}
          alt="grindjetpack"
          className="animate-in zoom-in fade-in absolute top-10 right-0 size-64 -rotate-90 lg:top-32 xl:top-auto xl:right-auto xl:bottom-0 xl:left-1/2 xl:size-72 xl:-translate-x-1/2 xl:rotate-0"
          unoptimized
        />
      ) : null}
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
        block.result === 'none' && 'bg-muted border-border/40'
      )}
    >
      <p className="text-muted-foreground text-sm font-medium">#{block.number}</p>
      <p className="absolute top-1/2 -translate-y-1/2 text-4xl font-bold">
        {block.result === 'none' && '--'}
        {block.result === 'ok' && <>{formatMultiplier(block.multiplier)}x</>}
        {block.result === 'crash' && <span className="text-[#941818]">CRASH</span>}
      </p>
    </div>
  );
};
