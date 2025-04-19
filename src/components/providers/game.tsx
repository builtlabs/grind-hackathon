'use client';

import { ContractState } from '@/app/api/game/types';
import { fetcher } from '@/lib/fetch';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useBlock } from './block';
import { multipliers } from '@/lib/block-crash';

interface GameData {
  state?: ContractState;
  oldState?: boolean;
}

const GameContext = createContext<GameData | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { number } = useBlock();
  const [lastEnd, setLastEnd] = useState<number>(0);
  const previous = useQuery<ContractState>({
    queryKey: ['contract-state', lastEnd],
    queryFn: async ({ signal }) =>
      fetcher<ContractState>(`/api/game?blockNumber=${lastEnd}`, { signal }),
    enabled: !!number && !!lastEnd && lastEnd < number,
  });

  const game = useQuery<ContractState>({
    queryKey: ['contract-state', number],
    queryFn: async ({ signal }) =>
      fetcher<ContractState>(`/api/game?blockNumber=${number}`, { signal }),
    placeholderData: (previousValue: ContractState | undefined) => {
      return previousValue;
    },
    enabled: !!number,
  });

  useEffect(() => {
    if (game.data?.start && !game.data?.end) {
      const end = game.data.start + multipliers.length - 1;
      setLastEnd(end);
    } else if (game.data?.end) {
      setLastEnd(game.data.end + 1);
    }
  }, [game.data?.start, game.data?.end]);

  const value: GameData = useMemo(() => {
    const oldState = previous.data && game.data && !game.data?.start;
    return {
      state: oldState
        ? {
            ...previous.data,
            history: game.data.history,
            liquidity: game.data.liquidity,
          }
        : game.data,
      oldState: oldState,
    };
  }, [game.data, previous.data]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export function useGame() {
  const context = useContext(GameContext);
  if (context === null) {
    throw new Error('useBlock must be used within a BlockProvider');
  }
  return context;
}
