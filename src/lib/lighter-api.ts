import axios from 'axios';
import type { AccountResponse } from '@/types/lighter';

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

  createWebSocket(): WebSocket {
    return new WebSocket(WS_URL);
  },

  subscribeToChannel(ws: WebSocket, channel: string) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  }
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

export const formatPercentage = (num: number): string => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};
