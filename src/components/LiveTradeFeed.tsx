import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { lighterApi, formatCurrency, formatNumber } from "@/lib/lighter-api";
import { getMarketEntries } from "@/lib/markets";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { LighterTrade } from "@/types/lighter";

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

          const volume = incomingTrades.reduce((sum, t) => sum + parseFloat(t.usd_amount || '0'), 0);
          setVolumeSum(prev => prev + volume);

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
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-3.5 w-3.5 text-primary" />
            Live Trade Feed
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
        {/* Volume Summary */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/30">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Volume</p>
            <p className="text-sm font-bold">{formatCurrency(volumeSum)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trades</p>
            <Badge variant="secondary" className="text-[10px] h-5">{trades.length}</Badge>
          </div>
        </div>

        {/* Trade Feed */}
        <ScrollArea className="h-[350px]" ref={scrollRef}>
          <div className="space-y-1.5">
            {trades.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                Waiting for trades...
              </p>
            ) : (
              trades.map((trade, idx) => {
                const isBuy = trade.type === 'buy' || !trade.is_maker_ask;
                const timestamp = new Date(trade.timestamp * 1000).toLocaleTimeString();
                
                return (
                  <div 
                    key={`${trade.trade_id}-${idx}`}
                    className={`p-2.5 rounded-lg border transition-all ${
                      idx === 0 ? 'bg-accent/50 border-primary/50' : 'bg-secondary/20 border-border/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {isBuy ? (
                          <TrendingUp className="h-3 w-3 text-profit" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-loss" />
                        )}
                        <Badge variant={isBuy ? 'default' : 'destructive'} className="text-[9px] h-4 px-1.5">
                          {isBuy ? 'BUY' : 'SELL'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{timestamp}</span>
                      </div>
                      <span className={`text-xs font-bold ${isBuy ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(parseFloat(trade.price))}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-muted-foreground">
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