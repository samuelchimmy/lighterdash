import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrencySmart, formatNumber } from '@/lib/lighter-api';
import type { LighterTrade } from '@/types/lighter';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TradesHistoryProps {
  trades: LighterTrade[];
}

export const TradesHistory = ({ trades }: TradesHistoryProps) => {
  if (!trades || trades.length === 0) {
    return (
      <Card className="p-6 bg-card border-border shadow-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Trades</h3>
        <p className="text-muted-foreground text-center py-8">No trades found</p>
      </Card>
    );
  }

  // Show only the most recent 20 trades
  const recentTrades = trades.slice(0, 20);

  return (
    <Card className="p-6 bg-card border-border shadow-card overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Trades</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-secondary/50">
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Size</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">USD Amount</TableHead>
              <TableHead className="text-muted-foreground text-right">Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTrades.map((trade) => {
              const isMaker = trade.maker_fee !== undefined && trade.maker_fee !== 0;
              const fee = (trade.maker_fee || trade.taker_fee || 0) / 100; // Convert from basis points
              const size = parseFloat(trade.size || '0');
              const isBuy = size > 0;
              
              return (
                <TableRow key={trade.trade_id} className="border-border hover:bg-secondary/50">
                  <TableCell className="text-foreground">
                    {new Date(trade.timestamp).toLocaleDateString()} {new Date(trade.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1 ${isBuy ? 'text-profit' : 'text-loss'}`}>
                      {isBuy ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {isBuy ? 'BUY' : 'SELL'}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground">{formatNumber(Math.abs(size), 4)}</TableCell>
                  <TableCell className="text-foreground">{formatCurrencySmart(parseFloat(trade.price || '0'))}</TableCell>
                  <TableCell className="text-foreground">{formatCurrencySmart(parseFloat(trade.usd_amount || '0'))}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrencySmart(fee)}
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
