// Utility functions for Lighter Futures Calculator

export type Side = 'long' | 'short';
export type MarginMode = 'isolated' | 'cross';

/**
 * Calculate initial margin required for a position
 */
export function calculateInitialMargin(
  quantity: number,
  entryPrice: number,
  leverage: number
): number {
  if (leverage === 0) return 0;
  return (quantity * entryPrice) / leverage;
}

/**
 * Calculate PnL for a position
 */
export function calculatePnL(
  side: Side,
  entryPrice: number,
  exitPrice: number,
  quantity: number
): number {
  if (side === 'long') {
    return (exitPrice - entryPrice) * quantity;
  } else {
    return (entryPrice - exitPrice) * quantity;
  }
}

/**
 * Calculate ROE (Return on Equity) percentage
 */
export function calculateROE(pnl: number, initialMargin: number): number {
  if (initialMargin === 0) return 0;
  return (pnl / initialMargin) * 100;
}

/**
 * Calculate liquidation price
 * @param mmf Maintenance Margin Fraction (default 0.005 = 0.5%)
 */
export function calculateLiquidationPrice(
  side: Side,
  entryPrice: number,
  leverage: number,
  mmf: number = 0.005
): number {
  if (leverage === 0) return 0;
  
  if (side === 'long') {
    return entryPrice * (1 - (1 / leverage) + mmf);
  } else {
    return entryPrice * (1 + (1 / leverage) - mmf);
  }
}

/**
 * Calculate target price needed to achieve desired ROE
 */
export function calculateTargetPrice(
  side: Side,
  entryPrice: number,
  quantity: number,
  leverage: number,
  roePercent: number
): number {
  const initialMargin = calculateInitialMargin(quantity, entryPrice, leverage);
  const requiredPnL = (roePercent / 100) * initialMargin;
  
  if (quantity === 0) return 0;
  
  if (side === 'long') {
    return entryPrice + (requiredPnL / quantity);
  } else {
    return entryPrice - (requiredPnL / quantity);
  }
}

/**
 * Format number as currency (USDC)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Validate if input is a valid number
 */
export function validateNumberInput(value: string): boolean {
  return /^\d*\.?\d*$/.test(value) || value === '';
}

/**
 * Parse number input safely
 */
export function parseNumberInput(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get color class for PnL display
 */
export function getPnLColorClass(value: number): string {
  if (value > 0) return 'text-profit';
  if (value < 0) return 'text-loss';
  return 'text-muted-foreground';
}
