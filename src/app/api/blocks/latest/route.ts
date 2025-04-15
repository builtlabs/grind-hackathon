import { NextResponse } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { createPublicClient } from '@/lib/viem';
import { abstractTestnet } from 'viem/chains';
import { Block, CachedResponse } from '../types';

// solve the cache stampede or thundering herd problem
let pendingFetch: Promise<CachedResponse<Block>> | null = null;

async function fetchBlock(): Promise<CachedResponse<Block>> {
  console.log('Fetching latest block...');
  const publicClient = createPublicClient(abstractTestnet);
  const block = await publicClient.getBlock();

  const timestamp = Date.now();
  return {
    data: {
      number: block.number.toString(),
      hash: block.hash,
      timestamp: Number(block.timestamp),
    },
    timestamp,
    refetchAt: timestamp + 500,
  };
}

const getBlock = cache(
  async (): Promise<CachedResponse<Block>> => {
    if (pendingFetch) return pendingFetch;

    pendingFetch = fetchBlock().finally(() => {
      // Release lock
      pendingFetch = null;
    });

    return pendingFetch;
  },
  ['blocks', 'latest'],
  {
    tags: ['blocks', 'latest'],
    revalidate: 0.5,
  }
);

export async function GET() {
  try {
    const data = await getBlock();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch latest block!', error }, { status: 500 });
  }
}

export const revalidate = 0.5; // seconds
