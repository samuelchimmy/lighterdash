import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencySmart, formatPercentage } from '@/lib/lighter-api';
import type { UserStats } from '@/types/lighter';
import { Activity, PieChart, DollarSign } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AccountStatsProps {
  stats: UserStats | null;
}

export const AccountStats = ({ stats }: AccountStatsProps) => {
  const animatedLeverage = useAnimatedCounter(parseFloat(stats?.leverage || '0'), { decimals: 2, duration: 800 });
  const animatedMarginUsage = useAnimatedCounter(parseFloat(stats?.margin_usage || '0'), { decimals: 4, duration: 800 });
  const animatedAvailableBalance = useAnimatedCounter(parseFloat(stats?.available_balance || '0'), { duration: 800 });
  const animatedCollateral = useAnimatedCounter(parseFloat(stats?.collateral || '0'), { duration: 800 });

  if (!stats) {
    return (
      <Card className="p-6 bg-card border-border shadow-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Account Stats</h3>
        <p className="text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border shadow-card hover-glow-card">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Account Stats</h3>
      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border/50 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Leverage</p>
                  </div>
                  {parseFloat(stats.leverage || '0') > 5 && (
                    <Badge variant="destructive" className="text-xs hover-glow-badge">High</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{animatedLeverage.toFixed(2)}x</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">Leverage</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                The ratio of your total position value to your collateral. Higher leverage means higher risk.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border/50 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Margin Usage</p>
                  </div>
                  {parseFloat(stats.margin_usage || '0') > 0.8 && (
                    <Badge variant="destructive" className="text-xs hover-glow-badge">High Risk</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{formatPercentage(animatedMarginUsage * 100)}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">Margin Usage</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Percentage of your margin that's currently being used. Above 80% is considered high risk.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border/50 cursor-help">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Available Balance</p>
                </div>
                <p className="text-xl font-bold text-foreground">{formatCurrencySmart(animatedAvailableBalance)}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">Available Balance</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Free margin available for opening new positions or withdrawing.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border/50 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Collateral</p>
                  </div>
                  {parseFloat(stats.collateral || '0') > 0 && (
                    <Badge className="text-xs bg-primary text-primary-foreground hover-glow-badge">Active</Badge>
                  )}
                </div>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrencySmart(animatedCollateral)}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">Collateral</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Total value of assets deposited as collateral for your positions.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </Card>
  );
};
