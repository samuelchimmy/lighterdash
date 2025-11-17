import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Download, Filter, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lighterApi } from '@/lib/lighter-api';
import { formatCurrency, formatNumber } from '@/lib/lighter-api';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { exportToCSV } from '@/lib/export-utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { resolveMarketSymbol } from '@/lib/markets';

interface LiquidationEvent {
  id: string;
  wallet_address: string;
  market_id: number;
  symbol?: string;
  event_type: 'liquidation' | 'deleverage';
  price: number;
  size: number;
  usdc_amount: number;
  timestamp: number;
  settlement_price?: number;
  created_at: string;
}

interface PlatformLiquidation {
  accountIndex: number;
  walletAddress: string;
  event: LiquidationEvent;
}

const Liquidations = () => {
  const navigate = useNavigate();
  const [liquidations, setLiquidations] = useState<LiquidationEvent[]>([]);
  const [platformLiquidations, setPlatformLiquidations] = useState<PlatformLiquidation[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'liquidation' | 'deleverage'>('all');
  const [filterSymbol, setFilterSymbol] = useState<string>('all');
  const [searchWallet, setSearchWallet] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch historical liquidations from database
  useEffect(() => {
    const fetchLiquidations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('liquidations')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching liquidations:', error);
        toast({
          title: "Error",
          description: "Failed to load liquidation history",
          variant: "destructive"
        });
      } else {
        setLiquidations((data || []) as LiquidationEvent[]);
      }
      setLoading(false);
    };

    fetchLiquidations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('liquidations-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'liquidations'
      }, (payload) => {
        setLiquidations(prev => [payload.new as LiquidationEvent, ...prev].slice(0, 100));
        toast({
          title: "New Liquidation Event",
          description: `${(payload.new as LiquidationEvent).symbol || 'Unknown'} - ${formatCurrency(Number((payload.new as LiquidationEvent).usdc_amount))}`,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Generate heatmap data from liquidations
  useEffect(() => {
    if (liquidations.length === 0) return;

    // Group liquidations by price ranges
    const priceRanges = new Map<number, { count: number; volume: number }>();
    
    liquidations.forEach(liq => {
      const priceLevel = Math.floor(Number(liq.price) / 100) * 100; // Group by $100 increments
      const existing = priceRanges.get(priceLevel) || { count: 0, volume: 0 };
      priceRanges.set(priceLevel, {
        count: existing.count + 1,
        volume: existing.volume + Number(liq.usdc_amount)
      });
    });

    const heatmap = Array.from(priceRanges.entries())
      .map(([price, data]) => ({
        price,
        count: data.count,
        volume: data.volume
      }))
      .sort((a, b) => a.price - b.price);

    setHeatmapData(heatmap);
  }, [liquidations]);

  // Subscribe to platform-wide liquidations via trade stream
  useEffect(() => {
    const ws = new WebSocket('wss://mainnet.zklighter.elliot.ai/stream');
    
    ws.onopen = () => {
      console.log('🔌 Connected to Lighter trade stream');
      
      // Subscribe to trades across multiple major markets
      const majorMarkets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // BTC, SOL, ETH, etc.
      majorMarkets.forEach(marketId => {
        ws.send(JSON.stringify({
          type: 'subscribe',
          channel: `trade/${marketId}`
        }));
      });
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Look for liquidation indicators in trade data
        if (data.type === 'update/trade' && data.trades) {
          for (const trade of data.trades) {
            // Detect potential liquidations (large sudden trades, specific patterns)
            const isLiquidation = trade.type === 'liquidation' || 
                                 (trade.usd_amount && parseFloat(trade.usd_amount) > 10000);
            
            if (isLiquidation && trade.market_id && trade.price) {
              const marketSymbol = resolveMarketSymbol(trade.market_id);
              
              // Add to platform liquidations list
              setPlatformLiquidations(prev => {
                const newLiq: PlatformLiquidation = {
                  accountIndex: trade.bid_account_id || trade.ask_account_id || 0,
                  walletAddress: 'Unknown',
                  event: {
                    id: `${trade.trade_id}-${Date.now()}`,
                    wallet_address: 'Platform',
                    market_id: trade.market_id,
                    symbol: marketSymbol,
                    event_type: 'liquidation',
                    price: parseFloat(trade.price),
                    size: parseFloat(trade.size),
                    usdc_amount: parseFloat(trade.usd_amount || '0'),
                    timestamp: trade.timestamp * 1000,
                    created_at: new Date().toISOString()
                  }
                };
                
                return [newLiq, ...prev].slice(0, 50);
              });

              // Store in database for history
              try {
                await supabase.from('liquidations').insert({
                  wallet_address: 'Platform',
                  market_id: trade.market_id,
                  symbol: marketSymbol,
                  event_type: 'liquidation',
                  price: parseFloat(trade.price),
                  size: parseFloat(trade.size),
                  usdc_amount: parseFloat(trade.usd_amount || '0'),
                  timestamp: trade.timestamp * 1000,
                });
              } catch (error) {
                console.error('Error storing platform liquidation:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing trade event:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  const filteredLiquidations = liquidations.filter(liq => {
    if (filterType !== 'all' && liq.event_type !== filterType) return false;
    if (filterSymbol !== 'all' && liq.symbol !== filterSymbol) return false;
    if (searchWallet && !liq.wallet_address.toLowerCase().includes(searchWallet.toLowerCase())) return false;
    return true;
  });

  const uniqueSymbols = Array.from(new Set(liquidations.map(l => l.symbol).filter(Boolean)));

  const handleExport = () => {
    const exportData = filteredLiquidations.map(liq => ({
      'Timestamp': new Date(liq.timestamp).toLocaleString(),
      'Wallet': liq.wallet_address,
      'Symbol': liq.symbol || 'N/A',
      'Type': liq.event_type,
      'Price': formatCurrency(Number(liq.price)),
      'Size': formatNumber(Number(liq.size)),
      'USD Amount': formatCurrency(Number(liq.usdc_amount)),
      'Settlement Price': liq.settlement_price ? formatCurrency(Number(liq.settlement_price)) : 'N/A'
    }));

    exportToCSV(exportData, `liquidations-${Date.now()}.csv`);
    toast({
      title: "Export Complete",
      description: `Exported ${exportData.length} liquidation events`
    });
  };

  const totalVolume = filteredLiquidations.reduce((sum, liq) => sum + Number(liq.usdc_amount), 0);
  const totalEvents = filteredLiquidations.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <BarChart3 className="w-8 h-8 text-primary" />
                <span className="ml-2 text-xl font-semibold">LighterDash</span>
              </Button>
              <div className="flex items-center gap-2 ml-4">
                <div className={`w-2 h-2 rounded-full ${platformLiquidations.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm text-muted-foreground">
                  {platformLiquidations.length > 0 ? 'Live' : 'Waiting for events'}
                </span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Platform Liquidations
              <Badge variant="secondary" className="ml-2">
                {platformLiquidations.length} Live
              </Badge>
            </h1>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium">Total Events</CardTitle>
              <Activity className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{totalEvents}</div>
              <p className="text-[10px] text-muted-foreground">Last 100 liquidations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium">Total Volume</CardTitle>
              <TrendingDown className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(totalVolume)}</div>
              <p className="text-[10px] text-muted-foreground">Liquidated value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium">Avg. Liquidation</CardTitle>
              <AlertTriangle className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {totalEvents > 0 ? formatCurrency(totalVolume / totalEvents) : '$0'}
              </div>
              <p className="text-[10px] text-muted-foreground">Per event</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform-Wide Live Feed */}
        {platformLiquidations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                Live Platform Feed
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time liquidations detected across major markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {platformLiquidations.map((pliq, idx) => (
                  <div
                    key={`${pliq.event.id}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                      <div>
                        <div className="font-medium text-sm">{pliq.event.symbol}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(pliq.event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-destructive text-sm">
                        {formatCurrency(pliq.event.usdc_amount)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        @ {formatCurrency(pliq.event.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liquidation Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Liquidation Heatmap
              </CardTitle>
              <CardDescription className="text-xs">
                Price levels where liquidations are concentrated
              </CardDescription>
            </CardHeader>
          <CardContent>
            {heatmapData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={heatmapData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="price" 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Liquidation Count', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'volume') return [formatCurrency(value), 'Volume'];
                      return [value, 'Count'];
                    }}
                    labelFormatter={(label) => `Price: $${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--destructive))" 
                    fillOpacity={1}
                    fill="url(#volumeGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No liquidation data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liquidation History Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-base">Liquidation History</CardTitle>
                  <CardDescription className="text-xs">Recent liquidation events across the platform</CardDescription>
                </div>
              <Button onClick={handleExport} size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search by wallet address..."
                  value={searchWallet}
                  onChange={(e) => setSearchWallet(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="liquidation">Liquidation</SelectItem>
                  <SelectItem value="deleverage">Deleverage</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSymbol} onValueChange={setFilterSymbol}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Symbol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Symbols</SelectItem>
                  {uniqueSymbols.map(symbol => (
                    <SelectItem key={symbol} value={symbol!}>{symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead className="text-right">USD Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading liquidations...
                      </TableCell>
                    </TableRow>
                  ) : filteredLiquidations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No liquidations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLiquidations.map((liq) => (
                      <TableRow key={liq.id}>
                        <TableCell className="font-mono text-xs">
                          {new Date(liq.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {liq.wallet_address.slice(0, 6)}...{liq.wallet_address.slice(-4)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{liq.symbol || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={liq.event_type === 'liquidation' ? 'destructive' : 'secondary'}>
                            {liq.event_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(Number(liq.price))}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(Number(liq.size))}
                        </TableCell>
                        <TableCell className="text-right font-mono text-destructive font-semibold">
                          {formatCurrency(Number(liq.usdc_amount))}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Liquidations;
