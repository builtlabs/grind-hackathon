import { Betting } from '@/components/game/betting';
import { GameBlock } from '@/components/game/block';
import { GameTable } from '@/components/game/table';
import { GameProvider } from '@/components/providers/game';

export default function Home() {
  return (
    <GameProvider>
      <main className="container flex h-full w-full grow flex-col justify-between gap-10 py-20 max-[1280px]:max-w-md xl:flex-row xl:py-32">
        <Betting className="order-1 xl:order-none" />
        <GameBlock />
        <GameTable className="order-2 xl:order-none" />
      </main>
    </GameProvider>
  );
}
