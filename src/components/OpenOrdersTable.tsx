import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/lighter-api";
import { ClipboardList, TrendingUp, TrendingDown } from "lucide-react";

interface Order {
  order_index: number;
  client_order_index: number;
  market_index: number;
  symbol?: string;
  initial_base_amount: string;
  price: string;
  remaining_base_amount: string;
  is_ask: boolean;
  side: string;
  type: string;
  time_in_force: string;
  status: string;
  timestamp: number;
}

interface OpenOrdersTableProps {
  orders: Record<string, Order[]> | Order[];
}

const MARKET_SYMBOLS: Record<number, string> = {
  0: "ETH-USD",
  1: "BTC-USD",
  2: "SOL-USD",
  3: "ARB-USD",
  4: "OP-USD",
};

export function OpenOrdersTable({ orders }: OpenOrdersTableProps) {
  const ordersList = Array.isArray(orders) 
    ? orders 
    : Object.values(orders).flat();

  if (ordersList.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Open Orders</h3>
        </div>
        <p className="text-muted-foreground text-center py-8">No open orders</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Open Orders</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Market</TableHead>
              <TableHead className="text-muted-foreground font-medium">Side</TableHead>
              <TableHead className="text-muted-foreground font-medium">Type</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Size</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Price</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Filled</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersList.map((order, index) => {
              const symbol = MARKET_SYMBOLS[order.market_index] || `Market ${order.market_index}`;
              const initialSize = parseFloat(order.initial_base_amount || '0');
              const remainingSize = parseFloat(order.remaining_base_amount || '0');
              const filledPercent = initialSize > 0 ? ((initialSize - remainingSize) / initialSize) * 100 : 0;

              return (
                <TableRow key={order.order_index || index} className="border-border/30 hover:bg-secondary/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{symbol}</TableCell>
                  <TableCell>
                    <Badge variant={order.side === 'buy' ? 'default' : 'destructive'} className="gap-1">
                      {order.side === 'buy' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {order.side.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.type}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {formatNumber(parseFloat(order.initial_base_amount))}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {formatCurrency(parseFloat(order.price))}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {filledPercent.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {order.status}
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
}
