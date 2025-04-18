import type { NextConfig } from 'next';
import path from 'path';

// https://github.com/radix-ui/primitives/issues/3485
const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.alias['@radix-ui/react-use-effect-event'] = path.resolve(
      __dirname,
      'src/stubs/use-effect-event.js'
    );
    return config;
  },
};

export default nextConfig;
