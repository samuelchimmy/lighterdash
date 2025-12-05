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
      <Card className="p-3 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-1.5 mb-3">
          <Trophy className="w-3.5 h-3.5 text-primary" fill="currentColor" fillOpacity={0.2} />
          <h3 className="text-xs font-semibold text-foreground">Best & Worst Trades</h3>
        </div>
        <p className="text-muted-foreground text-center py-4 text-[10px]">No trades available</p>
      </Card>
    );
  }

  const TradeCard = ({ trade, isBest }: { trade: ReturnType<typeof calculateTradePnL>, isBest: boolean }) => {
    const symbol = MARKET_SYMBOLS[trade.market_id] || `Market ${trade.market_id}`;
    
    return (
      <div className="p-2 border border-border/50 rounded-lg bg-secondary/30 space-y-1.5 hover:bg-secondary/50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[10px] text-foreground">{symbol}</span>
            <Badge variant={isBest ? 'default' : 'destructive'} className="text-[8px] h-3.5 px-1">
              {isBest ? 'WIN' : 'LOSS'}
            </Badge>
          </div>
          <span className={`font-bold text-[10px] ${isBest ? 'text-profit' : 'text-loss'}`}>
            {isBest ? '+' : ''}{formatCurrency(trade.pnl)}
          </span>
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>Size: {formatNumber(parseFloat(trade.size))}</span>
          <span>Price: {formatCurrency(parseFloat(trade.price))}</span>
        </div>
        <div className="text-[9px] text-muted-foreground">
          {new Date(trade.timestamp * 1000).toLocaleDateString()}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-3 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-1.5 mb-3">
        <Trophy className="w-3.5 h-3.5 text-primary" fill="currentColor" fillOpacity={0.2} />
        <h3 className="text-xs font-semibold text-foreground">Best & Worst Trades</h3>
      </div>
      <div className="space-y-3">
        {/* Best Trades */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold flex items-center gap-1.5 text-foreground">
            <TrendingUp className="h-3 w-3 text-profit" fill="currentColor" fillOpacity={0.2} />
            Top 5 Winning Trades
          </h4>
          <div className="space-y-1.5">
            {bestTrades.map((trade) => (
              <TradeCard key={trade.trade_id} trade={trade} isBest={true} />
            ))}
          </div>
        </div>

        {/* Worst Trades */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold flex items-center gap-1.5 text-foreground">
            <TrendingDown className="h-3 w-3 text-loss" fill="currentColor" fillOpacity={0.2} />
            Top 5 Losing Trades
          </h4>
          <div className="space-y-1.5">
            {worstTrades.map((trade) => (
              <TradeCard key={trade.trade_id} trade={trade} isBest={false} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
