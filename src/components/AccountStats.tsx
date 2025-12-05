import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencySmart, formatPercentage } from '@/lib/lighter-api';
import type { UserStats } from '@/types/lighter';
import { ChartBarIcon, ChartPieIcon, WalletIcon, BoltIcon } from '@heroicons/react/24/solid';
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
      <Card className="p-3 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
        <h3 className="text-xs font-semibold mb-3 text-foreground flex items-center gap-1.5">
          <div className="p-1.5 rounded-md bg-primary/10">
            <BoltIcon className="w-3.5 h-3.5 text-primary" />
          </div>
          Account Stats
        </h3>
        <p className="text-muted-foreground text-center py-4 text-[10px]">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-3 hover-glow-card bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
      <h3 className="text-xs font-semibold mb-3 text-foreground flex items-center gap-1.5">
        <div className="p-1.5 rounded-md bg-primary/10">
          <BoltIcon className="w-3.5 h-3.5 text-primary" />
        </div>
        Account Stats
      </h3>
      <TooltipProvider>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-muted/30 rounded-lg p-2.5 border border-border/30 cursor-help hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-primary/10">
                      <ChartBarIcon className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-[9px] text-muted-foreground">Leverage</p>
                  </div>
                  {parseFloat(stats.leverage || '0') > 5 && (
                    <Badge variant="destructive" className="text-[8px] h-3.5 px-1">High</Badge>
                  )}
                </div>
                <p className="text-base font-bold text-foreground">{animatedLeverage.toFixed(2)}x</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold text-[10px]">Leverage</p>
              <p className="text-[9px] text-muted-foreground max-w-xs">
                The ratio of your total position value to your collateral.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-muted/30 rounded-lg p-2.5 border border-border/30 cursor-help hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-primary/10">
                      <ChartPieIcon className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-[9px] text-muted-foreground">Margin Usage</p>
                  </div>
                  {parseFloat(stats.margin_usage || '0') > 0.8 && (
                    <Badge variant="destructive" className="text-[8px] h-3.5 px-1">Risk</Badge>
                  )}
                </div>
                <p className="text-base font-bold text-foreground">{formatPercentage(animatedMarginUsage * 100)}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold text-[10px]">Margin Usage</p>
              <p className="text-[9px] text-muted-foreground max-w-xs">
                Percentage of margin currently being used.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-muted/30 rounded-lg p-2.5 border border-border/30 cursor-help hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="p-1 rounded-md bg-profit/10">
                    <WalletIcon className="w-3 h-3 text-profit" />
                  </div>
                  <p className="text-[9px] text-muted-foreground">Available Balance</p>
                </div>
                <p className="text-base font-bold text-foreground">{formatCurrencySmart(animatedAvailableBalance)}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold text-[10px]">Available Balance</p>
              <p className="text-[9px] text-muted-foreground max-w-xs">
                Free margin available for new positions.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-muted/30 rounded-lg p-2.5 border border-border/30 cursor-help hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-primary/10">
                      <BoltIcon className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-[9px] text-muted-foreground">Collateral</p>
                  </div>
                  {parseFloat(stats.collateral || '0') > 0 && (
                    <Badge className="text-[8px] h-3.5 px-1 bg-primary/10 text-primary border-0">Active</Badge>
                  )}
                </div>
                <p className="text-base font-bold text-foreground">
                  {formatCurrencySmart(animatedCollateral)}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold text-[10px]">Collateral</p>
              <p className="text-[9px] text-muted-foreground max-w-xs">
                Total assets deposited as collateral.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </Card>
  );
};
