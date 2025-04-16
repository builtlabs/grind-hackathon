'use client';

import { ContractState } from '@/app/api/game/types';
import { fetcher } from '@/lib/fetch';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react';
import { useBlock } from './block';

interface GameData {
  state?: ContractState;
}

const GameContext = createContext<GameData | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { number } = useBlock();
  const game = useQuery<ContractState>({
    queryKey: ['contract-state', number],
    queryFn: async ({ signal }) =>
      fetcher<ContractState>(`/api/game?blockNumber=${number}`, { signal }),
    placeholderData: (previousValue: ContractState | undefined) => {
      return previousValue;
    },
  });

  return <GameContext.Provider value={{ state: game.data }}>{children}</GameContext.Provider>;
};

export function useGame() {
  const context = useContext(GameContext);
  if (context === null) {
    throw new Error('useBlock must be used within a BlockProvider');
  }
  return context;
}
