import { useState, useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';

export function useColumnLayout() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  // Allow 2 columns on mobile
  const availableColumns = useMemo(() => {
    if (isMobile) return [2]; // Only 2 columns on mobile
    if (isTablet) return [2, 3]; // 2 or 3 columns on tablets
    return [2, 3, 4]; // 2, 3, or 4 columns on larger screens
  }, [isMobile, isTablet]);
  
  // Set initial column count based on screen size
  const initialColumns = isMobile ? 2 : isTablet ? 3 : 4;
  const [columnCount, setColumnCount] = useState(initialColumns);

  // Force 2 columns on mobile
  const breakpointColumns = useMemo(() => ({
    default: columnCount,
    1024: Math.min(columnCount, 3), // Max 3 columns on tablets
    640: 2 // Force 2 columns on mobile
  }), [columnCount]);

  return {
    columnCount,
    setColumnCount,
    breakpointColumns,
    availableColumns
  };
}