import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { comparePerformance, type PerformanceComparison } from '@/lib/comparison-utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMemo } from 'react';
import { formatCurrencySmart } from '@/lib/lighter-api';

interface ComparisonCardProps {
  winRate: number;
  leverage: number;
  totalPnL: number;
  totalTrades: number;
}

export const ComparisonCard = ({ winRate, leverage, totalPnL, totalTrades }: ComparisonCardProps) => {
  const comparisons = useMemo(() => {
    return comparePerformance(winRate, leverage, 0, totalPnL, totalTrades);
  }, [winRate, leverage, totalPnL, totalTrades]);

  const getIcon = (performance: PerformanceComparison['performance']) => {
    switch (performance) {
      case 'above':
        return <TrendingUp className="w-4 h-4 text-profit" />;
      case 'below':
        return <TrendingDown className="w-4 h-4 text-loss" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getBadgeVariant = (performance: PerformanceComparison['performance']) => {
    switch (performance) {
      case 'above':
        return 'default' as const;
      case 'below':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <Card className="p-6 bg-card border-border shadow-card hover-glow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Performance Comparison</h3>
        <p className="text-sm text-muted-foreground">vs. Market Averages</p>
      </div>

      <div className="space-y-4">
        {comparisons.map((comp) => (
          <div key={comp.metric} className="bg-secondary/30 rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getIcon(comp.performance)}
                <span className="font-medium text-foreground">{comp.metric}</span>
              </div>
              <Badge variant={getBadgeVariant(comp.performance)} className="hover-glow-badge">
                {comp.performance === 'above' ? 'Above Avg' : comp.performance === 'below' ? 'Below Avg' : 'Average'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Your Value</p>
                <p className="font-semibold text-foreground">
                  {comp.metric === 'Avg PnL per Trade' 
                    ? formatCurrencySmart(comp.userValue)
                    : comp.metric === 'Win Rate'
                    ? `${comp.userValue.toFixed(1)}%`
                    : `${comp.userValue.toFixed(2)}x`
                  }
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Market Avg</p>
                <p className="font-semibold text-foreground">
                  {comp.metric === 'Avg PnL per Trade'
                    ? formatCurrencySmart(comp.marketAvg)
                    : comp.metric === 'Win Rate'
                    ? `${comp.marketAvg.toFixed(1)}%`
                    : `${comp.marketAvg.toFixed(2)}x`
                  }
                </p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Percentile Rank</span>
                <span className="text-xs font-semibold text-primary">
                  {comp.percentile.toFixed(0)}th
                </span>
              </div>
              <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${comp.percentile}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        * Market averages are based on aggregated trading data
      </p>
    </Card>
  );
};
