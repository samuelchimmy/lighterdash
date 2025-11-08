import { useState, useEffect } from 'react';
import { lighterApi } from '@/lib/lighter-api';
import { SummaryCard } from './SummaryCard';
import { AccountStats } from './AccountStats';
import { PositionsTable } from './PositionsTable';
import type { UserStats, Position } from '@/types/lighter';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface DashboardProps {
  walletAddress: string;
}

export const Dashboard = ({ walletAddress }: DashboardProps) => {
  const [accountIndex, setAccountIndex] = useState<number | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let ws: WebSocket | null = null;

    const initializeDashboard = async () => {
      try {
        setIsConnecting(true);
        
        // Fetch account index
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

        setAccountIndex(index);

        // Create WebSocket connection
        ws = lighterApi.createWebSocket();

        ws.onopen = () => {
          console.log('WebSocket connected');
          
          // Subscribe to channels
          lighterApi.subscribeToChannel(ws!, `user_stats/${index}`);
          lighterApi.subscribeToChannel(ws!, `account_all_positions/${index}`);
          lighterApi.subscribeToChannel(ws!, `account_all_trades/${index}`);
          lighterApi.subscribeToChannel(ws!, `account_all_orders/${index}`);
          lighterApi.subscribeToChannel(ws!, `account_all/${index}`);
          
          setIsConnecting(false);
          toast({
            title: "Connected",
            description: "Real-time data feed active",
          });
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('WebSocket message:', message);

            const channel: string | undefined = message.channel;
            const type: string | undefined = message.type;

            // Prefer explicit type handling
            if (type === 'update/user_stats' && message.stats) {
              setUserStats(message.stats as UserStats);
              return;
            }
            if (type === 'update/account_all_positions' && message.positions) {
              const positionsArray = Object.values(message.positions || {});
              const filtered = (positionsArray as Position[]).filter((p: any) => parseFloat(p?.position || '0') !== 0);
              setPositions(filtered as Position[]);
              return;
            }

            // Fallback: route by channel name if type varies (e.g. subscribed/*)
            if (channel?.startsWith('user_stats:') && message.stats) {
              setUserStats(message.stats as UserStats);
              return;
            }
            if (channel?.startsWith('account_all_positions:') && message.positions) {
              const positionsArray = Object.values(message.positions || {});
              setPositions(positionsArray as Position[]);
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

  const totalPnl = userStats 
    ? (parseFloat(userStats.portfolio_value || '0') - parseFloat(userStats.collateral || '0'))
    : 0;
  const accountValue = userStats ? parseFloat(userStats.portfolio_value || '0') : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SummaryCard
        totalPnl={totalPnl}
        walletAddress={walletAddress}
        accountValue={accountValue}
      />

      <AccountStats stats={userStats} />

      <PositionsTable positions={positions} />
    </div>
  );
};
