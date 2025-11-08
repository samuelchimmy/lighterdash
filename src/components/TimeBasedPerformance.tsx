import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time-Based Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No trading data available</p>
        </CardContent>
      </Card>
    );
  }

  const getBarColor = (winRate: number) => {
    if (winRate >= 60) return 'hsl(var(--chart-1))';
    if (winRate >= 50) return 'hsl(var(--chart-2))';
    return 'hsl(var(--chart-5))';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time-Based Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hourly">
              <Clock className="h-4 w-4 mr-2" />
              Hourly
            </TabsTrigger>
            <TabsTrigger value="daily">
              <Calendar className="h-4 w-4 mr-2" />
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
                    fontSize={12}
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
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
                  <div key={data.hour} className="p-3 border rounded-lg bg-card/50">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={index === 0 ? 'default' : 'outline'} className="text-xs">
                        {data.hour}:00
                      </Badge>
                    </div>
                    <p className="text-lg font-bold">{formatPercentage(data.winRate)}</p>
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
                    fontSize={12}
                    tickFormatter={(day) => DAYS_OF_WEEK[day].slice(0, 3)}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
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
                  <div key={data.day} className="p-3 border rounded-lg bg-card/50">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={index === 0 ? 'default' : 'outline'} className="text-xs">
                        {DAYS_OF_WEEK[data.day].slice(0, 3)}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold">{formatPercentage(data.winRate)}</p>
                    <p className="text-xs text-muted-foreground">{data.count} trades</p>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
