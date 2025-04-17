import { env } from '@/env.mjs';
import { abstractTestnet } from '@/lib/chain';
import { createWalletClient } from '@/lib/viem';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const account = privateKeyToAccount(env.MASTER_KEY as Hex);
export const walletClient = createWalletClient(abstractTestnet, account);
