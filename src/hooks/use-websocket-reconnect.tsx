import { useEffect, useRef, useCallback, useState } from 'react';
import { lighterApi } from '@/lib/lighter-api';
import { useToast } from '@/hooks/use-toast';

interface UseWebSocketReconnectOptions {
  accountIndex: number | null;
  onConnectionChange?: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
  onMessage?: (message: any) => void;
  enabled?: boolean;
}

export const useWebSocketReconnect = ({
  accountIndex,
  onConnectionChange,
  onMessage,
  enabled = true,
}: UseWebSocketReconnectOptions) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const { toast } = useToast();
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  const updateStatus = useCallback((status: 'connected' | 'disconnected' | 'reconnecting') => {
    setConnectionStatus(status);
    onConnectionChange?.(status);
  }, [onConnectionChange]);

  const connectWebSocket = useCallback(() => {
    if (!accountIndex || !enabled || !isMountedRef.current) {
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    console.log('Connecting WebSocket...');
    const ws = lighterApi.createWebSocket();
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) return;
      
      console.log('WebSocket connected');
      reconnectAttemptsRef.current = 0;
      updateStatus('connected');
      
      // Subscribe to all channels
      lighterApi.subscribeToChannel(ws, `user_stats/${accountIndex}`);
      lighterApi.subscribeToChannel(ws, `account_all_positions/${accountIndex}`);
      lighterApi.subscribeToChannel(ws, `account_all/${accountIndex}`);
      lighterApi.subscribeToChannel(ws, `account_all_trades/${accountIndex}`);
      lighterApi.subscribeToChannel(ws, `account_all_orders/${accountIndex}`);
      lighterApi.subscribeToChannel(ws, `account_tx/${accountIndex}`);
      
      toast({
        title: "Connected",
        description: "Real-time updates active",
      });
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;
      
      try {
        const message = JSON.parse(event.data);
        onMessage?.(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (isMountedRef.current) {
        updateStatus('disconnected');
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      if (!isMountedRef.current) return;
      
      updateStatus('disconnected');
      
      // Attempt to reconnect with exponential backoff
      const maxAttempts = 10;
      if (reconnectAttemptsRef.current < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;
        
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxAttempts})`);
        updateStatus('reconnecting');
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, delay);
      } else {
        toast({
          title: "Connection lost",
          description: "Unable to reconnect. Click 'Offline' to retry.",
          variant: "destructive",
        });
      }
    };
  }, [accountIndex, enabled, onMessage, updateStatus, toast]);

  const manualReconnect = useCallback(() => {
    // Reset reconnection attempts for manual reconnection
    reconnectAttemptsRef.current = 0;
    
    // Clear any pending reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    connectWebSocket();
  }, [connectWebSocket]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (enabled && accountIndex) {
      connectWebSocket();
    }

    return () => {
      isMountedRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [accountIndex, enabled, connectWebSocket]);

  return {
    connectionStatus,
    reconnect: manualReconnect,
    isConnected: connectionStatus === 'connected',
  };
};
