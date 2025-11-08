import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/lighter-api';
import type { Position } from '@/types/lighter';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PositionsTableProps {
  positions: Position[];
}

export const PositionsTable = ({ positions }: PositionsTableProps) => {
  if (!positions || positions.length === 0) {
    return (
      <Card className="p-6 bg-card border-border shadow-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Open Positions</h3>
        <p className="text-muted-foreground text-center py-8">No open positions</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border shadow-card overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Open Positions</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-secondary/50">
              <TableHead className="text-muted-foreground">Asset</TableHead>
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
              const side = size > 0 ? 'long' : size < 0 ? 'short' : 'neutral';
              
              return (
                <TableRow key={index} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-medium text-foreground">{position.symbol}</TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1 ${side === 'long' ? 'text-profit' : 'text-loss'}`}>
                      {side === 'long' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {side.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground">{formatNumber(Math.abs(size), 4)}</TableCell>
                  <TableCell className="text-foreground">{formatCurrency(parseFloat(position.avg_entry_price || '0'))}</TableCell>
                  <TableCell className="text-foreground">{formatCurrency(parseFloat(position.position_value || '0'))}</TableCell>
                  <TableCell className="text-foreground">{formatCurrency(parseFloat(position.liquidation_price || '0'))}</TableCell>
                  <TableCell className={`text-right font-semibold ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatCurrency(pnl)}
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
