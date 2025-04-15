'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { abstractTestnet } from '@/lib/chain';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Alchemy, Network } from 'alchemy-sdk';
import { env } from '@/env.mjs';
import { useEffect, useMemo, useState } from 'react';

interface Block {
  number: number;
  timestamp: number;
}

const alchemy = new Alchemy({
  apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ABSTRACT_TESTNET,
});

function analyseBlockTimes(blocks: Block[]) {
  if (blocks.length < 2) return null;

  const times = blocks.map(block => block.timestamp);
  const timeDiffs = times.slice(1).map((time, index) => Number(times[index] - time));
  const avg = timeDiffs.reduce((acc, time) => acc + time, 0) / timeDiffs.length;

  return {
    avg: avg / 1000, // convert to seconds
    min: Math.min(...timeDiffs) / 1000, // convert to seconds
    max: Math.max(...timeDiffs) / 1000, // convert to seconds
  };
}

export const Blocks: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const analysis = useMemo(() => analyseBlockTimes(blocks), [blocks]);

  useEffect(() => {
    function handleBlock(block: number) {
      setBlocks(current => {
        const newBlocks = [
          {
            number: block,
            timestamp: Date.now(),
          },
          ...current,
        ];
        return newBlocks;
      });
    }

    if (typeof window === 'undefined') return;

    alchemy.ws.on('block', handleBlock);

    return () => {
      alchemy.ws.removeAllListeners();
    };
  }, []);

  return (
    <div className="flex w-full flex-col items-end gap-1">
      {blocks[0] && (
        <span className="text-muted-foreground text-sm">
          Last updated{' '}
          {new Date(blocks[0]?.timestamp).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3,
          })}
        </span>
      )}
      <div className="flex w-full flex-row-reverse items-center justify-start gap-3">
        {blocks.map(block => (
          <BlockCard key={block.number} block={block} />
        ))}
      </div>
      <span className="text-muted-foreground text-end text-sm">
        Avg: {analysis?.avg.toFixed(2)} seconds
        <br />
        Min: {analysis?.min.toFixed(2)} seconds
        <br />
        Max: {analysis?.max.toFixed(2)} seconds
      </span>
    </div>
  );
};

const BlockCard: React.FC<{
  block: Block;
}> = ({ block }) => {
  const blockTimestamp = new Date(block.timestamp);
  return (
    <Card className="group size-64 flex-none">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span className="flex items-center">
            #{block.number}{' '}
            <span className="text-muted-foreground hidden text-sm group-first:inline-block">
              (latest)
            </span>
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-muted-foreground text-sm">
                {blockTimestamp.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3,
                })}
              </TooltipTrigger>
              <TooltipContent>
                {blockTimestamp.toLocaleString(undefined, {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3,
                })}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="mt-auto justify-end border-t">
        <Button variant="link" className="p-0" asChild>
          <Link
            href={abstractTestnet.blockExplorers?.native.url + '/block/' + block.number}
            target="_blank"
          >
            View on {abstractTestnet.blockExplorers?.native.name}{' '}
            <ExternalLink className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
