import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/lighter-api";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Open Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No open orders</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Open Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Market</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Filled</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersList.map((order, index) => {
              const symbol = MARKET_SYMBOLS[order.market_index] || `Market ${order.market_index}`;
              const initialSize = parseFloat(order.initial_base_amount || '0');
              const remainingSize = parseFloat(order.remaining_base_amount || '0');
              const filledPercent = initialSize > 0 ? ((initialSize - remainingSize) / initialSize) * 100 : 0;

              return (
                <TableRow key={order.order_index || index}>
                  <TableCell className="font-medium">{symbol}</TableCell>
                  <TableCell>
                    <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                      {order.side === 'buy' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {order.side.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {order.type}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(parseFloat(order.initial_base_amount))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(order.price))}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}
