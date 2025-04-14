import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PRIVY_APP_SECRET: z.string(),
    ALCHEMY_API_KEY: z.string(),
    ALCHEMY_GRAPH_URL: z.string().url(),
    VERCEL_AUTOMATION_BYPASS_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_VERCEL_ENV: z.enum(['development', 'preview', 'production']).default('development'),
    NEXT_PUBLIC_VERCEL_URL: z
      .string()
      .default('localhost:3000')
      .transform(str =>
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? `https://${str}` : `http://${str}`
      ),
    NEXT_PUBLIC_PRIVY_APP_ID: z.string(),
    NEXT_PUBLIC_PRIVY_CLIENT_ID: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    NEXT_PUBLIC_PRIVY_CLIENT_ID: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID,
  },
});

export { env };
