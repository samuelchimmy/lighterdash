import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { LighterTrade } from "@/types/lighter";
import { formatPercentage } from "@/lib/lighter-api";
import { calculateTradePnL, analyzeEntryPatterns, analyzeDayPatterns } from "@/lib/trade-analysis";
import { Clock, Calendar } from "lucide-react";

interface TimeBasedPerformanceProps {
  trades: LighterTrade[];
  accountId?: number;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function TimeBasedPerformance({ trades, accountId }: TimeBasedPerformanceProps) {
  const { hourlyData, dailyData } = useMemo(() => {
    const tradesWithPnl = trades.map(t => calculateTradePnL(t, accountId));
    
    return {
      hourlyData: analyzeEntryPatterns(tradesWithPnl),
      dailyData: analyzeDayPatterns(tradesWithPnl),
    };
  }, [trades, accountId]);

  if (trades.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
          <h3 className="text-lg font-semibold text-foreground">Time-Based Performance</h3>
        </div>
        <p className="text-muted-foreground text-center py-8">No trading data available</p>
      </Card>
    );
  }

  const getBarColor = (winRate: number) => {
    if (winRate >= 60) return 'hsl(var(--profit))';
    if (winRate >= 50) return 'hsl(var(--primary))';
    return 'hsl(var(--loss))';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
        <h3 className="text-lg font-semibold text-foreground">Time-Based Performance</h3>
      </div>
      <Tabs defaultValue="hourly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="hourly" className="gap-2">
            <Clock className="h-4 w-4" />
            Hourly
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-2">
            <Calendar className="h-4 w-4" />
            Daily
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hourly" className="space-y-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={(hour) => `${hour}:00`}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={(value) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Win Rate"]}
                  labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                />
                <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                  {hourlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.winRate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {hourlyData
              .sort((a, b) => b.winRate - a.winRate)
              .slice(0, 4)
              .map((data, index) => (
                <div key={data.hour} className="p-3 border border-border/50 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={index === 0 ? 'default' : 'outline'} className="text-xs">
                      {data.hour}:00
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-foreground">{formatPercentage(data.winRate)}</p>
                  <p className="text-xs text-muted-foreground">{data.count} trades</p>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={(day) => DAYS_OF_WEEK[day].slice(0, 3)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={(value) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Win Rate"]}
                  labelFormatter={(day) => DAYS_OF_WEEK[day]}
                />
                <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                  {dailyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.winRate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dailyData
              .sort((a, b) => b.winRate - a.winRate)
              .slice(0, 4)
              .map((data, index) => (
                <div key={data.day} className="p-3 border border-border/50 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={index === 0 ? 'default' : 'outline'} className="text-xs">
                      {DAYS_OF_WEEK[data.day].slice(0, 3)}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-foreground">{formatPercentage(data.winRate)}</p>
                  <p className="text-xs text-muted-foreground">{data.count} trades</p>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
