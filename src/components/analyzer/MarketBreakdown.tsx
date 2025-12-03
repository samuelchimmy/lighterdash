import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, Layers } from 'lucide-react';
import { MarketBreakdown as MarketBreakdownType } from '@/lib/csv-trade-analyzer';
import { AITooltip } from './AITooltip';

interface MarketBreakdownProps {
  marketBreakdown: MarketBreakdownType[];
}

type SortKey = 'market' | 'netPnL' | 'winRate' | 'profitFactor' | 'totalFees' | 'totalTrades' | 'avgPnLPerTrade';
type SortDirection = 'asc' | 'desc';

function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000) return `$${(value / 1000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number): string {
  if (value === Infinity) return '∞';
  return value.toFixed(2);
}

export function MarketBreakdown({ marketBreakdown }: MarketBreakdownProps) {
  const [sortKey, setSortKey] = useState<SortKey>('netPnL');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedData = useMemo(() => {
    return [...marketBreakdown].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      const aNum = typeof aVal === 'number' ? aVal : 0;
      const bNum = typeof bVal === 'number' ? bVal : 0;
      
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    });
  }, [marketBreakdown, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1" /> 
      : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Per-Market Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('market')} className="h-auto p-0 font-medium hover:bg-transparent text-muted-foreground">
                    Market <SortIcon column="market" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('netPnL')} className="h-auto p-0 font-medium hover:bg-transparent text-muted-foreground">
                    Net PnL <SortIcon column="netPnL" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('winRate')} className="h-auto p-0 font-medium hover:bg-transparent text-muted-foreground">
                    Win Rate <SortIcon column="winRate" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('profitFactor')} className="h-auto p-0 font-medium hover:bg-transparent text-muted-foreground">
                    Profit Factor <SortIcon column="profitFactor" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('totalFees')} className="h-auto p-0 font-medium hover:bg-transparent text-muted-foreground">
                    Fees <SortIcon column="totalFees" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('totalTrades')} className="h-auto p-0 font-medium hover:bg-transparent text-muted-foreground">
                    Trades <SortIcon column="totalTrades" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('avgPnLPerTrade')} className="h-auto p-0 font-medium hover:bg-transparent text-muted-foreground">
                    Avg PnL <SortIcon column="avgPnLPerTrade" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-muted-foreground font-medium">Insight</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((market) => (
                <TableRow key={market.market} className="border-border/30 hover:bg-secondary/50">
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {market.market}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${market.netPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatCurrency(market.netPnL)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={market.winRate >= 50 ? 'text-profit' : 'text-loss'}>
                      {market.winRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={market.profitFactor >= 1 ? 'text-profit' : 'text-loss'}>
                      {formatNumber(market.profitFactor)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(market.totalFees)}
                  </TableCell>
                  <TableCell className="text-right text-foreground">{market.totalTrades}</TableCell>
                  <TableCell className={`text-right font-medium ${market.avgPnLPerTrade >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatCurrency(market.avgPnLPerTrade)}
                  </TableCell>
                  <TableCell className="text-right">
                    <AITooltip
                      metricType="market_performance"
                      data={{
                        market: market.market,
                        netPnL: market.netPnL,
                        winRate: market.winRate,
                        profitFactor: market.profitFactor,
                        avgPnLPerTrade: market.avgPnLPerTrade,
                        totalTrades: market.totalTrades
                      }}
                      className="p-1"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {sortedData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No market data available
          </div>
        )}

        {/* Summary stats */}
        {sortedData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-3 justify-center">
            <Badge variant="secondary" className="text-sm">
              {sortedData.length} Markets Traded
            </Badge>
            <Badge className="text-sm bg-profit/10 text-profit border-0">
              Best: {sortedData[0]?.market} ({formatCurrency(sortedData[0]?.netPnL || 0)})
            </Badge>
            <Badge variant="destructive" className="text-sm bg-loss/10 text-loss border-0">
              Worst: {sortedData[sortedData.length - 1]?.market} ({formatCurrency(sortedData[sortedData.length - 1]?.netPnL || 0)})
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
