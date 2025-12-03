import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrencySmart, formatNumber, formatPercentage } from '@/lib/lighter-api';
import type { Position } from '@/types/lighter';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Layers, ShieldAlert } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { useMemo } from 'react';

interface PositionsTableProps {
  positions: Position[];
}

export const PositionsTable = ({ positions }: PositionsTableProps) => {
  // Generate mock price movement data for sparklines
  const generateSparklineData = useMemo(() => (basePrice: number) => {
    const data: number[] = [];
    let price = basePrice;
    for (let i = 0; i < 12; i++) {
      price += (Math.random() - 0.48) * basePrice * 0.02;
      data.push(price);
    }
    return data;
  }, []);

  if (!positions || positions.length === 0) {
    return (
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card animate-slide-up delay-200">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Open Positions
        </h3>
        <p className="text-muted-foreground text-center py-8">No open positions</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-card overflow-hidden animate-slide-up delay-200">
      <h3 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
        <Layers className="w-5 h-5 text-primary" />
        Open Positions
        <Badge variant="outline" className="ml-2 text-xs border-border/50">
          {positions.length} Active
        </Badge>
      </h3>
      <div className="overflow-x-auto -mx-6 px-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Asset</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Price Action</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Side</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Size</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Entry Price</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Position Value</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Liq. Price</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Liq. Distance</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wide text-right">Unrealized PnL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((position, index) => {
              const pnl = parseFloat(position.unrealized_pnl || '0');
              const size = parseFloat(position.position || '0');
              const side = size > 0 ? 'LONG' : size < 0 ? 'SHORT' : 'NEUTRAL';
              const entryPrice = parseFloat(position.avg_entry_price || '0');
              const sparklineData = generateSparklineData(entryPrice);
              
              // Calculate distance to liquidation
              const currentPrice = parseFloat(position.position_value || '0') / Math.abs(size || 1);
              const liqPrice = parseFloat(position.liquidation_price || '0');
              const isLong = size > 0;
              
              const distanceToLiq = liqPrice > 0 
                ? isLong 
                  ? ((currentPrice - liqPrice) / currentPrice) * 100
                  : ((liqPrice - currentPrice) / currentPrice) * 100
                : 100;
              
              const riskPercent = Math.max(0, 100 - distanceToLiq);
              const getRiskColor = () => {
                if (riskPercent > 70) return 'loss';
                if (riskPercent > 40) return 'warning';
                return 'profit';
              };
              const riskColor = getRiskColor();
              
              return (
                <TableRow 
                  key={index} 
                  className={`border-border/30 transition-all duration-200 hover:bg-secondary/30 ${
                    riskPercent > 70 ? 'bg-loss/5' : riskPercent > 40 ? 'bg-warning/5' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${side === 'LONG' ? 'bg-profit/10' : 'bg-loss/10'}`}>
                        <span className="text-sm font-bold">{position.symbol?.charAt(0) || 'M'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{position.symbol}</span>
                        {riskPercent > 40 && (
                          <span className={`text-2xs flex items-center gap-1 ${riskColor === 'loss' ? 'text-loss' : 'text-warning'}`}>
                            <ShieldAlert className="w-3 h-3" /> At Risk
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="p-1 rounded bg-secondary/30">
                      <Sparkline 
                        data={sparklineData} 
                        width={60} 
                        height={24}
                        color="auto"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`gap-1 font-semibold border ${
                        side === 'LONG' 
                          ? 'bg-profit/20 text-profit border-profit/30 hover:bg-profit/30' 
                          : side === 'SHORT'
                          ? 'bg-loss/20 text-loss border-loss/30 hover:bg-loss/30'
                          : 'bg-secondary text-muted-foreground border-border'
                      }`}
                    >
                      {side === 'LONG' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : side === 'SHORT' ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      {side}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground font-mono-numbers">
                    {formatNumber(Math.abs(size), 4)}
                  </TableCell>
                  <TableCell className="text-foreground font-mono-numbers">
                    {formatCurrencySmart(parseFloat(position.avg_entry_price || '0'))}
                  </TableCell>
                  <TableCell className="text-foreground font-mono-numbers">
                    {formatCurrencySmart(Math.abs(parseFloat(position.position_value || '0')))}
                  </TableCell>
                  <TableCell className="font-mono-numbers">
                    <span className={riskPercent > 40 ? (riskColor === 'loss' ? 'text-loss' : 'text-warning') : 'text-foreground'}>
                      {formatCurrencySmart(parseFloat(position.liquidation_price || '0'))}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-24 space-y-1.5">
                      <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                            riskColor === 'loss' ? 'bg-loss' : riskColor === 'warning' ? 'bg-warning' : 'bg-profit'
                          }`}
                          style={{ width: `${riskPercent}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${
                        riskColor === 'loss' ? 'text-loss' : riskColor === 'warning' ? 'text-warning' : 'text-profit'
                      }`}>
                        {formatPercentage(distanceToLiq)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      className={`font-bold font-mono-numbers ${
                        pnl >= 0 
                          ? 'bg-profit/20 text-profit border-profit/30' 
                          : 'bg-loss/20 text-loss border-loss/30'
                      } border`}
                    >
                      {pnl >= 0 ? '+' : ''}{formatCurrencySmart(pnl)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
