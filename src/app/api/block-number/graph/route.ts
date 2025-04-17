import { NextResponse } from 'next/server';
import { getBlockNumber } from '@/server/graph-queries';

export async function GET() {
  const { data, error } = await getBlockNumber();

  if (error !== null) {
    return NextResponse.json({ message: 'Failed to fetch block number!', error }, { status: 500 });
  }

  return NextResponse.json(data);
}
