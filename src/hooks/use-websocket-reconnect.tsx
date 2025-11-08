import { useRef, useCallback } from 'react';
import { lighterApi } from '@/lib/lighter-api';
import { useToast } from '@/hooks/use-toast';

interface UseWebSocketReconnectProps {
  accountIndex: number | null;
  onConnectionStatusChange?: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
  onMessage?: (message: any) => void;
}

export const useWebSocketReconnect = ({
  accountIndex,
  onConnectionStatusChange,
  onMessage,
}: UseWebSocketReconnectProps) => {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const baseDelay = 1000; // Start with 1 second
  const maxDelay = 30000; // Max 30 seconds

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!accountIndex) return;

    cleanup();

    const ws = lighterApi.createWebSocket();
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttemptsRef.current = 0;
      onConnectionStatusChange?.('connected');

      // Subscribe to all channels
      lighterApi.subscribeToChannel(ws, `user_stats/${accountIndex}`);
      lighterApi.subscribeToChannel(ws, `account_all_positions/${accountIndex}`);
      lighterApi.subscribeToChannel(ws, `account_all/${accountIndex}`);
      lighterApi.subscribeToChannel(ws, `account_all_trades/${accountIndex}`);
      lighterApi.subscribeToChannel(ws, `account_all_orders/${accountIndex}`);
      lighterApi.subscribeToChannel(ws, `account_tx/${accountIndex}`);

      toast({
        title: "Connected",
        description: "Real-time data stream active",
      });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        onMessage?.(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onConnectionStatusChange?.('disconnected');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      onConnectionStatusChange?.('disconnected');
      wsRef.current = null;

      // Attempt to reconnect with exponential backoff
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(
          baseDelay * Math.pow(2, reconnectAttemptsRef.current),
          maxDelay
        );
        
        onConnectionStatusChange?.('reconnecting');
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        toast({
          title: "Connection lost",
          description: "Failed to reconnect. Click the status to try again.",
          variant: "destructive",
        });
      }
    };

    return ws;
  }, [accountIndex, onConnectionStatusChange, onMessage, toast, cleanup]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    cleanup();
    connect();
  }, [connect, cleanup]);

  const disconnect = useCallback(() => {
    cleanup();
    onConnectionStatusChange?.('disconnected');
  }, [cleanup, onConnectionStatusChange]);

  return {
    connect,
    reconnect,
    disconnect,
    websocket: wsRef.current,
  };
};
