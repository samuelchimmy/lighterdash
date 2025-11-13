import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { lighterApi } from "@/lib/lighter-api";
import { Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Market {
  index: number;
  symbol: string;
  baseAsset: string;
  daily_quote_token_volume?: number;
  open_interest?: string;
  market_cap?: number;
}

type SortOption = "volume" | "openInterest" | "marketCap" | "symbol";

const FALLBACK_MARKETS: Market[] = [
  { index: 0, symbol: "ETH-USD", baseAsset: "ETH" },
  { index: 1, symbol: "BTC-USD", baseAsset: "BTC" },
  { index: 7, symbol: "XRP-USD", baseAsset: "XRP" },
  { index: 24, symbol: "HYPE-USD", baseAsset: "HYPE" },
  { index: 25, symbol: "BNB-USD", baseAsset: "BNB" },
  { index: 29, symbol: "ENA-USD", baseAsset: "ENA" },
];

interface AssetSelectorProps {
  selectedMarket: Market;
  onMarketChange: (market: Market) => void;
}

export function AssetSelector({ selectedMarket, onMarketChange }: AssetSelectorProps) {
  const [markets, setMarkets] = useState<Market[]>(FALLBACK_MARKETS);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("volume");

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        console.log('🔄 AssetSelector: Fetching markets...');
        const apiMarkets = await lighterApi.getAllMarkets();
        console.log('📊 AssetSelector: Received markets:', apiMarkets.length, apiMarkets.slice(0, 3));
        
        if (apiMarkets.length > 0) {
          const formattedMarkets = apiMarkets.map(m => ({
            index: m.market_index,
            symbol: m.symbol,
            baseAsset: m.base_asset,
            daily_quote_token_volume: m.daily_quote_token_volume,
            open_interest: m.open_interest,
            market_cap: m.market_cap,
          }));
          
          console.log('✅ AssetSelector: Formatted markets with volume data:', 
            formattedMarkets.slice(0, 3).map(m => ({
              symbol: m.symbol,
              volume: m.daily_quote_token_volume,
              oi: m.open_interest
            }))
          );
          
          setMarkets(formattedMarkets);
          
          // Update selected market if it exists in new list
          const currentMarket = formattedMarkets.find(m => m.index === selectedMarket.index);
          if (currentMarket) {
            onMarketChange(currentMarket);
          } else if (formattedMarkets.length > 0) {
            onMarketChange(formattedMarkets[0]);
          }
        }
      } catch (error) {
        console.error('❌ AssetSelector: Failed to fetch markets, using fallback:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
    // Refresh every 5 minutes for new listings
    const interval = setInterval(fetchMarkets, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const sortedMarkets = [...markets].sort((a, b) => {
    switch (sortBy) {
      case "volume":
        return (b.daily_quote_token_volume || 0) - (a.daily_quote_token_volume || 0);
      case "openInterest":
        return parseFloat(b.open_interest || "0") - parseFloat(a.open_interest || "0");
      case "marketCap":
        return (b.market_cap || 0) - (a.market_cap || 0);
      case "symbol":
      default:
        return a.symbol.localeCompare(b.symbol);
    }
  });

  // Debug: Log sorting
  useEffect(() => {
    console.log('🔄 AssetSelector: Sorting by:', sortBy);
    console.log('📊 Top 5 sorted markets:', sortedMarkets.slice(0, 5).map(m => ({
      symbol: m.symbol,
      volume: m.daily_quote_token_volume,
      oi: m.open_interest,
      cap: m.market_cap
    })));
  }, [sortBy, markets]);

  const getSortLabel = () => {
    switch (sortBy) {
      case "volume": return "24h Volume";
      case "openInterest": return "Open Interest";
      case "marketCap": return "Market Cap";
      case "symbol": return "Name";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedMarket.symbol}
        onValueChange={(value) => {
          const market = sortedMarkets.find(m => m.symbol === value);
          if (market) {
            console.log('🔄 AssetSelector: Selected market:', market);
            onMarketChange(market);
          }
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px] h-12 bg-card border-border">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SelectValue>
                <span className="font-semibold text-foreground">{selectedMarket.symbol}</span>
              </SelectValue>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="bg-card border-border z-50">
          {sortedMarkets.map((market) => (
            <SelectItem 
              key={market.index} 
              value={market.symbol}
              className="cursor-pointer hover:bg-accent"
            >
              {market.symbol}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-12 w-12 bg-card border-border" disabled={isLoading}>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-border z-50">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setSortBy("volume")}
            className={sortBy === "volume" ? "bg-accent" : ""}
          >
            24h Volume
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setSortBy("openInterest")}
            className={sortBy === "openInterest" ? "bg-accent" : ""}
          >
            Open Interest
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setSortBy("marketCap")}
            className={sortBy === "marketCap" ? "bg-accent" : ""}
          >
            Market Cap
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setSortBy("symbol")}
            className={sortBy === "symbol" ? "bg-accent" : ""}
          >
            Name (A-Z)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { FALLBACK_MARKETS as MARKETS };
