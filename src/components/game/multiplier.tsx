import { ComponentProps } from 'react';
import { Badge } from '../ui/badge';
import { formatMultiplier } from '@/lib/block-crash';

function multiplierVariant(multiplier: number): ComponentProps<typeof Badge>['variant'] {
  if (multiplier < 1) {
    return 'destructive';
  }

  if (multiplier === 1) {
    return 'warning';
  }

  if (multiplier > 50) {
    return 'special';
  }

  // TODO: Add more variants
  return 'constructive';
}

export const MultiplierBadge: React.FC<{
  multiplier: bigint;
  variant?: ComponentProps<typeof Badge>['variant'];
}> = ({ multiplier, variant: variantOverride }) => {
  const formatted = formatMultiplier(BigInt(multiplier));
  const variant = variantOverride ? variantOverride : multiplierVariant(Number(formatted));

  return (
    <Badge variant={variant} className="w-12">
      {formatted}x
    </Badge>
  );
};
