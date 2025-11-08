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
  collateral: string;
  portfolio_value: string;
  leverage: string;
  available_balance: string;
  margin_usage: string;
  buying_power: string;
  cross_stats?: {
    collateral: string;
    portfolio_value: string;
    leverage: string;
    available_balance: string;
    margin_usage: string;
    buying_power: string;
  };
  total_stats?: {
    collateral: string;
    portfolio_value: string;
    leverage: string;
    available_balance: string;
    margin_usage: string;
    buying_power: string;
  };
}

export interface Position {
  market_id: number;
  symbol: string;
  initial_margin_fraction: string;
  open_order_count: number;
  pending_order_count: number;
  position_tied_order_count: number;
  sign: number;
  position: string;
  avg_entry_price: string;
  position_value: string;
  unrealized_pnl: string;
  realized_pnl: string;
  liquidation_price: string;
  total_funding_paid_out?: string;
  margin_mode: number;
  allocated_margin?: string;
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
