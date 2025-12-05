import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { lighterApi, formatCurrency, formatNumber } from "@/lib/lighter-api";
import { getMarketEntries } from "@/lib/markets";
import { BookOpen } from "lucide-react";

interface OrderBookLevel {
  price: string;
  size: string;
}

interface OrderBook {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
}

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
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Order Book Depth
          </CardTitle>
          <Select
            value={selectedMarket.toString()}
            onValueChange={(value) => setSelectedMarket(parseInt(value))}
          >
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getMarketEntries().map(([id, symbol]) => (
                <SelectItem key={id} value={id} className="text-xs">
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Spread & Mid Price */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/30">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mid Price</p>
            <p className="text-sm font-bold">{formatCurrency(midPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Spread</p>
            <Badge variant="secondary" className="text-[10px] h-5">{formatCurrency(spread)}</Badge>
          </div>
        </div>

        {/* Order Book Ladder */}
        <div className="space-y-1.5 min-h-[400px]">
          {/* Asks (Sell Orders) */}
          <div className="space-y-0.5 h-[180px] overflow-hidden">
            <p className="text-[10px] font-semibold text-loss mb-1.5 uppercase tracking-wider">Asks (Sell Orders)</p>
            {orderBook.asks.slice(0, 10).reverse().map((ask, idx) => {
              const size = parseFloat(ask.size);
              const percent = (size / maxSize) * 100;
              
              return (
                <div key={idx} className="relative h-5 flex items-center transition-none">
                  <div 
                    className="absolute right-0 h-full bg-loss/10 transition-all duration-200"
                    style={{ width: `${percent}%` }}
                  />
                  <div className="relative z-10 flex justify-between w-full px-2 text-[10px]">
                    <span className="text-loss font-medium">{formatCurrency(parseFloat(ask.price))}</span>
                    <span className="text-muted-foreground">{formatNumber(size, 4)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mid Price Line */}
          <div className="flex items-center justify-center py-1.5 border-y border-border/50 h-8">
            <span className="text-xs font-semibold text-primary">
              {formatCurrency(midPrice)}
            </span>
          </div>

          {/* Bids (Buy Orders) */}
          <div className="space-y-0.5 h-[180px] overflow-hidden">
            <p className="text-[10px] font-semibold text-profit mb-1.5 uppercase tracking-wider">Bids (Buy Orders)</p>
            {orderBook.bids.slice(0, 10).map((bid, idx) => {
              const size = parseFloat(bid.size);
              const percent = (size / maxSize) * 100;
              
              return (
                <div key={idx} className="relative h-5 flex items-center transition-none">
                  <div 
                    className="absolute left-0 h-full bg-profit/10 transition-all duration-200"
                    style={{ width: `${percent}%` }}
                  />
                  <div className="relative z-10 flex justify-between w-full px-2 text-[10px]">
                    <span className="text-profit font-medium">{formatCurrency(parseFloat(bid.price))}</span>
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