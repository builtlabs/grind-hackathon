import { Button } from './ui/button';
import { Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useTurboMode } from '@/hooks/use-turbo-mode';

export const Turbo: React.FC = () => {
  const { session, createSession, clearSession } = useTurboMode();

  function handleTurboMode() {
    if (session) {
      clearSession();
    } else {
      createSession();
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="link"
            type="button"
            className="text-muted-foreground h-min text-xs"
            size="sm"
            onClick={handleTurboMode}
          >
            <Zap className={cn(session && 'fill-current')} />
            <span>
              {session ? 'Disable' : 'Enable'} Turbo <span className="hidden sm:inline">Mode</span>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="w-64" side="bottom">
          <p>
            Turbo mode uses session keys to send transactions without confirmation, allowing you to
            place bets and cash out quicker!
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
