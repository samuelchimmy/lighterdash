import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencySmart, formatPercentage } from '@/lib/lighter-api';
import type { UserStats } from '@/types/lighter';
import { Activity, PieChart, DollarSign, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
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

// Circular progress component
const CircularProgress = ({ value, max = 100, size = 48, strokeWidth = 4, color = 'primary' }: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'profit' | 'loss' | 'warning';
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference - progress * circumference;

  const colorClasses = {
    primary: 'text-primary',
    profit: 'text-profit',
    loss: 'text-loss',
    warning: 'text-warning',
  };

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="progress-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className={`progress-fill ${colorClasses[color]}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: 'currentColor' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
        {Math.round(value)}%
      </span>
    </div>
  );
};

export const AccountStats = ({ stats }: AccountStatsProps) => {
  const leverage = parseFloat(stats?.leverage || '0');
  const marginUsage = parseFloat(stats?.margin_usage || '0') * 100;
  const availableBalance = parseFloat(stats?.available_balance || '0');
  const collateral = parseFloat(stats?.collateral || '0');

  const animatedLeverage = useAnimatedCounter(leverage, { decimals: 2, duration: 800 });
  const animatedMarginUsage = useAnimatedCounter(marginUsage, { decimals: 1, duration: 800 });
  const animatedAvailableBalance = useAnimatedCounter(availableBalance, { duration: 800 });
  const animatedCollateral = useAnimatedCounter(collateral, { duration: 800 });

  const getLeverageColor = () => {
    if (leverage > 10) return 'loss';
    if (leverage > 5) return 'warning';
    return 'profit';
  };

  const getMarginColor = () => {
    if (marginUsage > 80) return 'loss';
    if (marginUsage > 50) return 'warning';
    return 'profit';
  };

  if (!stats) {
    return (
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card animate-slide-up">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Account Stats
        </h3>
        <p className="text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card animate-slide-up delay-100">
      <h3 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Account Stats
      </h3>
      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Leverage */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="stat-card cursor-help group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Leverage</p>
                  </div>
                  {leverage > 5 && (
                    <Badge 
                      variant="destructive" 
                      className="text-2xs bg-loss/20 text-loss border-loss/30 border"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      High
                    </Badge>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-foreground font-mono-numbers">
                    {animatedLeverage.toFixed(2)}
                    <span className="text-lg text-muted-foreground ml-1">x</span>
                  </p>
                  <CircularProgress 
                    value={Math.min(leverage * 10, 100)} 
                    color={getLeverageColor()} 
                    size={44} 
                    strokeWidth={4}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="glass-strong">
              <p className="font-semibold">Leverage</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Position value to collateral ratio. Higher leverage = higher risk.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Margin Usage */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="stat-card cursor-help group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <PieChart className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Margin Usage</p>
                  </div>
                  {marginUsage > 80 && (
                    <Badge 
                      variant="destructive" 
                      className="text-2xs bg-loss/20 text-loss border-loss/30 border"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Risk
                    </Badge>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-foreground font-mono-numbers">
                    {animatedMarginUsage.toFixed(1)}
                    <span className="text-lg text-muted-foreground ml-1">%</span>
                  </p>
                  <CircularProgress 
                    value={marginUsage} 
                    color={getMarginColor()} 
                    size={44} 
                    strokeWidth={4}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="glass-strong">
              <p className="font-semibold">Margin Usage</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Percentage of margin used. Above 80% is high risk.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Available Balance */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="stat-card cursor-help group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Available Balance</p>
                </div>
                <p className="text-2xl font-bold text-foreground font-mono-numbers">
                  {formatCurrencySmart(animatedAvailableBalance)}
                </p>
                <div className="mt-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((availableBalance / Math.max(collateral, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="glass-strong">
              <p className="font-semibold">Available Balance</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Free margin for new positions or withdrawals.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Collateral */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="stat-card cursor-help group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Collateral</p>
                  </div>
                  {collateral > 0 && (
                    <Badge className="text-2xs bg-profit/20 text-profit border-profit/30 border">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground font-mono-numbers">
                  {formatCurrencySmart(animatedCollateral)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Securing positions
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="glass-strong">
              <p className="font-semibold">Collateral</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Total deposited collateral for positions.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </Card>
  );
};
