import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Hex } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shorthandHex(hex?: Hex, length = 4): string {
  return hex ? `${hex.slice(0, length + 2)}...${hex.slice(-length)}` : '';
}

export function formatNumber(number: number) {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumSignificantDigits: 3,
  }).format(number);
}
