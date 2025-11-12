import axios from 'axios';
import type { AccountResponse, AccountSnapshot, Position, LighterTrade, MarketStats as MarketStatsType } from '@/types/lighter';

const BASE_URL = 'https://mainnet.zklighter.elliot.ai';
const WS_URL = 'wss://mainnet.zklighter.elliot.ai/stream';

export interface MarketDetail {
  market_index: number;
  symbol: string;
  base_asset: string;
  asks: Array<{ price: string; size: string }>;
  bids: Array<{ price: string; size: string }>;
}

export const lighterApi = {
  async getAllMarkets(): Promise<MarketDetail[]> {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/orderBookDetails`);
      const raw = response.data;
      console.log('📊 Raw API response:', raw);

      // The API returns { code: 200, order_book_details: [...] }
      const orderBooks = raw.order_book_details || [];
      
      if (!Array.isArray(orderBooks)) {
        console.error('❌ order_book_details is not an array');
        return [];
      }

      const markets = orderBooks.map((book: any) => {
        const marketId = book.market_id ?? book.market_index;
        const baseSymbol = book.symbol; // e.g., "STBL", "ETH", "BTC"
        const fullSymbol = baseSymbol ? `${baseSymbol}-USD` : `MARKET-${marketId}`;
        
        return {
          market_index: marketId,
          symbol: fullSymbol,
          base_asset: baseSymbol || 'UNKNOWN',
          asks: book.asks || [],
          bids: book.bids || [],
        };
      });

      console.log(`✅ Processed ${markets.length} markets (first 10):`, markets.slice(0, 10));
      return markets;
    } catch (error) {
      console.error('❌ Error fetching markets:', error);
      return [];
    }
  },

  async getMarketDetail(marketIndex: number): Promise<MarketDetail | null> {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/orderBookDetails`, {
        params: { market_index: marketIndex },
      });
      const raw = response.data;

      // Single market returns { code: 200, order_book_details: [{ ... }] }
      const books = raw.order_book_details || [];
      const book = books[0];
      
      if (!book) return null;

      const marketId = book.market_id ?? book.market_index ?? marketIndex;
      const baseSymbol = book.symbol;
      const fullSymbol = baseSymbol ? `${baseSymbol}-USD` : `MARKET-${marketId}`;

      return {
        market_index: marketId,
        symbol: fullSymbol,
        base_asset: baseSymbol || 'UNKNOWN',
        asks: book.asks || [],
        bids: book.bids || [],
      };
    } catch (error) {
      console.error('❌ Error fetching market detail:', error);
      return null;
    }
  },


  async getAccountIndex(l1Address: string): Promise<number | null> {
    try {
      const response = await axios.get<AccountResponse>(
        `${BASE_URL}/api/v1/accountsByL1Address`,
        {
          params: { l1_address: l1Address }
        }
      );
      
      if (response.data.sub_accounts && response.data.sub_accounts.length > 0) {
        return response.data.sub_accounts[0].index;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching account index:', error);
      throw error;
    }
  },

  async getAccountSnapshot(accountIndex: number): Promise<AccountSnapshot> {
    try {
      const response = await axios.get<AccountSnapshot>(
        `${BASE_URL}/api/v1/account`,
        {
          params: { by: 'index', index: accountIndex }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching account snapshot:', error);
      // Return empty snapshot on error
      return {
        account_index: accountIndex,
        positions: {},
        trades: {},
        collateral: '0',
        portfolio_value: '0'
      };
    }
  },

  createWebSocket(): WebSocket {
    return new WebSocket(WS_URL);
  },

  subscribeToChannel(ws: WebSocket, channel: string) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  },

  async checkPointsEndpoints(accountIndex: number): Promise<{
    endpoint: string;
    status: number;
    data?: any;
    found: boolean;
  }[]> {
    const potentialEndpoints = [
      `/api/v1/points/${accountIndex}`,
      `/api/v1/rewards/${accountIndex}`,
      `/api/v1/leaderboard`,
      `/api/v1/user_points/${accountIndex}`,
      `/api/v1/achievements/${accountIndex}`,
      `/api/v1/account/${accountIndex}/points`,
      `/api/v1/account/${accountIndex}/rewards`,
    ];

    const results = await Promise.all(
      potentialEndpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`${BASE_URL}${endpoint}`);
          const data = response.ok ? await response.json() : null;
          
          console.log(`Tested ${endpoint}: ${response.status}`, data);
          
          return {
            endpoint,
            status: response.status,
            data,
            found: response.ok && data !== null,
          };
        } catch (error) {
          console.error(`Error testing ${endpoint}:`, error);
          return {
            endpoint,
            status: 0,
            found: false,
          };
        }
      })
    );

    return results;
  },
};

