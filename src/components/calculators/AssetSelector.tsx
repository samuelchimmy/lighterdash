import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

export interface Market {
  index: number;
  symbol: string;
  baseAsset: string;
}

const MARKETS: Market[] = [
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
  return (
    <Select
      value={selectedMarket.symbol}
      onValueChange={(value) => {
        const market = MARKETS.find(m => m.symbol === value);
        if (market) onMarketChange(market);
      }}
    >
      <SelectTrigger className="w-[200px] h-12 bg-card border-border">
        <div className="flex items-center gap-2">
          <SelectValue>
            <span className="font-semibold text-foreground">{selectedMarket.symbol}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-card border-border z-50">
        {MARKETS.map((market) => (
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

export { MARKETS };
