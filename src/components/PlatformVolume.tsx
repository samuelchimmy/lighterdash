import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { lighterApi, formatCurrencySmart } from "@/lib/lighter-api";
import { MarketStats as MarketStatsType } from "@/types/lighter";
import { BarChart3, TrendingUp } from "lucide-react";

export function PlatformVolume() {
  const [markets, setMarkets] = useState<Record<number, MarketStatsType>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ws = lighterApi.createWebSocket();

    ws.onopen = () => {
      console.log("📊 PlatformVolume WebSocket connected");
      lighterApi.subscribeToChannel(ws, "market_stats/all");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "update/market_stats" && data.market_stats) {
          console.log("📊 PlatformVolume received market:", data.market_stats.market_id);
          setMarkets(prev => ({
            ...prev,
            [data.market_stats.market_id]: data.market_stats
          }));
          setIsLoading(false);
        } else if (data.type === "subscribed/market_stats" && data.market_stats) {
          setMarkets(prev => ({
            ...prev,
            [data.market_stats.market_id]: data.market_stats
          }));
          setIsLoading(false);
        } else if (data.channel === "market_stats:all" && data.market_stats) {
          setMarkets(prev => ({
            ...prev,
            [data.market_stats.market_id]: data.market_stats
          }));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error parsing platform volume:", error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const volumeStats = useMemo(() => {
    const marketList = Object.values(markets);
    
    console.log("📊 PlatformVolume calculating stats from markets:", Object.keys(markets), "total:", marketList.length);
    
    // Calculate 24h total volume
    const total24h = marketList.reduce((sum, m) => 
      sum + (m.daily_quote_token_volume || 0), 0
    );

    // Calculate 7d total volume (approximation: daily * 7)
    const total7d = total24h * 7;

    // Calculate 30d total volume (approximation: daily * 30)
    const total30d = total24h * 30;

    // Calculate total open interest across all markets
    const totalOpenInterest = marketList.reduce((sum, m) => 
      sum + parseFloat(m.open_interest || '0'), 0
    );

    // Count total markets
    const totalMarkets = marketList.length;

    return {
      total24h,
      total7d,
      total30d,
      totalOpenInterest,
      totalMarkets,
    };
  }, [markets]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Platform Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Platform Volume
          </CardTitle>
          <Badge variant="default" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 24h Volume */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">24h Volume</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrencySmart(volumeStats.total24h)}
            </p>
          </div>

          {/* 7d Volume */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">7d Volume</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrencySmart(volumeStats.total7d)}
            </p>
            <p className="text-xs text-muted-foreground italic">Est.</p>
          </div>

          {/* 30d Volume */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">30d Volume</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrencySmart(volumeStats.total30d)}
            </p>
            <p className="text-xs text-muted-foreground italic">Est.</p>
          </div>

          {/* Total Open Interest */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Open Interest</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrencySmart(volumeStats.totalOpenInterest)}
            </p>
          </div>

          {/* Active Markets */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Active Markets</p>
            <p className="text-xl font-bold text-foreground">
              {volumeStats.totalMarkets}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Note:</span> 7-day and 30-day volumes are estimated based on the current 24-hour volume. 
            All data is streamed live from Lighter's WebSocket API.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
