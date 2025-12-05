import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencySmart, formatAddress } from '@/lib/lighter-api';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, WalletIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card className="p-3 hover-glow-card bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className={`p-1.5 rounded-md ${isProfitable ? 'bg-profit/10' : 'bg-loss/10'}`}>
              {isProfitable ? (
                  <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-profit" />
                ) : (
                  <ArrowTrendingDownIcon className="w-3.5 h-3.5 text-loss" />
                )}
              </div>
              <MetricTooltip {...METRIC_TOOLTIPS.totalPnl}>
                <p className="text-[10px] font-medium text-muted-foreground">Total PnL</p>
              </MetricTooltip>
            </div>
            <p className={`text-lg font-bold ${isProfitable ? 'text-profit' : 'text-loss'}`}>
              {formatCurrencySmart(animatedPnl)}
            </p>
            <Badge 
              variant={isProfitable ? 'default' : 'destructive'} 
              className="mt-1.5 text-[9px] h-4"
            >
              {isProfitable ? 'Profit' : 'Loss'}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-3 hover-glow-card bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="p-1.5 rounded-md bg-primary/10">
                <WalletIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-[10px] font-medium text-muted-foreground">Wallet Address</p>
            </div>
            <p className="text-sm font-mono font-semibold text-foreground">
              {formatAddress(walletAddress)}
            </p>
            <p className="text-[9px] text-muted-foreground mt-1.5 truncate max-w-[180px]">{walletAddress}</p>
          </div>
        </div>
      </Card>

      <Card className="p-3 hover-glow-card bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="p-1.5 rounded-md bg-primary/10">
                <CurrencyDollarIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <MetricTooltip {...METRIC_TOOLTIPS.accountValue}>
                <p className="text-[10px] font-medium text-muted-foreground">Total Account Value</p>
              </MetricTooltip>
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatCurrencySmart(animatedAccountValue)}
            </p>
            <Badge variant="outline" className="mt-1.5 text-[9px] h-4 border-primary/30 text-primary">
              Live
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
