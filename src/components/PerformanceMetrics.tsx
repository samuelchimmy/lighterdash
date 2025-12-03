import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencySmart, formatPercentage } from '@/lib/lighter-api';
import type { LighterTrade, Position } from '@/types/lighter';
import { ArrowTrendingUpIcon, AcademicCapIcon, TrophyIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { useMemo } from 'react';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';

interface PerformanceMetricsProps {
  trades: LighterTrade[];
  positions: Position[];
}

export const PerformanceMetrics = ({ trades, positions }: PerformanceMetricsProps) => {
  const metrics = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalPnL: 0,
        winningTrades: 0,
        totalTrades: 0,
        winRate: 0,
        bestTrade: null as LighterTrade | null,
        performanceByAsset: [] as { market_id: number; pnl: number; fees: number; count: number }[],
      };
    }

    // Calculate realized PnL from positions
    const realizedPnL = positions.reduce((sum, p) => sum + parseFloat(p.realized_pnl || '0'), 0);

    // Calculate total fees
    const totalFees = trades.reduce((sum, t) => {
      const fee = (t.maker_fee || t.taker_fee || 0) / 100;
      return sum + fee;
    }, 0);

    // Group trades by market to identify complete position cycles
    const marketTrades = trades.reduce((acc, trade) => {
      if (!acc[trade.market_id]) {
        acc[trade.market_id] = [];
      }
      acc[trade.market_id].push(trade);
      return acc;
    }, {} as Record<number, LighterTrade[]>);

    // Calculate performance by asset
    const performanceByAsset = Object.entries(marketTrades).map(([marketId, marketTradesArr]) => {
      const pnl = positions.find(p => p.market_id === parseInt(marketId))?.realized_pnl || '0';
      const fees = marketTradesArr.reduce((sum, t) => sum + ((t.maker_fee || t.taker_fee || 0) / 100), 0);
      return {
        market_id: parseInt(marketId),
        pnl: parseFloat(pnl),
        fees,
        count: marketTradesArr.length,
      };
    });

    // Find best trade (largest USD amount)
    const bestTrade = trades.reduce((best, current) => {
      const currentAmount = parseFloat(current.usd_amount || '0');
      const bestAmount = parseFloat(best?.usd_amount || '0');
      return currentAmount > bestAmount ? current : best;
    }, trades[0]);

    // Estimate winning trades (trades where position improved)
    const winningTrades = performanceByAsset.filter(p => p.pnl > 0).length;

    return {
      totalPnL: realizedPnL - totalFees,
      winningTrades,
      totalTrades: performanceByAsset.length,
      winRate: performanceByAsset.length > 0 ? (winningTrades / performanceByAsset.length) * 100 : 0,
      bestTrade,
      performanceByAsset: performanceByAsset.sort((a, b) => b.pnl - a.pnl),
    };
  }, [trades, positions]);

  const animatedTotalPnL = useAnimatedCounter(metrics.totalPnL, { duration: 1000 });
  const animatedWinRate = useAnimatedCounter(metrics.winRate, { decimals: 1, duration: 800 });
  const animatedBestTradeSize = useAnimatedCounter(
    metrics.bestTrade ? parseFloat(metrics.bestTrade.usd_amount || '0') : 0,
    { duration: 800 }
  );

  if (!trades || trades.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrophyIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Performance Metrics</h3>
        </div>
        <p className="text-muted-foreground text-center py-8">No trading history available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <ChartBarIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Performance Overview</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <ArrowTrendingUpIcon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Total Realized PnL</p>
            </div>
            <p className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatCurrencySmart(animatedTotalPnL)}
            </p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <AcademicCapIcon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">Win Rate</p>
              </div>
              {metrics.winRate >= 70 && (
                <Badge className="text-xs bg-profit/10 text-profit border-0">Excellent</Badge>
              )}
              {metrics.winRate >= 50 && metrics.winRate < 70 && (
                <Badge variant="secondary" className="text-xs">Good</Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">
              {animatedWinRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.winningTrades} / {metrics.totalTrades} winning
            </p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <TrophyIcon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Best Trade Size</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrencySmart(animatedBestTradeSize)}
            </p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <BoltIcon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Total Trades</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{trades.length}</p>
          </div>
        </div>
      </Card>

      {metrics.performanceByAsset.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrophyIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Performance by Market</h3>
          </div>
          <div className="space-y-3">
            {metrics.performanceByAsset.slice(0, 5).map((asset) => {
              const position = positions.find(p => p.market_id === asset.market_id);
              return (
                <div key={asset.market_id} className="bg-secondary/20 rounded-xl p-4 border border-border/30 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {position?.symbol || `Market ${asset.market_id}`}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {asset.count} trades
                      </Badge>
                    </div>
                    <Badge 
                      variant={asset.pnl >= 0 ? 'default' : 'destructive'}
                      className="font-bold"
                    >
                      {formatCurrencySmart(asset.pnl)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Fees: {formatCurrencySmart(asset.fees)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
