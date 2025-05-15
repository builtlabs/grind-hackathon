import { ContractState } from '@/app/api/game/types';
import { formatUnits } from 'viem';

export const multipliers = [
  500000n,
  750000n,
  1000000n,
  1250000n,
  1500000n,
  2000000n,
  2500000n,
  3000000n,
  4000000n,
  5000000n,
  6000000n,
  7000000n,
  9000000n,
  10000000n,
  12500000n,
  15000000n,
  17500000n,
  20000000n,
  22500000n,
  25000000n,
  27500000n,
  30000000n,
  32500000n,
  35000000n,
  37500000n,
  40000000n,
  42500000n,
  45000000n,
  47500000n,
  50000000n,
  52500000n,
  55000000n,
  57500000n,
  60000000n,
  62500000n,
  65000000n,
  67500000n,
  70000000n,
  72500000n,
  75000000n,
  77500000n,
  80000000n,
  82500000n,
  85000000n,
  87500000n,
  90000000n,
  92500000n,
  95000000n,
  97500000n,
  100000000n,
] as const;

export interface BlockInfo {
  number: number;
  multiplier: bigint;
  result: 'ok' | 'crash' | 'none';
}

export function createBlock(
  state?: Omit<ContractState, 'liquidity' | 'history' | 'bets'>
): BlockInfo {
  if (!state) {
    return {
      number: 0,
      multiplier: 0n,
      result: 'none',
    };
  }

  if (state.end && state.current === state.end) {
    return {
      number: state.current,
      multiplier: multipliers[state.current - state.start],
      result: 'crash',
    };
  }

  const end = state.end || state.start + multipliers.length - 1;

  if (state.start <= state.current && state.current <= end) {
    return {
      number: state.current,
      multiplier: multipliers[state.current - state.start],
      result: 'ok',
    };
  }

  return {
    number: state.current,
    multiplier: 0n,
    result: 'none',
  };
}

export function formatMultiplier(multiplier: bigint): string {
  return formatUnits(multiplier, 6);
}

export function stateCountdown(state: Omit<ContractState, 'liquidity' | 'history' | 'bets'>) {
  if (state.start && state.current && state.start > state.current) {
    return {
      type: 'starting',
      countdown: state.start - state.current,
      target: state.start,
    } as const;
  }

  const end = state.end || state.start + multipliers.length - 1;

  if (state.start && state.current && state.start <= state.current && state.current < end) {
    return {
      type: 'ending',
      countdown: state.start + multipliers.length - state.current,
      target: state.start + multipliers.length - 1,
    } as const;
  }

  if (state.start && end && end <= state.current) {
    return {
      type: 'ended',
      countdown: 0,
      target: end,
    } as const;
  }

  return null;
}

export function stillAlive(
  bet: { cashoutIndex: number },
  state: { start: number; end?: number }
): boolean {
  return !state.end || state.start + bet.cashoutIndex < state.end;
}

export function stillGrinding(
  bet: { cashoutIndex: number; cancelled: boolean },
  state: { start: number; current: number; end?: number }
): boolean {
  return !state.end && state.start + bet.cashoutIndex >= state.current && !bet.cancelled;
}
