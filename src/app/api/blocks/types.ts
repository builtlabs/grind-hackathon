import { Hex } from 'viem';

export interface CachedResponse<T> {
  data: T;
  timestamp: number;
  refetchAt: number;
}

export interface Block {
  number: string;
  hash: Hex;
  timestamp: number;
}
