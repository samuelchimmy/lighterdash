import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { lighterApi, formatCurrency, formatCurrencySmart, formatPercentage, normalizeMarketStats } from "@/lib/lighter-api";
import { MarketStats as MarketStatsType } from "@/types/lighter";
import { TrendingUp, TrendingDown, Activity, ChevronDown, Search, Star, Bell } from "lucide-react";
import { resolveMarketSymbol, loadMarkets, subscribeMarkets, ensureMarkets } from "@/lib/markets";
import { Button } from "@/components/ui/button";
import { MarketAlertDialog, MarketAlert } from "./MarketAlertDialog";
import { AlertHistory, AlertHistoryItem } from "./AlertHistory";
import { ActiveAlertsPanel } from "./ActiveAlertsPanel";
import { useToast } from "@/hooks/use-toast";
import { alertSoundManager } from "@/lib/alert-sounds";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Volume2 } from "lucide-react";

export function MarketStats() {
  const [markets, setMarkets] = useState<Record<number, MarketStatsType>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [marketsLoaded, setMarketsLoaded] = useState(false);
  const [, forceRender] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"priceChange" | "volume" | "openInterest" | "fundingRate">("priceChange");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [alerts, setAlerts] = useState<Record<number, MarketAlert>>({});
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [alertHistory, setAlertHistory] = useState<AlertHistoryItem[]>([]);
  const [lastAlertTime, setLastAlertTime] = useState<Record<string, number>>({});
  const [soundSettings, setSoundSettings] = useState(alertSoundManager.getSettings());
  const previousVolumes = useRef<Record<number, number>>({});
  const { toast } = useToast();

  const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes cooldown between same alerts

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('lighter-favorite-markets');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
      }
    }
  }, []);

  // Load alerts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('lighter-market-alerts');
    if (stored) {
      try {
        setAlerts(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse alerts:', error);
      }
    }

    const historyStored = localStorage.getItem('lighter-alert-history');
    if (historyStored) {
      try {
        setAlertHistory(JSON.parse(historyStored));
      } catch (error) {
        console.error('Failed to parse alert history:', error);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('lighter-favorite-markets', JSON.stringify(favorites));
  }, [favorites]);

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem('lighter-market-alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Save alert history to localStorage
  useEffect(() => {
    localStorage.setItem('lighter-alert-history', JSON.stringify(alertHistory));
  }, [alertHistory]);

  // Toggle favorite
  const toggleFavorite = (marketId: number) => {
    setFavorites(prev => 
      prev.includes(marketId) 
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    );
  };

  // Open alert dialog
  const openAlertDialog = (marketId: number) => {
    setSelectedMarketId(marketId);
    setAlertDialogOpen(true);
  };

  // Save alert
  const saveAlert = (alert: MarketAlert) => {
    setAlerts(prev => ({
      ...prev,
      [alert.marketId]: alert,
    }));
    toast({
      title: "Alert Saved",
      description: `Alerts configured for ${resolveMarketSymbol(alert.marketId)}`,
    });
  };

  // Delete alert
  const deleteAlert = (marketId: number) => {
    setAlerts(prev => {
      const newAlerts = { ...prev };
      delete newAlerts[marketId];
      return newAlerts;
    });
    toast({
      title: "Alert Deleted",
      description: `Alerts removed for ${resolveMarketSymbol(marketId)}`,
    });
  };

  // Toggle specific alert type
  const toggleAlertType = (marketId: number, alertType: keyof MarketAlert, enabled: boolean) => {
    setAlerts(prev => {
      const currentAlert = prev[marketId];
      if (!currentAlert) return prev;

      const updatedAlert: MarketAlert = {
        ...currentAlert,
        [alertType]: {
          ...(currentAlert[alertType] as object),
          enabled,
        },
      };

      return {
        ...prev,
        [marketId]: updatedAlert,
      };
    });
  };

  // Add to alert history
  const addToHistory = (item: Omit<AlertHistoryItem, "id">) => {
    const newItem: AlertHistoryItem = {
      ...item,
      id: `${item.marketId}-${item.type}-${Date.now()}`,
    };
    setAlertHistory(prev => [newItem, ...prev].slice(0, 100)); // Keep last 100 alerts
  };

  // Clear alert history
  const clearHistory = () => {
    setAlertHistory([]);
    toast({
      title: "History Cleared",
      description: "All alert history has been removed",
    });
  };

  // Remove single history item
  const removeHistoryItem = (id: string) => {
    setAlertHistory(prev => prev.filter(item => item.id !== id));
  };

  // Check if alert should be sent (cooldown check)
  const shouldSendAlert = (alertKey: string): boolean => {
    const lastTime = lastAlertTime[alertKey];
    if (!lastTime) return true;
    return Date.now() - lastTime > ALERT_COOLDOWN;
  };

  // Record alert sent
  const recordAlertSent = (alertKey: string) => {
    setLastAlertTime(prev => ({
      ...prev,
      [alertKey]: Date.now(),
    }));
  };

  // Check alerts
  useEffect(() => {
    if (Object.keys(markets).length === 0) return;

    Object.entries(alerts).forEach(([marketIdStr, alert]) => {
      const marketId = parseInt(marketIdStr);
      const market = markets[marketId];
      if (!market) return;

      const price = parseFloat(market.mark_price);
      const fundingRate = parseFloat(market.current_funding_rate || '0') * 100;
      const currentVolume = market.daily_quote_token_volume ?? 0;
      const symbol = resolveMarketSymbol(marketId);

      // Check price alerts
      if (alert.priceThreshold?.enabled) {
        if (alert.priceThreshold.above && price >= alert.priceThreshold.above) {
          const alertKey = `price-above-${marketId}`;
          if (shouldSendAlert(alertKey)) {
            const message = `Price is now $${price.toLocaleString()}, above threshold of $${alert.priceThreshold.above.toLocaleString()}`;
            sendNotification(`🟢 ${symbol} Price Alert`, message, 'price', 'above');
            addToHistory({ marketId, marketSymbol: symbol, type: 'price', message, timestamp: Date.now() });
            recordAlertSent(alertKey);
          }
        }
        if (alert.priceThreshold.below && price <= alert.priceThreshold.below) {
          const alertKey = `price-below-${marketId}`;
          if (shouldSendAlert(alertKey)) {
            const message = `Price is now $${price.toLocaleString()}, below threshold of $${alert.priceThreshold.below.toLocaleString()}`;
            sendNotification(`🔴 ${symbol} Price Alert`, message, 'price', 'below');
            addToHistory({ marketId, marketSymbol: symbol, type: 'price', message, timestamp: Date.now() });
            recordAlertSent(alertKey);
          }
        }
      }

      // Check volume spike
      if (alert.volumeSpike?.enabled) {
        const previousVolume = previousVolumes.current[marketId];
        if (previousVolume) {
          const percentageIncrease = ((currentVolume - previousVolume) / previousVolume) * 100;
          if (percentageIncrease >= alert.volumeSpike.percentageIncrease) {
            const alertKey = `volume-${marketId}`;
            if (shouldSendAlert(alertKey)) {
              const message = `Volume increased by ${percentageIncrease.toFixed(1)}%`;
              sendNotification(`🟡 ${symbol} Volume Spike`, message, 'volume', 'neutral');
              addToHistory({ marketId, marketSymbol: symbol, type: 'volume', message, timestamp: Date.now() });
              recordAlertSent(alertKey);
            }
          }
        }
        previousVolumes.current[marketId] = currentVolume;
      }

      // Check funding rate alerts
      if (alert.fundingRate?.enabled) {
        if (alert.fundingRate.above && fundingRate >= alert.fundingRate.above) {
          const alertKey = `funding-above-${marketId}`;
          if (shouldSendAlert(alertKey)) {
            const message = `Funding rate is now ${fundingRate.toFixed(4)}%, above threshold of ${alert.fundingRate.above}%`;
            sendNotification(`🟢 ${symbol} Funding Rate Alert`, message, 'funding', 'above');
            addToHistory({ marketId, marketSymbol: symbol, type: 'funding', message, timestamp: Date.now() });
            recordAlertSent(alertKey);
          }
        }
        if (alert.fundingRate.below && fundingRate <= alert.fundingRate.below) {
          const alertKey = `funding-below-${marketId}`;
          if (shouldSendAlert(alertKey)) {
            const message = `Funding rate is now ${fundingRate.toFixed(4)}%, below threshold of ${alert.fundingRate.below}%`;
            sendNotification(`🔴 ${symbol} Funding Rate Alert`, message, 'funding', 'below');
            addToHistory({ marketId, marketSymbol: symbol, type: 'funding', message, timestamp: Date.now() });
            recordAlertSent(alertKey);
          }
        }
      }
    });
  }, [markets, alerts]);

  // Send browser notification and play sound
  const sendNotification = (title: string, body: string, type: 'price' | 'volume' | 'funding', direction?: 'above' | 'below' | 'neutral') => {
    // Play sound
    if (type === 'price') {
      alertSoundManager.playPriceAlert();
    } else if (type === 'volume') {
      alertSoundManager.playVolumeAlert();
    } else if (type === 'funding') {
      alertSoundManager.playFundingAlert();
    }

    // Browser notification
    if (notificationPermission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
    
    // Toast notification
    toast({
      title,
      description: body,
    });
  };

  // Load markets first
  useEffect(() => {
    loadMarkets().then(() => {
      console.log('✅ Markets loaded, ready to display');
      setMarketsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!marketsLoaded) return;

    const ws = lighterApi.createWebSocket();

    ws.onopen = () => {
      console.log("📊 MarketStats WebSocket connected");
      lighterApi.subscribeToChannel(ws, "market_stats/all");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        console.log("📊 MarketStats RAW message:", JSON.stringify(data, null, 2));

        const updates: MarketStatsType[] = [];

        const tryPush = (raw: any) => {
          const norm = normalizeMarketStats(raw);
          if (norm) updates.push(norm);
        };

        // Handle market_stats as an object with market IDs as keys
        if (data.market_stats || data.marketStats) {
          const stats = data.market_stats ?? data.marketStats;
          if (typeof stats === 'object' && !Array.isArray(stats)) {
            Object.values(stats).forEach(tryPush);
          } else {
            tryPush(stats);
          }
        } else if (Array.isArray(data.markets)) {
          data.markets.forEach(tryPush);
        } else if (data.markets && typeof data.markets === 'object') {
          Object.values(data.markets).forEach(tryPush);
        }

        if (updates.length > 0) {
          setMarkets(prev => {
            const next = { ...prev };
            for (const m of updates) next[m.market_id] = m;
            return next;
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error parsing market stats:", error);
      }
    };

    ws.onclose = () => {
      console.log("MarketStats WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [marketsLoaded]);

  // If unknown MARKET-XX appear, fetch details for those IDs and re-render
  useEffect(() => {
    const ids = Object.keys(markets).map((k) => Number(k));
    const unresolved = ids.filter((id) => resolveMarketSymbol(id).startsWith('MARKET-'));
    if (unresolved.length > 0) {
      ensureMarkets(unresolved).then(() => forceRender((x) => x + 1));
    }
  }, [markets]);

  // Subscribe to mapping updates to re-render symbols
  useEffect(() => {
    const unsub = subscribeMarkets(() => forceRender((x) => x + 1));
    return () => unsub();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter and sort market list
  let marketList = Object.values(markets);
  
  // Apply search filter
  if (searchTerm) {
    marketList = marketList.filter(market => {
      const symbol = resolveMarketSymbol(market.market_id);
      return symbol.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }
  
  // Apply sorting - favorites always on top
  marketList = marketList.sort((a, b) => {
    // Favorites first
    const aFav = favorites.includes(a.market_id);
    const bFav = favorites.includes(b.market_id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    
    // Then by selected sort
    switch (sortBy) {
      case "priceChange":
        return (b.daily_price_change ?? 0) - (a.daily_price_change ?? 0);
      case "volume":
        return (b.daily_quote_token_volume ?? 0) - (a.daily_quote_token_volume ?? 0);
      case "openInterest":
        return parseFloat(b.open_interest || '0') - parseFloat(a.open_interest || '0');
      case "fundingRate":
        return parseFloat(b.current_funding_rate || '0') - parseFloat(a.current_funding_rate || '0');
      default:
        return a.market_id - b.market_id;
    }
  });

  // Calculate top gainers, losers, and open interest (from all markets, not filtered)
  const allMarkets = Object.values(markets);
  const topGainers = [...allMarkets]
    .sort((a, b) => (b.daily_price_change ?? 0) - (a.daily_price_change ?? 0))
    .slice(0, 3);
  
  const topLosers = [...allMarkets]
    .sort((a, b) => (a.daily_price_change ?? 0) - (b.daily_price_change ?? 0))
    .slice(0, 3);
  
  const topOpenInterest = [...allMarkets]
    .sort((a, b) => parseFloat(b.open_interest || '0') - parseFloat(a.open_interest || '0'))
    .slice(0, 3);

  // Calculate watchlist metrics
  const favoriteMarkets = allMarkets.filter(m => favorites.includes(m.market_id));
  const watchlistMetrics = {
    count: favoriteMarkets.length,
    totalVolume: favoriteMarkets.reduce((sum, m) => sum + (m.daily_quote_token_volume ?? 0), 0),
    avgChange: favoriteMarkets.length > 0 
      ? favoriteMarkets.reduce((sum, m) => sum + (m.daily_price_change ?? 0), 0) / favoriteMarkets.length
      : 0
  };

  return (
    <Collapsible defaultOpen={false}>
      <Card>
        <CardHeader>
          <CollapsibleTrigger className="w-full group">
            <div className="flex items-center justify-between hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <CardTitle>All Markets</CardTitle>
              </div>
              <ChevronDown className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6">
        {/* Sound Settings Dialog */}
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Alert Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alert Settings</DialogTitle>
                <DialogDescription>
                  Configure sound and browser notifications for market alerts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Browser Notifications */}
                <div className="space-y-3 p-4 rounded-lg border bg-card/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Browser Notifications</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notificationPermission === "granted" 
                          ? "Notifications enabled - you'll receive pop-up alerts" 
                          : notificationPermission === "denied"
                          ? "Notifications blocked - please enable in browser settings"
                          : "Click to enable notification pop-ups"}
                      </p>
                    </div>
                    {notificationPermission === "granted" ? (
                      <Badge variant="default" className="gap-1">
                        <Bell className="h-3 w-3" />
                        Enabled
                      </Badge>
                    ) : notificationPermission === "denied" ? (
                      <Badge variant="destructive" className="gap-1">
                        <Bell className="h-3 w-3" />
                        Blocked
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={async () => {
                          const permission = await Notification.requestPermission();
                          setNotificationPermission(permission);
                          if (permission === "granted") {
                            toast({
                              title: "Notifications Enabled",
                              description: "You'll now receive browser notification pop-ups for alerts",
                            });
                            // Send test notification
                            new Notification("LighterDash Alert Test", {
                              body: "Notifications are now enabled! You'll receive alerts like this.",
                              icon: "/favicon.ico",
                              badge: "/favicon.ico",
                            });
                          }
                        }}
                      >
                        Enable
                      </Button>
                    )}
                  </div>
                  {notificationPermission === "denied" && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                      To enable notifications: Go to your browser settings → Site settings → Notifications → Allow
                    </div>
                  )}
                  {notificationPermission === "granted" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        new Notification("🟢 Test Alert - Above Threshold", {
                          body: "This is a test browser notification (green indicator for above threshold)",
                          icon: "/favicon.ico",
                          badge: "/favicon.ico",
                        });
                        setTimeout(() => {
                          new Notification("🔴 Test Alert - Below Threshold", {
                            body: "This is a test browser notification (red indicator for below threshold)",
                            icon: "/favicon.ico",
                            badge: "/favicon.ico",
                          });
                        }, 1500);
                        alertSoundManager.playPriceAlert();
                      }}
                    >
                      Test Notification & Sound
                    </Button>
                  )}
                </div>

                {/* Sound Alerts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-enabled" className="text-base font-semibold">Sound Alerts</Label>
                    <Switch
                      id="sound-enabled"
                      checked={soundSettings.enabled}
                      onCheckedChange={(enabled) => {
                        alertSoundManager.setSoundEnabled(enabled);
                        setSoundSettings(alertSoundManager.getSettings());
                      }}
                    />
                  </div>
                  {soundSettings.enabled && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="volume">Volume</Label>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(soundSettings.volume * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <Slider
                            id="volume"
                            value={[soundSettings.volume]}
                            onValueChange={([value]) => {
                              alertSoundManager.setVolume(value);
                              setSoundSettings(alertSoundManager.getSettings());
                            }}
                            max={1}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <p className="text-sm font-medium">Test Sounds</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alertSoundManager.playPriceAlert()}
                          >
                            Price Alert
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alertSoundManager.playVolumeAlert()}
                          >
                            Volume Alert
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alertSoundManager.playFundingAlert()}
                          >
                            Funding Alert
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Alerts Panel */}
        <ActiveAlertsPanel
          alerts={alerts}
          getMarketSymbol={resolveMarketSymbol}
          onEdit={openAlertDialog}
          onDelete={deleteAlert}
          onToggleAlert={toggleAlertType}
        />

        {/* Alert History */}
        <AlertHistory
          history={alertHistory}
          onClear={clearHistory}
          onRemove={removeHistoryItem}
        />

        {/* Watchlist Summary */}
        {watchlistMetrics.count > 0 && (
          <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <h3 className="text-sm font-semibold">Watchlist Summary</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Markets</p>
                <p className="text-2xl font-bold">{watchlistMetrics.count}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
                <p className="text-2xl font-bold">{formatCurrencySmart(watchlistMetrics.totalVolume)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Change</p>
                <div className="flex items-center gap-1">
                  <p className={`text-2xl font-bold ${watchlistMetrics.avgChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(watchlistMetrics.avgChange)}
                  </p>
                  {watchlistMetrics.avgChange >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Open Interest */}
          <div className="p-4 rounded-lg border bg-card/50">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top Open Interest (24h)</h3>
            <div className="space-y-2">
              {topOpenInterest.map((market) => {
                const symbol = resolveMarketSymbol(market.market_id);
                return (
                  <div key={market.market_id} className="flex items-center justify-between">
                    <span className="font-medium">{symbol}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrencySmart(parseFloat(market.open_interest))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Gainers */}
          <div className="p-4 rounded-lg border bg-card/50">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top Gainers (24h)</h3>
            <div className="space-y-2">
              {topGainers.map((market) => {
                const symbol = resolveMarketSymbol(market.market_id);
                const change = market.daily_price_change ?? 0;
                return (
                  <div key={market.market_id} className="flex items-center justify-between">
                    <span className="font-medium">{symbol}</span>
                    <Badge variant="default" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {formatPercentage(change)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Losers */}
          <div className="p-4 rounded-lg border bg-card/50">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top Losers (24h)</h3>
            <div className="space-y-2">
              {topLosers.map((market) => {
                const symbol = resolveMarketSymbol(market.market_id);
                const change = market.daily_price_change ?? 0;
                return (
                  <div key={market.market_id} className="flex items-center justify-between">
                    <span className="font-medium">{symbol}</span>
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {formatPercentage(change)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* All Markets Grid */}
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trading pairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priceChange">Price Change</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="openInterest">Open Interest</SelectItem>
                <SelectItem value="fundingRate">Funding Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketList.map((market) => {
            const symbol = resolveMarketSymbol(market.market_id);
            const priceChange = market.daily_price_change ?? 0;
            const fundingRate = parseFloat(market.current_funding_rate || '0') * 100;
            const isPriceUp = priceChange >= 0;
            const isFundingPositive = fundingRate >= 0;
            const isFavorite = favorites.includes(market.market_id);
            const hasAlert = !!alerts[market.market_id];

            return (
              <div 
                key={market.market_id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors relative"
              >
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openAlertDialog(market.market_id)}
                    title="Configure alerts"
                  >
                    <Bell 
                      className={`h-4 w-4 ${hasAlert ? 'fill-blue-400 text-blue-400' : 'text-muted-foreground'}`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFavorite(market.market_id)}
                    title="Add to favorites"
                  >
                    <Star 
                      className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                    />
                  </Button>
                </div>
                <div className="flex items-start justify-between mb-3 pr-16">
                  <div>
                    <h3 className="font-semibold text-lg">{symbol}</h3>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(parseFloat(market.mark_price))}
                    </p>
                  </div>
                  <Badge 
                    variant={isPriceUp ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {isPriceUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {formatPercentage(priceChange)}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Index:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(market.index_price))}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Volume:</span>
                    <span className="font-medium">{formatCurrencySmart(market.daily_quote_token_volume)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Open Interest:</span>
                    <span className="font-medium">{formatCurrencySmart(parseFloat(market.open_interest))}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-muted-foreground">Funding Rate:</span>
                    <Badge 
                      variant={isFundingPositive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {fundingRate >= 0 ? '+' : ''}{fundingRate.toFixed(4)}%
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
          </CardContent>
        </CollapsibleContent>
      </Card>

      {/* Alert Dialog */}
      {selectedMarketId !== null && markets[selectedMarketId] && (
        <MarketAlertDialog
          open={alertDialogOpen}
          onOpenChange={setAlertDialogOpen}
          marketId={selectedMarketId}
          marketSymbol={resolveMarketSymbol(selectedMarketId)}
          currentPrice={parseFloat(markets[selectedMarketId].mark_price)}
          currentFundingRate={parseFloat(markets[selectedMarketId].current_funding_rate || '0')}
          alert={alerts[selectedMarketId]}
          onSave={saveAlert}
        />
      )}
    </Collapsible>
  );
}
