import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export const Sparkline = ({ 
  data, 
  width = 60, 
  height = 24, 
  color = 'hsl(var(--primary))',
  strokeWidth = 1.5
}: SparklineProps) => {
  const { path, isPositive } = useMemo(() => {
    if (!data || data.length === 0) {
      return { path: '', isPositive: true };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Avoid division by zero
    
    // Calculate points
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });
    
    // Create SVG path
    const pathData = points
      .map((point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${point.x} ${point.y}`;
      })
      .join(' ');
    
    // Determine trend
    const trend = data[data.length - 1] >= data[0];
    
    return { path: pathData, isPositive: trend };
  }, [data, width, height]);

  if (!data || data.length === 0) {
    return null;
  }

  const lineColor = color === 'auto' 
    ? (isPositive ? 'hsl(var(--profit))' : 'hsl(var(--loss))')
    : color;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
      preserveAspectRatio="none"
    >
      <path
        d={path}
        fill="none"
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
