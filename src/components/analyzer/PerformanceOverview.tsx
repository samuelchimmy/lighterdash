import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Receipt, Target, Award, LineChart } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
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
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '0ms' }}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg transition-colors duration-300 ${kpis.netPnL >= 0 ? 'bg-profit/10' : 'bg-loss/10'}`}>
                {kpis.netPnL >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-profit animate-in zoom-in duration-300" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-loss animate-in zoom-in duration-300" />
                )}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">Net Closed PnL</span>
            </div>
            <p className={`text-base font-bold transition-colors duration-300 ${kpis.netPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatCurrency(animatedNetPnL)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card via-card to-muted/30 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-muted">
                <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">Total Fees</span>
            </div>
            <p className="text-base font-bold text-foreground">
              {formatCurrency(kpis.totalFees)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Target className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">Win Rate</span>
            </div>
            <p className="text-base font-bold text-foreground">
              {animatedWinRate.toFixed(1)}%
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {kpis.winningTrades}W / {kpis.losingTrades}L
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg transition-colors duration-300 ${kpis.profitFactor >= 1 ? 'bg-profit/10' : 'bg-loss/10'}`}>
                <Award className={`w-3.5 h-3.5 transition-colors duration-300 ${kpis.profitFactor >= 1 ? 'text-profit' : 'text-loss'}`} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">Profit Factor</span>
            </div>
            <p className={`text-base font-bold transition-colors duration-300 ${kpis.profitFactor >= 1 ? 'text-profit' : 'text-loss'}`}>
              {formatNumber(kpis.profitFactor)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-card to-profit/5 border-border/50 shadow-md hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-400" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-3">
            <span className="text-[10px] text-muted-foreground">Gross Profit</span>
            <p className="text-sm font-semibold text-profit">{formatCurrency(kpis.grossProfit)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-loss/5 border-border/50 shadow-md hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-400" style={{ animationDelay: '250ms' }}>
          <CardContent className="p-3">
            <span className="text-[10px] text-muted-foreground">Gross Loss</span>
            <p className="text-sm font-semibold text-loss">-{formatCurrency(kpis.grossLoss)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-profit/5 border-border/50 shadow-md hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-400" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-3">
            <span className="text-[10px] text-muted-foreground">Avg Winner</span>
            <p className="text-sm font-semibold text-profit">{formatCurrency(kpis.avgWinningTrade)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-loss/5 border-border/50 shadow-md hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-400" style={{ animationDelay: '350ms' }}>
          <CardContent className="p-3">
            <span className="text-[10px] text-muted-foreground">Avg Loser</span>
            <p className="text-sm font-semibold text-loss">-{formatCurrency(kpis.avgLosingTrade)}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight for Overall Performance */}
      <Card className="bg-gradient-to-br from-primary/5 via-card to-purple-500/5 border-primary/20 overflow-hidden relative shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '400ms' }}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        <CardContent className="p-4 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-primary">
                  <path d="M12 .75a8.25 8.25 0 0 0-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 0 0 .577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 0 1-.937-.171.75.75 0 1 1 .374-1.453 5.261 5.261 0 0 0 2.626 0 .75.75 0 1 1 .374 1.452 6.712 6.712 0 0 1-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 0 0 .577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0 0 12 .75Z" />
                  <path fillRule="evenodd" d="M9.013 19.9a.75.75 0 0 1 .877-.597 11.319 11.319 0 0 0 4.22 0 .75.75 0 1 1 .28 1.473 12.819 12.819 0 0 1-4.78 0 .75.75 0 0 1-.597-.876ZM9.754 22.344a.75.75 0 0 1 .824-.668 13.682 13.682 0 0 0 2.844 0 .75.75 0 1 1 .156 1.492 15.156 15.156 0 0 1-3.156 0 .75.75 0 0 1-.668-.824Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">Get AI-Powered Insights</h3>
                <p className="text-[10px] text-muted-foreground">
                  Analyze your trading with personalized AI recommendations
                </p>
              </div>
            </div>
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground px-3 py-1.5 rounded-lg text-[10px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            />
          </div>
        </CardContent>
      </Card>


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cumulative PnL Chart */}
        <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-lg animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: '450ms' }}>
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-xs flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/10">
                <LineChart className="w-3 h-3 text-primary" />
              </div>
              Cumulative PnL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={chartData}>
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
                    cursor={{ fill: 'hsl(var(--muted) / 0.15)' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card) / 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid hsl(var(--border) / 0.5)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 12px hsl(var(--background) / 0.3)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontSize: '11px', marginBottom: '2px' }}
                    formatter={(value: number) => [
                      <span key="val" style={{ color: value >= 0 ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)', fontWeight: 600, fontSize: '12px' }}>
                        ${value.toFixed(2)}
                      </span>,
                      <span key="label" style={{ color: 'hsl(var(--foreground))', fontSize: '10px' }}>PnL</span>
                    ]}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Period PnL Chart */}
        <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-lg animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: '500ms' }}>
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-xs flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/10">
                <LineChart className="w-3 h-3 text-primary" />
              </div>
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
                    cursor={{ fill: 'hsl(var(--muted) / 0.15)' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card) / 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid hsl(var(--border) / 0.5)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 12px hsl(var(--background) / 0.3)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontSize: '11px', marginBottom: '2px' }}
                    formatter={(value: number) => [
                      <span key="val" style={{ color: value >= 0 ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)', fontWeight: 600, fontSize: '12px' }}>
                        ${value.toFixed(2)}
                      </span>,
                      <span key="label" style={{ color: 'hsl(var(--foreground))', fontSize: '10px' }}>PnL</span>
                    ]}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Bar 
                    dataKey="pnl" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {periodChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.pnl >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Badge */}
      <div className="flex items-center justify-center gap-2 flex-wrap animate-in fade-in duration-500" style={{ animationDelay: '600ms' }}>
        <Badge variant="outline" className="text-[9px] px-2 py-0.5 hover:scale-105 transition-transform">
          {kpis.totalTrades} Total Trades
        </Badge>
        <Badge variant={kpis.profitFactor >= 1 ? "default" : "destructive"} className="text-[9px] px-2 py-0.5 hover:scale-105 transition-transform">
          {kpis.profitFactor >= 2 ? 'Excellent' : kpis.profitFactor >= 1.5 ? 'Good' : kpis.profitFactor >= 1 ? 'Profitable' : 'Needs Work'}
        </Badge>
        <Badge variant="outline" className="text-[9px] px-2 py-0.5 hover:scale-105 transition-transform">
          Payoff Ratio: {formatNumber(kpis.payoffRatio)}
        </Badge>
      </div>
    </div>
  );
}
