import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Download, Filter, TrendingDown, Activity, BarChart3, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lighterApi } from '@/lib/lighter-api';
import { formatCurrency, formatNumber } from '@/lib/lighter-api';
import { toast } from '@/hooks/use-toast';
import { exportToCSV } from '@/lib/export-utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { resolveMarketSymbol } from '@/lib/markets';
import { Layout } from '@/components/Layout';

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

    const priceRanges = new Map<number, { count: number; volume: number }>();
    
    liquidations.forEach(liq => {
      const priceLevel = Math.floor(Number(liq.price) / 100) * 100;
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
      
      const majorMarkets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
        
        if (data.type === 'update/trade' && data.trades) {
          for (const trade of data.trades) {
            const isLiquidation = trade.type === 'liquidation' || 
                                 (trade.usd_amount && parseFloat(trade.usd_amount) > 10000);
            
            if (isLiquidation && trade.market_id && trade.price) {
              const marketSymbol = resolveMarketSymbol(trade.market_id);
              
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
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-5">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-destructive/10">
              <ShieldAlert className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Platform Liquidations</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${platformLiquidations.length > 0 ? 'bg-profit animate-pulse' : 'bg-muted-foreground'}`} />
                <span className="text-[10px] text-muted-foreground">
                  {platformLiquidations.length > 0 ? 'Live' : 'Waiting for events'}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
            {platformLiquidations.length} Live
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '50ms' }}>
          <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
              <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total Events</CardTitle>
              <Activity className="h-3.5 w-3.5 text-primary" />
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="text-xl font-bold text-foreground">{totalEvents}</div>
              <p className="text-[10px] text-muted-foreground">Last 100 liquidations</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-destructive/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
              <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total Volume</CardTitle>
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="text-xl font-bold text-foreground">{formatCurrency(totalVolume)}</div>
              <p className="text-[10px] text-muted-foreground">Liquidated value</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-amber-500/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
              <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Avg. Liquidation</CardTitle>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="text-xl font-bold text-foreground">
                {totalEvents > 0 ? formatCurrency(totalVolume / totalEvents) : '$0'}
              </div>
              <p className="text-[10px] text-muted-foreground">Per event</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform-Wide Live Feed */}
        {platformLiquidations.length > 0 && (
          <Card className="bg-card border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '100ms' }}>
            <CardHeader className="py-3 px-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-3.5 w-3.5 text-profit animate-pulse" />
                Live Platform Feed
              </CardTitle>
              <CardDescription className="text-[10px]">
                Real-time liquidations detected across major markets
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
                {platformLiquidations.map((pliq, idx) => (
                  <div
                    key={`${pliq.event.id}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/30 transition-colors animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-destructive/10">
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground">{pliq.event.symbol}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(pliq.event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-semibold text-destructive">
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
        <Card className="bg-card border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '150ms' }}>
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              Liquidation Heatmap
            </CardTitle>
            <CardDescription className="text-[10px]">
              Price levels where liquidations are concentrated
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {heatmapData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={heatmapData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="price" 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `$${value}`}
                    style={{ fontSize: '9px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '9px' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted) / 0.15)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card) / 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid hsl(var(--border) / 0.5)',
                      borderRadius: '8px',
                      fontSize: '10px'
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
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#volumeGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground">
                No liquidation data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liquidation History Table */}
        <Card className="bg-card border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '200ms' }}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-sm">Liquidation History</CardTitle>
                <CardDescription className="text-[10px]">Recent liquidation events across the platform</CardDescription>
              </div>
              <Button onClick={handleExport} size="sm" variant="outline" className="gap-1.5 h-7 text-[10px]">
                <Download className="h-3 w-3" />
                Export CSV
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2.5 pt-3">
              <div className="flex-1 min-w-[180px]">
                <Input
                  placeholder="Search by wallet address..."
                  value={searchWallet}
                  onChange={(e) => setSearchWallet(e.target.value)}
                  className="w-full h-8 text-xs"
                />
              </div>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  <SelectItem value="liquidation" className="text-xs">Liquidation</SelectItem>
                  <SelectItem value="deleverage" className="text-xs">Deleverage</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSymbol} onValueChange={setFilterSymbol}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Symbol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Symbols</SelectItem>
                  {uniqueSymbols.map(symbol => (
                    <SelectItem key={symbol} value={symbol!} className="text-xs">{symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {loading ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Loading liquidation history...
              </div>
            ) : filteredLiquidations.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No liquidation events found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Time</TableHead>
                      <TableHead className="text-[10px]">Wallet</TableHead>
                      <TableHead className="text-[10px]">Symbol</TableHead>
                      <TableHead className="text-[10px]">Type</TableHead>
                      <TableHead className="text-right text-[10px]">Price</TableHead>
                      <TableHead className="text-right text-[10px]">Size</TableHead>
                      <TableHead className="text-right text-[10px]">USD Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLiquidations.slice(0, 50).map((liq) => (
                      <TableRow key={liq.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-muted-foreground text-[10px]">
                          {new Date(liq.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-[10px]">
                          {liq.wallet_address.slice(0, 6)}...{liq.wallet_address.slice(-4)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px]">{liq.symbol || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={liq.event_type === 'liquidation' ? 'destructive' : 'secondary'}
                            className="text-[9px]"
                          >
                            {liq.event_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-[10px]">
                          {formatCurrency(Number(liq.price))}
                        </TableCell>
                        <TableCell className="text-right font-mono text-[10px]">
                          {formatNumber(Number(liq.size))}
                        </TableCell>
                        <TableCell className="text-right font-mono text-[10px] text-destructive font-semibold">
                          {formatCurrency(Number(liq.usdc_amount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Liquidations;
