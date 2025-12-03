import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FundingHistory as FundingHistoryType } from "@/types/lighter";
import { formatCurrency } from "@/lib/lighter-api";
import { Percent } from "lucide-react";

interface FundingHistoryProps {
  fundingHistories: Record<string, FundingHistoryType[]>;
}

const MARKET_SYMBOLS: Record<number, string> = {
  0: "ETH-USD",
  1: "BTC-USD", 
  2: "SOL-USD",
  3: "ARB-USD",
  4: "OP-USD",
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--profit))",
  "hsl(var(--loss))",
  "hsl(270 70% 60%)",
  "hsl(200 70% 50%)",
];

export function FundingHistory({ fundingHistories }: FundingHistoryProps) {
  const { chartData, summaryData } = useMemo(() => {
    const allEvents: (FundingHistoryType & { marketId: number })[] = [];
    const totals: Record<number, { total: number; count: number; symbol: string }> = {};

    // Collect all funding events across markets
    Object.entries(fundingHistories).forEach(([marketId, events]) => {
      const id = parseInt(marketId);
      const symbol = MARKET_SYMBOLS[id] || `Market ${id}`;
      
      totals[id] = { total: 0, count: 0, symbol };

      events.forEach(event => {
        const change = parseFloat(event.change);
        allEvents.push({ ...event, marketId: id });
        totals[id].total += change;
        totals[id].count += 1;
      });
    });

    // Sort by timestamp
    allEvents.sort((a, b) => a.timestamp - b.timestamp);

    // Create chart data with cumulative funding per market
    const cumulatives: Record<number, number> = {};
    const chartPoints = allEvents.map(event => {
      if (!cumulatives[event.marketId]) {
        cumulatives[event.marketId] = 0;
      }
      cumulatives[event.marketId] += parseFloat(event.change);

      const point: any = {
        timestamp: event.timestamp,
        date: new Date(event.timestamp).toLocaleDateString(),
      };

      // Add cumulative value for this market
      Object.keys(totals).forEach(marketId => {
        const id = parseInt(marketId);
        const symbol = MARKET_SYMBOLS[id] || `Market ${id}`;
        point[symbol] = id === event.marketId ? cumulatives[id] : (cumulatives[id] || 0);
      });

      return point;
    });

    return {
      chartData: chartPoints,
      summaryData: Object.entries(totals).map(([id, data]) => ({
        marketId: parseInt(id),
        ...data,
      })),
    };
  }, [fundingHistories]);

  if (summaryData.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Percent className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Funding History</h3>
        </div>
        <p className="text-muted-foreground text-center py-8">No funding history available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Percent className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Funding History</h3>
      </div>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaryData.map((data, idx) => {
            const isPositive = data.total >= 0;
            return (
              <div 
                key={data.marketId}
                className="p-4 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{data.symbol}</span>
                  <Badge variant={isPositive ? "default" : "destructive"}>
                    {data.count} events
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Funding Paid/Received</p>
                  <p className={`text-xl font-bold ${isPositive ? 'text-profit' : 'text-loss'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(data.total)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Cumulative"]}
                />
                <Legend />
                {summaryData.map((data, idx) => (
                  <Line
                    key={data.symbol}
                    type="monotone"
                    dataKey={data.symbol}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}
