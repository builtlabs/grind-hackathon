import { Betting } from '@/components/game/betting';
import { GameBlock } from '@/components/game/block';
import { GameTable } from '@/components/game/table';
import { IntroDialog } from '@/components/intro';

export default function Home() {
  return (
    <main className="container flex h-full w-full grow flex-col justify-between gap-10 py-20 max-[1280px]:max-w-md xl:flex-row xl:py-32">
      <IntroDialog />

      <Betting className="order-1 xl:order-none" />
      <GameBlock />
      <GameTable className="order-2 xl:order-none" />
    </main>
  );
}
