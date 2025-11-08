import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LighterTrade } from "@/types/lighter";
import { formatCurrency, formatPercentage } from "@/lib/lighter-api";
import { calculateTradePnL } from "@/lib/trade-analysis";
import { BarChart3 } from "lucide-react";

interface AssetPerformanceProps {
  trades: LighterTrade[];
  accountId?: number;
}

const MARKET_SYMBOLS: Record<number, string> = {
  0: "ETH-USD",
  1: "BTC-USD",
  2: "SOL-USD",
  3: "ARB-USD",
  4: "OP-USD",
};

export function AssetPerformance({ trades, accountId }: AssetPerformanceProps) {
  const assetStats = useMemo(() => {
    const stats: Record<number, {
      symbol: string;
      trades: number;
      wins: number;
      totalPnl: number;
      totalFees: number;
      totalVolume: number;
    }> = {};

    trades.forEach(trade => {
      const tradeWithPnl = calculateTradePnL(trade, accountId);
      const marketId = trade.market_id;
      
      if (!stats[marketId]) {
        stats[marketId] = {
          symbol: MARKET_SYMBOLS[marketId] || `Market ${marketId}`,
          trades: 0,
          wins: 0,
          totalPnl: 0,
          totalFees: 0,
          totalVolume: 0,
        };
      }

      stats[marketId].trades += 1;
      if (tradeWithPnl.isWin) stats[marketId].wins += 1;
      stats[marketId].totalPnl += tradeWithPnl.pnl;
      stats[marketId].totalFees += (tradeWithPnl.taker_fee || 0) + (tradeWithPnl.maker_fee || 0);
      stats[marketId].totalVolume += parseFloat(trade.usd_amount || '0');
    });

    return Object.values(stats).sort((a, b) => b.totalPnl - a.totalPnl);
  }, [trades, accountId]);

  if (assetStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance by Asset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No trading data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance by Asset
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assetStats.map((stat, index) => {
          const winRate = (stat.wins / stat.trades) * 100;
          const isProfitable = stat.totalPnl >= 0;

          return (
            <div key={index} className="p-4 border rounded-lg bg-card/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{stat.symbol}</span>
                  <Badge variant={isProfitable ? 'default' : 'destructive'}>
                    {stat.trades} trades
                  </Badge>
                </div>
                <span className={`text-xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                  {isProfitable ? '+' : ''}{formatCurrency(stat.totalPnl)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className="font-semibold">{formatPercentage(winRate)}</span>
                </div>
                <Progress value={winRate} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Wins</p>
                  <p className="font-semibold text-green-500">{stat.wins}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Losses</p>
                  <p className="font-semibold text-red-500">{stat.trades - stat.wins}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="font-semibold">{formatCurrency(stat.totalVolume)}</p>
                </div>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fees Paid</span>
                <span className="font-medium text-foreground">{formatCurrency(Math.abs(stat.totalFees))}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
