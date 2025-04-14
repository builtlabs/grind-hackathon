import { type CspDirective } from './types';

export function mergeCsp(sources: CspDirective[]): CspDirective {
  return sources.reduce<CspDirective>((acc, source) => {
    for (const directive in source) {
      if (!acc[directive]) {
        acc[directive] = [];
      }

      acc[directive] = Array.from(new Set([...acc[directive], ...source[directive]]));
    }
    return acc;
  }, {});
}

export function buildCspHeader(directives: CspDirective): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}
