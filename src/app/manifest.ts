import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HashCrash',
    short_name: 'HashCrash',
    description:
      'HashCrash is a blockchain-powered crash game where every block mined increases your multiplier. But push too far and you risk it all. Stake your $GRIND and test your nerve in this high-stakes, on-chain game of timing and tension.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  };
}
