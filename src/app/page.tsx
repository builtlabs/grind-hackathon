import { GameBlock } from '@/components/game/block';
import { GameTable } from '@/components/game/table';
import { GameProvider } from '@/components/providers/game';

export default function Home() {
  return (
    <GameProvider>
      <main className="container flex h-full w-full justify-center gap-20 py-32">
        <div className="w-64 rounded border">BETTING</div>
        <GameBlock />
        <GameTable />
      </main>
    </GameProvider>
  );
}
