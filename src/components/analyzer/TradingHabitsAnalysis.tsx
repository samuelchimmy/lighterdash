import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Clock, Calendar } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Side Analysis */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-profit" />
              <ArrowDownRight className="w-4 h-4 text-loss" />
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">PnL</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Profit Factor</TableHead>
                <TableHead className="text-right">Trades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge variant="outline" className="bg-profit/10 text-profit border-profit/30">Long</Badge>
                </TableCell>
                <TableCell className={`text-right font-medium ${sideAnalysis.long.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(sideAnalysis.long.pnl)}
                </TableCell>
                <TableCell className="text-right">{sideAnalysis.long.winRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right">{formatNumber(sideAnalysis.long.profitFactor)}</TableCell>
                <TableCell className="text-right">{sideAnalysis.long.trades}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="outline" className="bg-loss/10 text-loss border-loss/30">Short</Badge>
                </TableCell>
                <TableCell className={`text-right font-medium ${sideAnalysis.short.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(sideAnalysis.short.pnl)}
                </TableCell>
                <TableCell className="text-right">{sideAnalysis.short.winRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right">{formatNumber(sideAnalysis.short.profitFactor)}</TableCell>
                <TableCell className="text-right">{sideAnalysis.short.trades}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role & Type Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maker vs Taker */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Maker vs Taker</CardTitle>
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
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Badge variant="secondary">Maker</Badge></TableCell>
                  <TableCell className={`text-right font-medium ${roleAnalysis.maker.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatCurrency(roleAnalysis.maker.pnl)}
                  </TableCell>
                  <TableCell className="text-right">{roleAnalysis.maker.winRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{roleAnalysis.maker.trades}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge variant="secondary">Taker</Badge></TableCell>
                  <TableCell className={`text-right font-medium ${roleAnalysis.taker.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatCurrency(roleAnalysis.taker.pnl)}
                  </TableCell>
                  <TableCell className="text-right">{roleAnalysis.taker.winRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{roleAnalysis.taker.trades}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Limit vs Market */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Limit vs Market Orders</CardTitle>
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
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Badge variant="outline">Limit</Badge></TableCell>
                  <TableCell className={`text-right font-medium ${typeAnalysis.limit.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatCurrency(typeAnalysis.limit.pnl)}
                  </TableCell>
                  <TableCell className="text-right">{typeAnalysis.limit.winRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{typeAnalysis.limit.trades}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge variant="outline">Market</Badge></TableCell>
                  <TableCell className={`text-right font-medium ${typeAnalysis.market.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatCurrency(typeAnalysis.market.pnl)}
                  </TableCell>
                  <TableCell className="text-right">{typeAnalysis.market.winRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{typeAnalysis.market.trades}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Time Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Performance */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
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
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredHourlyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(h) => `${h}:00`}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'pnl' ? `$${value.toFixed(2)}` : `${value.toFixed(1)}%`,
                      name === 'pnl' ? 'PnL' : 'Win Rate'
                    ]}
                    labelFormatter={(h) => `Hour: ${h}:00`}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
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
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
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
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredDailyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(d) => d.slice(0, 3)}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'pnl' ? `$${value.toFixed(2)}` : `${value.toFixed(1)}%`,
                      name === 'pnl' ? 'PnL' : 'Win Rate'
                    ]}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
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
