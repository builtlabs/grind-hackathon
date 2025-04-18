import { Betting } from '@/components/game/betting';
import { GameBlock } from '@/components/game/block';
import { GameTable } from '@/components/game/table';
import { GameProvider } from '@/components/providers/game';

export default function Home() {
  return (
    <GameProvider>
      <main className="container flex h-full w-full flex-col justify-between gap-10 py-20 max-[1024px]:max-w-md lg:flex-row lg:py-32">
        <Betting className="order-1 lg:order-none" />
        <GameBlock />
        <GameTable className="order-2 lg:order-none" />
      </main>
    </GameProvider>
  );
}
