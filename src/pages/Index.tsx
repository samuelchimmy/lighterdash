import { useState, useEffect } from 'react';
import { WalletInput } from '@/components/WalletInput';
import { Dashboard } from '@/components/Dashboard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { ScanningLoader } from '@/components/ScanningLoader';
import { DonationModal } from '@/components/DonationModal';
import { RealtimeLiquidationMonitor } from '@/components/RealtimeLiquidationMonitor';
import { Layout } from '@/components/Layout';
import { FeatureAnnouncement } from '@/components/FeatureAnnouncement';
import { WalletIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { useSearchParams } from 'react-router-dom';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [scannedAddress, setScannedAddress] = useState<string | null>(() => {
    const urlAddress = searchParams.get('wallet');
    const storedAddress = localStorage.getItem('lighterdash-wallet');
    return urlAddress || storedAddress;
  });
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date>();

  const handleConnectionChange = (status: 'connected' | 'disconnected' | 'reconnecting') => {
    setConnectionStatus(status);
    if (status === 'connected') {
      setLastUpdate(new Date());
    }
  };

  const handleScan = async (address: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setScannedAddress(address);
      localStorage.setItem('lighterdash-wallet', address);
      setSearchParams({ wallet: address });
      setIsScanning(false);
    }, 1800);
  };

  useEffect(() => {
    if (scannedAddress) {
      localStorage.setItem('lighterdash-wallet', scannedAddress);
      setSearchParams({ wallet: scannedAddress });
    } else {
      localStorage.removeItem('lighterdash-wallet');
      setSearchParams({});
    }
  }, [scannedAddress, setSearchParams]);

  return (
    <Layout 
      showNav={!scannedAddress}
      headerContent={
        scannedAddress ? (
          <ConnectionStatus status={connectionStatus} lastUpdate={lastUpdate} />
        ) : null
      }
    >
      <DonationModal />
      <FeatureAnnouncement />
      <div className="container mx-auto px-4 py-8" role="main">
        {isScanning ? (
          <ScanningLoader />
        ) : !scannedAddress ? (
          <div className="max-w-4xl mx-auto">
            <section className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Track Your Lighter Trading Performance
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Community-built analytics dashboard for Lighter. View real-time trading statistics,
                track your performance, and analyze your trading data.
              </p>
            </section>

            <section className="mb-12" aria-label="Wallet address input">
              <WalletInput onScan={handleScan} isLoading={isScanning} />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in" aria-label="Key features">
              <article className="group bg-card border border-border/50 rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/15 transition-colors">
                  <WalletIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Wallet Tracker</h3>
                <p className="text-muted-foreground text-sm">
                  Track any Lighter wallet&apos;s positions, trades, PnL, and performance metrics in real-time.
                </p>
              </article>

              <article className="group bg-card border border-border/50 rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/15 transition-colors">
                  <ChartBarIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Market Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  View live order books, recent trades, funding rates, and comprehensive market statistics.
                </p>
              </article>

              <article className="group bg-card border border-border/50 rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/15 transition-colors">
                  <BoltIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Real-Time Updates</h3>
                <p className="text-muted-foreground text-sm">
                  WebSocket-powered live data streams for instant market and account updates.
                </p>
              </article>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }} aria-label="Detailed features">
              <article className="group bg-card border border-border/50 rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1">
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <ChartBarIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  Wallet Analytics
                </h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">Track total PnL, unrealized and realized gains across all positions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">Monitor portfolio value, leverage, and margin usage in real-time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">View detailed position breakdowns by asset with entry prices and liquidation levels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">Analyze complete trade history with fees, duration, and profitability metrics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">Compare multiple wallets side-by-side to analyze performance differences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">Export trading data and performance reports for external analysis</span>
                  </li>
                </ul>
              </article>

              <article className="group bg-card border border-border/50 rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1">
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <BoltIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  Advanced Features
                </h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">AI-powered pattern recognition to identify winning and losing trade setups</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">Win/loss streak analysis with performance breakdown by time and market</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">Trading journal with custom notes and tags for every trade</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">Liquidation risk monitoring with real-time alerts and position health tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">Live market data including order book depth, recent trades, and funding rates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">Performance metrics by asset, time, and trading strategy with visual charts</span>
                  </li>
                </ul>
              </article>
            </section>
          </div>
        ) : (
          <section aria-label="Wallet dashboard">
            <button
              onClick={() => {
                setScannedAddress(null);
                localStorage.removeItem('lighterdash-wallet');
                setSearchParams({});
              }}
              className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="group-hover:-translate-x-1 transition-transform"
              >
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              <span className="text-sm">Scan different wallet</span>
            </button>
            <Dashboard 
              walletAddress={scannedAddress}
              onConnectionStatusChange={handleConnectionChange}
            />
            <RealtimeLiquidationMonitor accountIndex={null} walletAddress={scannedAddress} />
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Index;
