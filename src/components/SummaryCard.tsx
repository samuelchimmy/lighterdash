import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencySmart, formatAddress } from '@/lib/lighter-api';
import { TrendingUp, TrendingDown, Wallet, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
      {/* Total PnL Card */}
      <Card className="relative overflow-hidden p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card hover-glow-card group">
        {/* Gradient accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${isProfitable ? 'gradient-profit' : 'gradient-loss'}`} />
        
        {/* Background glow effect */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${isProfitable ? 'bg-profit' : 'bg-loss'}`} />
        
        <div className="relative flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <MetricTooltip {...METRIC_TOOLTIPS.totalPnl}>
                <p className="text-sm text-muted-foreground font-medium">Total PnL</p>
              </MetricTooltip>
              <Badge 
                variant={isProfitable ? 'default' : 'destructive'} 
                className={`text-xs font-semibold ${isProfitable ? 'bg-profit/20 text-profit border-profit/30' : 'bg-loss/20 text-loss border-loss/30'} border hover-glow-badge`}
              >
                {isProfitable ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {isProfitable ? 'Profit' : 'Loss'}
              </Badge>
            </div>
            <p className={`text-4xl font-bold font-mono-numbers tracking-tight ${isProfitable ? 'text-profit text-glow-profit' : 'text-loss text-glow-loss'}`}>
              {formatCurrencySmart(animatedPnl)}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${isProfitable ? 'bg-profit/10' : 'bg-loss/10'} group-hover:scale-110 transition-transform duration-300`}>
            {isProfitable ? (
              <TrendingUp className={`w-7 h-7 text-profit icon-glow`} />
            ) : (
              <TrendingDown className={`w-7 h-7 text-loss icon-glow`} />
            )}
          </div>
        </div>
      </Card>

      {/* Wallet Address Card */}
      <Card className="relative overflow-hidden p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card hover-glow-card group">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 gradient-accent" />
        
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-10 bg-accent" />
        
        <div className="relative flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-sm text-muted-foreground font-medium">Wallet Address</p>
            <p className="text-2xl font-mono font-semibold text-foreground tracking-tight truncate">
              {formatAddress(walletAddress)}
            </p>
            <p className="text-xs text-muted-foreground/70 truncate font-mono">{walletAddress}</p>
          </div>
          <div className="p-3 rounded-xl bg-accent/10 group-hover:scale-110 transition-transform duration-300">
            <Wallet className="w-7 h-7 text-accent icon-glow" />
          </div>
        </div>
      </Card>

      {/* Account Value Card */}
      <Card className="relative overflow-hidden p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card hover-glow-card group">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
        
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-10 bg-primary" />
        
        <div className="relative flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <MetricTooltip {...METRIC_TOOLTIPS.accountValue}>
                <p className="text-sm text-muted-foreground font-medium">Total Account Value</p>
              </MetricTooltip>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10 live-indicator font-semibold">
                Live
              </Badge>
            </div>
            <p className="text-4xl font-bold text-foreground font-mono-numbers tracking-tight">
              {formatCurrencySmart(animatedAccountValue)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform duration-300">
            <Zap className="w-7 h-7 text-primary icon-glow animate-pulse-glow" />
          </div>
        </div>
      </Card>
    </div>
  );
};
