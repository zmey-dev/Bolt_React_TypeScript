import React from 'react';
import * as flags from 'country-flag-icons/react/3x2';

interface CountryFlagProps {
  countryCode: string;
  className?: string;
}

export function CountryFlag({ countryCode, className = "w-6 h-4" }: CountryFlagProps) {
  const Flag = (flags as Record<string, React.ComponentType>)[countryCode];
  
  if (!Flag) {
    return <div className={`bg-gray-700 rounded ${className}`} />;
  }

  return <Flag className={className} />;
}