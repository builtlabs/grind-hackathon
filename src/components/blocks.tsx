'use client';

import { fetcher } from '@/lib/fetch';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { abstractTestnet } from '@/lib/chain';
import Link from 'next/link';
import { Block, CachedResponse } from '@/app/api/blocks/types';
import { ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

function fullTimeString(date: Date) {
  // HH:MM:SS milliseconds
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date
    .getMilliseconds()
    .toString()
    .padStart(3, '0')}`;
}

function analyseBlockTimes(blocks: Block[]) {
  if (blocks.length < 12) return null;

  const times = blocks.splice(10).map(block => block.timestamp);
  const timeDiffs = times.slice(1).map((time, index) => times[index] - time);
  const avg = timeDiffs.reduce((acc, time) => acc + time, 0) / timeDiffs.length;

  return {
    avg,
    min: Math.min(...timeDiffs),
    max: Math.max(...timeDiffs),
  };
}

export const Blocks: React.FC = () => {
  const blocks = useSuspenseQuery({
    queryKey: ['blocks'],
    queryFn: async ({ signal }) => fetcher<CachedResponse<Block[]>>('/api/blocks', { signal }),
    select(data): CachedResponse<Block>[] {
      return data.data.map(block => ({
        data: block,
        timestamp: data.timestamp,
        refetchAt: data.refetchAt,
      }));
    },
  });

  const { data, dataUpdatedAt } = useQuery({
    queryKey: ['blocks', 'latest'],
    initialData: blocks.data,
    queryFn: async ({ signal }): Promise<CachedResponse<Block>[]> => {
      const latest = await fetcher<CachedResponse<Block>>('/api/blocks/latest', { signal });

      return [latest];
    },
    refetchInterval(query) {
      if (query.state.data) {
        const latest = query.state.data[0];
        const { refetchAt } = latest;
        return Math.max(refetchAt - Date.now(), 250);
      }

      return 500; // milliseconds
    },
    refetchIntervalInBackground: true,
    notifyOnChangeProps: ['data', 'error'],
    structuralSharing(oldData: unknown | undefined, newData: unknown) {
      if (!oldData) return newData;

      const oldBlocks = oldData as CachedResponse<Block>[];
      const newBlocks = newData as CachedResponse<Block>[];

      if (oldBlocks.find(block => block.data.number === newBlocks[0].data.number)) {
        return oldData;
      }

      return [...newBlocks, ...oldBlocks];
    },
  });
  const analysis = analyseBlockTimes(data.map(block => block.data));

  return (
    <div className="flex w-full flex-col items-end gap-1">
      <span className="text-muted-foreground text-sm">
        Last updated {fullTimeString(new Date(dataUpdatedAt))}
      </span>
      <div className="flex w-full flex-row-reverse items-center justify-start gap-3">
        {data.map(block => (
          <BlockCard key={block.data.hash} block={block.data} />
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
  const blockTimestamp = new Date(block.timestamp * 1000);
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
                {blockTimestamp.toLocaleTimeString()}
              </TooltipTrigger>
              <TooltipContent>{blockTimestamp.toLocaleString()}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription className="truncate">{block.hash}</CardDescription>
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
