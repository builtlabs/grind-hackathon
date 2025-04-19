export type ContractState = {
  current: number;
  start: number;
  end: number;
  liquidity: string;
  history: readonly number[];
  bets: {
    user: `0x${string}`;
    amount: string;
    cashoutIndex: number;
    cancelled: boolean;
  }[];
};
