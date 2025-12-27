// Simple state store for trade data during mapping flow
// Using a simple object store pattern instead of Zustand for simplicity

interface TradeDataState {
  rawData: Record<string, string>[] | null;
  headers: string[] | null;
}

let state: TradeDataState = {
  rawData: null,
  headers: null,
};

const listeners: Set<() => void> = new Set();

export const tradeDataStore = {
  getState: () => state,
  
  setRawDataForMapping: (rawData: Record<string, string>[], headers: string[]) => {
    state = { rawData, headers };
    listeners.forEach(listener => listener());
  },
  
  clearRawData: () => {
    state = { rawData: null, headers: null };
    listeners.forEach(listener => listener());
  },
  
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// React hook for the store
import { useSyncExternalStore } from 'react';

export const useTradeDataStore = () => {
  return useSyncExternalStore(
    tradeDataStore.subscribe,
    tradeDataStore.getState,
    tradeDataStore.getState
  );
};
