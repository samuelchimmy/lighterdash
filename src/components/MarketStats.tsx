import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { lighterApi, formatCurrency, formatCurrencySmart, formatPercentage } from "@/lib/lighter-api";
import { MarketStats as MarketStatsType } from "@/types/lighter";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const MARKET_SYMBOLS: Record<number, string> = {
  0: "ETH-USD",
  1: "BTC-USD",
  7: "XRP-USD",
  24: "HYPE-USD",
  25: "BNB-USD",
  29: "ENA-USD",
};

export function MarketStats() {
  const [markets, setMarkets] = useState<Record<number, MarketStatsType>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ws = lighterApi.createWebSocket();

    ws.onopen = () => {
      console.log("📊 MarketStats WebSocket connected");
      lighterApi.subscribeToChannel(ws, "market_stats/all");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        console.log("📊 MarketStats message:", data.type, data.channel);
        
        // Handle both single market updates and batch updates
        if (data.type === "update/market_stats" && data.market_stats) {
          console.log("📊 Single market update:", {
            market_id: data.market_stats.market_id,
            mark_price: data.market_stats.mark_price,
            index_price: data.market_stats.index_price
          });
          setMarkets(prev => ({
            ...prev,
            [data.market_stats.market_id]: data.market_stats
          }));
          setIsLoading(false);
        } else if (data.type === "subscribed/market_stats" && data.market_stats) {
          // Handle initial subscription response
          console.log("📊 Subscribed to market stats:", data.market_stats);
          setMarkets(prev => ({
            ...prev,
            [data.market_stats.market_id]: data.market_stats
          }));
          setIsLoading(false);
        } else if (data.channel === "market_stats:all" && data.market_stats) {
          // Alternative channel format
          console.log("📊 Market stats from channel:", data.market_stats);
          setMarkets(prev => ({
            ...prev,
            [data.market_stats.market_id]: data.market_stats
          }));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error parsing market stats:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("MarketStats WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("MarketStats WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const marketList = Object.values(markets).sort((a, b) => a.market_id - b.market_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketList.map((market) => {
            const symbol = MARKET_SYMBOLS[market.market_id] || `Market ${market.market_id}`;
            const priceChange = market.daily_price_change ?? 0;
            const fundingRate = parseFloat(market.current_funding_rate || '0') * 100;
            const isPriceUp = priceChange >= 0;
            const isFundingPositive = fundingRate >= 0;

            return (
              <div 
                key={market.market_id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{symbol}</h3>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(parseFloat(market.mark_price))}
                    </p>
                  </div>
                  <Badge 
                    variant={isPriceUp ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {isPriceUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {formatPercentage(priceChange)}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Index:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(market.index_price))}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Volume:</span>
                    <span className="font-medium">{formatCurrencySmart(market.daily_quote_token_volume)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Open Interest:</span>
                    <span className="font-medium">{formatCurrencySmart(parseFloat(market.open_interest))}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-muted-foreground">Funding Rate:</span>
                    <Badge 
                      variant={isFundingPositive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {fundingRate >= 0 ? '+' : ''}{fundingRate.toFixed(4)}%
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
