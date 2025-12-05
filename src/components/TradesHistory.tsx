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
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid';

interface TradesHistoryProps {
  trades: LighterTrade[];
}

export const TradesHistory = ({ trades }: TradesHistoryProps) => {
  if (!trades || trades.length === 0) {
    return (
      <Card className="p-3 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-1.5 mb-3">
          <ArrowsRightLeftIcon className="w-3.5 h-3.5 text-primary" />
          <h3 className="text-xs font-semibold text-foreground">Recent Trades</h3>
        </div>
        <p className="text-muted-foreground text-center py-4 text-[10px]">No trades found</p>
      </Card>
    );
  }

  // Show only the most recent 20 trades
  const recentTrades = trades.slice(0, 20);

  return (
    <Card className="p-3 overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium text-[10px] py-2">Date</TableHead>
              <TableHead className="text-muted-foreground font-medium text-[10px] py-2">Type</TableHead>
              <TableHead className="text-muted-foreground font-medium text-[10px] py-2">Size</TableHead>
              <TableHead className="text-muted-foreground font-medium text-[10px] py-2">Price</TableHead>
              <TableHead className="text-muted-foreground font-medium text-[10px] py-2">USD Amount</TableHead>
              <TableHead className="text-muted-foreground font-medium text-[10px] py-2 text-right">Fee</TableHead>
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
                  <TableCell className="text-foreground text-[10px] py-2">
                    {new Date(trade.timestamp).toLocaleDateString()} {new Date(trade.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="py-2">
                    <span className={`flex items-center gap-1 font-medium text-[10px] ${isBuy ? 'text-profit' : 'text-loss'}`}>
                      {isBuy ? (
                        <ArrowTrendingUpIcon className="w-3 h-3" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-3 h-3" />
                      )}
                      {isBuy ? 'BUY' : 'SELL'}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground font-mono text-[10px] py-2">{formatNumber(Math.abs(size), 4)}</TableCell>
                  <TableCell className="text-foreground text-[10px] py-2">{formatCurrencySmart(parseFloat(trade.price || '0'))}</TableCell>
                  <TableCell className="text-foreground text-[10px] py-2">{formatCurrencySmart(parseFloat(trade.usd_amount || '0'))}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-[10px] py-2">
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
