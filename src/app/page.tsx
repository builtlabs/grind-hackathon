import { Betting } from '@/components/game/betting';
import { GameBlock } from '@/components/game/block';
import { GameTable } from '@/components/game/table';
import { GameProvider } from '@/components/providers/game';

export default function Home() {
  return (
    <GameProvider>
      <main className="container flex h-full w-full justify-center gap-20 py-32">
        <Betting />
        <GameBlock />
        <GameTable />
      </main>
    </GameProvider>
  );
}
