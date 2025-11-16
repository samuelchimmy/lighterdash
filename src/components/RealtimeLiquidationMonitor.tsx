import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatAddress } from '@/lib/lighter-api';
import { resolveMarketSymbol } from '@/lib/markets';
import { alertSoundManager } from '@/lib/alert-sounds';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface LiquidationEvent {
  id: string;
  kind: 'liquidation';
  content: {
    id: string;
    is_ask: boolean;
    usdc_amount: string;
    size: string;
    market_index: number;
    price: string;
    timestamp: number;
    avg_price: string;
  };
  created_at: string;
}

interface DeleverageEvent {
  id: string;
  kind: 'deleverage';
  content: {
    id: string;
    usdc_amount: string;
    size: string;
    market_index: number;
    settlement_price: string;
    timestamp: number;
  };
  created_at: string;
}

type NotificationEvent = LiquidationEvent | DeleverageEvent;

interface RealtimeLiquidationMonitorProps {
  accountIndex: number | null;
  walletAddress: string | null;
}

export function RealtimeLiquidationMonitor({ 
  accountIndex, 
  walletAddress 
}: RealtimeLiquidationMonitorProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => 
    alertSoundManager.getSettings().enabled
  );
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle sound toggle
  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    alertSoundManager.setSoundEnabled(enabled);
  };

  // Connect to WebSocket
  useEffect(() => {
    if (!accountIndex || !walletAddress) {
      return;
    }

    const connectWebSocket = () => {
      console.log('🔌 Connecting to notification WebSocket for account:', accountIndex);
      
      const ws = new WebSocket('wss://mainnet.zklighter.elliot.ai/stream');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected, subscribing to notifications...');
        setIsConnected(true);
        
        // Subscribe to notification channel
        ws.send(JSON.stringify({
          type: 'subscribe',
          channel: `notification/${accountIndex}`
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Notification event received:', data);

          if (data.type === 'update/notification' && data.notifs) {
            const newEvents: NotificationEvent[] = data.notifs.filter(
              (notif: any) => notif.kind === 'liquidation' || notif.kind === 'deleverage'
            );

            if (newEvents.length > 0) {
              setEvents(prev => {
                const existingIds = new Set(prev.map(e => e.id));
                const uniqueNew = newEvents.filter(e => !existingIds.has(e.id));
                
                // Show notifications and store in database for new events
                uniqueNew.forEach(async (event) => {
                  const symbol = resolveMarketSymbol(event.content.market_index);
                  
                  // Store in database
                  if (walletAddress) {
                    try {
                      await supabase.from('liquidations').insert({
                        wallet_address: walletAddress,
                        market_id: event.content.market_index || 0,
                        symbol: symbol,
                        event_type: event.kind,
                        price: parseFloat(event.kind === 'liquidation' ? event.content.price : event.content.settlement_price),
                        size: parseFloat(event.content.size),
                        usdc_amount: parseFloat(event.content.usdc_amount),
                        timestamp: event.content.timestamp || Date.now(),
                        settlement_price: event.kind === 'deleverage' ? parseFloat(event.content.settlement_price) : null,
                      });
                    } catch (error) {
                      console.error('Error storing liquidation:', error);
                    }
                  }
                  
                  if (event.kind === 'liquidation') {
                    const side = event.content.is_ask ? 'SHORT' : 'LONG';
                    alertSoundManager.playLiquidationAlert();
                    
                    toast({
                      title: '⚠️ Liquidation Alert!',
                      description: `${symbol} ${side} position liquidated at ${formatCurrency(parseFloat(event.content.avg_price))}. Loss: ${formatCurrency(parseFloat(event.content.usdc_amount))}`,
                      variant: 'destructive',
                    });
                  } else if (event.kind === 'deleverage') {
                    alertSoundManager.playMarginAlert();
                    
                    toast({
                      title: '🔴 Auto-Deleveraged!',
                      description: `${symbol} position auto-deleveraged at ${formatCurrency(parseFloat(event.content.settlement_price))}. Size: ${event.content.size}`,
                      variant: 'destructive',
                    });
                  }
                });

                return [...uniqueNew, ...prev].slice(0, 50); // Keep last 50 events
              });
            }
          }
        } catch (error) {
          console.error('❌ Error processing notification:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      };
    };

    connectWebSocket();

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [accountIndex, walletAddress, toast]);

  if (!accountIndex || !walletAddress) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Real-Time Liquidation Monitor
            {isConnected && (
              <Badge variant="secondary" className="animate-pulse">
                Live
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="sound-toggle" className="text-sm cursor-pointer">
              {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Label>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && (
          <div className="flex items-center justify-center p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            Connecting to notification stream...
          </div>
        )}

        {isConnected && events.length === 0 && (
          <div className="flex items-center justify-center p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-sm">
            <p className="text-green-500">No liquidations detected - monitoring active</p>
          </div>
        )}

        {events.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Recent Events</h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {events.map((event) => {
                const symbol = resolveMarketSymbol(event.content.market_index);
                const timestamp = new Date(
                  event.kind === 'liquidation' 
                    ? event.content.timestamp 
                    : event.content.timestamp
                );

                return (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border bg-card/50 space-y-2 animate-fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{symbol}</span>
                        <Badge 
                          variant={event.kind === 'liquidation' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {event.kind === 'liquidation' ? 'LIQUIDATED' : 'ADL'}
                        </Badge>
                        {event.kind === 'liquidation' && (
                          <Badge 
                            variant={event.content.is_ask ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {event.content.is_ask ? 'SHORT' : 'LONG'}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <span className="ml-2 font-semibold">
                          {formatCurrency(parseFloat(
                            event.kind === 'liquidation' 
                              ? event.content.avg_price 
                              : event.content.settlement_price
                          ))}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <span className="ml-2 font-semibold">
                          {event.content.size}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">
                          {event.kind === 'liquidation' ? 'Loss' : 'Settlement'}:
                        </span>
                        <span className="ml-2 font-semibold text-destructive">
                          {formatCurrency(parseFloat(event.content.usdc_amount))}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/50">
          <p>💡 This monitor tracks liquidations and auto-deleveraging events in real-time.</p>
          <p className="mt-1">Sound alerts will play when events are detected.</p>
        </div>
      </CardContent>
    </Card>
  );
}
