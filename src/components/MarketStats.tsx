import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { lighterApi, formatCurrency, formatCurrencySmart, formatPercentage, normalizeMarketStats } from "@/lib/lighter-api";
import { MarketStats as MarketStatsType } from "@/types/lighter";
import { TrendingUp, TrendingDown, Activity, ChevronDown, Search, Star } from "lucide-react";
import { resolveMarketSymbol, loadMarkets, subscribeMarkets, ensureMarkets } from "@/lib/markets";
import { Button } from "@/components/ui/button";

export function MarketStats() {
  const [markets, setMarkets] = useState<Record<number, MarketStatsType>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [marketsLoaded, setMarketsLoaded] = useState(false);
  const [, forceRender] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"priceChange" | "volume" | "openInterest" | "fundingRate">("priceChange");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('lighter-favorite-markets');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('lighter-favorite-markets', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite
  const toggleFavorite = (marketId: number) => {
    setFavorites(prev => 
      prev.includes(marketId) 
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    );
  };

  // Load markets first
  useEffect(() => {
    loadMarkets().then(() => {
      console.log('✅ Markets loaded, ready to display');
      setMarketsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!marketsLoaded) return;

    const ws = lighterApi.createWebSocket();

    ws.onopen = () => {
      console.log("📊 MarketStats WebSocket connected");
      lighterApi.subscribeToChannel(ws, "market_stats/all");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        console.log("📊 MarketStats RAW message:", JSON.stringify(data, null, 2));

        const updates: MarketStatsType[] = [];

        const tryPush = (raw: any) => {
          const norm = normalizeMarketStats(raw);
          if (norm) updates.push(norm);
        };

        // Handle market_stats as an object with market IDs as keys
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
          setMarkets(prev => {
            const next = { ...prev };
            for (const m of updates) next[m.market_id] = m;
            return next;
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error parsing market stats:", error);
      }
    };

    ws.onclose = () => {
      console.log("MarketStats WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [marketsLoaded]);

  // If unknown MARKET-XX appear, fetch details for those IDs and re-render
  useEffect(() => {
    const ids = Object.keys(markets).map((k) => Number(k));
    const unresolved = ids.filter((id) => resolveMarketSymbol(id).startsWith('MARKET-'));
    if (unresolved.length > 0) {
      ensureMarkets(unresolved).then(() => forceRender((x) => x + 1));
    }
  }, [markets]);

  // Subscribe to mapping updates to re-render symbols
  useEffect(() => {
    const unsub = subscribeMarkets(() => forceRender((x) => x + 1));
    return () => unsub();
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

  // Filter and sort market list
  let marketList = Object.values(markets);
  
  // Apply search filter
  if (searchTerm) {
    marketList = marketList.filter(market => {
      const symbol = resolveMarketSymbol(market.market_id);
      return symbol.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }
  
  // Apply sorting - favorites always on top
  marketList = marketList.sort((a, b) => {
    // Favorites first
    const aFav = favorites.includes(a.market_id);
    const bFav = favorites.includes(b.market_id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    
    // Then by selected sort
    switch (sortBy) {
      case "priceChange":
        return (b.daily_price_change ?? 0) - (a.daily_price_change ?? 0);
      case "volume":
        return (b.daily_quote_token_volume ?? 0) - (a.daily_quote_token_volume ?? 0);
      case "openInterest":
        return parseFloat(b.open_interest || '0') - parseFloat(a.open_interest || '0');
      case "fundingRate":
        return parseFloat(b.current_funding_rate || '0') - parseFloat(a.current_funding_rate || '0');
      default:
        return a.market_id - b.market_id;
    }
  });

  // Calculate top gainers, losers, and open interest (from all markets, not filtered)
  const allMarkets = Object.values(markets);
  const topGainers = [...allMarkets]
    .sort((a, b) => (b.daily_price_change ?? 0) - (a.daily_price_change ?? 0))
    .slice(0, 3);
  
  const topLosers = [...allMarkets]
    .sort((a, b) => (a.daily_price_change ?? 0) - (b.daily_price_change ?? 0))
    .slice(0, 3);
  
  const topOpenInterest = [...allMarkets]
    .sort((a, b) => parseFloat(b.open_interest || '0') - parseFloat(a.open_interest || '0'))
    .slice(0, 3);

  return (
    <Collapsible defaultOpen={false}>
      <Card>
        <CardHeader>
          <CollapsibleTrigger className="w-full group">
            <div className="flex items-center justify-between hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <CardTitle>All Markets</CardTitle>
              </div>
              <ChevronDown className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6">
        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Open Interest */}
          <div className="p-4 rounded-lg border bg-card/50">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top Open Interest (24h)</h3>
            <div className="space-y-2">
              {topOpenInterest.map((market) => {
                const symbol = resolveMarketSymbol(market.market_id);
                return (
                  <div key={market.market_id} className="flex items-center justify-between">
                    <span className="font-medium">{symbol}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrencySmart(parseFloat(market.open_interest))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Gainers */}
          <div className="p-4 rounded-lg border bg-card/50">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top Gainers (24h)</h3>
            <div className="space-y-2">
              {topGainers.map((market) => {
                const symbol = resolveMarketSymbol(market.market_id);
                const change = market.daily_price_change ?? 0;
                return (
                  <div key={market.market_id} className="flex items-center justify-between">
                    <span className="font-medium">{symbol}</span>
                    <Badge variant="default" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {formatPercentage(change)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Losers */}
          <div className="p-4 rounded-lg border bg-card/50">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top Losers (24h)</h3>
            <div className="space-y-2">
              {topLosers.map((market) => {
                const symbol = resolveMarketSymbol(market.market_id);
                const change = market.daily_price_change ?? 0;
                return (
                  <div key={market.market_id} className="flex items-center justify-between">
                    <span className="font-medium">{symbol}</span>
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {formatPercentage(change)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* All Markets Grid */}
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trading pairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priceChange">Price Change</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="openInterest">Open Interest</SelectItem>
                <SelectItem value="fundingRate">Funding Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketList.map((market) => {
            const symbol = resolveMarketSymbol(market.market_id);
            const priceChange = market.daily_price_change ?? 0;
            const fundingRate = parseFloat(market.current_funding_rate || '0') * 100;
            const isPriceUp = priceChange >= 0;
            const isFundingPositive = fundingRate >= 0;
            const isFavorite = favorites.includes(market.market_id);

            return (
              <div 
                key={market.market_id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => toggleFavorite(market.market_id)}
                >
                  <Star 
                    className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                </Button>
                <div className="flex items-start justify-between mb-3 pr-8">
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
        </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
