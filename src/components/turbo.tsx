import { abstractTestnet } from 'viem/chains';
import { Button } from './ui/button';
import { Zap } from 'lucide-react';
import { useAbstractSession } from '@/hooks/use-abstract-session';
import { useEffect, useState } from 'react';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import { toast } from 'sonner';

export const Turbo: React.FC = () => {
  const { data: client } = useAbstractClient();
  const { getStoredSession, clearStoredSession, createAndStoreSession } =
    useAbstractSession(abstractTestnet);
  const [session, setSession] = useState<Awaited<ReturnType<typeof getStoredSession>>>(null);

  function handleTurboMode() {
    if (!client) return;

    if (session) {
      clearStoredSession();
      toast.success('Turbo mode disabled');
      setSession(null);
    } else {
      const promise = createAndStoreSession()?.then(session => {
        if (session) {
          setSession(session);
        }
      });

      if (promise) {
        toast.promise(promise, {
          loading: 'Enabling turbo mode...',
          success: 'Turbo mode enabled',
          error: 'Failed to enable turbo mode',
        });
      } else {
        toast.error('Failed to enable turbo mode');
      }
    }
  }

  useEffect(() => {
    if (client && !session) {
      getStoredSession()?.then(session => {
        setSession(session);
      });
    }
  }, [client, getStoredSession, session]);

  if (!client) return null;

  return (
    <Button
      variant="link"
      type="button"
      className="text-muted-foreground ml-auto text-xs"
      size="sm"
      onClick={handleTurboMode}
    >
      <Zap />
      {session ? 'disable turbo mode' : 'enable turbo mode'}
    </Button>
  );
};
