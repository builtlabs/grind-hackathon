import { NextRequest, NextResponse } from 'next/server';
import { publicClient } from '@/server/viem';
import { abi, addresses } from '@/contracts/block-crash';
import { abstractTestnet } from 'viem/chains';
import { unstable_cache as cache } from 'next/cache';
import { ContractState } from './types';

const getState = cache(
  async (blockNumber: number): Promise<ContractState> => {
    console.log('Fetching state from contract...', blockNumber);
    const [[start, end, liquidity], history, bets] = await Promise.all([
      publicClient.readContract({
        abi,
        address: addresses[abstractTestnet.id],
        functionName: 'getRoundInfo',
        blockNumber: BigInt(blockNumber),
      }),
      publicClient.readContract({
        abi,
        address: addresses[abstractTestnet.id],
        functionName: 'getHistory',
        args: [7n],
      }),
      publicClient.readContract({
        abi,
        address: addresses[abstractTestnet.id],
        functionName: 'getBets',
      }),
    ]);

    return {
      current: blockNumber,
      start: Number(start),
      end: Number(end),
      liquidity: liquidity.toString(),
      history,
      bets: bets.map(bet => ({
        user: bet.user,
        amount: bet.amount.toString(),
        cashoutIndex: Number(bet.cashoutIndex),
      })),
    };
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
