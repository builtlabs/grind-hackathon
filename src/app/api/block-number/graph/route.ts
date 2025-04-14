import { NextResponse } from 'next/server';
import { getBlockNumber } from '@/server/graph-queries';
import { getPrivySession } from '@/server/privy';

export async function GET() {
  const session = await getPrivySession();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await getBlockNumber();

  if (error !== null) {
    return NextResponse.json({ message: 'Failed to fetch block number!', error }, { status: 500 });
  }

  return NextResponse.json(data);
}
