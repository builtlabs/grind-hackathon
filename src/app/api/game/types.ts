import { ReadContractReturnType } from 'viem';
import { type abi } from '@/contracts/moon-sheep';

export type ContractState = ReadContractReturnType<typeof abi, 'owner'>;
