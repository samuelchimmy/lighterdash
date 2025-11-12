// Centralized market mapping utilities with dynamic API loading
import { lighterApi, type MarketDetail } from './lighter-api';

export type MarketMapping = Record<number, string>;

// Fallback if API fails
const FALLBACK_MARKETS: MarketMapping = {
  0: "ETH-USD",
  1: "BTC-USD",
  7: "XRP-USD",
  24: "HYPE-USD",
  25: "BNB-USD",
  29: "ENA-USD",
};

// In-memory runtime mapping cache
let runtimeMapping = new Map<number, string>(
  Object.entries(FALLBACK_MARKETS).map(([k, v]) => [Number(k), v])
);
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

// Load all markets from API
export async function loadMarkets(): Promise<void> {
  if (isLoaded) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      console.log('🔄 Loading markets from API...');
      const markets = await lighterApi.getAllMarkets();
      console.log(`📊 Received ${markets.length} markets:`, markets);
      
      if (markets.length > 0) {
        runtimeMapping.clear();
        markets.forEach(m => {
          console.log(`➕ Adding market: ${m.market_index} -> ${m.symbol}`);
          runtimeMapping.set(m.market_index, m.symbol);
        });
        isLoaded = true;
        console.log(`✅ Loaded ${markets.length} markets. Current mapping:`, Array.from(runtimeMapping.entries()));
      } else {
        console.warn('⚠️ No markets returned from API, using fallback');
      }
    } catch (error) {
      console.error('❌ Failed to load markets:', error);
    }
  })();

  return loadPromise;
}

// Resolve market symbol by ID
export function resolveMarketSymbol(marketId: number): string {
  return runtimeMapping.get(marketId) || `MARKET-${marketId}`;
}

// Get all known markets
export function getKnownMapping(): MarketMapping {
  const obj: MarketMapping = {};
  for (const [k, v] of runtimeMapping.entries()) obj[k] = v;
  return obj;
}

// Get market entries for selectors
export function getMarketEntries(): Array<[string, string]> {
  return Array.from(runtimeMapping.entries()).map(([id, symbol]) => [
    id.toString(),
    symbol
  ]);
}

// Auto-load on first import
loadMarkets();
