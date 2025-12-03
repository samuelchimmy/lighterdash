import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Trophy, Frown } from "lucide-react";
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
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
          <h3 className="text-lg font-semibold text-foreground">Best & Worst Trades</h3>
        </div>
        <p className="text-muted-foreground text-center py-8">No trades available</p>
      </Card>
    );
  }

  const TradeCard = ({ trade, isBest }: { trade: ReturnType<typeof calculateTradePnL>, isBest: boolean }) => {
    const symbol = MARKET_SYMBOLS[trade.market_id] || `Market ${trade.market_id}`;
    
    return (
      <div className="p-3 border border-border/50 rounded-lg bg-secondary/30 space-y-2 hover:bg-secondary/50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{symbol}</span>
            <Badge variant={isBest ? 'default' : 'destructive'} className="text-xs">
              {isBest ? 'WIN' : 'LOSS'}
            </Badge>
          </div>
          <span className={`font-bold ${isBest ? 'text-profit' : 'text-loss'}`}>
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
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
        <h3 className="text-lg font-semibold text-foreground">Best & Worst Trades</h3>
      </div>
      <div className="space-y-6">
        {/* Best Trades */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <TrendingUp className="h-4 w-4 text-profit" />
            Top 5 Winning Trades
          </h4>
          <div className="space-y-2">
            {bestTrades.map((trade) => (
              <TradeCard key={trade.trade_id} trade={trade} isBest={true} />
            ))}
          </div>
        </div>

        {/* Worst Trades */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <TrendingDown className="h-4 w-4 text-loss" />
            Top 5 Losing Trades
          </h4>
          <div className="space-y-2">
            {worstTrades.map((trade) => (
              <TradeCard key={trade.trade_id} trade={trade} isBest={false} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
