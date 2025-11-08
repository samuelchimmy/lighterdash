import { useState, useEffect, useRef } from 'react';
import { lighterApi } from '@/lib/lighter-api';
import { supabase } from '@/integrations/supabase/client';
import { SummaryCard } from './SummaryCard';
import { AccountStats } from './AccountStats';
import { PositionsTable } from './PositionsTable';
import { TradesHistory } from './TradesHistory';
import { PerformanceMetrics } from './PerformanceMetrics';
import { PnlChart } from './PnlChart';
import { PortfolioChart } from './PortfolioChart';
import { ExportMenu } from './ExportMenu';
import { AlertMonitor } from './AlertMonitor';
import { ComparisonCard } from './ComparisonCard';
import { TradingJournal } from './TradingJournal';
import { AuthForm } from './AuthForm';
import { TradeAnalysisView } from './TradeAnalysisView';
import { Button } from '@/components/ui/button';
import { 
  SummaryCardSkeleton, 
  AccountStatsSkeleton, 
  PositionsTableSkeleton, 
  ChartSkeleton,
  PerformanceMetricsSkeleton 
} from './LoadingSkeleton';
import type { UserStats, Position, LighterTrade, PnlDataPoint } from '@/types/lighter';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface DashboardProps {
  walletAddress: string;
  onConnectionStatusChange?: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
}

