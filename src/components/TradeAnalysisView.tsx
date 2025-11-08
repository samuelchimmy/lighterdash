import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import type { LighterTrade } from '@/types/lighter';
import {
  calculateTradePnL,
  findStreaks,
  analyzeEntryPatterns,
  analyzeDayPatterns,
  type TradeWithPnL,
} from '@/lib/trade-analysis';
import { TrendingUp, TrendingDown, Calendar, Clock, Flame, Target } from 'lucide-react';

interface TradeAnalysisViewProps {
  trades: LighterTrade[];
  accountIndex?: number;
}

export const TradeAnalysisView = ({ trades, accountIndex }: TradeAnalysisViewProps) => {
  const analysis = useMemo(() => {
    const tradesWithPnL = trades.map(trade => calculateTradePnL(trade, accountIndex));
    const streaks = findStreaks(tradesWithPnL);
    const hourlyPatterns = analyzeEntryPatterns(tradesWithPnL);
    const dailyPatterns = analyzeDayPatterns(tradesWithPnL);

    // Find longest streaks
    const longestWinStreak = streaks
      .filter(s => s.type === 'win')
      .sort((a, b) => b.count - a.count)[0];
    
    const longestLossStreak = streaks
      .filter(s => s.type === 'loss')
      .sort((a, b) => b.count - a.count)[0];

    // Find current streak
    const currentStreak = streaks[streaks.length - 1];

    // Best performing hours
    const bestHours = [...hourlyPatterns]
      .filter(h => h.count >= 3)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 3);

    // Best performing days
    const bestDays = [...dailyPatterns]
      .filter(d => d.count >= 3)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 3);

    return {
      tradesWithPnL,
      streaks,
      hourlyPatterns,
      dailyPatterns,
      longestWinStreak,
      longestLossStreak,
      currentStreak,
      bestHours,
      bestDays,
    };
  }, [trades, accountIndex]);

  const getStreakColor = (count: number, type: 'win' | 'loss') => {
    if (type === 'win') {
      if (count >= 5) return 'hsl(var(--success))';
      if (count >= 3) return 'hsl(var(--success-muted))';
      return 'hsl(var(--success-light))';
    } else {
      if (count >= 5) return 'hsl(var(--destructive))';
      if (count >= 3) return 'hsl(var(--destructive-muted))';
      return 'hsl(var(--destructive-light))';
    }
  };

  return (
    <Card className="p-6 bg-card border-border shadow-card">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Trade Analysis</h2>
      </div>

      {/* Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {analysis.currentStreak && (
          <Card className="p-4 bg-secondary/30 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Current Streak</span>
            </div>
            <div className="flex items-center gap-2">
              {analysis.currentStreak.type === 'win' ? (
                <TrendingUp className="w-5 h-5 text-success" />
              ) : (
                <TrendingDown className="w-5 h-5 text-destructive" />
              )}
              <span className="text-2xl font-bold text-foreground">
                {analysis.currentStreak.count}
              </span>
              <Badge variant={analysis.currentStreak.type === 'win' ? 'default' : 'destructive'}>
                {analysis.currentStreak.type === 'win' ? 'Wins' : 'Losses'}
              </Badge>
            </div>
          </Card>
        )}

        {analysis.longestWinStreak && (
          <Card className="p-4 bg-secondary/30 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Longest Win Streak</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {analysis.longestWinStreak.count}
              </span>
              <span className="text-sm text-success">
                ${analysis.longestWinStreak.totalPnL.toFixed(2)}
              </span>
            </div>
          </Card>
        )}

        {analysis.longestLossStreak && (
          <Card className="p-4 bg-secondary/30 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium text-muted-foreground">Longest Loss Streak</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {analysis.longestLossStreak.count}
              </span>
              <span className="text-sm text-destructive">
                ${analysis.longestLossStreak.totalPnL.toFixed(2)}
              </span>
            </div>
          </Card>
        )}
      </div>

      <Tabs defaultValue="streaks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="streaks">Streak Timeline</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Patterns</TabsTrigger>
          <TabsTrigger value="daily">Daily Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="streaks" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Win/Loss Streak Timeline</h3>
            </div>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {analysis.streaks.map((streak, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-secondary/20"
                  style={{
                    borderLeft: `4px solid ${getStreakColor(streak.count, streak.type)}`,
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {streak.type === 'win' ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <span className="font-semibold text-foreground">
                        {streak.count} {streak.type === 'win' ? 'Wins' : 'Losses'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {streak.startDate.toLocaleDateString()} - {streak.endDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${streak.type === 'win' ? 'text-success' : 'text-destructive'}`}>
                      ${streak.totalPnL.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${(streak.totalPnL / streak.count).toFixed(2)} avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hourly" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Trading Performance by Hour</h3>
            </div>

            {analysis.bestHours.length > 0 && (
              <div className="mb-4 p-4 bg-secondary/30 rounded-lg border border-border/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Best Performing Hours</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.bestHours.map(hour => (
                    <Badge key={hour.hour} variant="outline" className="gap-1">
                      {hour.hour.toString().padStart(2, '0')}:00 - {hour.winRate.toFixed(0)}% WR
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.hourlyPatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(hour) => `${hour}:00`}
                  formatter={(value: any, name: string) => {
                    if (name === 'winRate') return [`${value.toFixed(1)}%`, 'Win Rate'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="winRate" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]}>
                  {analysis.hourlyPatterns.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.winRate >= 50 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Trading Performance by Day</h3>
            </div>

            {analysis.bestDays.length > 0 && (
              <div className="mb-4 p-4 bg-secondary/30 rounded-lg border border-border/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Best Performing Days</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.bestDays.map(day => (
                    <Badge key={day.day} variant="outline" className="gap-1">
                      {day.dayName} - {day.winRate.toFixed(0)}% WR
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.dailyPatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="dayName" 
                  stroke="hsl(var(--muted-foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'winRate') return [`${value.toFixed(1)}%`, 'Win Rate'];
                    if (name === 'avgPnL') return [`$${value.toFixed(2)}`, 'Avg PnL'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="winRate" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]}>
                  {analysis.dailyPatterns.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.winRate >= 50 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {analysis.dailyPatterns.map(day => (
                <Card key={day.day} className="p-3 bg-secondary/30 border-border/50">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    {day.dayName.slice(0, 3)}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {day.count} trades
                  </div>
                  <div className="text-xs mt-1">
                    <span className={day.winRate >= 50 ? 'text-success' : 'text-destructive'}>
                      {day.winRate.toFixed(0)}% WR
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
