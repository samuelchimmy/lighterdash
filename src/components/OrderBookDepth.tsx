import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { lighterApi, formatCurrency, formatNumber } from "@/lib/lighter-api";
import { BookOpen } from "lucide-react";

interface OrderBookLevel {
  price: string;
  size: string;
}

interface OrderBook {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
}

const MARKET_SYMBOLS: Record<number, string> = {
  0: "ETH-USD",
  1: "BTC-USD",
  2: "SOL-USD",
  3: "ARB-USD",
  4: "OP-USD",
};

export function OrderBookDepth() {
  const [selectedMarket, setSelectedMarket] = useState<number>(0);
  const [orderBook, setOrderBook] = useState<OrderBook>({ asks: [], bids: [] });
  const [spread, setSpread] = useState<number>(0);
  const [midPrice, setMidPrice] = useState<number>(0);

  useEffect(() => {
    const ws = lighterApi.createWebSocket();

    ws.onopen = () => {
      console.log("📖 OrderBook WebSocket connected");
      lighterApi.subscribeToChannel(ws, `order_book/${selectedMarket}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "update/order_book" && data.order_book) {
          const book = data.order_book;
          setOrderBook({
            asks: book.asks || [],
            bids: book.bids || [],
          });

          // Calculate spread and mid price
          if (book.asks?.length > 0 && book.bids?.length > 0) {
            const bestAsk = parseFloat(book.asks[0].price);
            const bestBid = parseFloat(book.bids[0].price);
            setSpread(bestAsk - bestBid);
            setMidPrice((bestAsk + bestBid) / 2);
          }
        }
      } catch (error) {
        console.error("Error parsing order book:", error);
      }
    };

    return () => {
      ws.close();
    };
  }, [selectedMarket]);

  const maxAskSize = Math.max(...orderBook.asks.map(a => parseFloat(a.size)), 0);
  const maxBidSize = Math.max(...orderBook.bids.map(b => parseFloat(b.size)), 0);
  const maxSize = Math.max(maxAskSize, maxBidSize);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Order Book Depth
          </CardTitle>
          <Select
            value={selectedMarket.toString()}
            onValueChange={(value) => setSelectedMarket(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MARKET_SYMBOLS).map(([id, symbol]) => (
                <SelectItem key={id} value={id}>
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Spread & Mid Price */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div>
            <p className="text-xs text-muted-foreground">Mid Price</p>
            <p className="text-lg font-bold">{formatCurrency(midPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Spread</p>
            <Badge variant="secondary">{formatCurrency(spread)}</Badge>
          </div>
        </div>

        {/* Order Book Ladder */}
        <div className="space-y-2">
          {/* Asks (Sell Orders) */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-red-500 mb-2">ASKS (Sell Orders)</p>
            {orderBook.asks.slice(0, 10).reverse().map((ask, idx) => {
              const size = parseFloat(ask.size);
              const percent = (size / maxSize) * 100;
              
              return (
                <div key={idx} className="relative h-6 flex items-center">
                  <div 
                    className="absolute right-0 h-full bg-red-500/10"
                    style={{ width: `${percent}%` }}
                  />
                  <div className="relative z-10 flex justify-between w-full px-2 text-xs">
                    <span className="text-red-500 font-medium">{formatCurrency(parseFloat(ask.price))}</span>
                    <span className="text-muted-foreground">{formatNumber(size, 4)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mid Price Line */}
          <div className="flex items-center justify-center py-2 border-y border-border">
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(midPrice)}
            </span>
          </div>

          {/* Bids (Buy Orders) */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-green-500 mb-2">BIDS (Buy Orders)</p>
            {orderBook.bids.slice(0, 10).map((bid, idx) => {
              const size = parseFloat(bid.size);
              const percent = (size / maxSize) * 100;
              
              return (
                <div key={idx} className="relative h-6 flex items-center">
                  <div 
                    className="absolute left-0 h-full bg-green-500/10"
                    style={{ width: `${percent}%` }}
                  />
                  <div className="relative z-10 flex justify-between w-full px-2 text-xs">
                    <span className="text-green-500 font-medium">{formatCurrency(parseFloat(bid.price))}</span>
                    <span className="text-muted-foreground">{formatNumber(size, 4)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
