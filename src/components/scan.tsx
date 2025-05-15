'use client';

import { scan } from 'react-scan';
import { useEffect } from 'react';
import { env } from '@/env.mjs';

export const ReactScan: React.FC = () => {
  useEffect(() => {
    scan({
      enabled: env.NEXT_PUBLIC_VERCEL_ENV === 'development',
    });
  }, []);

  return null;
};
