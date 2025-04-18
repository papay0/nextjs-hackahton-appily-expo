import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ArrowUpProps {
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}

export const ArrowUp: React.FC<ArrowUpProps> = ({ 
  width = 24, 
  height = 24, 
  stroke = '#FFFFFF',
  fill = 'none'
}) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={2}
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <Path d="M12 19V5" />
      <Path d="M5 12L12 5L19 12" />
    </Svg>
  );
}; 