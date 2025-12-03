import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrencySmart } from '@/lib/lighter-api';
import type { PnlDataPoint } from '@/types/lighter';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Trash2, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card animate-slide-up delay-150">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Account Value Chart
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No historical data available yet</p>
          <p className="text-xs text-muted-foreground mt-1">Data will be collected as you use the dashboard</p>
        </div>
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
        <div className="glass-strong rounded-xl p-4 shadow-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-2">
            {new Date(data.timestamp).toLocaleString()}
          </p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Account Value:</span>
              <span className="font-mono-numbers">{formatCurrencySmart(data.accountValue)}</span>
            </p>
            <p className={`text-sm font-semibold flex items-center justify-between gap-4 ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              <span className="text-muted-foreground">PnL:</span>
              <span className="font-mono-numbers">{formatCurrencySmart(data.pnl)}</span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center justify-between gap-4">
              <span>Collateral:</span>
              <span className="font-mono-numbers">{formatCurrencySmart(data.collateral)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card animate-slide-up delay-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Account Value Chart</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              className={`flex items-center gap-1 font-semibold font-mono-numbers ${
                chartMetrics.isPositive 
                  ? 'bg-profit/20 text-profit border-profit/30' 
                  : 'bg-loss/20 text-loss border-loss/30'
              } border`}
            >
              {chartMetrics.isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {formatCurrencySmart(Math.abs(chartMetrics.change))}
            </Badge>
            <span className={`text-sm font-medium ${chartMetrics.isPositive ? 'text-profit' : 'text-loss'}`}>
              {chartMetrics.isPositive ? '+' : ''}{chartMetrics.changePercent.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground">
              ({timeRange})
            </span>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
          {(['24h', '1W', '1M', 'All'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange(range)}
              className={`text-xs h-8 px-3 transition-all ${
                timeRange === range 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="w-full h-[300px] relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="gradientAccountValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradientPnlPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradientPnlNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--loss))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--loss))" stopOpacity={0.02} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3} 
              vertical={false}
            />
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
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={0} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="3 3" 
              strokeOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="accountValue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#gradientAccountValue)"
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
                filter: "url(#glow)"
              }}
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
          <div className="w-3 h-3 rounded-full bg-primary shadow-glow-primary" />
          <span>Account Value</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${chartMetrics.isPositive ? 'bg-profit' : 'bg-loss'}`}
            style={{ boxShadow: chartMetrics.isPositive ? 'var(--shadow-glow-profit)' : 'var(--shadow-glow-loss)' }}
          />
          <span>PnL</span>
        </div>
      </div>
    </Card>
  );
};
