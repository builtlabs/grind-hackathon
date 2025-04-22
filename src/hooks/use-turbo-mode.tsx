import { abi as abstractGlobalWalletAbi } from '@/contracts/abstract-global-wallet';
import { abi as sessionKeyValidatorAbi, addresses } from '@/contracts/session-key-validator';
import { abi as grindAbi, addresses as grindAddresses } from '@/contracts/grind';
import { encodeSession } from '@abstract-foundation/agw-client/sessions';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import {
  Account,
  Chain,
  concatHex,
  encodeFunctionData,
  maxUint256,
  SendTransactionParameters,
} from 'viem';
import { abstractTestnet } from 'viem/chains';
import { useAccount, usePublicClient } from 'wagmi';
import { useSendTransaction } from './use-send-transaction';
import { useGrindBalance } from './use-grind-balance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clearStoredSession } from '@/lib/session-keys/clear-stored-session';
import { useEffect } from 'react';
import { useSessionKey } from './use-session-key';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { getSessionConfig } from '@/lib/session-keys/session-config';
import { storeSession } from '@/lib/session-keys/store-session';

export function useTurboMode(options?: { enabled?: boolean; onEnabled?: () => void }) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();
  const { data: client } = useAbstractClient();
  const { sendTransaction } = useSendTransaction({
    key: 'turbo-mode',
  });
  const grind = useGrindBalance();
  const { data: session, isPending } = useSessionKey(options);

  const createSession = useMutation({
    mutationKey: ['create-session'],
    mutationFn: async () => {
      if (!client || !address) {
        throw new Error('Client or address not available');
      }

      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const sessionPrivateKey = generatePrivateKey();
      const sessionSigner = privateKeyToAccount(sessionPrivateKey);

      const session = getSessionConfig(sessionSigner.address);

      const validationHooks = await publicClient.readContract({
        address,
        abi: abstractGlobalWalletAbi,
        functionName: 'listHooks',
        args: [true],
      });

      const hasSessionModule = validationHooks.some(hook => hook === addresses[abstractTestnet.id]);

      const transaction: SendTransactionParameters<Chain, Account>[] = [];

      if (!hasSessionModule) {
        const encodedSession = encodeSession(session);
        transaction.push({
          to: address,
          data: encodeFunctionData({
            abi: abstractGlobalWalletAbi,
            functionName: 'addModule',
            args: [concatHex([addresses[abstractTestnet.id], encodedSession])],
          }),
        });
      } else {
        transaction.push({
          to: addresses[abstractTestnet.id],
          data: encodeFunctionData({
            abi: sessionKeyValidatorAbi,
            functionName: 'createSession',
            args: [session as never],
          }),
        });
      }

      if (grind.data?.allowance !== maxUint256) {
        transaction.push({
          to: grindAddresses[abstractTestnet.id],
          data: encodeFunctionData({
            abi: grindAbi,
            functionName: 'approve',
            args: [addresses[abstractTestnet.id], maxUint256],
          }),
        });
      }

      const sessionData = { session, privateKey: sessionPrivateKey };

      sendTransaction({
        transaction,
        onSuccess: () => {
          grind.refetch();
          storeSession(address, sessionData);
          queryClient.setQueryData(['session'], () => sessionData);
          options?.onEnabled?.();
        },
      });

      return sessionData;
    },
    onMutate: () => {
      toast.loading('Enabling turbo mode...', {
        id: 'turbo-mode',
        description: 'Approve the transaction in your Abstract wallet.',
      });
    },
    onError: () => {
      toast.error('Failed to enable turbo mode', {
        id: 'turbo-mode',
        description: 'There was an error enabling turbo mode.',
      });
    },
  });

  const clearSession = useMutation({
    mutationKey: ['clear-session'],
    mutationFn: async () => {
      if (!client || !address) {
        throw new Error('Client or address not available');
      }

      clearStoredSession(address);
      queryClient.setQueryData(['session'], () => null);
    },
    onMutate: () => {
      toast.loading('Disabling turbo mode...', {
        id: 'turbo-mode',
        description: 'Please wait while we disable turbo mode.',
      });
    },
    onError: () => {
      toast.error('Failed to enable disable mode', {
        id: 'turbo-mode',
        description: 'There was an error disabling turbo mode.',
      });
    },
    onSuccess: () => {
      toast.success('Turbo mode disabled', {
        id: 'turbo-mode',
        description: 'Turbo mode is now disabled.',
      });
    },
  });

  function handleCreateSession() {
    createSession.mutate();
  }

  function handleClearSession() {
    clearSession.mutate();
  }

  useEffect(() => {
    if (clearSession.isSuccess) {
      clearSession.reset();
      sendTransaction({
        transaction: {
          to: grindAddresses[abstractTestnet.id],
          data: encodeFunctionData({
            abi: grindAbi,
            functionName: 'approve',
            args: [addresses[abstractTestnet.id], 0n],
          }),
        },
        onSuccess: () => {
          grind.refetch();
        },
      });
    }
  }, [clearSession, grind, sendTransaction]);

  return {
    session,
    isPending: isPending || createSession.isPending || clearSession.isPending,
    createSession: handleCreateSession,
    clearSession: handleClearSession,
  };
}
