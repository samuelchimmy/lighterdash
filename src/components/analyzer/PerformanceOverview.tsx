import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { KPIMetrics, CumulativePnLPoint } from '@/lib/csv-trade-analyzer';
import { AITooltip } from './AITooltip';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';

interface PerformanceOverviewProps {
  kpis: KPIMetrics;
  cumulativePnL: CumulativePnLPoint[];
  periodPnL: { period: string; pnl: number }[];
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (absValue >= 1000) return `$${(value / 1000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number): string {
  if (value === Infinity) return '∞';
  return value.toFixed(2);
}

export function PerformanceOverview({ kpis, cumulativePnL, periodPnL }: PerformanceOverviewProps) {
  const animatedNetPnL = useAnimatedCounter(kpis.netPnL);
  const animatedWinRate = useAnimatedCounter(kpis.winRate);

  const chartData = useMemo(() => {
    // Aggregate by date for cleaner chart
    const dateMap = new Map<string, number>();
    let running = 0;
    cumulativePnL.forEach(point => {
      running = point.pnl;
      dateMap.set(point.dateStr, running);
    });
    return Array.from(dateMap.entries()).map(([date, pnl]) => ({ date, pnl }));
  }, [cumulativePnL]);

  const periodChartData = useMemo(() => {
    return periodPnL.slice(-14); // Last 14 periods
  }, [periodPnL]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border hover-glow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Net Closed PnL</span>
              {kpis.netPnL >= 0 ? (
                <TrendingUp className="w-4 h-4 text-profit" />
              ) : (
                <TrendingDown className="w-4 h-4 text-loss" />
              )}
            </div>
            <p className={`text-2xl font-bold ${kpis.netPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatCurrency(animatedNetPnL)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover-glow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Fees</span>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(kpis.totalFees)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover-glow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <Target className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {animatedWinRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.winningTrades}W / {kpis.losingTrades}L
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover-glow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Profit Factor</span>
              <Award className="w-4 h-4 text-primary" />
            </div>
            <p className={`text-2xl font-bold ${kpis.profitFactor >= 1 ? 'text-profit' : 'text-loss'}`}>
              {formatNumber(kpis.profitFactor)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Gross Profit</span>
            <p className="text-lg font-semibold text-profit">{formatCurrency(kpis.grossProfit)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Gross Loss</span>
            <p className="text-lg font-semibold text-loss">-{formatCurrency(kpis.grossLoss)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Avg Winner</span>
            <p className="text-lg font-semibold text-profit">{formatCurrency(kpis.avgWinningTrade)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-sm text-muted-foreground">Avg Loser</span>
            <p className="text-lg font-semibold text-loss">-{formatCurrency(kpis.avgLosingTrade)}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight for Overall Performance */}
      <div className="flex justify-end">
        <AITooltip
          metricType="overall_performance"
          data={{
            netPnL: kpis.netPnL,
            winRate: kpis.winRate,
            profitFactor: kpis.profitFactor,
            payoffRatio: kpis.payoffRatio,
            totalTrades: kpis.totalTrades,
            avgWinner: kpis.avgWinningTrade,
            avgLoser: kpis.avgLosingTrade
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative PnL Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Cumulative PnL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL']}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Period PnL Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Daily Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL']}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Bar 
                    dataKey="pnl" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Badge */}
      <div className="flex items-center justify-center gap-2">
        <Badge variant="outline" className="text-sm">
          {kpis.totalTrades} Total Trades
        </Badge>
        <Badge variant={kpis.profitFactor >= 1 ? "default" : "destructive"} className="text-sm">
          {kpis.profitFactor >= 2 ? 'Excellent' : kpis.profitFactor >= 1.5 ? 'Good' : kpis.profitFactor >= 1 ? 'Profitable' : 'Needs Work'}
        </Badge>
        <Badge variant="outline" className="text-sm">
          Payoff Ratio: {formatNumber(kpis.payoffRatio)}
        </Badge>
      </div>
    </div>
  );
}
