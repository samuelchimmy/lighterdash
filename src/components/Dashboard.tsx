import { useState, useEffect } from 'react';
import { lighterApi } from '@/lib/lighter-api';
import { SummaryCard } from './SummaryCard';
import { AccountStats } from './AccountStats';
import { PositionsTable } from './PositionsTable';
import { TradesHistory } from './TradesHistory';
import { PerformanceMetrics } from './PerformanceMetrics';
import type { UserStats, Position, LighterTrade } from '@/types/lighter';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface DashboardProps {
  walletAddress: string;
}

export const Dashboard = ({ walletAddress }: DashboardProps) => {
  const [accountIndex, setAccountIndex] = useState<number | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<LighterTrade[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();

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
        setIsHydrated(true);
        setIsConnecting(false);

        // Phase 3: Connect WebSocket for real-time updates (only after hydration)
        ws = lighterApi.createWebSocket();

        ws.onopen = () => {
          if (!isMounted) return;
          console.log('WebSocket connected');
          
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
              setUserStats(message.stats as UserStats);
              return;
            }
            if (channel?.startsWith('user_stats:') && message.stats) {
              setUserStats(message.stats as UserStats);
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
          toast({
            title: "Connection error",
            description: "Failed to connect to real-time data feed",
            variant: "destructive",
          });
          setIsConnecting(false);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to Lighter network...</p>
        </div>
      </div>
    );
  }

  const portfolio = parseFloat(userStats?.portfolio_value || '0');
  const collateral = parseFloat(userStats?.collateral || '0');
  const unrealizedFromPositions = positions.reduce((sum, p) => sum + parseFloat((p as any)?.unrealized_pnl || '0'), 0);
  const totalPnl = portfolio > 0 || collateral > 0 ? (portfolio - collateral) : unrealizedFromPositions;
  const accountValue = portfolio;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SummaryCard
        totalPnl={totalPnl}
        walletAddress={walletAddress}
        accountValue={accountValue}
      />

      <AccountStats stats={userStats} />

      <PositionsTable positions={positions} />

      <PerformanceMetrics trades={trades} positions={positions} />

      <TradesHistory trades={trades} />
    </div>
  );
};