export const Dashboard = ({ walletAddress, onConnectionStatusChange }: DashboardProps) => {
  const [user, setUser] = useState<any>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [accountIndex, setAccountIndex] = useState<number | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<LighterTrade[]>([]);
  const [pnlHistory, setPnlHistory] = useState<PnlDataPoint[]>(() => {
    // Load PnL history from localStorage on mount
    try {
      const stored = localStorage.getItem(`pnl-history-${walletAddress}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isConnecting, setIsConnecting] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const { toast } = useToast();

  // Save PnL history to localStorage whenever it changes
  useEffect(() => {
    if (pnlHistory.length > 0) {
      localStorage.setItem(`pnl-history-${walletAddress}`, JSON.stringify(pnlHistory));
    }
  }, [pnlHistory, walletAddress]);

  // Check auth status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    const initializeDashboard = async () => {
      try {
        setIsConnecting(true);
        
        // Phase 1: Fetch account index
        const index = await lighterApi.getAccountIndex(walletAddress);
        
        if (!index) {
          toast({
            title: "Account not found",
            description: "No Lighter account found for this address",
            variant: "destructive",
          });
          setIsConnecting(false);
          return;
        }

        if (!isMounted) return;
        setAccountIndex(index);

        // Phase 2: Fetch initial account snapshot
        const snapshot = await lighterApi.getAccountSnapshot(index);
        
        if (!isMounted) return;
        
        // Parse and set initial data
        const { normalizePositions, normalizeTrades } = await import('@/lib/lighter-api');
        const positionsArray = normalizePositions(snapshot.positions || {})
          .filter(p => parseFloat(p.position || '0') !== 0);
        
        const tradesArray = normalizeTrades(snapshot.trades || {});
        
        const initialStats: UserStats = snapshot.stats || {
          collateral: snapshot.collateral || '0',
          portfolio_value: snapshot.portfolio_value || '0',
          leverage: '0',
          available_balance: '0',
          margin_usage: '0',
          buying_power: '0',
        };
        
        setUserStats(initialStats);
        setPositions(positionsArray);
        setTrades(tradesArray);
        
        // Add initial data point to PnL history if it's fresh data
        const portfolio = parseFloat(initialStats.portfolio_value || '0');
        const collateral = parseFloat(initialStats.collateral || '0');
        const newDataPoint = {
          timestamp: Date.now(),
          accountValue: portfolio,
          pnl: portfolio - collateral,
          collateral: collateral,
        };
        
        setPnlHistory(prev => {
          // If we already have data from localStorage, append to it
          if (prev.length > 0) {
            return [...prev, newDataPoint];
          }
          // Otherwise, start fresh
          return [newDataPoint];
        });
        
        setIsHydrated(true);
        setIsConnecting(false);

        // Phase 3: Connect WebSocket for real-time updates (only after hydration)
        ws = lighterApi.createWebSocket();

        ws.onopen = () => {
          if (!isMounted) return;
          console.log('WebSocket connected');
          
          onConnectionStatusChange?.('connected');
          
          // Subscribe to channels (no auth required for public data)
          lighterApi.subscribeToChannel(ws!, `user_stats/${index}`);
          lighterApi.subscribeToChannel(ws!, `account_all_positions/${index}`);
          lighterApi.subscribeToChannel(ws!, `account_all/${index}`);
          lighterApi.subscribeToChannel(ws!, `account_all_trades/${index}`);
          
          toast({
            title: "Live updates active",
            description: "Real-time data stream connected",
          });
        };

        ws.onmessage = async (event) => {
          if (!isMounted) return;
          
          try {
            const message = JSON.parse(event.data);
            console.log('WebSocket message:', message);

            const channel: string | undefined = message.channel;
            const type: string | undefined = message.type;

            // Import merge helpers
            const { mergePositions, dedupeAndPrepend, normalizeTrades } = await import('@/lib/lighter-api');

            // Handle user_stats updates
            if (type === 'update/user_stats' && message.stats) {
              const stats = message.stats as UserStats;
              setUserStats(stats);
              
              // Add data point to PnL history (throttled to once per minute)
              const now = Date.now();
              if (now - lastUpdateRef.current >= 60000) {
                const portfolio = parseFloat(stats.portfolio_value || '0');
                const collateral = parseFloat(stats.collateral || '0');
                setPnlHistory(prev => [...prev, {
                  timestamp: now,
                  accountValue: portfolio,
                  pnl: portfolio - collateral,
                  collateral: collateral,
                }]);
                lastUpdateRef.current = now;
              }
              return;
            }
            if (channel?.startsWith('user_stats:') && message.stats) {
              const stats = message.stats as UserStats;
              setUserStats(stats);
              
              // Add data point to PnL history (throttled to once per minute)
              const now = Date.now();
              if (now - lastUpdateRef.current >= 60000) {
                const portfolio = parseFloat(stats.portfolio_value || '0');
                const collateral = parseFloat(stats.collateral || '0');
                setPnlHistory(prev => [...prev, {
                  timestamp: now,
                  accountValue: portfolio,
                  pnl: portfolio - collateral,
                  collateral: collateral,
                }]);
                lastUpdateRef.current = now;
              }
              return;
            }

            // Handle positions updates with merge logic
            if (type === 'update/account_all_positions' && message.positions) {
              setPositions(prev => mergePositions(prev, message.positions));
              return;
            }
            if (type === 'update/account_all' && message.positions) {
              setPositions(prev => mergePositions(prev, message.positions));
              return;
            }
            if (channel?.startsWith('account_all:') && message.positions) {
              setPositions(prev => mergePositions(prev, message.positions));
              return;
            }
            if (channel?.startsWith('account_all_positions:') && message.positions) {
              setPositions(prev => mergePositions(prev, message.positions));
              return;
            }

            // Handle trades updates
            if (type === 'update/account_all_trades' && message.trades) {
              const incomingTrades = normalizeTrades(message.trades);
              setTrades(prev => dedupeAndPrepend(prev, incomingTrades));
              return;
            }
            if (channel?.startsWith('account_all_trades:') && message.trades) {
              const incomingTrades = normalizeTrades(message.trades);
              setTrades(prev => dedupeAndPrepend(prev, incomingTrades));
              return;
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          onConnectionStatusChange?.('disconnected');
          toast({
            title: "Connection error",
            description: "Failed to connect to real-time data feed",
            variant: "destructive",
          });
          setIsConnecting(false);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          onConnectionStatusChange?.('disconnected');
        };

      } catch (error) {
        console.error('Error initializing dashboard:', error);
        toast({
          title: "Error",
          description: "Failed to load account data",
          variant: "destructive",
        });
        setIsConnecting(false);
      }
    };

    initializeDashboard();

    // Cleanup
    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
    };
  }, [walletAddress, toast]);

  if (isConnecting) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <SummaryCardSkeleton />
        <AccountStatsSkeleton />
        <ChartSkeleton />
        <PositionsTableSkeleton />
        <PerformanceMetricsSkeleton />
      </div>
    );
  }

  const portfolio = parseFloat(userStats?.portfolio_value || '0');
  const collateral = parseFloat(userStats?.collateral || '0');
  const unrealizedFromPositions = positions.reduce((sum, p) => sum + parseFloat((p as any)?.unrealized_pnl || '0'), 0);
  const totalPnl = portfolio > 0 || collateral > 0 ? (portfolio - collateral) : unrealizedFromPositions;
  const accountValue = portfolio;

  const calculateWinRate = () => {
    if (positions.length === 0) return 0;
    const profitablePositions = positions.filter(p => parseFloat(p.unrealized_pnl || '0') > 0);
    return (profitablePositions.length / positions.length) * 100;
  };


  if (showAuthForm && !user) {
    return (
      <div className="space-y-6">
        <SummaryCard
          totalPnl={totalPnl}
          walletAddress={walletAddress}
          accountValue={accountValue}
        />
        <div className="flex items-center justify-center py-8">
          <AuthForm onSuccess={() => setShowAuthForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AlertMonitor stats={userStats} positions={positions} currentPnL={totalPnl} />
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <div className="flex gap-2">
          <ExportMenu
            positions={positions}
            trades={trades}
            stats={userStats}
            walletAddress={walletAddress}
          />
          {!user && (
            <Button onClick={() => setShowAuthForm(true)} variant="outline">
              Sign In for Journal
            </Button>
          )}
        </div>
      </div>

      <SummaryCard
        totalPnl={totalPnl}
        walletAddress={walletAddress}
        accountValue={accountValue}
      />

      <AccountStats stats={userStats} />

      <PnlChart 
        data={pnlHistory} 
        onClearHistory={() => {
          setPnlHistory([]);
          localStorage.removeItem(`pnl-history-${walletAddress}`);
          toast({
            title: "History cleared",
            description: "PnL chart history has been reset",
          });
        }}
      />


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PositionsTable positions={positions} />
        <PortfolioChart positions={positions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComparisonCard
          winRate={calculateWinRate()}
          leverage={parseFloat(userStats?.leverage || '0')}
          totalPnL={totalPnl}
          totalTrades={trades.length}
        />
        <PerformanceMetrics trades={trades} positions={positions} />
      </div>

      {/* Trade Analysis */}
      {trades.length > 0 && (
        <TradeAnalysisView 
          trades={trades}
          accountIndex={accountIndex ?? undefined}
        />
      )}

      {/* Trading Journal */}
      {user && (
        <TradingJournal 
          trades={trades} 
          walletAddress={walletAddress}
          userId={user.id}
        />
      )}

      <TradesHistory trades={trades} />
    </div>
  );
};
