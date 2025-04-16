'use client';

import { useGame } from '../providers/game';

export const GameBlock: React.FC = () => {
  const { state } = useGame();

  return (
    <div className="h-96 w-64 overflow-hidden rounded border p-3">
      <p className="text-2xl font-bold">CONTRACT OWNER</p>
      <p className="w-full truncate text-lg">{state}</p>
    </div>
  );
};
