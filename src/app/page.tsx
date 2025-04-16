import { GameBlock } from '@/components/game/block';
import { GameTable } from '@/components/game/table';
import { BlockProvider } from '@/components/providers/block';
import { GameProvider } from '@/components/providers/game';

export default function Home() {
  return (
    <BlockProvider>
      <GameProvider>
        <main className="container flex w-full grow items-center justify-center gap-5">
          <div className="h-96 w-64 rounded border">BETTING</div>
          <GameBlock />
          <GameTable />
        </main>
      </GameProvider>
    </BlockProvider>
  );
}
