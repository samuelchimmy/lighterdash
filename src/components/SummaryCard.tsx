import { Card } from '@/components/ui/card';
import { formatCurrency, formatAddress } from '@/lib/lighter-api';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardProps {
  totalPnl: number;
  walletAddress: string;
  accountValue: number;
}

export const SummaryCard = ({ totalPnl, walletAddress, accountValue }: SummaryCardProps) => {
  const isProfitable = totalPnl >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-card border-border shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total PnL</p>
            <p className={`text-3xl font-bold ${isProfitable ? 'text-profit' : 'text-loss'}`}>
              {formatCurrency(totalPnl)}
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
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Account Value</p>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(accountValue)}
          </p>
        </div>
      </Card>
    </div>
  );
};
