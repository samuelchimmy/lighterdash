import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface MetricTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  formula?: string;
  example?: string;
}

export const MetricTooltip = ({ children, title, description, formula, example }: MetricTooltipProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5 cursor-help">
            {children}
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4 space-y-2" side="top">
          <div>
            <p className="font-semibold text-foreground mb-1">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {formula && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Formula:</p>
              <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{formula}</code>
            </div>
          )}
          {example && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Example:</p>
              <p className="text-xs text-foreground">{example}</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Predefined metric explanations
export const METRIC_TOOLTIPS = {
  totalPnl: {
    title: "Total PnL (Profit and Loss)",
    description: "The total profit or loss across all your positions, including both realized and unrealized gains/losses.",
    formula: "Portfolio Value - Collateral",
    example: "If you deposited $1000 and now have $1200, your PnL is +$200"
  },
  accountValue: {
    title: "Total Account Value",
    description: "The current total value of your account including collateral and unrealized PnL from all positions.",
    formula: "Collateral + Unrealized PnL",
  },
  leverage: {
    title: "Leverage",
    description: "The ratio of your total position value to your collateral. Higher leverage means higher risk.",
    formula: "Total Position Value / Collateral",
    example: "10x leverage means $1000 collateral controls $10,000 position"
  },
  marginUsage: {
    title: "Margin Usage",
    description: "The percentage of your available margin currently being used. When this reaches 100%, you cannot open new positions.",
    formula: "(Used Margin / Total Margin) × 100",
  },
  buyingPower: {
    title: "Buying Power",
    description: "The maximum amount you can use to open new positions based on your available margin and current leverage.",
    formula: "Available Margin × Max Leverage",
  },
  unrealizedPnl: {
    title: "Unrealized PnL",
    description: "Profit or loss on your open positions that hasn't been locked in yet. This changes as market prices move.",
    formula: "(Current Price - Entry Price) × Position Size",
  },
  realizedPnl: {
    title: "Realized PnL",
    description: "Profit or loss that has been locked in by closing positions or through funding payments.",
  },
  fundingRate: {
    title: "Funding Rate",
    description: "Periodic payments between long and short traders to keep perpetual prices aligned with spot prices.",
    example: "Positive rate means longs pay shorts, negative means shorts pay longs"
  },
  liquidationPrice: {
    title: "Liquidation Price",
    description: "The price at which your position will be automatically closed to prevent further losses beyond your margin.",
    example: "If liquidation price is $3000, your position closes if price reaches that level"
  },
  winRate: {
    title: "Win Rate",
    description: "The percentage of your trades that resulted in profit.",
    formula: "(Profitable Trades / Total Trades) × 100",
    example: "7 winning trades out of 10 total = 70% win rate"
  },
};
