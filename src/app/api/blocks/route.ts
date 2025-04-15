import { NextResponse } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { Block, CachedResponse } from './types';
import { publicClient } from '@/server/viem';

// solve the cache stampede or thundering herd problem
let pendingFetch: Promise<CachedResponse<Block[]>> | null = null;

async function fetchBlocks(): Promise<CachedResponse<Block[]>> {
  console.log('Fetching latest blocks...');
  const latestBlock = await publicClient.getBlock();
  const previousBlocks = await Promise.all([
    publicClient.getBlock({ blockNumber: latestBlock.number - 1n }),
    publicClient.getBlock({ blockNumber: latestBlock.number - 2n }),
    publicClient.getBlock({ blockNumber: latestBlock.number - 3n }),
    publicClient.getBlock({ blockNumber: latestBlock.number - 4n }),
    publicClient.getBlock({ blockNumber: latestBlock.number - 5n }),
    publicClient.getBlock({ blockNumber: latestBlock.number - 6n }),
    publicClient.getBlock({ blockNumber: latestBlock.number - 7n }),
    publicClient.getBlock({ blockNumber: latestBlock.number - 8n }),
    publicClient.getBlock({ blockNumber: latestBlock.number - 9n }),
  ]);

  const blocks = [latestBlock, ...previousBlocks];

  const timestamp = Date.now();
  return {
    data: blocks.map(block => ({
      number: block.number.toString(),
      hash: block.hash,
      timestamp: Number(block.timestamp),
    })),
    timestamp,
    refetchAt: timestamp + 500, // 1 seconds later
  };
}

const getBlocks = cache(
  async (): Promise<CachedResponse<Block[]>> => {
    if (pendingFetch) return pendingFetch;

    pendingFetch = fetchBlocks().finally(() => {
      // Release lock
      pendingFetch = null;
    });

    return pendingFetch;
  },
  ['blocks'],
  {
    tags: ['blocks'],
    revalidate: 0.5,
  }
);

export async function GET() {
  try {
    const data = await getBlocks();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch blocks!', error }, { status: 500 });
  }
}

export const revalidate = 0.5; // seconds
