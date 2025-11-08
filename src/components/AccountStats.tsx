import { Card } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/lighter-api';
import type { UserStats } from '@/types/lighter';
import { Activity, PieChart, DollarSign } from 'lucide-react';

interface AccountStatsProps {
  stats: UserStats | null;
}

export const AccountStats = ({ stats }: AccountStatsProps) => {
  if (!stats) {
    return (
      <Card className="p-6 bg-card border-border shadow-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Account Stats</h3>
        <p className="text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border shadow-card">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Account Stats</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Leverage</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{parseFloat(stats.leverage || '0').toFixed(2)}x</p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Margin Usage</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatPercentage(parseFloat(stats.margin_usage || '0') * 100)}</p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Available Balance</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(parseFloat(stats.available_balance || '0'))}</p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Collateral</p>
          </div>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(parseFloat(stats.collateral || '0'))}
          </p>
        </div>
      </div>
    </Card>
  );
};
