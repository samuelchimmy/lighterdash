// Centralized market mapping utilities with dynamic price-based resolution
// This lets us infer symbols from live mark prices when the market_id → symbol map isn't known.

export type MarketMapping = Record<number, string>;

// Seed with the confirmed IDs we already know
const STATIC_MARKET_SYMBOLS: MarketMapping = {
  0: "ETH-USD",
  1: "BTC-USD",
  7: "XRP-USD",
  24: "HYPE-USD",
  25: "BNB-USD",
  29: "ENA-USD",
};

// Lightweight price hints based on user-provided list.
// Note: prices move; we match within a small relative tolerance.
const PRICE_HINTS: Array<{ symbol: string; price: number }> = [
  { symbol: "ETH-USD", price: 3400.65 },
  { symbol: "BTC-USD", price: 102259.6 },
  { symbol: "SOL-USD", price: 157.8 },
  { symbol: "BNB-USD", price: 995.24 },
  { symbol: "XRP-USD", price: 2.283257 },
  { symbol: "SUI-USD", price: 2.11378 },
  { symbol: "APT-USD", price: 3.0741 },
  { symbol: "AVAX-USD", price: 17.4117 },
  { symbol: "AAVE-USD", price: 202.956 },
  { symbol: "ENA-USD", price: 0.32021 },
  { symbol: "HYPE-USD", price: 40.4113 },
  { symbol: "PAXG-USD", price: 3990.92 },
  { symbol: "ZEC-USD", price: 607.822 },
  { symbol: "XMR-USD", price: 366.772 },
  { symbol: "NEAR-USD", price: 2.86104 },
  { symbol: "TON-USD", price: 2.09447 },
  { symbol: "TRX-USD", price: 0.29157 },
  { symbol: "UNI-USD", price: 6.0126 },
  // FX & metals
  { symbol: "EURUSD", price: 1.15782 },
  { symbol: "USDJPY", price: 153.456 },
  { symbol: "GBPUSD", price: 1.31583 },
  { symbol: "USDCAD", price: 1.4046 },
  { symbol: "USDCHF", price: 0.80504 },
  { symbol: "XAU-USD", price: 3996.87 },
  { symbol: "XAG-USD", price: 48.2306 },
];

// In-memory runtime mapping cache
const runtimeMapping = new Map<number, string>(Object.entries(STATIC_MARKET_SYMBOLS).map(([k, v]) => [Number(k), v]));
const usedSymbols = new Set<string>(Object.values(STATIC_MARKET_SYMBOLS));

// Relative tolerance for price matching (e.g., 0.5% = 0.005)
const DEFAULT_REL_TOL = 0.005;

export function resolveMarketSymbol(marketId: number, markPrice: number, relTol: number = DEFAULT_REL_TOL): string | undefined {
  // If we already know it, return immediately
  const known = runtimeMapping.get(marketId);
  if (known) return known;

  if (!Number.isFinite(markPrice) || markPrice <= 0) return undefined;

  let best: { symbol: string; diff: number } | null = null;

  for (const hint of PRICE_HINTS) {
    if (usedSymbols.has(hint.symbol)) continue; // avoid assigning same symbol to multiple markets
    // Relative difference to account for price scale
    const diff = Math.abs(markPrice - hint.price) / Math.max(1, hint.price);
    if (diff <= relTol) {
      if (!best || diff < best.diff) {
        best = { symbol: hint.symbol, diff };
      }
    }
  }

  if (best) {
    runtimeMapping.set(marketId, best.symbol);
    usedSymbols.add(best.symbol);
    return best.symbol;
  }

  return undefined;
}

export function getKnownMapping(): MarketMapping {
  const obj: MarketMapping = {};
  for (const [k, v] of runtimeMapping.entries()) obj[k] = v;
  return obj;
}

export function setMarketSymbol(marketId: number, symbol: string) {
  runtimeMapping.set(marketId, symbol);
  usedSymbols.add(symbol);
}
