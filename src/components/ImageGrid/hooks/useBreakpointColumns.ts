import { useMemo } from 'react';

export function useBreakpointColumns(columnCount: number) {
  return useMemo(() => ({
    default: columnCount,
    1100: Math.min(columnCount, 2),
    700: 1
  }), [columnCount]);
}