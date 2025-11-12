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

// In-memory runtime mapping cache and listeners
let runtimeMapping = new Map<number, string>(
  Object.entries(FALLBACK_MARKETS).map(([k, v]) => [Number(k), v])
);
let isLoaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => {
    try { fn(); } catch {}
  });
}

export function subscribeMarkets(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

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
          if (m?.market_index != null && m.symbol) {
            runtimeMapping.set(m.market_index, m.symbol);
          }
        });
        isLoaded = true;
        console.log(`✅ Loaded ${markets.length} markets. Current mapping:`, Array.from(runtimeMapping.entries()));
        notify();
      } else {
        console.warn('⚠️ No markets returned from API, using fallback');
      }
    } catch (error) {
      console.error('❌ Failed to load markets:', error);
    }
  })();

  return loadPromise;
}

// Ensure specific market IDs are loaded
export async function ensureMarkets(ids: number[]): Promise<void> {
  const missing = ids.filter((id) => !runtimeMapping.has(id));
  if (missing.length === 0) return;
  const results = await Promise.all(missing.map((id) => lighterApi.getMarketDetail(id)));
  let updated = false;
  results.forEach((m) => {
    if (m && m.symbol) {
      runtimeMapping.set(m.market_index, m.symbol);
      updated = true;
    }
  });
  if (updated) notify();
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
