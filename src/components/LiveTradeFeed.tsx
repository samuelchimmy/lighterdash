import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { lighterApi, formatCurrency, formatNumber } from "@/lib/lighter-api";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { LighterTrade } from "@/types/lighter";

const MARKET_SYMBOLS: Record<number, string> = {
  0: "ETH-USD",
  1: "BTC-USD",
  7: "XRP-USD",
  24: "HYPE-USD",
  25: "BNB-USD",
  29: "ENA-USD",
};

export function LiveTradeFeed() {
  const [selectedMarket, setSelectedMarket] = useState<number>(0);
  const [trades, setTrades] = useState<LighterTrade[]>([]);
  const [volumeSum, setVolumeSum] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = lighterApi.createWebSocket();

    ws.onopen = () => {
      console.log("🔴 LiveTrade WebSocket connected");
      lighterApi.subscribeToChannel(ws, `trade/${selectedMarket}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "update/trade" && data.trades) {
          const incomingTrades: LighterTrade[] = data.trades;
          
          setTrades(prev => {
            const newTrades = [...incomingTrades, ...prev].slice(0, 50);
            return newTrades;
          });

          // Update volume sum
          const volume = incomingTrades.reduce((sum, t) => sum + parseFloat(t.usd_amount || '0'), 0);
          setVolumeSum(prev => prev + volume);

          // Auto-scroll to top on new trade
          if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
          }
        }
      } catch (error) {
        console.error("Error parsing trade feed:", error);
      }
    };

    return () => {
      ws.close();
      setTrades([]);
      setVolumeSum(0);
    };
  }, [selectedMarket]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Trade Feed
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
        {/* Volume Summary */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div>
            <p className="text-xs text-muted-foreground">Total Volume</p>
            <p className="text-lg font-bold">{formatCurrency(volumeSum)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Trades</p>
            <Badge variant="secondary">{trades.length}</Badge>
          </div>
        </div>

        {/* Trade Feed */}
        <ScrollArea className="h-[400px]" ref={scrollRef}>
          <div className="space-y-2">
            {trades.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Waiting for trades...
              </p>
            ) : (
              trades.map((trade, idx) => {
                const isBuy = trade.type === 'buy' || !trade.is_maker_ask;
                const timestamp = new Date(trade.timestamp * 1000).toLocaleTimeString();
                
                return (
                  <div 
                    key={`${trade.trade_id}-${idx}`}
                    className={`p-3 rounded-lg border transition-all ${
                      idx === 0 ? 'bg-accent/50 border-primary/50' : 'bg-card/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isBuy ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={isBuy ? 'default' : 'destructive'} className="text-xs">
                          {isBuy ? 'BUY' : 'SELL'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{timestamp}</span>
                      </div>
                      <span className={`text-sm font-bold ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(parseFloat(trade.price))}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Size: {formatNumber(parseFloat(trade.size), 4)}</span>
                      <span>Value: {formatCurrency(parseFloat(trade.usd_amount))}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
