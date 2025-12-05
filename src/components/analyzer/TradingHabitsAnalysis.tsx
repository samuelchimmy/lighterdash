import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Clock, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { SideAnalysis, RoleAnalysis, TypeAnalysis, HourlyPattern, DailyPattern } from '@/lib/csv-trade-analyzer';
import { AITooltip } from './AITooltip';

interface TradingHabitsAnalysisProps {
  sideAnalysis: SideAnalysis;
  roleAnalysis: RoleAnalysis;
  typeAnalysis: TypeAnalysis;
  hourlyPatterns: HourlyPattern[];
  dailyPatterns: DailyPattern[];
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number): string {
  if (value === Infinity) return '∞';
  return value.toFixed(2);
}

export function TradingHabitsAnalysis({
  sideAnalysis,
  roleAnalysis,
  typeAnalysis,
  hourlyPatterns,
  dailyPatterns
}: TradingHabitsAnalysisProps) {
  const filteredHourlyPatterns = hourlyPatterns.filter(h => h.trades > 0);
  const filteredDailyPatterns = dailyPatterns.filter(d => d.trades > 0);

  return (
    <div className="space-y-4">
      {/* Side Analysis */}
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-lg">
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 text-profit" />
                <TrendingDown className="w-3 h-3 text-loss" />
              </div>
              Long vs Short Analysis
            </CardTitle>
            <AITooltip
              metricType="side_analysis"
              data={{
                long_pnl: sideAnalysis.long.pnl,
                long_win_rate: sideAnalysis.long.winRate,
                long_profit_factor: sideAnalysis.long.profitFactor,
                long_trades: sideAnalysis.long.trades,
                short_pnl: sideAnalysis.short.pnl,
                short_win_rate: sideAnalysis.short.winRate,
                short_profit_factor: sideAnalysis.short.profitFactor,
                short_trades: sideAnalysis.short.trades
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-muted-foreground font-medium text-[10px]">Side</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium text-[10px]">PnL</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium text-[10px]">Win Rate</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium text-[10px]">Profit Factor</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium text-[10px]">Trades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border/30 hover:bg-secondary/50">
                <TableCell className="py-2">
                  <Badge variant="outline" className="bg-profit/10 text-profit border-profit/30 text-[9px]">Long</Badge>
                </TableCell>
                <TableCell className={`text-right font-medium text-[10px] ${sideAnalysis.long.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(sideAnalysis.long.pnl)}
                </TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{sideAnalysis.long.winRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{formatNumber(sideAnalysis.long.profitFactor)}</TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{sideAnalysis.long.trades}</TableCell>
              </TableRow>
              <TableRow className="border-border/30 hover:bg-secondary/50">
                <TableCell className="py-2">
                  <Badge variant="outline" className="bg-loss/10 text-loss border-loss/30 text-[9px]">Short</Badge>
                </TableCell>
                <TableCell className={`text-right font-medium text-[10px] ${sideAnalysis.short.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(sideAnalysis.short.pnl)}
                </TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{sideAnalysis.short.winRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{formatNumber(sideAnalysis.short.profitFactor)}</TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{sideAnalysis.short.trades}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role & Type Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Maker vs Taker */}
        <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-border/50 shadow-lg">
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs">Maker vs Taker</CardTitle>
              <AITooltip
                metricType="maker_taker"
                data={{
                  maker_pnl: roleAnalysis.maker.pnl,
                  maker_win_rate: roleAnalysis.maker.winRate,
                  maker_trades: roleAnalysis.maker.trades,
                  taker_pnl: roleAnalysis.taker.pnl,
                  taker_win_rate: roleAnalysis.taker.winRate,
                  taker_trades: roleAnalysis.taker.trades
                }}
            />
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-muted-foreground font-medium text-[10px]">Role</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium text-[10px]">PnL</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium text-[10px]">Win Rate</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium text-[10px]">Trades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border/30 hover:bg-secondary/50">
                <TableCell className="py-2"><Badge variant="secondary" className="text-[9px]">Maker</Badge></TableCell>
                <TableCell className={`text-right font-medium text-[10px] ${roleAnalysis.maker.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(roleAnalysis.maker.pnl)}
                </TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{roleAnalysis.maker.winRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{roleAnalysis.maker.trades}</TableCell>
              </TableRow>
              <TableRow className="border-border/30 hover:bg-secondary/50">
                <TableCell className="py-2"><Badge variant="secondary" className="text-[9px]">Taker</Badge></TableCell>
                <TableCell className={`text-right font-medium text-[10px] ${roleAnalysis.taker.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(roleAnalysis.taker.pnl)}
                </TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{roleAnalysis.taker.winRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{roleAnalysis.taker.trades}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Limit vs Market */}
      <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-border/50 shadow-lg">
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs">Limit vs Market Orders</CardTitle>
              <AITooltip
                metricType="limit_market"
                data={{
                  limit_pnl: typeAnalysis.limit.pnl,
                  limit_win_rate: typeAnalysis.limit.winRate,
                  limit_trades: typeAnalysis.limit.trades,
                  market_pnl: typeAnalysis.market.pnl,
                  market_win_rate: typeAnalysis.market.winRate,
                  market_trades: typeAnalysis.market.trades
                }}
            />
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-muted-foreground font-medium text-[10px]">Type</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium text-[10px]">PnL</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium text-[10px]">Win Rate</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium text-[10px]">Trades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border/30 hover:bg-secondary/50">
                <TableCell className="py-2"><Badge variant="outline" className="text-[9px]">Limit</Badge></TableCell>
                <TableCell className={`text-right font-medium text-[10px] ${typeAnalysis.limit.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(typeAnalysis.limit.pnl)}
                </TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{typeAnalysis.limit.winRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{typeAnalysis.limit.trades}</TableCell>
              </TableRow>
              <TableRow className="border-border/30 hover:bg-secondary/50">
                <TableCell className="py-2"><Badge variant="outline" className="text-[9px]">Market</Badge></TableCell>
                <TableCell className={`text-right font-medium text-[10px] ${typeAnalysis.market.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(typeAnalysis.market.pnl)}
                </TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{typeAnalysis.market.winRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right text-foreground text-[10px]">{typeAnalysis.market.trades}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    {/* Time Patterns */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Hourly Performance */}
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-lg">
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-primary" />
              Performance by Hour
            </CardTitle>
              <AITooltip
                metricType="time_pattern"
                data={{
                  type: 'hourly',
                  patterns: filteredHourlyPatterns.map(h => ({
                    hour: h.hour,
                    pnl: h.pnl,
                    winRate: h.winRate,
                    trades: h.trades
                  }))
                }}
            />
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredHourlyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(h) => `${h}:00`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(v) => `$${v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'pnl' ? `$${value.toFixed(2)}` : `${value.toFixed(1)}%`,
                      name === 'pnl' ? 'PnL' : 'Win Rate'
                    ]}
                    labelFormatter={(h) => `Hour: ${h}:00`}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {filteredHourlyPatterns.map((entry, index) => (
                      <Cell key={index} fill={entry.pnl >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Performance */}
        <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-lg">
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-primary" />
                Performance by Day of Week
              </CardTitle>
              <AITooltip
                metricType="time_pattern"
                data={{
                  type: 'daily',
                  patterns: filteredDailyPatterns.map(d => ({
                    day: d.day,
                    pnl: d.pnl,
                    winRate: d.winRate,
                    trades: d.trades
                  }))
                }}
            />
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredDailyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(d) => d.slice(0, 3)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(v) => `$${v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'pnl' ? `$${value.toFixed(2)}` : `${value.toFixed(1)}%`,
                      name === 'pnl' ? 'PnL' : 'Win Rate'
                    ]}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {filteredDailyPatterns.map((entry, index) => (
                      <Cell key={index} fill={entry.pnl >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
