import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { lighterApi, formatCurrencySmart, normalizeMarketStats } from "@/lib/lighter-api";
import { MarketStats as MarketStatsType } from "@/types/lighter";
import { BarChart3, TrendingUp, Activity, DollarSign, Layers } from "lucide-react";

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

        const updates: MarketStatsType[] = [];
        const tryPush = (raw: any) => {
          const norm = normalizeMarketStats(raw);
          if (norm) updates.push(norm);
        };

        if (data.market_stats || data.marketStats) {
          const stats = data.market_stats ?? data.marketStats;
          if (typeof stats === 'object' && !Array.isArray(stats)) {
            Object.values(stats).forEach(tryPush);
          } else {
            tryPush(stats);
          }
        } else if (Array.isArray(data.markets)) {
          data.markets.forEach(tryPush);
        } else if (data.markets && typeof data.markets === 'object') {
          Object.values(data.markets).forEach(tryPush);
        }

        if (updates.length > 0) {
          setMarkets((prev) => {
            const next = { ...prev };
            for (const m of updates) next[m.market_id] = m;
            return next;
          });
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
    
    const total24h = marketList.reduce((sum, m) => 
      sum + (m.daily_quote_token_volume || 0), 0
    );
    const total7d = total24h * 7;
    const total30d = total24h * 30;
    const totalOpenInterest = marketList.reduce((sum, m) => 
      sum + parseFloat(m.open_interest || '0'), 0
    );
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
      <Card className="bg-card border-border/50 shadow-sm">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            Platform Volume
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            Platform Volume
          </CardTitle>
          <Badge variant="default" className="flex items-center gap-1 text-[10px] h-5">
            <TrendingUp className="h-2.5 w-2.5" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="h-3 w-3 text-primary" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">24h Volume</p>
            </div>
            <p className="text-base font-bold text-foreground">
              {formatCurrencySmart(volumeStats.total24h)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="h-3 w-3 text-primary" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">7d Volume</p>
            </div>
            <p className="text-base font-bold text-foreground">
              {formatCurrencySmart(volumeStats.total7d)}
            </p>
            <p className="text-[9px] text-muted-foreground italic">Est.</p>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 className="h-3 w-3 text-primary" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">30d Volume</p>
            </div>
            <p className="text-base font-bold text-foreground">
              {formatCurrencySmart(volumeStats.total30d)}
            </p>
            <p className="text-[9px] text-muted-foreground italic">Est.</p>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-1.5 mb-1">
              <Layers className="h-3 w-3 text-primary" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Open Interest</p>
            </div>
            <p className="text-base font-bold text-foreground">
              {formatCurrencySmart(volumeStats.totalOpenInterest)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Markets</p>
            </div>
            <p className="text-base font-bold text-foreground">
              {volumeStats.totalMarkets}
            </p>
          </div>
        </div>

        <div className="mt-3 p-2.5 rounded-lg bg-secondary/20 border border-border/30">
          <p className="text-[10px] text-muted-foreground">
            <span className="font-semibold">Note:</span> 7d and 30d volumes are estimated from 24h data. All data streams live from Lighter API.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}