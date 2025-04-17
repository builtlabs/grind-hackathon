'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { SquareActivity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetcher } from '@/lib/fetch';
import { GetBlockNumberQuery } from '@/graph/graphql';
import { useBlock } from './providers/block';

type Status = 'out-of-sync' | 'normal';

function withinRange(a: bigint, b: bigint, range: number) {
  return Math.abs(Number(a - b)) <= range;
}

function allWithinRange(numbers: bigint[], range: number) {
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      if (!withinRange(numbers[i], numbers[j], range)) {
        return false;
      }
    }
  }

  return true;
}

interface SystemStatusProps {
  className?: string;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ className }) => {
  const [status, setStatus] = useState<Status>('normal');

  const { data: graph, isFetching: isFetchingGraph } = useQuery({
    queryKey: ['block-number-graph'],
    queryFn: ({ signal }) => fetcher<GetBlockNumberQuery>('/api/block-number/graph', { signal }),
    refetchInterval: 10000,
    select(data) {
      const blockNumber = data._meta?.block.number;
      return blockNumber ? BigInt(blockNumber) : null;
    },
  });

  const { number: chain } = useBlock();

  useEffect(() => {
    if (isFetchingGraph) {
      return;
    }

    if (!graph || !chain) {
      return;
    }

    const numbers = [graph, BigInt(chain)];
    const state = allWithinRange(numbers, 10) ? 'normal' : 'out-of-sync';
    setStatus(state);
  }, [graph, chain, isFetchingGraph]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            'flex h-full flex-none items-center',
            status === 'out-of-sync' && 'text-destructive',
            className
          )}
        >
          <SquareActivity className="size-6" />
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {status === 'normal' ? (
            <span>All systems normal</span>
          ) : (
            <>
              <span>System out of sync</span>
              <br />
              <span className="text-muted-foreground">Graph: {graph?.toString()}</span>
              <br />
              <span className="text-muted-foreground">Chain: {chain?.toString()}</span>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
