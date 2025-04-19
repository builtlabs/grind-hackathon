import { getStoredSession } from '@/lib/session-keys/get-stored-session';
import { useAbstractClient, useCreateSession } from '@abstract-foundation/agw-react';
import { useQuery } from '@tanstack/react-query';
import { abstractTestnet } from 'viem/chains';
import { useAccount } from 'wagmi';

export function useSessionKey(options?: { enabled?: boolean }) {
  const { address } = useAccount();
  const { createSessionAsync } = useCreateSession();
  const { data: client } = useAbstractClient();

  return useQuery({
    queryKey: ['session'],
    queryFn: () => {
      if (!client || !address) {
        throw new Error('Client or address not available');
      }

      return getStoredSession(client, address, abstractTestnet, createSessionAsync);
    },
    enabled: Boolean(client) && options?.enabled !== undefined ? options.enabled : true,
  });
}
