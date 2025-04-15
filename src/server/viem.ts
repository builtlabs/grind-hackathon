import { abstractTestnet } from '@/lib/chain';
import { createPublicClient } from '@/lib/viem';

export const publicClient = createPublicClient(abstractTestnet);
