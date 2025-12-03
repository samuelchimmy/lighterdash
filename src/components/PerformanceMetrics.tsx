import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencySmart, formatPercentage } from '@/lib/lighter-api';
import type { LighterTrade, Position } from '@/types/lighter';
import { TrendingUp, Target, Award, PieChart, Trophy, Flame, BarChart3, Sparkles } from 'lucide-react';
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

  const getWinRateBadge = () => {
    if (metrics.winRate >= 70) return { label: 'Excellent', color: 'bg-profit/20 text-profit border-profit/30' };
    if (metrics.winRate >= 50) return { label: 'Good', color: 'bg-primary/20 text-primary border-primary/30' };
    if (metrics.winRate >= 30) return { label: 'Fair', color: 'bg-warning/20 text-warning border-warning/30' };
    return { label: 'Low', color: 'bg-loss/20 text-loss border-loss/30' };
  };

  if (!trades || trades.length === 0) {
    return (
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card animate-slide-up">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Performance Overview
        </h3>
        <p className="text-muted-foreground text-center py-8">No trading history available</p>
      </Card>
    );
  }

  const winRateBadge = getWinRateBadge();

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card animate-slide-up delay-200">
        <h3 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Performance Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Realized PnL */}
          <div className="stat-card group">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-lg ${metrics.totalPnL >= 0 ? 'bg-profit/10' : 'bg-loss/10'} group-hover:scale-110 transition-transform`}>
                <TrendingUp className={`w-4 h-4 ${metrics.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`} />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Total Realized PnL</p>
            </div>
            <p className={`text-3xl font-bold font-mono-numbers ${metrics.totalPnL >= 0 ? 'text-profit text-glow-profit' : 'text-loss text-glow-loss'}`}>
              {formatCurrencySmart(animatedTotalPnL)}
            </p>
          </div>

          {/* Win Rate */}
          <div className="stat-card group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Win Rate</p>
              </div>
              <Badge className={`text-2xs ${winRateBadge.color} border`}>
                {winRateBadge.label}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-foreground font-mono-numbers">
              {animatedWinRate.toFixed(1)}
              <span className="text-lg text-muted-foreground ml-1">%</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.winningTrades} / {metrics.totalTrades} winning markets
            </p>
          </div>

          {/* Best Trade */}
          <div className="stat-card group">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-accent/10 group-hover:scale-110 transition-transform">
                <Trophy className="w-4 h-4 text-accent" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Best Trade Size</p>
            </div>
            <p className="text-3xl font-bold text-foreground font-mono-numbers">
              {formatCurrencySmart(animatedBestTradeSize)}
            </p>
          </div>

          {/* Total Trades */}
          <div className="stat-card group">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Total Trades</p>
            </div>
            <p className="text-3xl font-bold text-foreground font-mono-numbers">{trades.length}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Across {metrics.totalTrades} markets
            </p>
          </div>
        </div>
      </Card>

      {metrics.performanceByAsset.length > 0 && (
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card animate-slide-up delay-300">
          <h3 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Performance by Market
          </h3>
          <div className="space-y-3">
            {metrics.performanceByAsset.slice(0, 5).map((asset, index) => {
              const position = positions.find(p => p.market_id === asset.market_id);
              const isProfitable = asset.pnl >= 0;
              
              return (
                <div 
                  key={asset.market_id} 
                  className="relative overflow-hidden rounded-xl p-4 bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Subtle gradient based on PnL */}
                  <div className={`absolute inset-0 opacity-5 ${isProfitable ? 'bg-gradient-to-r from-profit to-transparent' : 'bg-gradient-to-r from-loss to-transparent'}`} />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isProfitable ? 'bg-profit/10' : 'bg-loss/10'}`}>
                        <span className="text-lg font-bold">{(position?.symbol || `M${asset.market_id}`).charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {position?.symbol || `Market ${asset.market_id}`}
                          </span>
                          <Badge variant="outline" className="text-2xs border-border/50">
                            {asset.count} trades
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Fees: {formatCurrencySmart(asset.fees)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={`font-bold font-mono-numbers ${isProfitable ? 'bg-profit/20 text-profit border-profit/30' : 'bg-loss/20 text-loss border-loss/30'} border`}
                      >
                        {formatCurrencySmart(asset.pnl)}
                      </Badge>
                    </div>
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
