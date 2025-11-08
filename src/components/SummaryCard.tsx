import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencySmart, formatAddress } from '@/lib/lighter-api';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-card border-border shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground">Total PnL</p>
              <Badge variant={isProfitable ? 'default' : 'destructive'} className="text-xs">
                {isProfitable ? 'Profit' : 'Loss'}
              </Badge>
            </div>
            <p className={`text-3xl font-bold ${isProfitable ? 'text-profit' : 'text-loss'}`}>
              {formatCurrencySmart(animatedPnl)}
            </p>
          </div>
          {isProfitable ? (
            <TrendingUp className="w-8 h-8 text-profit" />
          ) : (
            <TrendingDown className="w-8 h-8 text-loss" />
          )}
        </div>
      </Card>

      <Card className="p-6 bg-card border-border shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
            <p className="text-xl font-mono font-semibold text-foreground">
              {formatAddress(walletAddress)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{walletAddress}</p>
          </div>
          <Wallet className="w-8 h-8 text-primary" />
        </div>
      </Card>

      <Card className="p-6 bg-card border-border shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground">Total Account Value</p>
              <Badge variant="outline" className="text-xs">Live</Badge>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrencySmart(animatedAccountValue)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
