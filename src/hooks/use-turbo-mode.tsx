import { clearStoredSession } from '@/lib/session-keys/clear-stored-session';
import { createAndStoreSession } from '@/lib/session-keys/create-and-store-session';
import { useAbstractClient, useCreateSession } from '@abstract-foundation/agw-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { abstractTestnet } from 'viem/chains';
import { useAccount } from 'wagmi';
import { useGrindBalance } from './use-grind-balance';
import { useSendTransaction } from './use-send-transaction';
import { encodeFunctionData, maxUint256 } from 'viem';
import { abi as grindAbi, addresses as grindAddresses } from '@/contracts/grind';
import { addresses } from '@/contracts/block-crash';
import { useSessionKey } from './use-session-key';
import { useEffect } from 'react';

export function useTurboMode(options?: { enabled?: boolean; onEnabled?: () => void }) {
  const { address } = useAccount();
  const { createSessionAsync } = useCreateSession();
  const { data: client } = useAbstractClient();
  const grind = useGrindBalance();

  const queryClient = useQueryClient();
  const { data: session, isPending } = useSessionKey(options);

  const createSession = useMutation({
    mutationKey: ['create-session'],
    mutationFn: () => {
      if (!client || !address) {
        throw new Error('Client or address not available');
      }

      return createAndStoreSession(address, createSessionAsync);
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
    onSuccess: session => {
      toast.success('Turbo mode enabled', {
        id: 'turbo-mode',
        description: 'Turbo mode is now enabled.',
      });
      queryClient.setQueryData(['session'], () => session);
      options?.onEnabled?.();
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

  const { sendTransaction } = useSendTransaction({
    key: 'approve-grind',
  });

  function handleCreateSession() {
    if (!client || !address) {
      throw new Error('Client or address not available');
    }

    if (grind.data?.allowance === maxUint256) {
      createSession.mutate();
    } else {
      sendTransaction({
        transaction: {
          to: grindAddresses[abstractTestnet.id],
          data: encodeFunctionData({
            abi: grindAbi,
            functionName: 'approve',
            args: [addresses[abstractTestnet.id], maxUint256],
          }),
        },
        onSuccess: () => {
          grind.refetch();
          createSession.mutate();
        },
      });
    }
  }

  function handleClearSession() {
    if (!client || !address) {
      throw new Error('Client or address not available');
    }

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
