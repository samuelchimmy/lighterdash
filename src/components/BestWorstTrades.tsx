import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LighterTrade } from "@/types/lighter";
import { formatCurrency, formatNumber } from "@/lib/lighter-api";
import { calculateTradePnL } from "@/lib/trade-analysis";

interface BestWorstTradesProps {
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

export function BestWorstTrades({ trades, accountId }: BestWorstTradesProps) {
  const { bestTrades, worstTrades } = useMemo(() => {
    const tradesWithPnl = trades.map(t => calculateTradePnL(t, accountId));
    const sorted = [...tradesWithPnl].sort((a, b) => b.pnl - a.pnl);
    
    return {
      bestTrades: sorted.slice(0, 5),
      worstTrades: sorted.slice(-5).reverse(),
    };
  }, [trades, accountId]);

  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Best & Worst Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No trades available</p>
        </CardContent>
      </Card>
    );
  }

  const TradeCard = ({ trade, isBest }: { trade: ReturnType<typeof calculateTradePnL>, isBest: boolean }) => {
    const symbol = MARKET_SYMBOLS[trade.market_id] || `Market ${trade.market_id}`;
    
    return (
      <div className="p-3 border rounded-lg bg-card/50 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{symbol}</span>
            <Badge variant={isBest ? 'default' : 'destructive'} className="text-xs">
              {isBest ? 'WIN' : 'LOSS'}
            </Badge>
          </div>
          <span className={`font-bold ${isBest ? 'text-green-500' : 'text-red-500'}`}>
            {isBest ? '+' : ''}{formatCurrency(trade.pnl)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Size: {formatNumber(parseFloat(trade.size))}</span>
          <span>Price: {formatCurrency(parseFloat(trade.price))}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(trade.timestamp * 1000).toLocaleDateString()}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Best & Worst Trades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Best Trades */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Top 5 Winning Trades
          </h4>
          <div className="space-y-2">
            {bestTrades.map((trade, idx) => (
              <TradeCard key={trade.trade_id} trade={trade} isBest={true} />
            ))}
          </div>
        </div>

        {/* Worst Trades */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            Top 5 Losing Trades
          </h4>
          <div className="space-y-2">
            {worstTrades.map((trade, idx) => (
              <TradeCard key={trade.trade_id} trade={trade} isBest={false} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
