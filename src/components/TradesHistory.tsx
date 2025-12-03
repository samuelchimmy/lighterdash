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
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';

interface TradesHistoryProps {
  trades: LighterTrade[];
}

export const TradesHistory = ({ trades }: TradesHistoryProps) => {
  if (!trades || trades.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeftRight className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
          <h3 className="text-lg font-semibold text-foreground">Recent Trades</h3>
        </div>
        <p className="text-muted-foreground text-center py-8">No trades found</p>
      </Card>
    );
  }

  // Show only the most recent 20 trades
  const recentTrades = trades.slice(0, 20);

  return (
    <Card className="p-6 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Date</TableHead>
              <TableHead className="text-muted-foreground font-medium">Type</TableHead>
              <TableHead className="text-muted-foreground font-medium">Size</TableHead>
              <TableHead className="text-muted-foreground font-medium">Price</TableHead>
              <TableHead className="text-muted-foreground font-medium">USD Amount</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTrades.map((trade) => {
              const isMaker = trade.maker_fee !== undefined && trade.maker_fee !== 0;
              const fee = (trade.maker_fee || trade.taker_fee || 0) / 100; // Convert from basis points
              const size = parseFloat(trade.size || '0');
              const isBuy = size > 0;
              
              return (
                <TableRow key={trade.trade_id} className="border-border/30 hover:bg-secondary/50 transition-colors">
                  <TableCell className="text-foreground">
                    {new Date(trade.timestamp).toLocaleDateString()} {new Date(trade.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1.5 font-medium ${isBuy ? 'text-profit' : 'text-loss'}`}>
                      {isBuy ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {isBuy ? 'BUY' : 'SELL'}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground font-mono">{formatNumber(Math.abs(size), 4)}</TableCell>
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
