'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const NavLink: React.FC<ComponentProps<typeof Link>> = ({ href, children, className }) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href as string);

  return (
    <Link
      href={href}
      className={cn(
        'text-lg font-bold uppercase',
        isActive ? 'text-foreground' : 'hover:text-foreground/80',
        className
      )}
    >
      {children}
    </Link>
  );
};

export const MobileNavLink: React.FC<ComponentProps<typeof Link>> = ({
  href,
  children,
  className,
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'text-lg font-bold uppercase',
        isActive ? 'text-foreground underline' : 'hover:text-foreground/80',
        className
      )}
    >
      {children}
    </Link>
  );
};

export const NavLine: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [lineStyle, setLineStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const updateLinePosition = useCallback(() => {
    const links = ref.current?.parentElement?.querySelectorAll('a[href]');
    let activeNavItem = null;

    if (links) {
      for (const link of links) {
        const href = link.getAttribute('href');
        if (href && pathname === href) {
          activeNavItem = link;
        }
      }
    }

    if (activeNavItem) {
      const rect = activeNavItem.getBoundingClientRect();
      const navRect = ref.current?.parentElement?.getBoundingClientRect();
      if (navRect) {
        setLineStyle({
          left: rect.left - navRect.left - 5,
          width: rect.width + 10,
        });
      }
    } else {
      setLineStyle(current => ({
        left: current.left + current.width / 2,
        width: 0,
      }));
    }
  }, [pathname]);

  useEffect(() => {
    updateLinePosition();
    window.addEventListener('resize', updateLinePosition);
    return () => {
      window.removeEventListener('resize', updateLinePosition);
    };
  }, [updateLinePosition]);

  return (
    <div
      ref={ref}
      className="bg-foreground absolute bottom-0 h-0.5 rounded-full transition-[left,width] duration-300"
      style={{ left: `${lineStyle.left}px`, width: `${lineStyle.width}px` }}
    />
  );
};
