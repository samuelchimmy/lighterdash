import axios from 'axios';
import type { AccountResponse, AccountSnapshot, Position, LighterTrade } from '@/types/lighter';

const BASE_URL = 'https://mainnet.zklighter.elliot.ai';
const WS_URL = 'wss://mainnet.zklighter.elliot.ai/stream';

export const lighterApi = {
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
          params: { index: accountIndex }
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

export const formatPercentage = (num: number): string => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
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
