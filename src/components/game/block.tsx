'use client';

import { cn } from '@/lib/utils';
import { useGame } from '../providers/game';
import { useBlock } from '../providers/block';
import { useMemo } from 'react';

export const GameBlock: React.FC = () => {
  const { number } = useBlock();
  useGame();

  const blocks = useMemo(() => {
    const blocks = [];
    for (let i = 0; i < 5; i++) {
      blocks.push({
        number: number + i - 3,
        multiplier: Math.floor(Math.random() * 100) + 1,
        result: (i === 1 ? 'crash' : 'ok') as 'ok' | 'crash',
      });
    }
    return blocks;
  }, [number]);

  return (
    <div className="h-96 overflow-hidden rounded border p-3">
      <p className="text-2xl font-bold">CONTRACT OWNER</p>
      <div className="relative isolate mx-20 flex size-52 items-center">
        {blocks.map((block, index) => (
          <Block
            key={block.number}
            index={index}
            number={block.number}
            multiplier={block.multiplier}
            result={block.result}
          />
        ))}
      </div>
    </div>
  );
};

interface BlockInfo {
  number: number;
  index: number;
  multiplier: number;
  result: 'ok' | 'crash' | 'none';
}

const Block: React.FC<BlockInfo> = ({ number, index, multiplier, result }) => {
  return (
    <div
      key={number}
      className={cn(
        'absolute flex size-52 flex-none flex-col items-center rounded border-4 p-4',
        'transition-all duration-1000 ease-in-out',
        index === 0 && '-z-20 scale-0',
        index === 1 && '-z-10 -translate-x-1/2 scale-80',
        index === 2 && 'z-10 scale-100',
        index === 3 && '-z-10 translate-x-1/2 scale-80',
        index === 4 && '-z-20 scale-0',
        result === 'ok' && 'border-[#269418] bg-[#196622]',
        result === 'crash' && 'border-[#941818] bg-[#5E0C0D]',
        result === 'none' && 'border-[#444] bg-[#1d1d1d]'
      )}
    >
      <p className="text-xl font-bold opacity-70">#{number}</p>
      <p className="absolute top-1/2 -translate-y-1/2 text-4xl font-bold">{multiplier}x</p>
    </div>
  );
};
