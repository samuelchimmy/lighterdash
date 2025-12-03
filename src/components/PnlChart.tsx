import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrencySmart } from '@/lib/lighter-api';
import type { PnlDataPoint } from '@/types/lighter';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Trash2, LineChart as LineChartIcon } from 'lucide-react';

interface PnlChartProps {
  data: PnlDataPoint[];
  onClearHistory: () => void;
}

type TimeRange = '24h' | '1W' | '1M' | 'All';

export const PnlChart = ({ data, onClearHistory }: PnlChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = Date.now();
    let cutoffTime = 0;

    switch (timeRange) {
      case '24h':
        cutoffTime = now - 24 * 60 * 60 * 1000;
        break;
      case '1W':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '1M':
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case 'All':
        cutoffTime = 0;
        break;
    }

    return data
      .filter(point => point.timestamp >= cutoffTime)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [data, timeRange]);

  const chartMetrics = useMemo(() => {
    if (filteredData.length === 0) {
      return { change: 0, changePercent: 0, isPositive: false };
    }

    const firstValue = filteredData[0].accountValue;
    const lastValue = filteredData[filteredData.length - 1].accountValue;
    const change = lastValue - firstValue;
    const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;

    return {
      change,
      changePercent,
      isPositive: change >= 0,
    };
  }, [filteredData]);

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <LineChartIcon className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
          <h3 className="text-lg font-semibold text-foreground">Account Value Chart</h3>
        </div>
        <p className="text-muted-foreground text-center py-8">No historical data available yet</p>
        <p className="text-xs text-muted-foreground text-center">Data will be collected as you use the dashboard</p>
      </Card>
    );
  }

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeRange === '24h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '1W') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
          <p className="text-xs text-muted-foreground mb-2">
            {new Date(data.timestamp).toLocaleString()}
          </p>
          <p className="text-sm font-semibold text-foreground">
            Account Value: {formatCurrencySmart(data.accountValue)}
          </p>
          <p className={`text-sm font-semibold ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            PnL: {formatCurrencySmart(data.pnl)}
          </p>
          <p className="text-xs text-muted-foreground">
            Collateral: {formatCurrencySmart(data.collateral)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <LineChartIcon className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
            <h3 className="text-lg font-semibold text-foreground">Account Value Chart</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-sm font-semibold ${chartMetrics.isPositive ? 'text-profit' : 'text-loss'}`}>
              {chartMetrics.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {formatCurrencySmart(Math.abs(chartMetrics.change))}
            </span>
            <span className={`text-sm ${chartMetrics.isPositive ? 'text-profit' : 'text-loss'}`}>
              ({chartMetrics.isPositive ? '+' : ''}{chartMetrics.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
          {(['24h', '1W', '1M', 'All'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="text-xs px-3"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="gradientAccountValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradientPnlPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradientPnlNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--loss))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--loss))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />
            <Area
              type="monotone"
              dataKey="accountValue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#gradientAccountValue)"
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke={chartMetrics.isPositive ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
              strokeWidth={2}
              fill={chartMetrics.isPositive ? 'url(#gradientPnlPositive)' : 'url(#gradientPnlNegative)'}
              dot={false}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary rounded-full"></div>
          <span>Account Value</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-0.5 ${chartMetrics.isPositive ? 'bg-profit' : 'bg-loss'} rounded-full`} style={{ borderTop: '2px dashed' }}></div>
          <span>PnL</span>
        </div>
      </div>
    </Card>
  );
};
