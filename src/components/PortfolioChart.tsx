import { Card } from '@/components/ui/card';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Position } from '@/types/lighter';
import { formatCurrencySmart } from '@/lib/lighter-api';

interface PortfolioChartProps {
  positions: Position[];
}

const COLORS = [
  'hsl(160 84% 39%)',  // Primary green
  'hsl(160 70% 50%)',  // Lighter green
  'hsl(180 80% 40%)',  // Teal
  'hsl(140 80% 40%)',  // Another green shade
  'hsl(200 70% 45%)',  // Blue-green
  'hsl(120 60% 45%)',  // Light green
];

export const PortfolioChart = ({ positions }: PortfolioChartProps) => {
  const chartData = useMemo(() => {
    if (!positions || positions.length === 0) return [];

    return positions
      .map((position) => {
        const value = Math.abs(parseFloat(position.position_value || '0'));
        return {
          name: position.symbol,
          value: value,
          size: parseFloat(position.position || '0'),
          side: parseFloat(position.position || '0') > 0 ? 'LONG' : 'SHORT',
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [positions]);

  const totalValue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="p-6 bg-card border-border shadow-card hover-glow-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Portfolio Composition</h3>
        <p className="text-muted-foreground text-center py-8">No positions to display</p>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalValue) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Value: {formatCurrencySmart(data.value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Allocation: {percentage}%
          </p>
          <p className="text-sm text-muted-foreground">
            Side: <span className={data.side === 'LONG' ? 'text-profit' : 'text-loss'}>
              {data.side}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / totalValue) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-foreground font-medium">{entry.value}</span>
              <span className="text-muted-foreground">({percentage}%)</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="p-6 bg-card border-border shadow-card hover-glow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Portfolio Composition</h3>
        <p className="text-sm text-muted-foreground">
          Total Value: {formatCurrencySmart(totalValue)}
        </p>
      </div>
      
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="hsl(var(--border))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
