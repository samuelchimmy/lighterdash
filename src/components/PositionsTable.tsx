import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrencySmart, formatNumber } from '@/lib/lighter-api';
import type { Position } from '@/types/lighter';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
              
              return (
                <TableRow key={index} className="border-border hover:bg-secondary/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{position.symbol}</TableCell>
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
