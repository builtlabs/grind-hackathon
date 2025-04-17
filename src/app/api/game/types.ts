export type ContractState = {
  start: number;
  end: number;
  liquidity: string;
  history: readonly number[];
  bets: {
    user: `0x${string}`;
    amount: string;
    cashoutIndex: number;
  }[];
};
