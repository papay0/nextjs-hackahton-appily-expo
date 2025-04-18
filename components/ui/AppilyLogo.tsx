import React from 'react';
import SvgComponent from './AppilyLogoSvg';

interface AppilyLogoProps {
  size?: number;
  color?: string;
}

export function AppilyLogo({ size = 40, color = '#FEC237' }: AppilyLogoProps) {
  return (
    <SvgComponent 
      width={size}
      height={size}
    />
  );
} 