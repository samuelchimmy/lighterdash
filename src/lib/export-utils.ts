import type { Position, LighterTrade, UserStats } from '@/types/lighter';

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPositionsToCSV = (positions: Position[]) => {
  const data = positions.map(p => ({
    symbol: p.symbol,
    side: parseFloat(p.position || '0') > 0 ? 'LONG' : 'SHORT',
    size: Math.abs(parseFloat(p.position || '0')),
    entry_price: p.avg_entry_price,
    position_value: p.position_value,
    unrealized_pnl: p.unrealized_pnl,
    realized_pnl: p.realized_pnl,
    liquidation_price: p.liquidation_price,
    initial_margin_fraction: p.initial_margin_fraction,
  }));
  
  exportToCSV(data, 'positions');
};

export const exportTradesToCSV = (trades: LighterTrade[]) => {
  const data = trades.map(t => ({
    trade_id: t.trade_id,
    market_id: t.market_id,
    type: t.type,
    size: t.size,
    price: t.price,
    usd_amount: t.usd_amount,
    timestamp: new Date(t.timestamp * 1000).toISOString(),
    maker_fee: t.maker_fee,
    taker_fee: t.taker_fee,
  }));
  
  exportToCSV(data, 'trades');
};

export const exportAccountStatsToCSV = (stats: UserStats) => {
  const data = [{
    collateral: stats.collateral,
    portfolio_value: stats.portfolio_value,
    leverage: stats.leverage,
    available_balance: stats.available_balance,
    margin_usage: stats.margin_usage,
    buying_power: stats.buying_power,
    timestamp: new Date().toISOString(),
  }];
  
  exportToCSV(data, 'account_stats');
};

export const exportAllData = (
  positions: Position[],
  trades: LighterTrade[],
  stats: UserStats | null,
  walletAddress: string
) => {
  // Export each dataset
  if (positions.length > 0) exportPositionsToCSV(positions);
  if (trades.length > 0) exportTradesToCSV(trades);
  if (stats) exportAccountStatsToCSV(stats);
  
  // Also create a summary export
  const summary = [{
    wallet_address: walletAddress,
    total_positions: positions.length,
    total_trades: trades.length,
    portfolio_value: stats?.portfolio_value || '0',
    collateral: stats?.collateral || '0',
    leverage: stats?.leverage || '0',
    export_date: new Date().toISOString(),
  }];
  
  exportToCSV(summary, 'trading_summary');
};
