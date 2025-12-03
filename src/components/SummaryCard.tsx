import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencySmart, formatAddress } from '@/lib/lighter-api';
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';
import { MetricTooltip, METRIC_TOOLTIPS } from './MetricTooltip';

interface SummaryCardProps {
  totalPnl: number;
  walletAddress: string;
  accountValue: number;
}

export const SummaryCard = ({ totalPnl, walletAddress, accountValue }: SummaryCardProps) => {
  const isProfitable = totalPnl >= 0;
  
  const animatedPnl = useAnimatedCounter(totalPnl, { duration: 1000 });
  const animatedAccountValue = useAnimatedCounter(accountValue, { duration: 1000 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 hover-glow-card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${isProfitable ? 'bg-profit/10' : 'bg-loss/10'}`}>
                {isProfitable ? (
                  <TrendingUp className="w-5 h-5 text-profit" fill="currentColor" fillOpacity={0.2} />
                ) : (
                  <TrendingDown className="w-5 h-5 text-loss" fill="currentColor" fillOpacity={0.2} />
                )}
              </div>
              <MetricTooltip {...METRIC_TOOLTIPS.totalPnl}>
                <p className="text-sm font-medium text-muted-foreground">Total PnL</p>
              </MetricTooltip>
            </div>
            <p className={`text-3xl font-bold ${isProfitable ? 'text-profit' : 'text-loss'}`}>
              {formatCurrencySmart(animatedPnl)}
            </p>
            <Badge 
              variant={isProfitable ? 'default' : 'destructive'} 
              className="mt-2 text-xs"
            >
              {isProfitable ? 'Profit' : 'Loss'}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6 hover-glow-card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
            </div>
            <p className="text-xl font-mono font-semibold text-foreground">
              {formatAddress(walletAddress)}
            </p>
            <p className="text-xs text-muted-foreground mt-2 truncate max-w-[200px]">{walletAddress}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 hover-glow-card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
              </div>
              <MetricTooltip {...METRIC_TOOLTIPS.accountValue}>
                <p className="text-sm font-medium text-muted-foreground">Total Account Value</p>
              </MetricTooltip>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrencySmart(animatedAccountValue)}
            </p>
            <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">
              Live
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
