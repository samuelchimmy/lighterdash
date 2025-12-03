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
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
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
      price += (Math.random() - 0.48) * basePrice * 0.02; // Random walk
      data.push(price);
    }
    return data;
  }, []);

  if (!positions || positions.length === 0) {
    return (
      <Card className="p-6 bg-card border-border shadow-card hover-glow-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Open Positions</h3>
        <p className="text-muted-foreground text-center py-8">No open positions</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border shadow-card hover-glow-card overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Open Positions</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-secondary/50">
              <TableHead className="text-muted-foreground">Asset</TableHead>
              <TableHead className="text-muted-foreground">Price Action</TableHead>
              <TableHead className="text-muted-foreground">Side</TableHead>
              <TableHead className="text-muted-foreground">Size</TableHead>
              <TableHead className="text-muted-foreground">Entry Price</TableHead>
              <TableHead className="text-muted-foreground">Position Value</TableHead>
              <TableHead className="text-muted-foreground">Liq. Price</TableHead>
              <TableHead className="text-muted-foreground">Liq. Distance</TableHead>
              <TableHead className="text-muted-foreground text-right">Unrealized PnL</TableHead>
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
              const riskColor = riskPercent > 70 ? 'text-red-500' : riskPercent > 40 ? 'text-yellow-500' : 'text-green-500';
              const progressColor = riskPercent > 70 ? 'bg-red-500' : riskPercent > 40 ? 'bg-yellow-500' : 'bg-green-500';
              
              return (
                <TableRow 
                  key={index} 
                  className={`border-border hover:bg-secondary/50 transition-colors ${
                    riskPercent > 70 ? 'bg-red-500/5' : riskPercent > 40 ? 'bg-yellow-500/5' : ''
                  }`}
                >
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      {riskPercent > 40 && <AlertTriangle className={`w-4 h-4 ${riskColor}`} />}
                      {position.symbol}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Sparkline 
                      data={sparklineData} 
                      width={60} 
                      height={24}
                      color="auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={side === 'LONG' ? 'default' : side === 'SHORT' ? 'destructive' : 'secondary'}
                      className="gap-1 hover-glow-badge cursor-default"
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
                  <TableCell className="text-foreground">{formatNumber(Math.abs(size), 4)}</TableCell>
                  <TableCell className="text-foreground">{formatCurrencySmart(parseFloat(position.avg_entry_price || '0'))}</TableCell>
                  <TableCell className="text-foreground">{formatCurrencySmart(Math.abs(parseFloat(position.position_value || '0')))}</TableCell>
                  <TableCell className="text-foreground">{formatCurrencySmart(parseFloat(position.liquidation_price || '0'))}</TableCell>
                  <TableCell>
                    <div className="w-24 space-y-1">
                      <div className="relative h-2">
                        <Progress value={riskPercent} className="h-2" />
                      </div>
                      <span className={`text-xs font-semibold ${riskColor}`}>
                        {formatPercentage(distanceToLiq)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatCurrencySmart(pnl)}
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
