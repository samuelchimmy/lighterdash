import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { lighterApi } from "@/lib/lighter-api";
import { Loader2 } from "lucide-react";

export interface Market {
  index: number;
  symbol: string;
  baseAsset: string;
}

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

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const apiMarkets = await lighterApi.getAllMarkets();
        if (apiMarkets.length > 0) {
          const formattedMarkets = apiMarkets.map(m => ({
            index: m.market_index,
            symbol: m.symbol,
            baseAsset: m.base_asset,
          }));
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
        console.error('Failed to fetch markets, using fallback:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
    // Refresh every 5 minutes for new listings
    const interval = setInterval(fetchMarkets, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Select
      value={selectedMarket.symbol}
      onValueChange={(value) => {
        const market = markets.find(m => m.symbol === value);
        if (market) onMarketChange(market);
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
        {markets.map((market) => (
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
  );
}

export { FALLBACK_MARKETS as MARKETS };
