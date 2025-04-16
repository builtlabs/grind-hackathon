import { NextRequest, NextResponse } from 'next/server';
import { publicClient } from '@/server/viem';
import { abi, addresses } from '@/contracts/moon-sheep';
import { abstractTestnet } from 'viem/chains';
import { unstable_cache as cache } from 'next/cache';

const getState = cache(
  (blockNumber: number) => {
    console.log('Fetching state from contract...', blockNumber);
    return publicClient.readContract({
      abi,
      address: addresses[abstractTestnet.id],
      functionName: 'owner',
      blockNumber: BigInt(blockNumber),
    });
  },
  ['contract-state'],
  {
    revalidate: false, // cache forever; since we are using blockNumber as a cache key
    tags: ['contract-state'], // invalidate cache if block reorg happens
  }
);

export async function GET(req: NextRequest) {
  const blockNumber = req.nextUrl.searchParams.get('blockNumber');

  if (!blockNumber) {
    return NextResponse.json({ message: 'Block number is required' }, { status: 400 });
  }

  try {
    if (isNaN(Number(blockNumber))) {
      return NextResponse.json({ message: 'Block number must be a number' }, { status: 400 });
    }

    const data = await getState(Number(blockNumber));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching state:', error);
    return NextResponse.json({ message: 'Error fetching state' }, { status: 500 });
  }
}
