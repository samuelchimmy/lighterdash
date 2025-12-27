// Exchange Mapping Library - Universal Trade History Preprocessor
// This file contains data structures and translation dictionaries for supported exchanges

import { CSVTrade } from './csv-trade-analyzer';

// --- Lighter Profile ---
export const lighterHeaders = ["Market", "Side", "Date", "Trade Value", "Size", "Price", "Closed PnL", "Fee", "Role", "Type"];
export const mapLighterToCSVTrade = (trade: Record<string, string>): CSVTrade | null => {
  try {
    const dateStr = trade['Date'];
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    const sideRaw = (trade['Side'] || '').toLowerCase();
    const roleRaw = (trade['Role'] || 'taker').toLowerCase();
    const typeRaw = (trade['Type'] || 'market').toLowerCase();
    
    return {
      date,
      market: (trade['Market'] || '').toUpperCase(),
      side: sideRaw.includes('long') || sideRaw.includes('buy') ? 'Long' : 'Short',
      size: parseFloat(trade['Size']) || 0,
      price: parseFloat(trade['Price']) || 0,
      closedPnL: parseFloat(trade['Closed PnL']) || 0,
      fee: Math.abs(parseFloat(trade['Fee'])) || 0,
      role: roleRaw.includes('maker') ? 'Maker' : 'Taker',
      type: typeRaw.includes('limit') ? 'Limit' : 'Market',
    };
  } catch {
    return null;
  }
};

// --- Nado Profile ---
export const nadoHeaders = ["Time", "Market", "Direction", "Amount", "Price", "Fee", "Total", "Realized PnL"];
export const mapNadoToCSVTrade = (trade: Record<string, string>): CSVTrade | null => {
  try {
    const dateStr = trade['Time'];
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    const directionRaw = (trade['Direction'] || '').toLowerCase();
    
    return {
      date,
      market: (trade['Market'] || '').toUpperCase(),
      side: directionRaw.includes('long') || directionRaw.includes('buy') ? 'Long' : 'Short',
      size: parseFloat(trade['Amount']) || 0,
      price: parseFloat(trade['Price']) || 0,
      closedPnL: parseFloat(trade['Realized PnL']) || 0,
      fee: Math.abs(parseFloat(trade['Fee'])) || 0,
      role: 'Taker', // Data not available in Nado CSV
      type: 'Market', // Data not available in Nado CSV
    };
  } catch {
    return null;
  }
};

// --- Hyperliquid Profile ---
export const hyperliquidHeaders = ["time", "coin", "dir", "px", "sz", "ntl", "fee", "closedPnl"];
export const mapHyperliquidToCSVTrade = (trade: Record<string, string>): CSVTrade | null => {
  try {
    const dateStr = trade['time'];
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    const dirRaw = (trade['dir'] || '').toLowerCase();
    
    return {
      date,
      market: (trade['coin'] || '').toUpperCase(),
      side: dirRaw.includes('long') || dirRaw.includes('buy') || dirRaw === 'b' ? 'Long' : 'Short',
      size: parseFloat(trade['sz']) || 0,
      price: parseFloat(trade['px']) || 0,
      closedPnL: parseFloat(trade['closedPnl']) || 0,
      fee: Math.abs(parseFloat(trade['fee'])) || 0,
      role: 'Taker', // Data not available in Hyperliquid CSV
      type: 'Market', // Data not available in Hyperliquid CSV
    };
  } catch {
    return null;
  }
};

// Helper function to check for a format match
export const headersMatch = (userHeaders: string[], knownHeaders: string[]): boolean => {
  if (!userHeaders || userHeaders.length === 0) return false;
  // Check if at least 70% of known headers are present (case-insensitive)
  const normalizedUserHeaders = userHeaders.map(h => h.toLowerCase().trim());
  const matchCount = knownHeaders.filter(header => 
    normalizedUserHeaders.includes(header.toLowerCase().trim())
  ).length;
  return matchCount >= Math.ceil(knownHeaders.length * 0.7);
};

// Exchange detection result
export interface ExchangeDetectionResult {
  detected: boolean;
  exchange: 'lighter' | 'nado' | 'hyperliquid' | 'unknown';
  mapper: ((trade: Record<string, string>) => CSVTrade | null) | null;
}

// Detect exchange from CSV headers
export const detectExchange = (headers: string[]): ExchangeDetectionResult => {
  if (headersMatch(headers, lighterHeaders)) {
    return { detected: true, exchange: 'lighter', mapper: mapLighterToCSVTrade };
  }
  if (headersMatch(headers, nadoHeaders)) {
    return { detected: true, exchange: 'nado', mapper: mapNadoToCSVTrade };
  }
  if (headersMatch(headers, hyperliquidHeaders)) {
    return { detected: true, exchange: 'hyperliquid', mapper: mapHyperliquidToCSVTrade };
  }
  return { detected: false, exchange: 'unknown', mapper: null };
};

// Standard fields we need for analysis
export const requiredFields = [
  { key: 'date', label: 'Date', required: true, description: 'Trade timestamp' },
  { key: 'market', label: 'Market/Symbol', required: true, description: 'Trading pair or asset' },
  { key: 'side', label: 'Side/Direction', required: true, description: 'Long/Short or Buy/Sell' },
  { key: 'size', label: 'Size/Amount', required: false, description: 'Position size' },
  { key: 'price', label: 'Price', required: false, description: 'Entry/Exit price' },
  { key: 'closedPnL', label: 'Closed PnL', required: true, description: 'Realized profit/loss' },
  { key: 'fee', label: 'Fee', required: false, description: 'Trading fees' },
  { key: 'role', label: 'Role', required: false, description: 'Maker/Taker' },
  { key: 'type', label: 'Order Type', required: false, description: 'Limit/Market' },
];

// Create a CSVTrade from custom mapping
export const mapCustomToCSVTrade = (
  trade: Record<string, string>,
  mapping: Record<string, string>
): CSVTrade | null => {
  try {
    const dateStr = trade[mapping.date];
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    const sideRaw = (trade[mapping.side] || '').toLowerCase();
    const roleRaw = (trade[mapping.role] || 'taker').toLowerCase();
    const typeRaw = (trade[mapping.type] || 'market').toLowerCase();
    
    return {
      date,
      market: (trade[mapping.market] || 'UNKNOWN').toUpperCase(),
      side: sideRaw.includes('long') || sideRaw.includes('buy') || sideRaw === 'b' ? 'Long' : 'Short',
      size: parseFloat(trade[mapping.size]) || 0,
      price: parseFloat(trade[mapping.price]) || 0,
      closedPnL: parseFloat(trade[mapping.closedPnL]) || 0,
      fee: Math.abs(parseFloat(trade[mapping.fee])) || 0,
      role: roleRaw.includes('maker') ? 'Maker' : 'Taker',
      type: typeRaw.includes('limit') ? 'Limit' : 'Market',
    };
  } catch {
    return null;
  }
};