export const validateEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

export const formatCurrencySmart = (num: number): string => {
  const abs = Math.abs(num);
  const decimals = abs < 1 ? 6 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) return '0.00%';
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

// Normalize a single market stats object from various shapes (snake_case / camelCase, string/number)
export const normalizeMarketStats = (raw: any): MarketStatsType | null => {
  if (!raw || typeof raw !== 'object') return null;
  const n = (kSnake: string, kCamel: string, def: any = undefined) =>
    raw[kSnake] ?? raw[kCamel] ?? def;
  const toNum = (v: any) => (typeof v === 'number' ? v : parseFloat(v ?? '0'));
  const toStr = (v: any) => (v !== undefined && v !== null ? String(v) : '0');

  const market_id = n('market_id', 'marketId');
  if (market_id === undefined || market_id === null) return null;

  return {
    market_id: Number(market_id),
    index_price: toStr(n('index_price', 'indexPrice', '0')),
    mark_price: toStr(n('mark_price', 'markPrice', '0')),
    open_interest: toStr(n('open_interest', 'openInterest', '0')),
    last_trade_price: toStr(n('last_trade_price', 'lastTradePrice', '0')),
    current_funding_rate: toStr(n('current_funding_rate', 'currentFundingRate', '0')),
    funding_rate: toStr(n('funding_rate', 'fundingRate', '0')),
    funding_timestamp: Number(n('funding_timestamp', 'fundingTimestamp', 0)),
    daily_base_token_volume: toNum(n('daily_base_token_volume', 'dailyBaseTokenVolume', 0)),
    daily_quote_token_volume: toNum(n('daily_quote_token_volume', 'dailyQuoteTokenVolume', 0)),
    daily_price_low: toNum(n('daily_price_low', 'dailyPriceLow', 0)),
    daily_price_high: toNum(n('daily_price_high', 'dailyPriceHigh', 0)),
    daily_price_change: toNum(n('daily_price_change', 'dailyPriceChange', 0)),
  };
};

// Normalize positions from API response
export const normalizePositions = (input: Record<string, Position> | Position[] | undefined): Position[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return Object.values(input);
};

// Normalize trades from API response
export const normalizeTrades = (input: Record<string, LighterTrade[]> | LighterTrade[] | undefined): LighterTrade[] => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.sort((a, b) => b.timestamp - a.timestamp);
  }
  const trades = Object.values(input).flat();
  return trades.sort((a, b) => b.timestamp - a.timestamp);
};

// Merge positions by market_id, filtering zero-sized positions
export const mergePositions = (existing: Position[], incoming: Record<string, Position> | Position[]): Position[] => {
  const map = new Map<number, Position>();
  
  // Add existing positions to map
  existing.forEach(p => map.set(p.market_id, p));
  
  // Merge incoming positions
  const incomingArray = normalizePositions(incoming);
  incomingArray.forEach(p => {
    const size = parseFloat(p.position || '0');
    if (size === 0) {
      map.delete(p.market_id);
    } else {
      map.set(p.market_id, p);
    }
  });
  
  return Array.from(map.values());
};

// Deduplicate and prepend new trades
export const dedupeAndPrepend = (existing: LighterTrade[], incoming: LighterTrade[]): LighterTrade[] => {
  const existingIds = new Set(existing.map(t => t.trade_id));
  const newTrades = incoming.filter(t => !existingIds.has(t.trade_id));
  return [...newTrades, ...existing].sort((a, b) => b.timestamp - a.timestamp);
};
