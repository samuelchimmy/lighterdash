export interface SubAccount {
  index: number;
  l1_address: string;
  account_type: number;
  cancel_all_time: number;
  total_order_count: number;
  total_isolated_order_count: number;
  pending_order_count: number;
  available_balance: string;
  status: number;
  collateral: string;
}

export interface AccountResponse {
  sub_accounts: SubAccount[];
}

export interface UserStats {
  leverage: number;
  margin_usage: number;
  portfolio_value: number;
  available_balance: number;
  unrealized_pnl: number;
  realized_pnl: number;
}

export interface Position {
  asset: string;
  size: number;
  unrealized_pnl: number;
  entry_price: number;
  mark_price: number;
  liquidation_price: number;
  side: 'long' | 'short';
}

export interface Order {
  asset: string;
  type: string;
  size: number;
  price: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface Trade {
  asset: string;
  side: 'long' | 'short';
  pnl: number;
  size: number;
  entry_price: number;
  exit_price: number;
  timestamp: number;
  duration?: number;
  fees?: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface PerformanceByAsset {
  asset: string;
  total_pnl: number;
  total_fees: number;
  trade_count: number;
}
