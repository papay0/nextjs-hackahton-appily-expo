import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

interface ArrowUpProps extends SvgProps {
  width?: number;
  height?: number;
  stroke?: string;
}

export const ArrowUp: React.FC<ArrowUpProps> = ({
  width = 24,
  height = 24,
  stroke = '#FFFFFF',
  ...props
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Path d="M12 19V5" />
      <Path d="M5 12l7-7 7 7" />
    </Svg>
  );
};

export default ArrowUp; 