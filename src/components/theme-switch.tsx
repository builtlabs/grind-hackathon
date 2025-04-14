'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();

  function handleToggle() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <button
      type="button"
      className={cn(
        'border-border bg-background/20 flex size-10 items-center justify-center rounded-full border-2 transition-all hover:brightness-75 motion-reduce:transition-none',
        className
      )}
      onClick={handleToggle}
      title="Toggle theme"
    >
      <Sun className="size-5 scale-100 rotate-0 transition-transform motion-reduce:transition-none dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-5 scale-0 rotate-90 transition-transform motion-reduce:transition-none dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
