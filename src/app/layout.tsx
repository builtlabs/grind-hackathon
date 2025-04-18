import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { headers } from 'next/headers';
import { Header } from '@/components/core/header';
import { Footer } from '@/components/core/footer';
import { BlockProvider } from '@/components/providers/block';
import { Toaster } from '@/components/ui/sonner';
import { AbstractWalletWrapper } from '@/components/providers/abstract';
import MatrixRainBackground from '@/components/background';
import { GameProvider } from '@/components/providers/game';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HashCrash',
  description:
    'HashCrash is a blockchain-powered crash game where every block mined increases your multiplier. But push too far and you risk it all. Stake your $GRIND and test your nerve in this high-stakes, on-chain game of timing and tension.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const nonce = headerStore.get('x-nonce') ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.className} antialiased`}>
        <AbstractWalletWrapper nonce={nonce}>
          <BlockProvider>
            <Header />
            <GameProvider>
              <div className="relative -mt-16 flex flex-col overflow-hidden xl:h-screen xl:min-h-[750px] xl:pt-16">
                <MatrixRainBackground />
                {children}
              </div>
            </GameProvider>
          </BlockProvider>
          <Footer />
        </AbstractWalletWrapper>
        <Toaster />
      </body>
    </html>
  );
}
