'use client';

import { cn } from '@/lib/utils';
import { useGame } from '../providers/game';
import { useBlock } from '../providers/block';
import { useEffect, useState } from 'react';

interface BlockInfo {
  number: number;
  multiplier: number;
  result: 'ok' | 'crash' | 'none';
}

function generateBlock(number: number): BlockInfo {
  const rnd = Math.floor(Math.random() * 100) + 1;
  return {
    number,
    multiplier: rnd,
    result: rnd > 50 ? 'ok' : rnd > 20 ? 'crash' : 'none',
  };
}

export const GameBlock: React.FC = () => {
  const { number } = useBlock();
  const [blocks, setBlocks] = useState<BlockInfo[]>([]);
  useGame();

  useEffect(() => {
    if (!number) {
      return;
    }

    setBlocks(current => {
      const newBlocks: BlockInfo[] = [];

      for (let i = 0; i < 5; i++) {
        const blockNumber = number + i - 2;
        const block = current.find(b => b.number === blockNumber);
        if (block) {
          newBlocks.push(block);
        } else {
          newBlocks.push(generateBlock(blockNumber));
        }
      }

      return newBlocks;
    });
  }, [number]);

  return (
    <div className="flex flex-col gap-11 py-5">
      <div className="flex flex-col items-center">
        <p className="text-base">Current Multiplier</p>
        <p className="text-7xl font-bold">{blocks[2]?.multiplier}x</p>
      </div>
      <div className="relative isolate mx-20 flex size-52 items-center">
        {blocks.map((block, index) => (
          <Block key={block.number} index={index} block={block} />
        ))}
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
        'absolute flex size-52 flex-none flex-col items-center rounded border-4 p-4',
        'transition-all duration-1000 ease-in-out',
        index === 0 && '-z-20 scale-0',
        index === 1 && '-z-10 -translate-x-1/2 scale-80',
        index === 2 && 'z-10 scale-100',
        index === 3 && '-z-10 translate-x-1/2 scale-80',
        index === 4 && '-z-20 scale-0',
        block.result === 'ok' && 'border-[#269418] bg-[#196622]',
        block.result === 'crash' && 'border-[#941818] bg-[#5E0C0D]',
        block.result === 'none' && 'border-[#444] bg-[#1d1d1d]'
      )}
    >
      <p className="text-xl font-bold opacity-70">#{block.number}</p>
      <p className="absolute top-1/2 -translate-y-1/2 text-4xl font-bold">{block.multiplier}x</p>
    </div>
  );
};
