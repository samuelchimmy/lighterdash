import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencySmart, formatPercentage } from '@/lib/lighter-api';
import type { UserStats } from '@/types/lighter';
import { Gauge, PieChart, Wallet, Activity } from 'lucide-react';
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
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
          </div>
          Account Stats
        </h3>
        <p className="text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover-glow-card">
      <h3 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Activity className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
        </div>
        Account Stats
      </h3>
      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-muted/30 rounded-xl p-4 border border-border/30 cursor-help hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Gauge className="w-4 h-4 text-primary" fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <p className="text-sm text-muted-foreground">Leverage</p>
                  </div>
                  {parseFloat(stats.leverage || '0') > 5 && (
                    <Badge variant="destructive" className="text-xs">High</Badge>
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
              <div className="bg-muted/30 rounded-xl p-4 border border-border/30 cursor-help hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <PieChart className="w-4 h-4 text-primary" fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <p className="text-sm text-muted-foreground">Margin Usage</p>
                  </div>
                  {parseFloat(stats.margin_usage || '0') > 0.8 && (
                    <Badge variant="destructive" className="text-xs">High Risk</Badge>
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
              <div className="bg-muted/30 rounded-xl p-4 border border-border/30 cursor-help hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-profit/10">
                    <Wallet className="w-4 h-4 text-profit" fill="currentColor" fillOpacity={0.2} />
                  </div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatCurrencySmart(animatedAvailableBalance)}</p>
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
              <div className="bg-muted/30 rounded-xl p-4 border border-border/30 cursor-help hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Activity className="w-4 h-4 text-primary" fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <p className="text-sm text-muted-foreground">Collateral</p>
                  </div>
                  {parseFloat(stats.collateral || '0') > 0 && (
                    <Badge className="text-xs bg-primary/10 text-primary border-0">Active</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">
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
